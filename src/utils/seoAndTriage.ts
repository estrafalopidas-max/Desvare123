import {
  BRAND_CONFIG,
  CategoriaServicio,
  PREGUNTAS_FRECUENTES,
  SERVICIOS_16,
  ServicioItem,
  ZONAS_COBERTURA,
  ZonaCobertura,
} from '../data/desvaresData';

export interface ParametrosTriage {
  servicioId: string;
  zonaSlug: string;
  barrio?: string;
  vehiculoMarcaModelo?: string;
  tipoVehiculo?: 'Moto' | 'Scooter' | 'Carro / Camioneta';
}

export interface ResultadoTriage {
  servicio: ServicioItem;
  zona: ZonaCobertura;
  tiempoEstimado: string;
  mensajeTextoPlano: string;
  urlWhatsapp: string;
}

/**
 * Construye el mensaje de triage operativo con Cotización y Asesoría GRATIS
 * y genera la URL oficial de WhatsApp hacia +57 300 1899288.
 */
export function construirTriageWhatsapp(params: ParametrosTriage): ResultadoTriage {
  const servicio =
    SERVICIOS_16.find((s) => s.id === params.servicioId) ?? SERVICIOS_16[0];
  const zona =
    ZONAS_COBERTURA.find((z) => z.slug === params.zonaSlug) ?? ZONAS_COBERTURA[0];

  const sectorDetalle =
    params.barrio && params.barrio.trim().length > 0
      ? `${zona.nombre} (Sector: ${params.barrio.trim()})`
      : zona.nombre;

  const vehiculoDetalle =
    params.vehiculoMarcaModelo && params.vehiculoMarcaModelo.trim().length > 0
      ? `${params.tipoVehiculo ?? 'Moto'} - ${params.vehiculoMarcaModelo.trim()}`
      : params.tipoVehiculo ?? 'Motocicleta';

  const mensajeLineas = [
    `Hola *${BRAND_CONFIG.nombre}*, solicito cotización gratis y asistencia a domicilio:`,
    `• *Servicio:* ${servicio.tituloCorto} (${servicio.numero})`,
    `• *Ubicación:* ${sectorDetalle}`,
    `• *Vehículo:* ${vehiculoDetalle}`,
    `A continuación envío mi ubicación o detalles para atención inmediata:`,
  ];

  const mensajeTextoPlano = mensajeLineas.join('\n');
  const urlWhatsapp = `https://wa.me/${BRAND_CONFIG.whatsappNumero}?text=${encodeURIComponent(
    mensajeTextoPlano
  )}`;

  return {
    servicio,
    zona,
    tiempoEstimado: zona.tiempoArribo,
    mensajeTextoPlano,
    urlWhatsapp,
  };
}

/**
 * Filtra los 16 servicios del cliente por categoría y término de búsqueda semántica.
 */
export function filtrarServicios(
  categoria: CategoriaServicio | 'todos',
  busqueda: string
): ServicioItem[] {
  const termino = busqueda.trim().toLowerCase();

  return SERVICIOS_16.filter((item) => {
    const coincideCategoria =
      categoria === 'todos' || item.categoria === categoria;
    if (!coincideCategoria) return false;
    if (!termino) return true;

    const textoIndexado = [
      item.titulo,
      item.tituloCorto,
      item.descripcion,
      item.etiquetaCategoria,
      ...item.sintomasClave,
    ]
      .join(' ')
      .toLowerCase();

    return textoIndexado.includes(termino);
  });
}

/**
 * Valida los datos del formulario de solicitud de despacho o cotización antes de enviar al servidor.
 */
export interface DatosSolicitudDespacho {
  nombreCliente: string;
  telefonoContacto: string;
  zonaSlug: string;
  barrio: string;
  servicioId: string;
  tipoVehiculo: 'Moto' | 'Scooter' | 'Carro / Camioneta';
  referenciaVehiculo: string;
  detallesFalla: string;
}

