import React from 'react';
import { PhoneCall, Wrench } from 'lucide-react';
import { BRAND_CONFIG } from '../data/desvaresData';

interface NavbarProps {
  onAbrirModalDespacho: () => void;
  onResetearZona: () => void;
}

/**
 * Barra de navegación superior con estética luminosa (Motorsport Daylight & Titanium)
 * cumpliendo el Top Bar Contract de 3 zonas:
 * [Zona 1: Logotipo automotriz de alta confianza] — [Zona 2: 5 enlaces de navegación] — [Zona 3: 1 acción primaria]
 */
export const Navbar: React.FC<NavbarProps> = ({ onAbrirModalDespacho, onResetearZona }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-3 sm:gap-8 px-4 sm:px-8 py-2.5 sm:py-3">
        {/* Zona 1: Ícono de herramienta sutil y nítido + Wordmark con sello local */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onResetearZona();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group inline-flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink min-w-0 focus-visible:outline-2 focus-visible:outline-[#FF5500]"
        >
          {/* Emblema técnico sutil en platino claro con llave mecánica de alto contraste */}
          <span
            data-testid="logo-tool-icon"
            className="relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 border border-slate-200/90 text-[#0F172A] group-hover:border-[#FF5500]/50 group-hover:bg-orange-50/40 transition-colors shrink-0"
          >
            <Wrench
              className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F172A] stroke-[2.25] -rotate-12 group-hover:text-[#FF5500] transition-colors"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-1 sm:bottom-1.5 right-1 sm:right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF5500]"
              aria-hidden="true"
            />
          </span>

          {/* Bloque tipográfico con jerarquía de marca real y descriptor geográfico */}
          <div className="flex flex-col justify-center leading-none min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-display text-xl sm:text-[26px] font-bold tracking-tight text-[#0F172A]">
                DESVARES
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono-tabular text-xs sm:text-sm font-bold tracking-normal border-l-2 border-[#FF5500]">
                123
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.08em] sm:tracking-[0.12em] uppercase text-slate-500 mt-0.5 truncate">
              Taller Móvil · Valle de Aburrá
            </span>
          </div>
        </a>

        {/* Zona 2: 5 enlaces de navegación concisos en una sola línea */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600"
        >
          <a
            href="#asistencia-inmediata"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Asistencia Inmediata
          </a>
          <a
            href="#especialidades"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Especialidades
          </a>
          <a
            href="#catalogo-16-servicios"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            16 Servicios
          </a>
          <a
            href="#cobertura-local"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Cobertura
          </a>
          <a
            href="#preguntas-frecuentes"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Preguntas
          </a>
        </nav>

        {/* Zona 3: 1 Acción Primaria con seguimiento de conversión GA4 (no se desborda en móvil) */}
        <div className="flex items-center shrink-0">
          <button
            id="btn-solicitar-rescate-ahora"
            type="button"
            onClick={onAbrirModalDespacho}
            data-ga-conversion="solicitar-rescate-ahora"
            data-ga-label="Solicitar Rescate Ahora"
            data-ga-location="navbar_superior"
            data-ga-channel="formulario_web"
            title={`Solicitar Rescate Ahora al ${BRAND_CONFIG.telefonoDisplay}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500] shadow-2xs"
          >
            <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
            <span className="hidden xs:inline sm:inline">Solicitar Rescate Ahora</span>
            <span className="inline xs:hidden sm:hidden">Solicitar Rescate</span>
          </button>
        </div>
      </div>
    </header>
  );
};
