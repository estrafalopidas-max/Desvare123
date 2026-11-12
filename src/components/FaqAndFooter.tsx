import React, { useState } from 'react';
import { ChevronDown, Wrench, MessageSquare, Phone } from 'lucide-react';
import {
  BRAND_CONFIG,
  PREGUNTAS_FRECUENTES,
  ZONAS_COBERTURA,
} from '../data/desvaresData';

interface FaqAndFooterProps {
  onAbrirModalDespacho: () => void;
  onCambiarZona: (slug: string, actualizarUrl?: boolean) => void;
}

const TESTIMONIOS_ATRIBUIBLES = [
  {
    id: 'testimonio-1',
    nombre: 'Mauricio Restrepo',
    rol: 'Coordinador Logístico · San Fernando, Itagüí',
    vehiculo: 'Yamaha NMAX Connected 155',
    relato:
      'Mi scooter rompió la correa CVT a las 6:40 AM. En 22 minutos llegó la unidad móvil con la correa original, limpiaron el variador y a las 7:35 AM seguí mi ruta.',
  },
  {
    id: 'testimonio-2',
    nombre: 'Catalina Vélez',
    rol: 'Arquitecta · Sector Aves María, Sabaneta',
    vehiculo: 'Mazda CX-30 & KTM Duke 200',
    relato:
      'Tenía una llanta de la camioneta pinchada en el sótano y la moto sin batería. En una sola visita despincharon la camioneta y verificaron el sistema de carga de la Duke.',
  },
  {
    id: 'testimonio-3',
    nombre: 'Sebastián Cardona',
    rol: 'Ingeniero de Software · Las Vegas, Envigado',
    vehiculo: 'Bajaj Dominar 400 UG',
    relato:
      'La moto no prendía y marcaba testigo FI. Llegaron con escáner electrónico, detectaron la falla en el sensor TPS, me dieron cotización clara antes de iniciar y dejaron la moto con garantía.',
  },
];

