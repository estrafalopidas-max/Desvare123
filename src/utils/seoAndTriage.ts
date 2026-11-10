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
  nombreCliente?: string;
  telefonoContacto?: string;
  detallesFalla?: string;
  codigoOrden?: string;
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
 * y genera la URL oficial de WhatsApp hacia +57 300 603 6253.
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

  // Extraer coordenadas si el campo barrio incluye "(GPS: lat, lng)" para adjuntar pin directo de Google Maps
  const matchGps = params.barrio?.match(/GPS:\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/i);
  const enlacePinMaps = matchGps
    ? `https://maps.google.com/?q=${matchGps[1]},${matchGps[2]}`
    : null;

  const mensajeLineas = [
    `Hola *${BRAND_CONFIG.nombre}*, solicito cotización gratis y asistencia a domicilio:`,
    ...(params.codigoOrden ? [`• *Orden web:* #${params.codigoOrden}`] : []),
    ...(params.nombreCliente && params.nombreCliente.trim().length > 0
      ? [
          `• *Cliente:* ${params.nombreCliente.trim()}${
            params.telefonoContacto ? ` (${params.telefonoContacto.trim()})` : ''
          }`,
        ]
      : []),
    `• *Servicio:* ${servicio.tituloCorto} (${servicio.numero})`,
    `• *Ubicación:* ${sectorDetalle}`,
    ...(enlacePinMaps ? [`• *Pin GPS exacto:* ${enlacePinMaps}`] : []),
    `• *Vehículo:* ${vehiculoDetalle}`,
    ...(params.detallesFalla && params.detallesFalla.trim().length > 0
      ? [`• *Detalle de la falla:* ${params.detallesFalla.trim()}`]
      : []),
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
      'Desvares 123 – Mecánico de motos y montallantas a domicilio en Itagüí, Sabaneta, Envigado y Medellín',
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
          ? `${BRAND_CONFIG.nombre} – Mecánico de motos y montallantas en ${zona.nombre}`
          : `${BRAND_CONFIG.nombre} – Mecánico de motos y montallantas a domicilio`,
        url: zona ? `${cleanBase}/zona/${zona.slug}` : cleanBase,
        telephone: BRAND_CONFIG.telefonoE164,
        email: BRAND_CONFIG.emailContacto,
        address: {
          '@type': 'PostalAddress',
          streetAddress: BRAND_CONFIG.direccionTaller,
          addressLocality: zona ? zona.nombre : 'Itagüí',
          addressRegion: 'Antioquia',
          addressCountry: 'CO',
        },
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
          name: 'Catálogo de 16 servicios de mecánica de motos y montallantas a domicilio',
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
      event_label: 'Solicitar rescate ahora',
      button_text: 'Solicitar rescate ahora',
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

/**
 * Malla detallada de barrios y nodos viales del Valle de Aburrá para asignar con alta precisión
 * el barrio y municipio más cercano incluso sin conexión a geocodificación externa.
 */
const MICROZONAS_BARRIOS_ABURRA: CoordenadaMunicipioAburra[] = [
  // Itagüí
  { slug: 'itagui', nombre: 'Itagüí', lat: 6.1726, lng: -75.6096, sectorReferencia: 'Parque de Itagüí' },
  { slug: 'itagui', nombre: 'Itagüí', lat: 6.1852, lng: -75.5972, sectorReferencia: 'Central Mayorista / Santa María' },
  { slug: 'itagui', nombre: 'Itagüí', lat: 6.1645, lng: -75.6152, sectorReferencia: 'Suramérica / Ditaires' },
  { slug: 'itagui', nombre: 'Itagüí', lat: 6.1785, lng: -75.6038, sectorReferencia: 'San Fernando / La Moda' },
  { slug: 'itagui', nombre: 'Itagüí', lat: 6.1602, lng: -75.6245, sectorReferencia: 'Pilsen / Bariloche' },
  // Sabaneta
  { slug: 'sabaneta', nombre: 'Sabaneta', lat: 6.1515, lng: -75.6166, sectorReferencia: 'Parque de Sabaneta / Aves María' },
  { slug: 'sabaneta', nombre: 'Sabaneta', lat: 6.1608, lng: -75.6055, sectorReferencia: 'Mayorca / Vegas de Sabaneta' },
  { slug: 'sabaneta', nombre: 'Sabaneta', lat: 6.1448, lng: -75.6212, sectorReferencia: 'Calle Larga / Prados de Sabaneta' },
  // Envigado
  { slug: 'envigado', nombre: 'Envigado', lat: 6.1696, lng: -75.5876, sectorReferencia: 'Parque de Envigado / Las Vegas' },
  { slug: 'envigado', nombre: 'Envigado', lat: 6.1795, lng: -75.5818, sectorReferencia: 'Zúñiga / Villagrande' },
  { slug: 'envigado', nombre: 'Envigado', lat: 6.1632, lng: -75.5965, sectorReferencia: 'El Portal / Alcalá' },
  { slug: 'envigado', nombre: 'Envigado', lat: 6.1585, lng: -75.5742, sectorReferencia: 'El Escobero / Señorial' },
  // La Estrella
  { slug: 'la-estrella', nombre: 'La Estrella', lat: 6.1577, lng: -75.6432, sectorReferencia: 'Parque de La Estrella' },
  { slug: 'la-estrella', nombre: 'La Estrella', lat: 6.1522, lng: -75.6295, sectorReferencia: 'Ancón Sur / Bellavista' },
  { slug: 'la-estrella', nombre: 'La Estrella', lat: 6.1265, lng: -75.6345, sectorReferencia: 'La Tablaza' },
  // Medellín (Sur, Occidente y Norte)
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2088, lng: -75.5678, sectorReferencia: 'El Poblado / Milla de Oro' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2285, lng: -75.5748, sectorReferencia: 'Ciudad del Río / Industriales' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2095, lng: -75.5865, sectorReferencia: 'Guayabal / Cristo Rey' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2315, lng: -75.6042, sectorReferencia: 'Belén / Rosales' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2455, lng: -75.5955, sectorReferencia: 'Laureles / Estadio' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2528, lng: -75.6095, sectorReferencia: 'La América / San Javier' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2632, lng: -75.5945, sectorReferencia: 'Los Colores / Cuarta Brigada' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2765, lng: -75.5985, sectorReferencia: 'Robledo' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2895, lng: -75.5762, sectorReferencia: 'Castilla' },
  { slug: 'medellin', nombre: 'Medellín', lat: 6.2476, lng: -75.5698, sectorReferencia: 'Centro / La Candelaria' },
];