export interface ResultadoValidacionSolicitud {
  valido: boolean;
  errores: Record<string, string>;
}

export function validarSolicitudDespacho(
  datos: DatosSolicitudDespacho
): ResultadoValidacionSolicitud {
  const errores: Record<string, string> = {};

  if (!datos.nombreCliente || datos.nombreCliente.trim().length < 2) {
    errores.nombreCliente = 'Ingresa tu nombre para registrar la orden.';
  }

  const soloDigitos = (datos.telefonoContacto || '').replace(/\D/g, '');
  if (soloDigitos.length < 7 || soloDigitos.length > 15) {
    errores.telefonoContacto =
      'Ingresa un número de celular o teléfono válido (mínimo 7 dígitos).';
  }

  if (!datos.barrio || datos.barrio.trim().length < 2) {
    errores.barrio = 'Indica el barrio o punto de referencia donde te encuentras.';
  }

  if (!datos.referenciaVehiculo || datos.referenciaVehiculo.trim().length < 2) {
    errores.referenciaVehiculo =
      'Indica la marca/línea de tu moto o carro (ej. Yamaha NMAX, Pulsar 200, Mazda 3).';
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}

/**
 * Resuelve los metadatos SEO (Title, Description, Canonical) según la ruta activa (Home o /zona/:slug).
 */
export function obtenerMetadatosPorRuta(
  pathname: string,
  baseUrl: string = BRAND_CONFIG.dominio
) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const matchZona = pathname.match(/^\/zona\/([a-z0-9-]+)\/?$/i);

  if (matchZona) {
    const slug = matchZona[1].toLowerCase();
    const zona = ZONAS_COBERTURA.find((z) => z.slug === slug);
    if (zona) {
      return {
        title: zona.tituloSeo,
        description: zona.descripcionSeo,
        canonical: `${cleanBase}/zona/${zona.slug}`,
        zonaActiva: zona,
      };
    }
  }

  return {
    title:
      'Desvares 123 – Mecánico de Motos y Montallantas a Domicilio en Itagüí, Sabaneta, Envigado y Medellín',
    description:
      '¿Tu moto no prende o te pinchaste? Mecánico de motos a domicilio y montallantas para carros y motos en Itagüí, Sabaneta, Envigado, La Estrella y Medellín. Cotización gratis y llegada en 25 min.',
    canonical: `${cleanBase}/`,
    zonaActiva: null,
  };
}

/**
 * Genera el grafo estructurado Schema.org (JSON-LD) multicapa:
 * AutoRepair + MotorcycleRepair + EmergencyService + OfferCatalog (16 servicios) + FAQPage.
 */
export function construirSchemaJsonLd(
  baseUrl: string = BRAND_CONFIG.dominio,
  zonaSlug?: string
) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const zona = zonaSlug ? ZONAS_COBERTURA.find((z) => z.slug === zonaSlug) : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['AutoRepair', 'MotorcycleRepair', 'EmergencyService', 'LocalBusiness'],
        '@id': `${cleanBase}/#organization`,
        name: zona
          ? `${BRAND_CONFIG.nombre} – Mecánico de Motos y Montallantas en ${zona.nombre}`
          : `${BRAND_CONFIG.nombre} – Mecánico de Motos y Montallantas a Domicilio`,
        url: zona ? `${cleanBase}/zona/${zona.slug}` : cleanBase,
        telephone: BRAND_CONFIG.telefonoE164,
        priceRange: '$$',
        currenciesAccepted: 'COP',
        paymentAccepted: 'Efectivo, Nequi, Transferencia Bancolombia, Tarjetas',
        description: zona
          ? zona.descripcionSeo
          : 'Servicio especializado de mecánica de motos a domicilio, montallantas para carros y motos, reinicio de baterías, inyección electrónica (Fuel Injection / Full Inyección FI), escáner, scooters, reparación de motores y colisión.',
        areaServed: ZONAS_COBERTURA.map((z) => ({
          '@type': 'City',
          name: z.nombre,
          containedInPlace: {
            '@type': 'AdministrativeArea',
            name: 'Antioquia, Colombia',
          },
        })),
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Catálogo de 16 Servicios de Mecánica de Motos y Montallantas a Domicilio',
          itemListElement: SERVICIOS_16.map((s, idx) => ({
            '@type': 'Offer',
            position: idx + 1,
            itemOffered: {
              '@type': 'Service',
              name: s.titulo,
              description: s.descripcion,
              areaServed: zona
                ? zona.nombre
                : 'Itagüí, Sabaneta, Envigado, La Estrella y Medellín',
            },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${cleanBase}/#faq`,
        mainEntity: PREGUNTAS_FRECUENTES.map((faq) => ({
          '@type': 'Question',
          name: faq.pregunta,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.respuesta,
          },
        })),
      },
    ],
  };
}