export const FaqAndFooter: React.FC<FaqAndFooterProps> = ({
  onAbrirModalDespacho,
  onCambiarZona,
}) => {
  const [abiertaId, setAbiertaId] = useState<string>(PREGUNTAS_FRECUENTES[0].id);

  return (
    <>
      {/* Casos Reales Condensados */}
      <section className="py-14 sm:py-18 bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="max-w-3xl mb-8 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-[#FF5500] tracking-wide">
              05. Casos reales en el Valle de Aburrá
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Conductores atendidos en Itagüí, Sabaneta y Envigado
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TESTIMONIOS_ATRIBUIBLES.map((item) => (
              <article
                key={item.id}
                className="rounded-xl bg-[#F8FAFC] border border-slate-200/90 p-6 flex flex-col justify-between space-y-4"
              >
                <p className="text-sm text-slate-700 leading-relaxed">"{item.relato}"</p>
                <div className="pt-4 border-t border-slate-200 space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{item.nombre}</p>
                  <p className="text-xs text-slate-500">{item.rol}</p>
                  <p className="text-xs text-[#FF5500] font-semibold pt-0.5">
                    Vehículo: {item.vehiculo}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sección 06: Preguntas Frecuentes (Sincronizadas con Schema FAQPage) */}
      <section
        id="preguntas-frecuentes"
        className="py-14 sm:py-18 bg-[#F8FAFC] border-b border-slate-200"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-3.5">
              <p className="text-xs sm:text-sm font-bold text-[#FF5500] tracking-wide">
                06. Preguntas frecuentes y tarifas
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                Resolvemos tus dudas al instante
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tiempos de llegada, montallantas para carros y motos, escáner FI y recogida para
                motores o colisión.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onAbrirModalDespacho}
                  data-ga-conversion="solicitar-rescate-ahora"
                  data-ga-label="Solicitar mecánico a domicilio - FAQ"
                  data-ga-location="faq_seccion"
                  data-ga-channel="whatsapp"
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#FF5500] hover:bg-[#E04800] rounded-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Solicitar mecánico a domicilio</span>
                </button>
                <a
                  href={`tel:${BRAND_CONFIG.telefonoE164}`}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#FF5500] shrink-0" aria-hidden="true" />
                  <span>Llamar ahora</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {PREGUNTAS_FRECUENTES.map((faq) => {
                const expandida = abiertaId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs"
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={expandida}
                        onClick={() => setAbiertaId(expandida ? '' : faq.id)}
                        className="w-full flex items-center justify-between gap-4 p-5 text-left text-sm sm:text-base font-bold text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.pregunta}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#FF5500] shrink-0 transition-transform duration-150 ${
                            expandida ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    {expandida && (
                      <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.respuesta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer en Grafito Elegante (#111827, estilo MotoÉlite/Ridez) */}
      <footer className="bg-[#111827] pt-12 pb-20 lg:pb-12 text-xs text-slate-400">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3.5">
                <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border-b-3 border-[#FF5500] shrink-0">
                  <Wrench
                    className="w-6 h-6 text-white stroke-[2.4] -rotate-12"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5500] ring-2 ring-slate-800"
                    aria-hidden="true"
                  />
                </span>
                <div className="inline-flex flex-col justify-center leading-none">
                  <span className="font-display text-[30px] font-bold tracking-tight text-white leading-[0.88]">
                    MECÁNICOS
                  </span>
                  <span className="font-display text-[29px] font-bold tracking-tight uppercase text-[#FF5500] leading-[0.9] mt-0.5">
                    A domicilio
                  </span>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Mecánica de motos a domicilio, montallantas carros y motos, inyección electrónica
                (Fuel Injection / Full Inyección FI), escáner, scooters, colisión y motores.
              </p>
              <div className="pt-1 space-y-2 text-xs text-slate-300">
                <p className="font-mono-tabular text-sm font-semibold text-white leading-snug">
                  <span className="block">WhatsApp y Llamadas:</span>
                  <span className="block">{BRAND_CONFIG.telefonoDisplay}</span>
                </p>
                <p className="leading-snug">
                  <span className="text-slate-400">Dirección: </span>
                  <span className="text-white font-medium">{BRAND_CONFIG.direccionTaller}</span>
                </p>
                <p className="leading-snug">
                  <span className="text-slate-400">Correo: </span>
                  <a
                    href={`mailto:${BRAND_CONFIG.emailContacto}`}
                    className="text-white font-medium hover:text-[#FF5500] transition-colors"
                  >
                    {BRAND_CONFIG.emailContacto}
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-white text-sm">Urgencias en vía</p>
              <ul className="space-y-1.5">
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    La moto no prende — Desvare en vía
                  </a>
                </li>
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Montallantas a domicilio carros y motos
                  </a>
                </li>
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Reinicio y venta de baterías a domicilio
                  </a>
                </li>
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Cambio de guayas de clutch y acelerador
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-white text-sm">Especialidades y taller</p>
              <ul className="space-y-1.5">
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Inyección electrónica (Full Inyección FI) y escáner
                  </a>
                </li>
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Experto en motos scooter y automáticas
                  </a>
                </li>
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Cambio de aceite y kit de arrastre
                  </a>
                </li>
                <li>
                  <a href="#catalogo-16-servicios" className="hover:text-white transition-colors">
                    Reparación de motores, colisión y repuestos
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-white text-sm">Rutas locales de cobertura</p>
              <ul className="space-y-1.5">
                {ZONAS_COBERTURA.map((z) => (
                  <li key={z.slug}>
                    <a
                      href={`/zona/${z.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onCambiarZona(z.slug, true);
                        document
                          .getElementById('cobertura-local')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors"
                    >
                      Mecánico y montallantas en {z.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              © {new Date().getFullYear()} Mecánicos a domicilio (mecanicosadomicilio.org) · Todos
              los derechos reservados · Desarrollado y diseñado por Reakta Group.
            </p>
            <p className="text-slate-400">
              {BRAND_CONFIG.horarioTexto}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
