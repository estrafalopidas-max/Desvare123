import React, { useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { Navigation, ShieldCheck, Clock, Truck } from 'lucide-react';
import { ZONAS_COBERTURA, ZonaCobertura, BRAND_CONFIG } from '../data/desvaresData';
import { COORDENADAS_MUNICIPIOS_ABURRA, CoordenadaMunicipioAburra } from '../utils/seoAndTriage';

interface MapaCoberturaAburraProps {
  zonaActivaSlug: string;
  onSeleccionarZonaDesdeMapa: (slug: string) => void;
}

const MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  '';

interface PuntoMapaMunicipio extends CoordenadaMunicipioAburra {
  zona: ZonaCobertura;
  svgX: number;
  svgY: number;
  radioCoberturaSvg: number;
}

// Posiciones proyectadas proporcionalmente de Norte a Sur a lo largo del eje vial del Río Medellín / Autopista Sur
const PUNTOS_MUNICIPIOS_VALLE: PuntoMapaMunicipio[] = COORDENADAS_MUNICIPIOS_ABURRA.map((coord) => {
  const zona = ZONAS_COBERTURA.find((z) => z.slug === coord.slug) ?? ZONAS_COBERTURA[0];
  const posicionesSvg: Record<string, { x: number; y: number; r: number }> = {
    medellin: { x: 470, y: 85, r: 58 },
    envigado: { x: 515, y: 195, r: 54 },
    itagui: { x: 355, y: 225, r: 64 },
    sabaneta: { x: 445, y: 295, r: 52 },
    'la-estrella': { x: 280, y: 345, r: 52 },
  };
  const pos = posicionesSvg[coord.slug] ?? { x: 400, y: 220, r: 54 };
  return {
    ...coord,
    zona,
    svgX: pos.x,
    svgY: pos.y,
    radioCoberturaSvg: pos.r,
  };
});

interface MarcadorMunicipioGmpProps {
  punto: PuntoMapaMunicipio;
  esActivo: boolean;
  onSelect: (slug: string) => void;
}

const MarcadorMunicipioGmp: React.FC<MarcadorMunicipioGmpProps> = ({
  punto,
  esActivo,
  onSelect,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: punto.lat, lng: punto.lng }}
        title={`${punto.nombre} — ${punto.zona.unidadesActivas} unidades móviles (${punto.zona.tiempoArribo})`}
        onClick={() => onSelect(punto.slug)}
      >
        <Pin
          background={esActivo ? '#FF5500' : '#0F172A'}
          borderColor={'#FFFFFF'}
          glyphColor={'#FFFFFF'}
          scale={esActivo ? 1.25 : 1.0}
        />
      </AdvancedMarker>

      {esActivo && marker && (
        <InfoWindow anchor={marker} maxWidth={250}>
          <div className="p-1 text-slate-900 space-y-1">
            <p className="font-bold text-xs text-[#FF5500]">
              {punto.zona.unidadesActivas} unidades móviles activas
            </p>
            <p className="font-bold text-sm">{punto.nombre}</p>
            <p className="text-xs text-slate-600">
              Llegada estimada: <strong>{punto.zona.tiempoArribo}</strong>
            </p>
            <p className="text-[11px] text-slate-500">{punto.sectorReferencia}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

/**
 * Mapa interactivo de cobertura del Valle de Aburrá (Itagüí, Sabaneta, Envigado, La Estrella y Medellín).
 * Combina la vista cartográfica vectorial de unidades móviles con Google Maps.
 */
export const MapaCoberturaAburra: React.FC<MapaCoberturaAburraProps> = ({
  zonaActivaSlug,
  onSeleccionarZonaDesdeMapa,
}) => {
  const tieneApiKeyGmp = Boolean(MAPS_API_KEY && MAPS_API_KEY.trim().length > 5);
  const [modoVista, setModoVista] = useState<'radar' | 'google_maps'>('google_maps');

  const puntoActivo =
    PUNTOS_MUNICIPIOS_VALLE.find((p) => p.slug === zonaActivaSlug) ?? PUNTOS_MUNICIPIOS_VALLE[0];

  const totalUnidades = ZONAS_COBERTURA.reduce((acc, z) => acc + z.unidadesActivas, 0);

  return (
    <div
      data-testid="mapa-cobertura-aburra"
      className="rounded-xl bg-slate-900 text-white border border-slate-800 overflow-hidden shadow-md"
    >
      {/* Cabecera del Mapa con estado de flota y selector de modo siempre visible */}
      <div className="px-4 sm:px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF5500]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
            <span>
              Mapa de cobertura en vivo · {totalUnidades} unidades móviles en el Valle de Aburrá
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Toca cualquier municipio en el mapa (
            <strong className="text-white">
              Itagüí, Sabaneta, Envigado, La Estrella o Medellín
            </strong>
            ) para ver tiempos de llegada y sectores cubiertos.
          </p>
        </div>

        <div
          role="group"
          aria-label="Cambiar vista del mapa de cobertura"
          className="inline-flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0 self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => setModoVista('google_maps')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              modoVista === 'google_maps'
                ? 'bg-[#FF5500] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Google Maps
          </button>
          <button
            type="button"
            onClick={() => setModoVista('radar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              modoVista === 'radar'
                ? 'bg-[#FF5500] text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Esquema vial sur
          </button>
        </div>
      </div>

      {/* Cuerpo del Mapa + Tarjeta lateral del Municipio Activo */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Lienzo del Mapa (8 columnas) */}
        <div className="lg:col-span-8 relative min-h-[360px] sm:min-h-[420px] bg-[#0B1120] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
          {modoVista === 'google_maps' ? (
            tieneApiKeyGmp ? (
              <div className="w-full h-[340px] sm:h-[370px]">
                <APIProvider apiKey={MAPS_API_KEY} language="es" region="CO" libraries={['marker']}>
                  <GoogleMap
                    mapId="DEMO_MAP_ID"
                    defaultCenter={{ lat: 6.1726, lng: -75.6096 }}
                    defaultZoom={12}
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    {PUNTOS_MUNICIPIOS_VALLE.map((punto) => (
                      <MarcadorMunicipioGmp
                        key={punto.slug}
                        punto={punto}
                        esActivo={punto.slug === zonaActivaSlug}
                        onSelect={onSeleccionarZonaDesdeMapa}
                      />
                    ))}
                  </GoogleMap>
                </APIProvider>
              </div>
            ) : (
              <div className="relative w-full h-[340px] sm:h-[370px] bg-slate-900">
                <iframe
                  key={puntoActivo.slug}
                  title={`Google Maps - Cobertura Desvares 123 en ${puntoActivo.nombre}`}
                  src={`https://maps.google.com/maps?q=${puntoActivo.lat},${puntoActivo.lng}&z=13&hl=es&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 backdrop-blur-xs border border-slate-700 text-xs text-white shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#FF5500]" aria-hidden="true" />
                    <span className="font-bold">{puntoActivo.nombre}:</span>
                    <span className="text-emerald-400 font-semibold">
                      {puntoActivo.zona.unidadesActivas} unidades ({puntoActivo.zona.tiempoArribo})
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="relative w-full h-[340px] sm:h-[370px] p-3 sm:p-4">
              {/* Mapa Cartográfico Vectorial Interactivo del Valle de Aburrá */}
              <svg
                viewBox="0 0 760 400"
                role="img"
                aria-label="Mapa interactivo de cobertura de unidades móviles en Itagüí, Sabaneta, Envigado, La Estrella y Medellín"
                className="w-full h-full select-none"
              >
                <defs>
                  <pattern
                    id="grid-aburra"
                    width="38"
                    height="38"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 38 0 L 0 0 0 38"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.10)"
                      strokeWidth="1"
                    />
                  </pattern>
                  <radialGradient id="pulso-naranja" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF5500" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#FF5500" stopOpacity="0.0" />
                  </radialGradient>
                </defs>

                {/* Retícula topográfica de fondo */}
                <rect width="760" height="400" fill="url(#grid-aburra)" />

                {/* Relieve estilizado del Valle de Aburrá (Cordilleras Occidental y Central) */}
                <path
                  d="M 140 0 Q 210 190 120 400 L 0 400 L 0 0 Z"
                  fill="rgba(30, 41, 59, 0.45)"
                />
                <path
                  d="M 640 0 Q 590 210 670 400 L 760 400 L 760 0 Z"
                  fill="rgba(30, 41, 59, 0.45)"
                />

                {/* Eje fluvial Río Medellín y Corredor Vial Autopista Sur / Regional */}
                <path
                  d="M 495 15 C 475 110, 425 185, 385 255 C 345 315, 305 355, 255 395"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeOpacity="0.35"
                />
                {/* Autopista Sur (Línea troncal occidental) */}
                <path
                  d="M 475 20 C 455 115, 395 185, 355 235 C 315 295, 290 335, 240 390"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeDasharray="7 5"
                  strokeOpacity="0.7"
                />
                {/* Av. Las Vegas / Av. El Poblado (Corredor oriental Envigado - Sabaneta) */}
                <path
                  d="M 505 25 C 520 120, 520 185, 515 205 C 495 255, 465 285, 440 335"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeOpacity="0.55"
                />

                {/* Etiquetas de Corredores Viales */}
                <text
                  x="295"
                  y="145"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="600"
                  letterSpacing="0.06em"
                >
                  AUTOPISTA SUR
                </text>
                <text
                  x="540"
                  y="145"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="600"
                  letterSpacing="0.06em"
                >
                  AV. EL POBLADO / LAS VEGAS
                </text>
                <text
                  x="150"
                  y="375"
                  fill="#64748B"
                  fontSize="10"
                  fontWeight="600"
                >
                  VARIANTE CALDAS · ANILLO SUR
                </text>

                {/* Radios de cobertura y Nodos Interactivos por Municipio */}
                {PUNTOS_MUNICIPIOS_VALLE.map((punto) => {
                  const esActivo = punto.slug === zonaActivaSlug;
                  return (
                    <g
                      key={punto.slug}
                      onClick={() => onSeleccionarZonaDesdeMapa(punto.slug)}
                      className="cursor-pointer"
                    >
                      {/* Anillo de cobertura del municipio */}
                      <circle
                        cx={punto.svgX}
                        cy={punto.svgY}
                        r={esActivo ? punto.radioCoberturaSvg + 10 : punto.radioCoberturaSvg}
                        fill={esActivo ? 'rgba(255, 85, 0, 0.20)' : 'rgba(16, 185, 129, 0.08)'}
                        stroke={esActivo ? '#FF5500' : 'rgba(148, 163, 184, 0.35)'}
                        strokeWidth={esActivo ? '2' : '1.2'}
                        strokeDasharray={esActivo ? 'none' : '4 4'}
                      />

                      {/* Pin central del municipio */}
                      <circle
                        cx={punto.svgX}
                        cy={punto.svgY}
                        r={esActivo ? 11 : 8}
                        fill={esActivo ? '#FF5500' : '#10B981'}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />

                      {/* Etiqueta flotante del Municipio con tiempo y unidades */}
                      <g
                        transform={`translate(${punto.svgX}, ${
                          punto.slug === 'sabaneta' || punto.slug === 'la-estrella'
                            ? punto.svgY + 26
                            : punto.svgY - 22
                        })`}
                      >
                        <rect
                          x="-78"
                          y="-14"
                          width="156"
                          height="28"
                          rx="6"
                          fill={esActivo ? '#FF5500' : '#0F172A'}
                          stroke={esActivo ? '#FFFFFF' : '#334155'}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {punto.nombre} · {punto.zona.tiempoArribo}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Controles accesibles por teclado en la base del mapa (visibles en Google Maps y Esquema Vial Sur) */}
          <div
            role="group"
            aria-label="Seleccionar municipio en el mapa del Valle de Aburrá"
            className="px-3 sm:px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {PUNTOS_MUNICIPIOS_VALLE.map((p) => {
                const activo = p.slug === zonaActivaSlug;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    data-testid={`map-pin-${p.slug}`}
                    onClick={() => onSeleccionarZonaDesdeMapa(p.slug)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      activo
                        ? 'bg-[#FF5500] text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activo ? 'bg-white' : 'bg-emerald-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{p.nombre}</span>
                    <span className="font-mono-tabular opacity-85">
                      ({p.zona.unidadesActivas})
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              GPS Centro: {puntoActivo.lat.toFixed(4)}, {puntoActivo.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Panel derecho de estado en tiempo real del municipio seleccionado en el mapa (4 columnas) */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{puntoActivo.zona.unidadesActivas} unidades móviles listas en zona</span>
            </div>

            <div>
              <p className="text-xs text-slate-400">Municipio seleccionado en el mapa:</p>
              <h3
                data-testid="mapa-zona-activa-titulo"
                className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5"
              >
                {puntoActivo.nombre} ({puntoActivo.zona.tiempoArribo})
              </h3>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF5500]" aria-hidden="true" />
                  <span>Tiempo promedio:</span>
                </span>
                <strong className="font-mono-tabular text-white">
                  {puntoActivo.zona.tiempoArribo}
                </strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#FF5500]" aria-hidden="true" />
                  <span>Coordenadas base:</span>
                </span>
                <span className="font-mono-tabular text-slate-200">
                  {puntoActivo.lat.toFixed(4)}, {puntoActivo.lng.toFixed(4)}
                </span>
              </div>

              <div className="pt-1.5 border-t border-slate-800 text-slate-300">
                <span className="text-slate-400 block mb-0.5">Ejes viales cubiertos:</span>
                <strong className="text-white font-medium leading-snug block">
                  {puntoActivo.zona.corredoresPrincipales}
                </strong>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappNumero}?text=${encodeURIComponent(
                `Hola Desvares 123, vi la disponibilidad en el mapa para ${puntoActivo.nombre} (${puntoActivo.zona.tiempoArribo}) y necesito un mecánico / montallantas a domicilio.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              data-ga-conversion="solicitar-rescate-ahora"
              data-ga-label={`Solicitar rescate ahora - Mapa ${puntoActivo.nombre}`}
              data-ga-location="mapa_cobertura"
              data-ga-zone={puntoActivo.slug}
              data-ga-channel="whatsapp"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF5500] hover:bg-[#E04800] text-xs sm:text-sm font-bold text-white transition-colors"
            >
              <span>Solicitar unidad en {puntoActivo.nombre}</span>
            </a>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Cobertura verificada en Itagüí, Sabaneta, Envigado, La Estrella y Medellín.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
