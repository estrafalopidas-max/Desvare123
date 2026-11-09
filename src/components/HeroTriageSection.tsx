import React, { useState } from 'react';
import { MessageSquare, Phone, ShieldCheck, MapPin, LocateFixed, ChevronDown, Wrench } from 'lucide-react';
import {
  BRAND_CONFIG,
  SERVICIOS_16,
  ZONAS_COBERTURA,
  ZonaCobertura,
} from '../data/desvaresData';
import {
  construirTriageWhatsapp,
  obtenerAtributosImagenOptimizada,
  resolverUbicacionGpsAburra,
} from '../utils/seoAndTriage';
import { TipoToast } from './ToastNotificaciones';

interface HeroTriageSectionProps {
  servicioSeleccionadoId: string;
  onSelectServicio: (id: string) => void;
  zonaSeleccionadaSlug: string;
  onSelectZona: (slug: string) => void;
  barrioSeleccionado: string;
  onChangeBarrio: (barrio: string) => void;
  zonaRutaActiva: ZonaCobertura | null;
  onAbrirModalConDatos: (params: {
    servicioId: string;
    zonaSlug: string;
    barrio: string;
    tipoVehiculo: 'Moto' | 'Scooter' | 'Carro / Camioneta';
    referenciaVehiculo: string;
  }) => void;
  onMostrarToast: (toast: { tipo: TipoToast; titulo: string; mensaje: string }) => void;
}

