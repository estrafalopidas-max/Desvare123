import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import {
  BRAND_CONFIG,
  SERVICIOS_16,
  ZONAS_COBERTURA,
} from '../data/desvaresData';
import {
  construirTriageWhatsapp,
  validarSolicitudDespacho,
  DatosSolicitudDespacho,
} from '../utils/seoAndTriage';
import { TipoToast } from './ToastNotificaciones';

export interface OrdenRegistrada {
  id: string;
  codigoOrden: string;
  nombreCliente: string;
  telefonoContacto: string;
  zonaNombre: string;
  barrio: string;
  servicioTitulo: string;
  tipoVehiculo: string;
  referenciaVehiculo: string;
  detallesFalla: string;
  creadoEn: string;
}

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
  onOrdenCreada: (orden: OrdenRegistrada) => void;
  tokenSesion: string;
  onMostrarToast: (toast: { tipo: TipoToast; titulo: string; mensaje: string }) => void;
}

export const ModalOrdenDespacho: React.FC<ModalOrdenDespachoProps> = ({
  abierto,
  onCerrar,
  valoresIniciales,
  onOrdenCreada,
  tokenSesion,
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
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [ordenConfirmada, setOrdenConfirmada] = useState<OrdenRegistrada | null>(null);

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
      setErrorServidor(null);
    }
  }, [abierto, valoresIniciales]);

  if (!abierto) return null;

  const triagePreview = construirTriageWhatsapp({
    servicioId: form.servicioId,
    zonaSlug: form.zonaSlug,
    barrio: form.barrio,
    tipoVehiculo: form.tipoVehiculo,
    vehiculoMarcaModelo: form.referenciaVehiculo,
  });

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    const validacion = validarSolicitudDespacho(form);
    if (!validacion.valido) {
      setErrores(validacion.errores);
      onMostrarToast({
        tipo: 'error',
        titulo: 'Error en el formulario',
        mensaje:
          'Completa los campos obligatorios (nombre, celular, barrio y vehículo) para enviar la orden.',
      });
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      const respuesta = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenSesion}`,
        },
        body: JSON.stringify(form),
      });

      const data = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(data.error || 'No se pudo registrar la orden de despacho.');
      }

      setOrdenConfirmada(data.orden);
      onOrdenCreada(data.orden);
      onMostrarToast({
        tipo: 'exito',
        titulo: '¡Orden de despacho enviada con éxito!',
        mensaje: `Solicitud #${data.orden.codigoOrden} registrada para ${data.orden.zonaNombre} (${data.orden.barrio}).`,
      });
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : 'Error de conexión al registrar la solicitud.';
      setErrorServidor(mensaje);
      onMostrarToast({
        tipo: 'error',
        titulo: 'No se pudo enviar la orden',
        mensaje,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-despacho-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-900 my-8">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-bold text-[#FF5500]">
              Desvares 123 · Línea Directa {BRAND_CONFIG.telefonoDisplay}
            </p>
            <h2
              id="modal-despacho-titulo"
              className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5"
            >
              {ordenConfirmada
                ? `Solicitud Registrada #${ordenConfirmada.codigoOrden}`
                : 'Solicitar Mecánico a Domicilio o Cotización'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setOrdenConfirmada(null);
              onCerrar();
            }}
            aria-label="Cerrar ventana de solicitud de servicio"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {ordenConfirmada ? (
          <div className="py-5 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Solicitud de servicio registrada con éxito</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Código de solicitud:{' '}
                <strong className="font-mono-tabular text-slate-900">
                  {ordenConfirmada.codigoOrden}
                </strong>{' '}
                para <strong className="text-slate-900">{ordenConfirmada.servicioTitulo}</strong> en{' '}
                <strong className="text-slate-900">
                  {ordenConfirmada.zonaNombre} ({ordenConfirmada.barrio})
                </strong>.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-600">
                Toca el botón inferior para compartir tu ubicación GPS actual al WhatsApp{' '}
                <strong className="font-mono-tabular text-slate-900">
                  {BRAND_CONFIG.telefonoDisplay}
                </strong>:
              </p>

              <a
                href={triagePreview.urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Confirmar Ubicación GPS por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setOrdenConfirmada(null);
                  onCerrar();
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Volver al sitio web
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} noValidate className="mt-4 space-y-4">
            {errorServidor && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                <span>{errorServidor}</span>
              </div>
            )}

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
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Servicio requerido *
                </label>
                <select
                  id="orden-servicio"
                  value={form.servicioId}
                  onChange={(e) => setForm({ ...form, servicioId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                >
                  {SERVICIOS_16.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.numero}. {s.tituloCorto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="orden-zona"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Municipio *
                </label>
                <select
                  id="orden-zona"
                  value={form.zonaSlug}
                  onChange={(e) => setForm({ ...form, zonaSlug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                >
                  {ZONAS_COBERTURA.map((z) => (
                    <option key={z.slug} value={z.slug}>
                      {z.nombre} ({z.tiempoArribo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="orden-barrio"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Barrio o punto de referencia *
                </label>
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
                Detalle adicional (opcional)
              </label>
              <textarea
                id="orden-detalles"
                rows={2}
                value={form.detallesFalla}
                onChange={(e) => setForm({ ...form, detallesFalla: e.target.value })}
                placeholder="Ej. Se apagó andando, llanta trasera pinchada..."
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">Cotización y asesoría inicial GRATIS:</strong>{' '}
              Te confirmamos disponibilidad, tiempo exacto de llegada y valor transparente antes de
              enviar al mecánico.
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={enviando}
                className="w-full sm:flex-1 px-5 py-3 text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {enviando ? 'Enviando solicitud...' : 'Confirmar Solicitud de Servicio'}
              </button>

              <a
                href={triagePreview.urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 text-[#FF5500]" aria-hidden="true" />
                <span>Ir directo a WhatsApp</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
