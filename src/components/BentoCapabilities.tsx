import React, { useState } from 'react';
import { ArrowUpRight, Wrench } from 'lucide-react';
import { BRAND_CONFIG } from '../data/desvaresData';
import { obtenerAtributosImagenOptimizada } from '../utils/seoAndTriage';

interface BentoCapabilitiesProps {
  onSeleccionarEspecialidad: (servicioId: string) => void;
}

interface TarjetaEspecialidad {
  id: string;
  servicioId: string;
  indice: string;
  titulo: string;
  subtituloMetadatos: string;
  descripcion: string;
  evidenciaCuantitativa: string;
  imagenUrl: string;
  colSpanClass: string;
  ctaTexto: string;
}

const TARJETAS_BENTO: TarjetaEspecialidad[] = [
  {
    id: 'bento-montallantas',
    servicioId: 'montallantas-carros-y-motos',
    indice: '01. Asistencia vial mixta',
    titulo: 'Montallantas carros y motos + reinicio de batería',
    subtituloMetadatos: 'Sellomatic y neumático · Despinche en vía · Iniciador 12V',
    descripcion:
      'Atendemos automóviles, camionetas y motos pinchados o sin batería en vía, casa o centro comercial sin rayar el rin.',
    evidenciaCuantitativa: 'Llegada promedio en 22 min por Av. El Poblado, Las Vegas y Autopista Sur.',
    imagenUrl: BRAND_CONFIG.imagenes.montallantas,
    colSpanClass: 'lg:col-span-7',
    ctaTexto: 'Solicitar montallantas / batería',
  },
  {
    id: 'bento-inyeccion',
    servicioId: 'full-inyeccion',
    indice: '02. Diagnóstico computarizado',
    titulo: 'Inyección electrónica (Full Inyección FI) y escáner',
    subtituloMetadatos: 'Fuel Injection OBD2 · Ultrasonido · Cuerpo de aceleración',
    descripcion:
      'Diagnosticamos sistemas Fuel Injection con escáner real antes de cambiar repuestos. Solución a testigos FI/ABS, pérdida de potencia y sensores.',
    evidenciaCuantitativa: '98% de efectividad en detección de fallas eléctricas en primera visita.',
    imagenUrl: BRAND_CONFIG.imagenes.inyeccionScanner,
    colSpanClass: 'lg:col-span-5',
    ctaTexto: 'Agendar escáner / FI',
  },
  {
    id: 'bento-scooter',
    servicioId: 'experto-motos-scooter',
    indice: '03. Transmisión CVT y preventivo',
    titulo: 'Experto en scooters, kit de arrastre y aceite',
    subtituloMetadatos: 'Variador y correa CVT · Guayas · Frenos DOT4',
    descripcion:
      'Especialistas en NMAX, PCX, BWS, Agility y Victory, más instalación de kit de arrastre, guayas y cambio de aceite a domicilio.',
    evidenciaCuantitativa: 'Stock móvil de correas originales, dados, guayas, pastillas y lubricantes.',
    imagenUrl: BRAND_CONFIG.imagenes.scooterExpert,
    colSpanClass: 'lg:col-span-5',
    ctaTexto: 'Solicitar experto en scooters',
  },
  {
    id: 'bento-motor-colision',
    servicioId: 'reparacion-de-motores',
    indice: '04. Taller mayor y siniestros',
    titulo: 'Reparación de motores (2T/4T), colisión y repuestos',
    subtituloMetadatos: 'Recogida segura a domicilio · Chasis y barras · Garantía escrita',
    descripcion:
      'Recogemos tu moto a domicilio para reparación de motor, cilindro, biela, caja de cambios o reconstrucción integral por choque.',
    evidenciaCuantitativa: 'Garantía escrita de 3 a 6 meses en motores y enderezado estructural.',
    imagenUrl: BRAND_CONFIG.imagenes.motorColision,
    colSpanClass: 'lg:col-span-7',
    ctaTexto: 'Cotizar motor o colisión',
  },
];

export const BentoCapabilities: React.FC<BentoCapabilitiesProps> = ({
  onSeleccionarEspecialidad,
}) => {
  const [erroresImg, setErroresImg] = useState<Record<string, boolean>>({});

  return (
    <section
      id="especialidades"
      className="py-14 sm:py-18 bg-[#F8FAFC] border-b border-slate-200"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="max-w-3xl mb-9 space-y-2">
          <p className="text-xs sm:text-sm font-bold text-[#FF5500] tracking-wide">
            02. Especialidades en sitio y taller mayor
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Desde un despinche en vía hasta motores y colisión
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Unidades móviles equipadas para urgencias y centro técnico especializado para
            intervenciones mayores.
          </p>
        </div>

        {/* Grilla Bento Asimétrica en Paleta Luminosa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {TARJETAS_BENTO.map((card) => {
            const imgAttrs = obtenerAtributosImagenOptimizada(card.imagenUrl);

            return (
              <article
                key={card.id}
                className={`${card.colSpanClass} rounded-xl bg-white border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between`}
              >
                {/* Fotografía en formato WebP con lazy loading y badge limpio en la base */}
                <div className="relative h-52 sm:h-60 w-full bg-slate-900 overflow-hidden border-b border-slate-200">
                  {!erroresImg[card.id] ? (
                    <picture className="block w-full h-full">
                      <source
                        type="image/webp"
                        srcSet={imgAttrs.webpSrcSet}
                        sizes={imgAttrs.sizes}
                      />
                      <img
                        src={imgAttrs.fallbackJpg}
                        alt={card.titulo}
                        width={800}
                        height={600}
                        loading={imgAttrs.loading}
                        decoding={imgAttrs.decoding}
                        fetchPriority={imgAttrs.fetchPriority}
                        onError={() =>
                          setErroresImg((prev) => ({ ...prev, [card.id]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 p-6">
                      <Wrench className="w-8 h-8 text-[#FF5500] mr-3" aria-hidden="true" />
                      <span className="font-display text-lg text-white">{card.titulo}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-5 right-5">
                    <p className="text-xs font-bold text-white">{card.indice}</p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">{card.subtituloMetadatos}</p>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      {card.titulo}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {card.descripcion}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-600 max-w-md">
                      <strong className="text-slate-900 font-semibold">Respaldo:</strong>{' '}
                      {card.evidenciaCuantitativa}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSeleccionarEspecialidad(card.servicioId)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-[#FF5500] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{card.ctaTexto}</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
