import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Wrench,
  MapPin,
  ChevronDown,
  LocateFixed,
  Loader2,
  Phone,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  SERVICIOS_16,
  ZONAS_COBERTURA,
} from '../data/desvaresData';
import {
  construirTriageWhatsapp,
  validarSolicitudDespacho,
  DatosSolicitudDespacho,
  resolverUbicacionGpsAburra,
  resolverDireccionExactaGps,
} from '../utils/seoAndTriage';
import { TipoToast } from './ToastNotificaciones';

interface ModalOrdenDespachoProps {
  abierto: boolean;
  onCerrar: () => void;
  valoresIniciales: {
    servicioId: string;
    zonaSlug: string;
    barrio: string;
    tipoVehiculo: 'Moto' | 'Scooter' | 'Carro / Camioneta';
    referenciaVehiculo: string;
  };
  onMostrarToast: (toast: { tipo: TipoToast; titulo: string; mensaje: string }) => void;
}

/**
 * Filtro inteligente previo a WhatsApp: captura los datos esenciales del vehículo,
 * falla y ubicación GPS de alta precisión para entregar toda la información completa
 * en un solo mensaje directo al WhatsApp del mecánico (+57 300 603 6253).
 */
export const ModalOrdenDespacho: React.FC<ModalOrdenDespachoProps> = ({
  abierto,
  onCerrar,
  valoresIniciales,
  onMostrarToast,
}) => {
  const [form, setForm] = useState<DatosSolicitudDespacho>({
    nombreCliente: '',
    telefonoContacto: '',
    zonaSlug: valoresIniciales.zonaSlug,
    barrio: valoresIniciales.barrio,
    servicioId: valoresIniciales.servicioId,
    tipoVehiculo: valoresIniciales.tipoVehiculo,
    referenciaVehiculo: valoresIniciales.referenciaVehiculo,
    detallesFalla: '',
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [obteniendoGps, setObteniendoGps] = useState(false);
  const [estadoGps, setEstadoGps] = useState<{
    tipo: 'obteniendo' | 'exito' | 'error';
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    if (abierto) {
      setForm((prev) => ({
        ...prev,
        servicioId: valoresIniciales.servicioId,
        zonaSlug: valoresIniciales.zonaSlug,
        barrio: valoresIniciales.barrio || prev.barrio,
        tipoVehiculo: valoresIniciales.tipoVehiculo,
        referenciaVehiculo: valoresIniciales.referenciaVehiculo || prev.referenciaVehiculo,
      }));
      setErrores({});
      setEstadoGps(null);
      setObteniendoGps(false);
    }
  }, [abierto, valoresIniciales]);

  if (!abierto) return null;

  const usarUbicacionPrecisaGps = () => {
    if (obteniendoGps) return;

    setObteniendoGps(true);
    setEstadoGps({
      tipo: 'obteniendo',
      mensaje:
        'Obteniendo ubicación GPS de alta precisión... Por favor espera unos segundos y autoriza el permiso en tu navegador.',
    });

    const opcionesAltaPrecision: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const precision = Math.round(pos.coords.accuracy || 0);

          // Paso 1: Asignación inmediata por microzona del Valle de Aburrá
          const preliminar = resolverUbicacionGpsAburra(lat, lng, form.zonaSlug, precision);
          setForm((prev) => ({
            ...prev,
            zonaSlug: preliminar.zonaSlug,
            barrio: preliminar.barrioFormateado,
          }));
          setErrores((prev) => ({ ...prev, barrio: '' }));

          // Paso 2: Enriquecimiento con geocodificación inversa (barrio y calle exacta)
          setEstadoGps({
            tipo: 'obteniendo',
            mensaje: 'Coordenadas GPS recibidas. Verificando barrio y dirección exacta...',
          });

          const exacta = await resolverDireccionExactaGps(lat, lng, form.zonaSlug, precision);
          setForm((prev) => ({
            ...prev,
            zonaSlug: exacta.zonaSlug,
            barrio: exacta.barrioFormateado,
          }));

          setObteniendoGps(false);
          const textoPrecision = precision > 0 ? ` (precisión ±${precision} m)` : '';
          setEstadoGps({
            tipo: 'exito',
            mensaje: `Ubicación GPS detectada${textoPrecision}: ${exacta.zonaNombre} · ${exacta.barrioFormateado}`,
          });

          onMostrarToast({
            tipo: 'exito',
            titulo: 'Ubicación GPS de alta precisión lista',
            mensaje: `${exacta.zonaNombre}: ${exacta.barrioFormateado}`,
          });
        },
        (err) => {
          setObteniendoGps(false);
          let motivo = 'No se pudo obtener la señal GPS exacta.';
          if (err.code === 1) {
            motivo =
              'Permiso de ubicación denegado. Activa el GPS del navegador o escribe tu barrio manualmente.';
          } else if (err.code === 3) {
            motivo =
              'Se agotó el tiempo de espera del GPS de alta precisión (10 s). Verifica tu señal o ingresa tu barrio manualmente.';
          }

          const respaldo = resolverUbicacionGpsAburra(Number.NaN, Number.NaN, form.zonaSlug);
          setForm((prev) => ({
            ...prev,
            barrio: prev.barrio.trim() ? prev.barrio : respaldo.barrioFormateado,
          }));

          setEstadoGps({
            tipo: 'error',
            mensaje: motivo,
          });
        },
        opcionesAltaPrecision
      );
    } else {
      setObteniendoGps(false);
      setEstadoGps({
        tipo: 'error',
        mensaje:
          'Tu navegador no soporta geolocalización GPS. Escribe tu barrio o punto de referencia.',
      });
    }
  };

  const triagePreview = construirTriageWhatsapp({
    servicioId: form.servicioId,
    zonaSlug: form.zonaSlug,
    barrio: form.barrio,
    tipoVehiculo: form.tipoVehiculo,
    vehiculoMarcaModelo: form.referenciaVehiculo,
    nombreCliente: form.nombreCliente,
    telefonoContacto: form.telefonoContacto,
    detallesFalla: form.detallesFalla,
  });

  const manejarEnvioDirectoWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();

    const validacion = validarSolicitudDespacho(form);
    if (!validacion.valido) {
      setErrores(validacion.errores);
      onMostrarToast({
        tipo: 'error',
        titulo: 'Faltan datos para el mecánico',
        mensaje:
          'Completa tu nombre, celular, barrio/GPS y la marca de tu vehículo para enviar el mensaje completo a WhatsApp.',
      });
      return;
    }

    setErrores({});

    // Disparar apertura directa hacia WhatsApp con la ficha técnica y ubicación GPS precargada
    const enlaceTemp = document.createElement('a');
    enlaceTemp.href = triagePreview.urlWhatsapp;
    enlaceTemp.target = '_blank';
    enlaceTemp.rel = 'noopener noreferrer';
    document.body.appendChild(enlaceTemp);
    enlaceTemp.click();
    document.body.removeChild(enlaceTemp);

    onMostrarToast({
      tipo: 'exito',
      titulo: 'Redirigiendo a WhatsApp',
      mensaje: `Enviando datos de tu ${form.referenciaVehiculo} en ${triagePreview.zona.nombre} al ${BRAND_CONFIG.telefonoDisplay}.`,
    });

    onCerrar();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-despacho-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[calc(100dvh-1.25rem)] sm:max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 text-slate-900">
        {/* Cabecera fija en la parte superior */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 shrink-0">
          <div>
            <p className="text-[11px] sm:text-xs font-bold text-[#FF5500]">
              Desvares 123 · Atención directa {BRAND_CONFIG.telefonoDisplay}
            </p>
            <h2
              id="modal-despacho-titulo"
              className="font-display text-lg sm:text-2xl font-bold text-slate-900 mt-0.5 leading-snug"
            >
              Datos para enviar tu mecánico por WhatsApp
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ventana de solicitud de servicio"
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pt-3 pb-1 pr-1">
          <form onSubmit={manejarEnvioDirectoWhatsapp} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="orden-nombre"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Tu nombre *
                </label>
                <input
                  id="orden-nombre"
                  type="text"
                  value={form.nombreCliente}
                  onChange={(e) => setForm({ ...form, nombreCliente: e.target.value })}
                  placeholder="Ej. Andrés Gómez"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                />
                {errores.nombreCliente && (
                  <p className="text-xs text-red-600 mt-1">{errores.nombreCliente}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="orden-telefono"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Celular / WhatsApp *
                </label>
                <input
                  id="orden-telefono"
                  type="tel"
                  value={form.telefonoContacto}
                  onChange={(e) => setForm({ ...form, telefonoContacto: e.target.value })}
                  placeholder="Ej. 300 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                />
                {errores.telefonoContacto && (
                  <p className="text-xs text-red-600 mt-1">{errores.telefonoContacto}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="orden-servicio"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Servicio requerido *
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#FF5500] transition-colors">
                    <Wrench className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <select
                    id="orden-servicio"
                    value={form.servicioId}
                    onChange={(e) => setForm({ ...form, servicioId: e.target.value })}
                    className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-sm font-semibold text-slate-900 transition-all cursor-pointer shadow-2xs outline-none"
                  >
                    {(form.tipoVehiculo === 'Carro / Camioneta'
                      ? SERVICIOS_16.filter(
                          (s) =>
                            s.id === 'montallantas-carros-y-motos' ||
                            s.id === 'reinicio-de-bateria'
                        )
                      : SERVICIOS_16
                    ).map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        className="py-2 text-slate-900 font-medium bg-white"
                      >
                        {s.numero}. {s.tituloCorto}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-6 h-6 rounded-md bg-slate-200/70 group-hover:bg-[#FF5500] text-slate-600 group-hover:text-white transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="orden-zona"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Municipio *
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#FF5500] transition-colors">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <select
                    id="orden-zona"
                    value={form.zonaSlug}
                    onChange={(e) => setForm({ ...form, zonaSlug: e.target.value })}
                    className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-sm font-semibold text-slate-900 transition-all cursor-pointer shadow-2xs outline-none"
                  >
                    {ZONAS_COBERTURA.map((z) => (
                      <option
                        key={z.slug}
                        value={z.slug}
                        className="py-2 text-slate-900 font-medium bg-white"
                      >
                        {z.nombre} ({z.tiempoArribo})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-6 h-6 rounded-md bg-slate-200/70 group-hover:bg-[#FF5500] text-slate-600 group-hover:text-white transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de estado en tiempo real mientras se obtiene o confirma el GPS de alta precisión */}
            {estadoGps && (
              <div
                role="status"
                aria-live="polite"
                className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs leading-relaxed transition-all ${
                  estadoGps.tipo === 'obteniendo'
                    ? 'bg-orange-50 border-orange-200 text-orange-900'
                    : estadoGps.tipo === 'exito'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {estadoGps.tipo === 'obteniendo' ? (
                  <Loader2
                    className="w-4 h-4 text-[#FF5500] animate-spin shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : estadoGps.tipo === 'exito' ? (
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <span>{estadoGps.mensaje}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="orden-barrio"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Barrio o punto de referencia *
                  </label>
                  <button
                    type="button"
                    onClick={usarUbicacionPrecisaGps}
                    disabled={obteniendoGps}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF5500] hover:text-[#E04800] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {obteniendoGps ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                    <span>
                      {obteniendoGps ? 'Localizando GPS...' : 'Usar mi ubicación GPS'}
                    </span>
                  </button>
                </div>
                <input
                  id="orden-barrio"
                  type="text"
                  value={form.barrio}
                  onChange={(e) => setForm({ ...form, barrio: e.target.value })}
                  placeholder="Ej. Mayorca, Las Vegas, Parque Itagüí..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                />
                {errores.barrio && <p className="text-xs text-red-600 mt-1">{errores.barrio}</p>}
              </div>

              <div>
                <label
                  htmlFor="orden-vehiculo"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Marca y línea de la moto o carro *
                </label>
                <input
                  id="orden-vehiculo"
                  type="text"
                  value={form.referenciaVehiculo}
                  onChange={(e) => setForm({ ...form, referenciaVehiculo: e.target.value })}
                  placeholder="Ej. Yamaha NMAX, Pulsar 200, Mazda 3"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                />
                {errores.referenciaVehiculo && (
                  <p className="text-xs text-red-600 mt-1">{errores.referenciaVehiculo}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="orden-detalles"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Detalle adicional de la falla (opcional)
              </label>
              <textarea
                id="orden-detalles"
                rows={2}
                value={form.detallesFalla}
                onChange={(e) => setForm({ ...form, detallesFalla: e.target.value })}
                placeholder="Ej. Se apagó andando, llanta trasera pinchada, testigo FI encendido..."
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">Cotización y asesoría inicial GRATIS:</strong>{' '}
              Al oprimir el botón se abrirá nuestro WhatsApp con todos estos datos listos para
              enviarte el mecánico de inmediato.
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="submit"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Enviar datos y abrir WhatsApp</span>
              </button>

              <a
                href={`tel:${BRAND_CONFIG.telefonoE164}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#FF5500]" aria-hidden="true" />
                <span>Llamar ahora</span>
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
