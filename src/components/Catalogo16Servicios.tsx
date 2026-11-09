import React, { useState } from 'react';
import { Search, MessageSquare, RotateCcw } from 'lucide-react';
import { CategoriaServicio, BRAND_CONFIG } from '../data/desvaresData';
import {
  filtrarServicios,
  construirTriageWhatsapp,
} from '../utils/seoAndTriage';

interface Catalogo16ServiciosProps {
  zonaActualSlug: string;
  barrioActual: string;
  onSeleccionarServicioParaDespacho: (servicioId: string) => void;
}

const TABS_CATEGORIAS: { id: CategoriaServicio | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos los servicios (16)' },
  { id: 'urgencia_vial', label: 'Urgencia vial y montallantas (4)' },
  { id: 'electronica_mantenimiento', label: 'Inyección FI, scooters y preventivo (8)' },
  { id: 'taller_mayor_repuestos', label: 'Motores, colisión y repuestos (4)' },
];

export const Catalogo16Servicios: React.FC<Catalogo16ServiciosProps> = ({
  zonaActualSlug,
  barrioActual,
  onSeleccionarServicioParaDespacho,
}) => {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaServicio | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const serviciosFiltrados = filtrarServicios(categoriaActiva, busqueda);

  return (
    <section
      id="catalogo-16-servicios"
      className="py-14 sm:py-18 bg-white border-b border-slate-200"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Encabezado de Sección Condensado */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs sm:text-sm font-bold text-[#FF5500] tracking-wide">
              03. Catálogo de 16 servicios especializados
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Mecánica de motos, montallantas carros y motos, scooters y taller
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Elige el servicio que necesitas para pedir un mecánico a domicilio o cotizar gratis
              por WhatsApp al{' '}
              <span className="font-mono-tabular text-slate-900 font-semibold">
                {BRAND_CONFIG.telefonoDisplay}
              </span>.
            </p>
          </div>

          {/* Buscador en tiempo real */}
          <div className="w-full lg:w-80 shrink-0">
            <label htmlFor="buscar-servicio" className="sr-only">
              Buscar síntoma o servicio mecánico
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="buscar-servicio"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar: scooter, batería, guaya, motor..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5500]"
              />
            </div>
          </div>
        </div>

        {/* Barra de Filtros Interactivos (Segmented Controls) */}
        <div
          role="tablist"
          aria-label="Filtrar catálogo por tipo de servicio"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 mb-6"
        >
          {TABS_CATEGORIAS.map((tab) => {
            const activo = categoriaActiva === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activo}
                type="button"
                onClick={() => setCategoriaActiva(tab.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activo
                    ? 'bg-[#FF5500] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Conteo accesible */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span data-testid="servicios-count">
            Mostrando{' '}
            <strong className="font-mono-tabular text-slate-900">
              {serviciosFiltrados.length}
            </strong>{' '}
            de 16 servicios especializados
          </span>
          {(categoriaActiva !== 'todos' || busqueda.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setCategoriaActiva('todos');
                setBusqueda('');
              }}
              className="inline-flex items-center gap-1.5 font-semibold text-[#FF5500] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Restablecer filtros</span>
            </button>
          )}
        </div>

        {/* Grilla de los 16 servicios */}
        {serviciosFiltrados.length === 0 ? (
          <div className="p-10 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <p className="font-display text-2xl font-bold text-slate-900">
              No encontramos un servicio con "{busqueda}"
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Restablece la búsqueda para ver las 16 especialidades o escríbenos por WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategoriaActiva('todos');
                setBusqueda('');
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#FF5500] rounded-lg hover:bg-[#E04800] transition-colors cursor-pointer"
            >
              Ver los 16 servicios completos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviciosFiltrados.map((servicio) => {
              const triageCard = construirTriageWhatsapp({
                servicioId: servicio.id,
                zonaSlug: zonaActualSlug,
                barrio: barrioActual,
              });

              return (
                <article
                  key={servicio.id}
                  className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono-tabular font-bold text-[#FF5500]">
                        #{servicio.numero}
                      </span>
                      <span>
                        {servicio.etiquetaCategoria} ·{' '}
                        <strong className="font-mono-tabular text-slate-700 font-semibold">
                          {servicio.tiempoRespuesta}
                        </strong>
                      </span>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {servicio.titulo}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {servicio.descripcion}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSeleccionarServicioParaDespacho(servicio.id)}
                      className="flex-1 px-3 py-2 text-xs font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors whitespace-nowrap truncate cursor-pointer"
                    >
                      Solicitar {servicio.tituloCorto}
                    </button>

                    <a
                      href={triageCard.urlWhatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Solicitar ${servicio.tituloCorto} por WhatsApp`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shrink-0"
                    >
                      <MessageSquare className="w-4 h-4 text-[#FF5500]" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

