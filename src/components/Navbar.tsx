import React, { useState } from 'react';
import {
  PhoneCall,
  Wrench,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  ShieldAlert,
  Cpu,
  Clock,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/desvaresData';

interface NavbarProps {
  onAbrirModalDespacho: () => void;
  onResetearZona: () => void;
}

/**
 * Barra de navegación superior con estética luminosa (Motorsport Daylight & Titanium),
 * dropdown interactivo de servicios y menú móvil desplegable estilizado.
 */
export const Navbar: React.FC<NavbarProps> = ({ onAbrirModalDespacho, onResetearZona }) => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [dropdownServiciosAbierto, setDropdownServiciosAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-8 py-2.5 sm:py-3">
        {/* Zona 1: Logotipo automotriz de alta confianza (50% más grande en escritorio y proporcionado en móvil) */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onResetearZona();
            setMenuMovilAbierto(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group inline-flex items-center gap-2.5 sm:gap-3.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#FF5500]"
        >
          {/* Emblema automotriz en grafito y naranja rescate */}
          <span
            data-testid="logo-tool-icon"
            className="relative inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0F172A] border-b-3 border-[#FF5500] text-white shadow-xs group-hover:bg-slate-800 transition-colors shrink-0"
          >
            <Wrench
              className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.4] -rotate-12 group-hover:text-[#FF5500] transition-colors"
              aria-hidden="true"
            />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5500] ring-2 ring-[#0F172A]"
              aria-hidden="true"
            />
          </span>

          {/* Bloque tipográfico simétrico de dos niveles sin expandir kerning */}
          <div className="inline-flex items-center gap-3 shrink-0">
            <div className="inline-flex flex-col justify-center leading-none">
              <span
                data-testid="logo-line-mecanicos"
                className="font-display text-[22px] sm:text-[30px] font-bold tracking-tight text-[#0F172A] leading-[0.88]"
              >
                MECÁNICOS
              </span>
              <span
                data-testid="logo-line-adomicilio"
                className="font-display text-[20.7px] sm:text-[29px] font-bold tracking-tight uppercase text-[#FF5500] leading-[0.9] mt-0.5"
              >
                A domicilio
              </span>
            </div>

            <div className="hidden xl:flex flex-col justify-center pl-3 border-l border-slate-200 leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                Taller móvil
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Valle de Aburrá
              </span>
            </div>
          </div>
        </a>

        {/* Zona 2: Enlaces de navegación con dropdown estilizado para 16 Servicios */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600"
        >
          <a
            href="#asistencia-inmediata"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Asistencia inmediata
          </a>

          <a
            href="#especialidades"
            className="hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Especialidades
          </a>

          {/* Menú Dropdown para 16 Servicios */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownServiciosAbierto(true)}
            onMouseLeave={() => setDropdownServiciosAbierto(false)}
          >
            <a
              href="#catalogo-16-servicios"
              onClick={() => setDropdownServiciosAbierto((prev) => !prev)}
              className="inline-flex items-center gap-1.5 hover:text-[#FF5500] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
            >
              <span>16 servicios</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  dropdownServiciosAbierto ? 'rotate-180 text-[#FF5500]' : ''
                }`}
                aria-hidden="true"
              />
            </a>

            {dropdownServiciosAbierto && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 space-y-1.5">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Categorías de atención
                    </span>
                    <span className="text-[10px] font-bold text-[#FF5500] bg-orange-50 px-1.5 py-0.5 rounded">
                      En sitio
                    </span>
                  </div>

                  <a
                    href="#catalogo-16-servicios"
                    onClick={() => setDropdownServiciosAbierto(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-md bg-orange-100 text-[#FF5500] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FF5500] group-hover:text-white transition-colors">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#FF5500]">
                        Urgencias en vía 24/7
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Moto no prende, montallantas, batería, guayas
                      </p>
                    </div>
                  </a>

                  <a
                    href="#catalogo-16-servicios"
                    onClick={() => setDropdownServiciosAbierto(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                        Electrónica y diagnóstico
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Inyección FI, escáner, scooter CVT, aceite
                      </p>
                    </div>
                  </a>

                  <a
                    href="#catalogo-16-servicios"
                    onClick={() => setDropdownServiciosAbierto(false)}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
                        Taller mayor y motor
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Arrastre, mantenimiento, motores, repuestos
                      </p>
                    </div>
                  </a>

                  <div className="pt-1 border-t border-slate-100">
                    <a
                      href="#catalogo-16-servicios"
                      onClick={() => setDropdownServiciosAbierto(false)}
                      className="block text-center text-xs font-bold text-[#FF5500] hover:underline py-1"
                    >
                      Ver los 16 servicios completos →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

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

        {/* Zona 3: CTA Primaria hacia el filtro inteligente de WhatsApp + Botón hamburguesa móvil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="btn-solicitar-rescate-ahora"
            type="button"
            onClick={() => {
              setMenuMovilAbierto(false);
              onAbrirModalDespacho();
            }}
            data-ga-conversion="solicitar-rescate-ahora"
            data-ga-label="Solicitar rescate ahora"
            data-ga-location="navbar_superior"
            data-ga-channel="whatsapp"
            title={`Solicitar rescate ahora por WhatsApp al ${BRAND_CONFIG.telefonoDisplay}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500] shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Solicitar rescate ahora</span>
            <span className="inline sm:hidden">Solicitar rescate</span>
          </button>

          {/* Botón menú desplegable en móvil */}
          <button
            type="button"
            onClick={() => setMenuMovilAbierto((prev) => !prev)}
            aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={menuMovilAbierto}
            className="lg:hidden inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            {menuMovilAbierto ? (
              <X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuMovilAbierto && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3.5 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1 pb-3 border-b border-slate-100">
            <a
              href="#asistencia-inmediata"
              onClick={() => setMenuMovilAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition-colors"
            >
              <Clock className="w-4 h-4 text-[#FF5500]" />
              <span>Asistencia inmediata</span>
            </a>
            <a
              href="#especialidades"
              onClick={() => setMenuMovilAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition-colors"
            >
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Especialidades</span>
            </a>
            <a
              href="#catalogo-16-servicios"
              onClick={() => setMenuMovilAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition-colors"
            >
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>16 servicios a domicilio</span>
            </a>
            <a
              href="#cobertura-local"
              onClick={() => setMenuMovilAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Cobertura Valle de Aburrá</span>
            </a>
            <a
              href="#preguntas-frecuentes"
              onClick={() => setMenuMovilAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Preguntas frecuentes</span>
            </a>
          </div>

          {/* Acceso directo a WhatsApp y Llamadas con el número 3006036253 */}
          <div className="pt-3 grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp directo</span>
            </a>
            <a
              href={`tel:${BRAND_CONFIG.telefonoE164}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Llamar al taller</span>
            </a>
          </div>
          <p className="text-[11px] text-center text-slate-500 mt-2 font-mono-tabular">
            Línea directa: {BRAND_CONFIG.telefonoDisplay}
          </p>
        </div>
      )}
    </header>
  );
};