export const HeroTriageSection: React.FC<HeroTriageSectionProps> = ({
  servicioSeleccionadoId,
  onSelectServicio,
  zonaSeleccionadaSlug,
  onSelectZona,
  barrioSeleccionado,
  onChangeBarrio,
  zonaRutaActiva,
  onAbrirModalConDatos,
  onMostrarToast,
}) => {
  const [tipoVehiculo, setTipoVehiculo] = useState<'Moto' | 'Scooter' | 'Carro / Camioneta'>('Moto');
  const [referenciaVehiculo, setReferenciaVehiculo] = useState('');
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [obteniendoGps, setObteniendoGps] = useState(false);

  const usarUbicacionActualGps = () => {
    setObteniendoGps(true);

    const aplicarCoordenadas = (lat: number, lng: number) => {
      const resuelto = resolverUbicacionGpsAburra(lat, lng, zonaSeleccionadaSlug);
      if (resuelto.zonaSlug !== zonaSeleccionadaSlug) {
        onSelectZona(resuelto.zonaSlug);
      }
      onChangeBarrio(resuelto.barrioFormateado);
      setObteniendoGps(false);
      onMostrarToast({
        tipo: 'exito',
        titulo: 'Ubicación GPS completada',
        mensaje: `Zona asignada: ${resuelto.zonaNombre} · ${resuelto.barrioFormateado}`,
      });
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          aplicarCoordenadas(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Respaldo inmediato con coordenadas del municipio activo cuando el navegador o iframe restringe el sensor GPS
          aplicarCoordenadas(Number.NaN, Number.NaN);
        },
        { enableHighAccuracy: true, timeout: 2000, maximumAge: 60000 }
      );
    } else {
      aplicarCoordenadas(Number.NaN, Number.NaN);
    }
  };

  const resultadoTriage = construirTriageWhatsapp({
    servicioId: servicioSeleccionadoId,
    zonaSlug: zonaSeleccionadaSlug,
    barrio: barrioSeleccionado,
    tipoVehiculo,
    vehiculoMarcaModelo: referenciaVehiculo,
  });

  const _zonaRutaActiva = zonaRutaActiva;
  void _zonaRutaActiva;

  const imgHeroAttrs = obtenerAtributosImagenOptimizada(BRAND_CONFIG.imagenes.hero, {
    esPrioritaria: true,
  });

  const esCarroOCamioneta = tipoVehiculo === 'Carro / Camioneta';
  const serviciosDisponibles = esCarroOCamioneta
    ? SERVICIOS_16.filter(
        (s) => s.id === 'montallantas-carros-y-motos' || s.id === 'reinicio-de-bateria'
      )
    : SERVICIOS_16;

  const seleccionarTipoVehiculo = (tipo: 'Moto' | 'Scooter' | 'Carro / Camioneta') => {
    setTipoVehiculo(tipo);
    if (tipo === 'Carro / Camioneta') {
      if (
        servicioSeleccionadoId !== 'montallantas-carros-y-motos' &&
        servicioSeleccionadoId !== 'reinicio-de-bateria'
      ) {
        onSelectServicio('montallantas-carros-y-motos');
      }
    }
  };

  return (
    <section
      id="asistencia-inmediata"
      className="relative overflow-hidden border-b border-slate-200 bg-slate-900"
    >
      {/* Video y Fotografía Base de Banner Completo (Full-Bleed) con Poster WebP Instantáneo y Scrim Medido */}
      <div className="absolute inset-0 z-0">
        {!imgError ? (
          <picture className="block w-full h-full">
            <source
              type="image/webp"
              srcSet={imgHeroAttrs.webpSrcSet}
              sizes={imgHeroAttrs.sizes}
            />
            <img
              src={imgHeroAttrs.fallbackJpg}
              alt="Unidad móvil de rescate mecánico de motos y montallantas a domicilio Desvares 123"
              width={1280}
              height={720}
              loading={imgHeroAttrs.loading}
              decoding={imgHeroAttrs.decoding}
              fetchPriority={imgHeroAttrs.fetchPriority}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center"
            />
          </picture>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}

        {!videoError && (
          <video
            data-testid="hero-background-video"
            src={BRAND_CONFIG.imagenes.videoHero}
            poster={imgHeroAttrs.webpSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)}
            aria-label="Video de mecánico de motos y unidad móvil Desvares 123 en atención nocturna"
            className="hidden md:block absolute inset-0 w-full h-full object-cover object-center"
          />
        )}

        {/* Scrim de contraste graduado: denso a la izquierda para lectura AA, más translúcido al centro/derecha para lucir el video en vivo */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20" />
      </div>

      {/* Contenido Principal sobre el Banner Completo */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Columna Izquierda: Mensaje Condensado y Directo sobre el Banner (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-white">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
              <span>Itagüí · Sabaneta · Envigado · La Estrella · Medellín</span>
              <span className="mx-2 text-white/40" aria-hidden="true">·</span>
              <span className="text-[#FF5500] font-mono-tabular">
                Llegada: {resultadoTriage.tiempoEstimado}
              </span>
            </p>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-white leading-[0.98]">
              Mecánico de motos y montallantas{' '}
              <span className="text-[#FF5500]">a domicilio.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
              ¿La moto no prende, batería descargada o llanta pinchada en carro o moto? Llegamos
              donde estés. Expertos en{' '}
              <strong className="text-white font-semibold">
                full inyección, Scooters, Escáner, Motores y Colisión
              </strong>.
            </p>

            {/* Botones rápidos de llamada y regla clara condensada */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={resultadoTriage.urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>WhatsApp directo: {BRAND_CONFIG.telefonoDisplay}</span>
              </a>

              <a
                href={`tel:${BRAND_CONFIG.telefonoE164}`}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-lg backdrop-blur-xs transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#FF5500] shrink-0" aria-hidden="true" />
                <span>Llamar ahora</span>
              </a>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-slate-950/75 border border-white/15 backdrop-blur-xs text-xs sm:text-sm text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#FF5500] shrink-0" aria-hidden="true" />
              <span>
                Cotización y asesoría técnica{' '}
                <strong className="text-white">GRATIS por WhatsApp</strong> · Garantía escrita en
                cada servicio.
              </span>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Solicitud Luminoso de Alto Contraste (5 cols) */}
          <div className="lg:col-span-5">
            <div className="w-full rounded-xl bg-white text-slate-900 border border-slate-200/90 shadow-xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <p className="text-xs font-bold text-[#FF5500] tracking-wide">
                  01. Solicitud de asistencia inmediata
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Solicita tu mecánico en 3 clics
                </h2>
              </div>

              <div className="space-y-3.5">
                {/* Paso 1: Tipo de vehículo (permite adaptar el catálogo de inmediato) */}
                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Tipo de vehículo
                  </span>
                  <div
                    role="group"
                    aria-label="Seleccionar tipo de vehículo"
                    className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200"
                  >
                    {(['Moto', 'Scooter', 'Carro / Camioneta'] as const).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => seleccionarTipoVehiculo(tipo)}
                        className={`px-2.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                          tipoVehiculo === tipo
                            ? 'bg-[#FF5500] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paso 2: Servicio requerido (restringido automáticamente para Carro / Camioneta) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="triage-servicio"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      2. ¿Qué necesitas hoy?
                    </label>
                    {esCarroOCamioneta && (
                      <span className="text-[11px] font-semibold text-[#FF5500] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                        Solo carro / camioneta
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#FF5500] transition-colors">
                      <Wrench className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <select
                      id="triage-servicio"
                      value={servicioSeleccionadoId}
                      onChange={(e) => onSelectServicio(e.target.value)}
                      className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-sm font-semibold text-slate-900 transition-all cursor-pointer shadow-2xs outline-none"
                    >
                      {serviciosDisponibles.map((s) => (
                        <option key={s.id} value={s.id} className="py-2 text-slate-900 font-medium bg-white">
                          {s.numero}. {s.tituloCorto} — ({s.etiquetaCategoria})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-6 h-6 rounded-md bg-slate-200/70 group-hover:bg-[#FF5500] text-slate-600 group-hover:text-white transition-colors">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Paso 3: Municipio y Barrio con botón 'Usar mi ubicación actual' */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. Zona de atención
                    </span>
                    <button
                      id="btn-usar-ubicacion-actual"
                      type="button"
                      onClick={usarUbicacionActualGps}
                      disabled={obteniendoGps}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 border border-[#FF5500]/30 text-xs font-bold text-[#FF5500] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <LocateFixed className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {obteniendoGps ? 'Detectando GPS...' : 'Usar mi ubicación actual'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="triage-zona"
                        className="block text-xs font-medium text-slate-600 mb-1.5"
                      >
                        Municipio
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-[#FF5500] transition-colors">
                          <MapPin className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <select
                          id="triage-zona"
                          value={zonaSeleccionadaSlug}
                          onChange={(e) => onSelectZona(e.target.value)}
                          className="w-full appearance-none pl-9 pr-9 py-2.5 rounded-xl bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-300 hover:border-slate-400 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 text-sm font-semibold text-slate-900 transition-all cursor-pointer shadow-2xs outline-none"
                        >
                          {ZONAS_COBERTURA.map((z) => (
                            <option key={z.slug} value={z.slug} className="py-2 text-slate-900 font-medium bg-white">
                              {z.nombre} ({z.tiempoArribo})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center w-5 h-5 rounded bg-slate-200/70 group-hover:bg-[#FF5500] text-slate-600 group-hover:text-white transition-colors">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="triage-barrio"
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Barrio / Sector
                      </label>
                      <input
                        id="triage-barrio"
                        type="text"
                        value={barrioSeleccionado}
                        onChange={(e) => onChangeBarrio(e.target.value)}
                        placeholder="Ej. Aves María, Las Vegas..."
                        className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>
                </div>

                {/* Referencia opcional */}
                <div>
                  <label
                    htmlFor="triage-referencia"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Marca / Línea (opcional)
                  </label>
                  <input
                    id="triage-referencia"
                    type="text"
                    value={referenciaVehiculo}
                    onChange={(e) => setReferenciaVehiculo(e.target.value)}
                    placeholder="Ej. NMAX, Pulsar 200, Mazda 3..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                {/* Resumen compacto en vivo */}
                <div
                  data-testid="triage-summary-box"
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="text-slate-500 block">Servicio en:</span>
                    <span className="font-semibold text-slate-900">
                      {resultadoTriage.servicio.tituloCorto} · {resultadoTriage.zona.nombre}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-tabular font-bold text-[#FF5500] block">
                      {resultadoTriage.tiempoEstimado}
                    </span>
                    <span className="text-emerald-700 font-semibold">Cotización GRATIS</span>
                  </div>
                </div>
              </div>

              {/* Botones de Conversión Directa con seguimiento GA4 */}
              <div className="space-y-2 pt-1">
                <a
                  href={resultadoTriage.urlWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ga-conversion="solicitar-rescate-ahora"
                  data-ga-label="Solicitar rescate ahora - WhatsApp Triage"
                  data-ga-location="hero_triage_whatsapp"
                  data-ga-service={servicioSeleccionadoId}
                  data-ga-zone={zonaSeleccionadaSlug}
                  data-ga-channel="whatsapp"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Solicitar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  data-ga-conversion="solicitar-rescate-ahora"
                  data-ga-label="Solicitar rescate ahora - Formulario Web"
                  data-ga-location="hero_triage_web"
                  data-ga-service={servicioSeleccionadoId}
                  data-ga-zone={zonaSeleccionadaSlug}
                  data-ga-channel="formulario_web"
                  onClick={() =>
                    onAbrirModalConDatos({
                      servicioId: servicioSeleccionadoId,
                      zonaSlug: zonaSeleccionadaSlug,
                      barrio: barrioSeleccionado,
                      tipoVehiculo,
                      referenciaVehiculo,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#FF5500] shrink-0" aria-hidden="true" />
                  <span>Solicitar desde la web</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Franja inferior de 4 KPIs concisos */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/80 text-slate-900 shadow-xs">
            <p className="font-mono-tabular text-2xl font-bold text-slate-900">20–30 min</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Arribo promedio en Itagüí, Sabaneta, Envigado y La Estrella
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/80 text-slate-900 shadow-xs">
            <p className="font-mono-tabular text-2xl font-bold text-slate-900">+4.800</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Desvares, despinches carros/motos y escáner realizados
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/80 text-slate-900 shadow-xs">
            <p className="font-display text-2xl font-bold text-[#FF5500]">Cotización gratis</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Asesoría inmediata por WhatsApp y precios claros antes de iniciar
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200/80 text-slate-900 shadow-xs">
            <p className="font-mono-tabular text-2xl font-bold text-slate-900">16 servicios</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Montallantas, baterías, FI, scooters, motores y colisión
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
