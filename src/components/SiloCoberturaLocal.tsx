import React from 'react';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ZONAS_COBERTURA, BRAND_CONFIG } from '../data/desvaresData';
import { MapaCoberturaAburra } from './MapaCoberturaAburra';

interface SiloCoberturaLocalProps {
  zonaActivaSlug: string;
  barrioSeleccionado: string;
  onCambiarZona: (slug: string, actualizarUrl?: boolean) => void;
  onSeleccionarBarrio: (zonaSlug: string, barrio: string) => void;
}

export const SiloCoberturaLocal: React.FC<SiloCoberturaLocalProps> = ({
  zonaActivaSlug,
  barrioSeleccionado,
  onCambiarZona,
  onSeleccionarBarrio,
}) => {
  const zonaActiva =
    ZONAS_COBERTURA.find((z) => z.slug === zonaActivaSlug) ?? ZONAS_COBERTURA[0];

  return (
    <section
      id="cobertura-local"
      className="py-14 sm:py-18 bg-[#F8FAFC] border-b border-slate-200"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs sm:text-sm font-bold text-[#FF5500] tracking-wide">
            04. Cobertura hiperlocal por municipio y barrio
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Unidades en Itagüí, Sabaneta, Envigado, La Estrella y Medellín
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Visualiza en el mapa las unidades móviles activas en el Valle de Aburrá y selecciona tu
            municipio o barrio para pedir asistencia inmediata.
          </p>
        </div>

        {/* Mapa Interactivo de Cobertura en el Valle de Aburrá */}
        <MapaCoberturaAburra
          zonaActivaSlug={zonaActiva.slug}
          onSeleccionarZonaDesdeMapa={(slug) => onCambiarZona(slug, true)}
        />

        {/* Panel detallado del Municipio Seleccionado */}
        <div className="rounded-xl bg-white border-2 border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Zonas: /zona/{zonaActiva.slug}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#FF5500] font-bold">
                  Arribo estimado: {zonaActiva.tiempoArribo}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-slate-700 font-medium">
                  {zonaActiva.unidadesActivas} unidades en zona
                </span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {zonaActiva.tituloSeo}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                Corredores: <strong className="text-slate-800">{zonaActiva.corredoresPrincipales}</strong>
              </p>
            </div>

            <div className="shrink-0">
              <a
                href={`https://wa.me/${BRAND_CONFIG.whatsappNumero}?text=${encodeURIComponent(
                  `Hola Desvares 123, necesito mecánico de motos / montallantas a domicilio en ${zonaActiva.nombre}${
                    barrioSeleccionado ? ` (Sector ${barrioSeleccionado})` : ''
                  }. Solicito cotización y asesoría gratis a domicilio.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Pedir mecánico en {zonaActiva.nombre}</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Grilla Interactiva de Barrios del Municipio */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Toca tu barrio o sector en{' '}
                <span className="text-[#FF5500] underline decoration-[#FF5500]/40">
                  {zonaActiva.nombre}
                </span>{' '}
                para cargar tu ubicación en la solicitud:
              </p>
              {barrioSeleccionado && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span>Barrio seleccionado: {barrioSeleccionado}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {zonaActiva.barrios.map((barrio) => {
                const seleccionado = barrioSeleccionado === barrio;
                return (
                  <button
                    key={barrio}
                    type="button"
                    onClick={() => onSeleccionarBarrio(zonaActiva.slug, barrio)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left text-xs font-medium border transition-colors whitespace-nowrap truncate cursor-pointer ${
                      seleccionado
                        ? 'bg-[#FF5500] text-white border-[#FF5500] font-semibold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#FF5500] hover:bg-orange-50/40 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{barrio}</span>
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        seleccionado ? 'text-white' : 'text-[#FF5500]'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen rápido de municipios con botón explícito para cambiar de zona */}
          <div className="pt-5 border-t border-slate-200 space-y-2.5">
            <p className="text-xs font-semibold text-slate-500">
              ¿Estás en otro municipio del Valle de Aburrá? Haz clic en cualquiera de las tarjetas para ver todos sus barrios:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {ZONAS_COBERTURA.map((z) => {
                const esActiva = z.slug === zonaActiva.slug;
                return (
                  <button
                    key={z.slug}
                    type="button"
                    onClick={() => onCambiarZona(z.slug, true)}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      esActiva
                        ? 'bg-orange-50/70 border-[#FF5500] ring-1 ring-[#FF5500]/30'
                        : 'bg-slate-50/80 border-slate-200 hover:border-[#FF5500] hover:bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 flex items-center justify-between gap-1">
                        <span>{z.nombre} ({z.tiempoArribo})</span>
                      </span>
                      <p className="text-slate-500 leading-relaxed line-clamp-2">
                        {z.barrios.slice(0, 6).join(' · ')}…
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-[#FF5500] pt-1">
                      <span>
                        {esActiva
                          ? `✓ Municipio activo (${z.barrios.length} barrios)`
                          : `Ver los ${z.barrios.length} barrios →`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