/**
 * Serializa de forma segura objetos JSON-LD para incrustarlos dentro de <script type="application/ld+json">,
 * escapando caracteres HTML sensibles (<, >, &) para impedir rupturas de etiqueta </script> (XSS).
 */
export function serializarJsonLdSeguro(datos: unknown): string {
  return JSON.stringify(datos)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export interface AtributosImagenOptimizada {
  webpSrc: string;
  webpSrcSet: string;
  fallbackJpg: string;
  loading: 'lazy' | 'eager';
  decoding: 'async';
  fetchPriority: 'high' | 'low';
  sizes: string;
}

/**
 * Genera los atributos de carga optimizada (WebP + srcSet responsivo + lazy loading + async decoding)
 * para garantizar carga ultra rápida en conexiones móviles 3G/4G inestables.
 */
export function obtenerAtributosImagenOptimizada(
  rutaImagen: string,
  opciones?: { esPrioritaria?: boolean }
): AtributosImagenOptimizada {
  const esPrioritaria = Boolean(opciones?.esPrioritaria);

  const baseSinExtension = rutaImagen.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  const webpSrc = `${baseSinExtension}.webp`;
  const fallbackJpg = `${baseSinExtension}.jpg`;

  const webpSrcSet = `${baseSinExtension}_640w.webp 640w, ${webpSrc} 1280w`;
  const sizes = esPrioritaria ? '100vw' : '(max-width: 1024px) 95vw, 580px';

  return {
    webpSrc,
    webpSrcSet,
    fallbackJpg,
    loading: esPrioritaria ? 'eager' : 'lazy',
    decoding: 'async',
    fetchPriority: esPrioritaria ? 'high' : 'low',
    sizes,
  };
}

export interface ParametrosConversionGA4 {
  ubicacionBoton?: string;
  servicioId?: string;
  zonaSlug?: string;
  canalContacto?: 'whatsapp' | 'telefono' | 'formulario_web';
}

/**
 * Construye el payload estandarizado del evento personalizado de Google Analytics 4 (GA4)
 * para medir conversiones reales al hacer clic en 'Solicitar Rescate Ahora'.
 */
export function construirPayloadConversionGA4(params?: ParametrosConversionGA4) {
  return {
    eventName: 'solicitar_rescate_ahora' as const,
    eventParams: {
      event_category: 'conversion_rescate',
      event_label: 'Solicitar Rescate Ahora',
      button_text: 'Solicitar Rescate Ahora',
      ubicacion_boton: params?.ubicacionBoton || 'navbar_principal',
      servicio_id: params?.servicioId || 'la-moto-no-prende',
      municipio_zona: params?.zonaSlug || 'itagui',
      canal_contacto: params?.canalContacto || 'formulario_web',
      currency: 'COP',
      value: 1,
    },
  };
}

export interface CoordenadaMunicipioAburra {
  slug: string;
  nombre: string;
  lat: number;
  lng: number;
  sectorReferencia: string;
}

export const COORDENADAS_MUNICIPIOS_ABURRA: CoordenadaMunicipioAburra[] = [
  {
    slug: 'itagui',
    nombre: 'Itagüí',
    lat: 6.1726,
    lng: -75.6096,
    sectorReferencia: 'Parque de Itagüí / Autopista Sur',
  },
  {
    slug: 'sabaneta',
    nombre: 'Sabaneta',
    lat: 6.1515,
    lng: -75.6166,
    sectorReferencia: 'Aves María / Las Vegas',
  },
  {
    slug: 'envigado',
    nombre: 'Envigado',
    lat: 6.1696,
    lng: -75.5876,
    sectorReferencia: 'Las Vegas / Parque de Envigado',
  },
  {
    slug: 'la-estrella',
    nombre: 'La Estrella',
    lat: 6.1577,
    lng: -75.6432,
    sectorReferencia: 'Ancón Sur / Parque de La Estrella',
  },
  {
    slug: 'medellin',
    nombre: 'Medellín',
    lat: 6.2442,
    lng: -75.5812,
    sectorReferencia: 'El Poblado / Industriales',
  },
];

export interface ResultadoUbicacionGps {
  zonaSlug: string;
  zonaNombre: string;
  barrioFormateado: string;
  coordenadasTexto: string;
}

/**
 * Determina el municipio más cercano del Valle de Aburrá a partir de coordenadas GPS (lat, lng)
 * y genera el texto de ubicación listo para agilizar el despacho.
 */
export function resolverUbicacionGpsAburra(
  lat: number,
  lng: number,
  zonaPreferidaSlug = 'itagui'
): ResultadoUbicacionGps {
  const coordenadasValidas =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  if (!coordenadasValidas) {
    const fallback =
      COORDENADAS_MUNICIPIOS_ABURRA.find((c) => c.slug === zonaPreferidaSlug) ??
      COORDENADAS_MUNICIPIOS_ABURRA[0];
    const coordsStr = `${fallback.lat.toFixed(4)}, ${fallback.lng.toFixed(4)}`;
    return {
      zonaSlug: fallback.slug,
      zonaNombre: fallback.nombre,
      coordenadasTexto: coordsStr,
      barrioFormateado: `${fallback.sectorReferencia} (GPS: ${coordsStr})`,
    };
  }

  // Verificar si las coordenadas están dentro del área metropolitana del Valle de Aburrá
  const enValleDeAburra = lat >= 6.05 && lat <= 6.45 && lng >= -75.72 && lng <= -75.48;

  if (!enValleDeAburra) {
    const coordsStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const base =
      COORDENADAS_MUNICIPIOS_ABURRA.find((c) => c.slug === zonaPreferidaSlug) ??
      COORDENADAS_MUNICIPIOS_ABURRA[0];
    return {
      zonaSlug: base.slug,
      zonaNombre: base.nombre,
      coordenadasTexto: coordsStr,
      barrioFormateado: `${base.sectorReferencia} (GPS: ${coordsStr})`,
    };
  }

  let masCercano = COORDENADAS_MUNICIPIOS_ABURRA[0];
  let menorDistancia = Number.POSITIVE_INFINITY;

  for (const item of COORDENADAS_MUNICIPIOS_ABURRA) {
    const dLat = lat - item.lat;
    const dLng = lng - item.lng;
    const distCuadrada = dLat * dLat + dLng * dLng;
    if (distCuadrada < menorDistancia) {
      menorDistancia = distCuadrada;
      masCercano = item;
    }
  }

  const coordsStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  return {
    zonaSlug: masCercano.slug,
    zonaNombre: masCercano.nombre,
    coordenadasTexto: coordsStr,
    barrioFormateado: `${masCercano.sectorReferencia} (GPS: ${coordsStr})`,
  };
}