export interface ResultadoUbicacionGps {
  zonaSlug: string;
  zonaNombre: string;
  barrioFormateado: string;
  coordenadasTexto: string;
  precisionMetros?: number;
}

/**
 * Determina el municipio y barrio más cercano del Valle de Aburrá a partir de coordenadas GPS (lat, lng)
 * y genera el texto de ubicación listo para agilizar el despacho.
 */
export function resolverUbicacionGpsAburra(
  lat: number,
  lng: number,
  zonaPreferidaSlug = 'itagui',
  precisionMetros?: number
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
      precisionMetros,
    };
  }

  let masCercano = MICROZONAS_BARRIOS_ABURRA[0];
  let menorDistancia = Number.POSITIVE_INFINITY;

  for (const item of MICROZONAS_BARRIOS_ABURRA) {
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
    precisionMetros,
  };
}

/**
 * Enriquece las coordenadas GPS consultando geocodificación inversa (OpenStreetMap Nominatim)
 * para obtener el barrio y vía exacta cuando hay conexión disponible, manteniendo respaldo instantáneo.
 */
export async function resolverDireccionExactaGps(
  lat: number,
  lng: number,
  zonaPreferidaSlug = 'itagui',
  precisionMetros?: number
): Promise<ResultadoUbicacionGps> {
  const base = resolverUbicacionGpsAburra(lat, lng, zonaPreferidaSlug, precisionMetros);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || typeof fetch === 'undefined') {
    return base;
  }

  const controlador = new AbortController();
  const timer = setTimeout(() => controlador.abort(), 3500);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(
      6
    )}&lon=${lng.toFixed(6)}&zoom=18&addressdetails=1&accept-language=es`;

    const res = await fetch(url, {
      signal: controlador.signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return base;
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return base;

    const textoMunicipio = [
      addr.city,
      addr.town,
      addr.municipality,
      addr.county,
      data?.display_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    let zonaSlugDetectada = base.zonaSlug;
    let zonaNombreDetectada = base.zonaNombre;

    if (textoMunicipio.includes('itagüí') || textoMunicipio.includes('itagui')) {
      zonaSlugDetectada = 'itagui';
      zonaNombreDetectada = 'Itagüí';
    } else if (textoMunicipio.includes('sabaneta')) {
      zonaSlugDetectada = 'sabaneta';
      zonaNombreDetectada = 'Sabaneta';
    } else if (textoMunicipio.includes('envigado')) {
      zonaSlugDetectada = 'envigado';
      zonaNombreDetectada = 'Envigado';
    } else if (textoMunicipio.includes('la estrella') || textoMunicipio.includes('estrella')) {
      zonaSlugDetectada = 'la-estrella';
      zonaNombreDetectada = 'La Estrella';
    } else if (textoMunicipio.includes('medellín') || textoMunicipio.includes('medellin')) {
      zonaSlugDetectada = 'medellin';
      zonaNombreDetectada = 'Medellín';
    }

    const barrioDetectado =
      addr.neighbourhood ||
      addr.suburb ||
      addr.quarter ||
      addr.city_district ||
      addr.residential ||
      '';
    const viaDetectada = addr.road || addr.pedestrian || '';

    const partesSector = [barrioDetectado, viaDetectada].filter(Boolean);
    if (partesSector.length === 0) {
      return {
        ...base,
        zonaSlug: zonaSlugDetectada,
        zonaNombre: zonaNombreDetectada,
      };
    }

    const coordsStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return {
      zonaSlug: zonaSlugDetectada,
      zonaNombre: zonaNombreDetectada,
      coordenadasTexto: coordsStr,
      barrioFormateado: `${partesSector.join(' · ')} (GPS: ${coordsStr})`,
      precisionMetros,
    };
  } catch {
    return base;
  } finally {
    clearTimeout(timer);
  }
}



