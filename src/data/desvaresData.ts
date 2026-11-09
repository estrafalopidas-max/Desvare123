/**
 * Datos maestros de configuración comercial, los 16 servicios exactos del cliente,
 * polígonos de cobertura geográfica y preguntas frecuentes para SEO y conversión.
 */

export const BRAND_CONFIG = {
  nombre: 'Desvares 123',
  dominio: 'https://desvares123.com',
  telefonoDisplay: '+57 300 603 6253',
  telefonoE164: '+573006036253',
  whatsappNumero: '573006036253',
  moneda: 'COP',
  tiempoPromedioMinutos: 25,
  horarioTexto: 'Atención de emergencias viales 24/7 · Taller especializado Lun–Sáb 7:00 AM – 7:00 PM',
  imagenes: {
    hero: '/images/hero_motorcycle_rescue_1794237578669.webp',
    videoHero: '/assets/aistudio/Mechanic_adjusting_motorcycle_en__1ad13d63_1080p_4f441d2f.mp4',
    montallantas: '/images/service_montallantas_movil_1794237580192.webp',
    inyeccionScanner: '/images/service_full_inyeccion_scanner_1794237581858.webp',
    scooterExpert: '/images/service_scooter_cvt_expert_1794237582169.webp',
    motorColision: '/images/service_motor_colision_1794237582586.webp',
  },
} as const;

export type CategoriaServicio =
  | 'urgencia_vial'
  | 'electronica_mantenimiento'
  | 'taller_mayor_repuestos';

export interface ServicioItem {
  id: string;
  numero: string;
  titulo: string;
  tituloCorto: string;
  categoria: CategoriaServicio;
  etiquetaCategoria: string;
  tiempoRespuesta: string;
  modalidad: string;
  descripcion: string;
  sintomasClave: string[];
  mensajeBaseWhatsapp: string;
}

/**
 * Los 16 servicios exactos solicitados por el cliente, estructurados con densidad semántica SEO
 * para indexación local y despacho inmediato por WhatsApp.
 */
export const SERVICIOS_16: ServicioItem[] = [
  {
    id: 'la-moto-no-prende',
    numero: '01',
    titulo: '¿La moto no prende? Desvare en sitio',
    tituloCorto: 'La moto no prende',
    categoria: 'urgencia_vial',
    etiquetaCategoria: 'Urgencia vial',
    tiempoRespuesta: '20–30 min',
    modalidad: 'En vía o domicilio',
    descripcion:
      'Diagnóstico inmediato de chispa, bujía, compresión, bomba de gasolina, fusibles y encendido eléctrico donde te hayas quedado varado.',
    sintomasClave: ['Sin chispa', 'Ahogada', 'Falla eléctrica', 'Bomba gasolina'],
    mensajeBaseWhatsapp: 'Urgencia: Mi moto no prende y necesito asistencia en sitio',
  },
  {
    id: 'montallantas-carros-y-motos',
    numero: '02',
    titulo: 'Montallantas carros y motos a domicilio',
    tituloCorto: 'Montallantas carros y motos',
    categoria: 'urgencia_vial',
    etiquetaCategoria: 'Urgencia vial',
    tiempoRespuesta: '20–30 min',
    modalidad: 'Móvil 24/7',
    descripcion:
      'Despinche móvil para motos, carros y camionetas. Reparación sellomatic, vulcanizado, cambio de neumático o válvula sin rayar el rin.',
    sintomasClave: ['Despinche Carro', 'Moto Sellomatic', 'Neumático', 'Válvula'],
    mensajeBaseWhatsapp: 'Urgencia Montallantas: Necesito despinche a domicilio (Carro / Moto)',
  },
  {
    id: 'reinicio-de-bateria',
    numero: '03',
    titulo: 'Reinicio y baterías a domicilio',
    tituloCorto: 'Reinicio de batería',
    categoria: 'urgencia_vial',
    etiquetaCategoria: 'Urgencia vial',
    tiempoRespuesta: '20–25 min',
    modalidad: 'En vía o parqueadero',
    descripcion:
      'Iniciador de alto amperaje para carros y motos. Medimos con multímetro batería, regulador y planta (estator) o instalamos batería nueva.',
    sintomasClave: ['Batería descargada', 'Reinicio 12V', 'Estator y regulador'],
    mensajeBaseWhatsapp: 'Urgencia Batería: Necesito reinicio o revisión de batería a domicilio',
  },
  {
    id: 'cambio-de-guayas',
    numero: '04',
    titulo: 'Cambio de guayas en vía o domicilio',
    tituloCorto: 'Guayas (clutch y acelerador)',
    categoria: 'urgencia_vial',
    etiquetaCategoria: 'Urgencia vial',
    tiempoRespuesta: '20–30 min',
    modalidad: 'En vía o domicilio',
    descripcion:
      'Reemplazo inmediato de guaya de clutch (embrague) o acelerador reventada con lubricación y graduación exacta de tensión.',
    sintomasClave: ['Guaya de clutch', 'Guaya acelerador', 'Graduación embrague'],
    mensajeBaseWhatsapp: 'Urgencia Guayas: Se me reventó la guaya (clutch/acelerador) y necesito cambio en sitio',
  },
  {
    id: 'experto-mecanica-motos',
    numero: '05',
    titulo: 'Experto en mecánica de motos',
    tituloCorto: 'Experto en mecánica de motos',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Especialidad técnica',
    tiempoRespuesta: '25–35 min',
    modalidad: 'Domicilio y Taller',
    descripcion:
      'Solución profesional a ruidos internos, pérdida de fuerza, fugas de aceite, frenos, rodamientos y puesta a punto multimarca.',
    sintomasClave: ['Frenos', 'Fugas de aceite', 'Pérdida de fuerza', 'Ajuste motor'],
    mensajeBaseWhatsapp: 'Necesito un experto en mecánica de motos para diagnóstico y reparación',
  },
  {
    id: 'full-inyeccion',
    numero: '06',
    titulo: 'Inyección electrónica (Full Inyección FI)',
    tituloCorto: 'Inyección electrónica (FI)',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Especialidad técnica',
    tiempoRespuesta: 'Programado / Hoy',
    modalidad: 'Domicilio y Taller',
    descripcion:
      'Mantenimiento Fuel Injection (Full Inyección): limpieza de inyectores por ultrasonido, lavado de cuerpo de aceleración, calibración de sensores TPS/MAP y presión de bomba.',
    sintomasClave: ['Fuel Injection FI', 'Inyectores ultrasonido', 'Cuerpo aceleración'],
    mensajeBaseWhatsapp:
      'Solicito servicio especializado de Inyección Electrónica / Full Inyección (FI) para mi moto',
  },
  {
    id: 'scaner-motos',
    numero: '07',
    titulo: 'Escáner electrónico de motos',
    tituloCorto: 'Escáner motos',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Especialidad técnica',
    tiempoRespuesta: '25–35 min',
    modalidad: 'En sitio con escáner',
    descripcion:
      'Diagnóstico computarizado OBD2 multimarca para lectura de códigos de falla, borrado de testigo Check Engine / FI / ABS y reseteo ECU.',
    sintomasClave: ['Testigo FI', 'Check Engine', 'Frenos ABS', 'Códigos ECU'],
    mensajeBaseWhatsapp: 'Mi moto tiene el testigo FI / Check encendido, necesito diagnóstico con Escáner',
  },
  {
    id: 'experto-motos-scooter',
    numero: '08',
    titulo: 'Experto en motos scooter (CVT)',
    tituloCorto: 'Experto en motos scooter',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Especialidad técnica',
    tiempoRespuesta: '25–35 min',
    modalidad: 'Domicilio y Taller',
    descripcion:
      'Especialistas en transmisión automática CVT (NMAX, PCX, BWS, Agility, Victory): correa de transmisión, variador, dados y centrífugo.',
    sintomasClave: ['Correa CVT', 'Dados y variador', 'NMAX · BWS · Agility'],
    mensajeBaseWhatsapp: 'Tengo una moto Scooter y necesito servicio con el técnico experto en Scooters',
  },
  {
    id: 'cambio-de-aceite',
    numero: '09',
    titulo: 'Cambio de aceite y filtros a domicilio',
    tituloCorto: 'Cambio de aceite',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Mantenimiento',
    tiempoRespuesta: '25–35 min',
    modalidad: 'Casa u oficina',
    descripcion:
      'Suministro y cambio de aceite sintético, semisintético y 4T (Motul, Liqui Moly, Yamalube, Mobil) + filtro original sin filas.',
    sintomasClave: ['Sintético y Semi', 'Filtro original', 'Aceite caja scooter'],
    mensajeBaseWhatsapp: 'Quiero agendar un cambio de aceite y filtro a domicilio para mi moto',
  },
  {
    id: 'kit-de-arrastre',
    numero: '10',
    titulo: 'Cambio de kit de arrastre a domicilio',
    tituloCorto: 'Kit de arrastre',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Mantenimiento',
    tiempoRespuesta: '30–45 min',
    modalidad: 'Domicilio y Taller',
    descripcion:
      'Venta e instalación de cadena reforzada u O-Ring, sproket y piñón de salida con alineación, tensado técnico y lubricación.',
    sintomasClave: ['Cadena O-Ring', 'Sproket y piñón', 'Tensado técnico'],
    mensajeBaseWhatsapp: 'Necesito cotizar o instalar Kit de Arrastre a domicilio para mi moto',
  },
  {
    id: 'mantenimiento-preventivo',
    numero: '11',
    titulo: 'Mantenimiento preventivo',
    tituloCorto: 'Mantenimiento preventivo',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Mantenimiento',
    tiempoRespuesta: 'Programado',
    modalidad: 'Domicilio y Taller',
    descripcion:
      'Alistamiento para tecnomecánica y viajes: pastillas y líquido de frenos DOT4, calibración de válvulas, filtro de aire, bujía y luces.',
    sintomasClave: ['Tecnomecánica', 'Pastillas freno', 'Calibración válvulas'],
    mensajeBaseWhatsapp: 'Quiero programar un Mantenimiento Preventivo para mi moto',
  },
  {
    id: 'mantenimiento-general',
    numero: '12',
    titulo: 'Mantenimiento general profundo',
    tituloCorto: 'Mantenimiento general',
    categoria: 'electronica_mantenimiento',
    etiquetaCategoria: 'Mantenimiento',
    tiempoRespuesta: 'Programado',
    modalidad: 'Taller / Recogida',
    descripcion:
      'Engrase general de chasis, cunas de dirección, retenedores y aceite hidráulico de barras, tijera, rodamientos e inyección.',
    sintomasClave: ['Cunas dirección', 'Barras y suspensión', 'Engrase chasis'],
    mensajeBaseWhatsapp: 'Quiero cotizar un Mantenimiento General completo para mi moto',
  },
  {
    id: 'reparacion-de-motores',
    numero: '13',
    titulo: 'Reparación de motores (2T y 4T)',
    tituloCorto: 'Reparación de motores',
    categoria: 'taller_mayor_repuestos',
    etiquetaCategoria: 'Taller mayor',
    tiempoRespuesta: 'Diagnóstico hoy',
    modalidad: 'Recogida + Taller',
    descripcion:
      'Reparación integral de cilindro, pistón, anillos, cabezote, válvulas, cadenilla, biela, cigüeñal, discos de clutch y caja de cambios.',
    sintomasClave: ['Humo o consumo aceite', 'Cilindro y biela', 'Clutch y caja'],
    mensajeBaseWhatsapp: 'Necesito diagnóstico y cotización para Reparación de Motor de mi moto',
  },
  {
    id: 'colision-y-siniestros',
    numero: '14',
    titulo: 'Reparación por colisión y chasis',
    tituloCorto: 'Colisión y reconstrucción',
    categoria: 'taller_mayor_repuestos',
    etiquetaCategoria: 'Taller mayor',
    tiempoRespuesta: 'Recogida inmediata',
    modalidad: 'Recogida + Taller',
    descripcion:
      'Recuperación de motos chocadas: enderezado hidráulico de chasis, barras, espigo y rines, pintura original, carenajes y cotización.',
    sintomasClave: ['Enderezado chasis', 'Barras y rines', 'Carenajes y pintura'],
    mensajeBaseWhatsapp: 'Tuve una colisión/caída y necesito evaluar la reparación de mi moto',
  },
  {
    id: 'venta-de-repuestos',
    numero: '15',
    titulo: 'Venta de repuestos a domicilio',
    tituloCorto: 'Repuestos',
    categoria: 'taller_mayor_repuestos',
    etiquetaCategoria: 'Repuestos y marcas',
    tiempoRespuesta: 'Con instalación',
    modalidad: 'Entrega en sitio',
    descripcion:
      'Baterías, llantas, neumáticos, pastillas de freno, kits de arrastre, guayas, bujías, reguladores, bobinas y repuestos de motor.',
    sintomasClave: ['Baterías y llantas', 'Frenos y guayas', 'Partes eléctricas'],
    mensajeBaseWhatsapp: 'Necesito cotizar un repuesto con instalación a domicilio',
  },
  {
    id: 'todas-las-marcas-de-motos',
    numero: '16',
    titulo: 'Todas las marcas de motos',
    tituloCorto: 'Todas las marcas de motos',
    categoria: 'taller_mayor_repuestos',
    etiquetaCategoria: 'Repuestos y marcas',
    tiempoRespuesta: '20–30 min',
    modalidad: 'Multimarca',
    descripcion:
      'Atención con herramienta especializada para Yamaha, Honda, Suzuki, Bajaj, AKT, Victory, Auteco, KTM, Kawasaki, Hero, Kymco, SYM y BMW.',
    sintomasClave: ['Yamaha · Honda · Suzuki', 'Bajaj · AKT · Victory', 'KTM · Kymco · BMW'],
    mensajeBaseWhatsapp: 'Consulta de servicio técnico multimarca para mi motocicleta',
  },
];

export interface ZonaCobertura {
  slug: string;
  nombre: string;
  tituloSeo: string;
  descripcionSeo: string;
  tiempoArribo: string;
  unidadesActivas: number;
  corredoresPrincipales: string;
  barrios: string[];
  destacadoAnilloSur: boolean;
}

export const ZONAS_COBERTURA: ZonaCobertura[] = [
  {
    slug: 'itagui',
    nombre: 'Itagüí',
    tituloSeo: 'Mecánico de motos y montallantas a domicilio en Itagüí – Desvares 123',
    descripcionSeo:
      '¿Varado o pinchado en Itagüí? Mecánico de motos a domicilio y montallantas carros y motos en Parque de Itagüí, Santa María, Mayorista, Ditaires y Autopista Sur. Llegamos en 20 min.',
    tiempoArribo: '15–25 min',
    unidadesActivas: 3,
    corredoresPrincipales: 'Autopista Sur · Av. Santa María · Central Mayorista · Av. Pilsen · Variante Caldas',
    destacadoAnilloSur: true,
    barrios: [
      'Parque de Itagüí',
      'Santa María',
      'Central Mayorista',
      'Suramérica',
      'San Pío X',
      'Ditaires',
      'Calatrava',
      'Simón Bolívar',
      'San Fernando',
      'Playa Rica',
      'La Moda',
      'Los Naranjos',
      'Bariloche',
      'El Rosario',
      'Pilsen',
      'San Francisco',
      'Viviendas del Sur',
      'Yarumito',
    ],
  },
  {
    slug: 'sabaneta',
    nombre: 'Sabaneta',
    tituloSeo: 'Mecánico de motos y montallantas a domicilio en Sabaneta – Desvares 123',
    descripcionSeo:
      'Servicio de desvare de motos y montallantas para carros y motos a domicilio en Sabaneta: Aves María, Mayorca, Parque de Sabaneta, Vegas y La Doctora. Expertos en Scooters y FI.',
    tiempoArribo: '15–25 min',
    unidadesActivas: 3,
    corredoresPrincipales: 'Av. Las Vegas · Av. El Poblado · Regional Sur · Calle Larga · Sector Mayorca',
    destacadoAnilloSur: true,
    barrios: [
      'Parque de Sabaneta',
      'Aves María',
      'Mayorca',
      'Vegas de Sabaneta',
      'Calle Larga',
      'Prados de Sabaneta',
      'Aliadas del Sur',
      'Cañaveralejo',
      'La Doctora',
      'San José',
      'Las Lomitas',
      'Entreamigos',
      'Holanda',
      'Restrepo Naranjo',
      'Paso Ancho',
      'Virgen del Carmen',
    ],
  },
  {
    slug: 'envigado',
    nombre: 'Envigado',
    tituloSeo: 'Mecánico de motos y montallantas a domicilio en Envigado – Desvares 123',
    descripcionSeo:
      'Mecánico de motos a domicilio y montallantas móvil en Envigado: Las Vegas, Zúñiga, Loma de las Brujas, El Portal, Alcalá, San Marcos y Las Palmas. Escáner, Baterías y Despinche.',
    tiempoArribo: '20–30 min',
    unidadesActivas: 4,
    corredoresPrincipales: 'Av. El Poblado · Av. Las Vegas · Loma del Escobero · Loma de las Brujas · Las Palmas',
    destacadoAnilloSur: true,
    barrios: [
      'Parque de Envigado',
      'Las Vegas',
      'Zúñiga',
      'Bosques de Zúñiga',
      'El Portal',
      'San Marcos',
      'Alcalá',
      'Loma de las Brujas',
      'Jardines',
      'Villagrande',
      'La Magnolia',
      'Pontevedra',
      'Loma del Chocho',
      'El Escobero',
      'El Dorado',
      'San José',
      'Obrero',
      'Barrio Mesa',
      'La Sebastiana',
      'Las Palmas',
    ],
  },
  {
    slug: 'la-estrella',
    nombre: 'La Estrella',
    tituloSeo: 'Mecánico de motos y montallantas a domicilio en La Estrella – Desvares 123',
    descripcionSeo:
      'Asistencia de mecánica de motos y montallantas para carros y motos a domicilio en La Estrella, Ancón Sur, La Tablaza y Variante Caldas. Desvares, guayas, baterías y taller.',
    tiempoArribo: '20–30 min',
    unidadesActivas: 2,
    corredoresPrincipales: 'Ancón Sur · Variante a Caldas · Calle 77 Sur · La Tablaza · Autopista Sur',
    destacadoAnilloSur: true,
    barrios: [
      'Parque de La Estrella',
      'Ancón Sur',
      'La Tablaza',
      'San Agustín',
      'Bellavista',
      'Pueblo Viejo',
      'Ferrería',
      'Horizontes',
      'Chile',
      'Caquetá',
      'Monterrey',
      'Variante Caldas',
    ],
  },
  {
    slug: 'medellin',
    nombre: 'Medellín',
    tituloSeo: 'Mecánico de motos y montallantas a domicilio en Medellín – Desvares 123',
    descripcionSeo:
      'Mecánico de motos a domicilio y montallantas carros y motos en Medellín: El Poblado, Guayabal, Belén, Laureles, Industriales y Centro. Inyección Electrónica (Full Inyección / Fuel Injection), Escáner, Scooters y Colisión.',
    tiempoArribo: '25–35 min',
    unidadesActivas: 4,
    corredoresPrincipales: 'El Poblado · Av. Guayabal · Industriales · Calle 30 · Calle 10 · Av. 80 · Las Palmas',
    destacadoAnilloSur: false,
    barrios: [
      'El Poblado',
      'Ciudad del Río',
      'Industriales',
      'Guayabal',
      'Cristo Rey',
      'Campo Amor',
      'Belén',
      'Rosales',
      'La Mota',
      'Laureles',
      'Estadio',
      'Conquistadores',
      'Avenida 33',
      'Las Palmas',
      'San Diego',
      'Centro / Palacé',
    ],
  },
];

export interface PreguntaFrecuente {
  id: string;
  pregunta: string;
  respuesta: string;
}

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    id: 'faq-costo-visita',
    pregunta: '¿Tiene algún costo pedir una cotización o asesoría para mi moto o carro?',
    respuesta:
      'La cotización y asesoría inicial por WhatsApp o llamada es 100% GRATIS. Nos cuentas qué falla presenta tu vehículo y en qué barrio estás, y te informamos el valor transparente del servicio antes de enviar al mecánico a domicilio.',
  },
  {
    id: 'faq-montallantas-carros-motos',
    pregunta: '¿El servicio de montallantas a domicilio atiende tanto motos como carros?',
    respuesta:
      'Sí. En Desvares 123 contamos con herramienta especializada para despinche de automóviles, camionetas y motocicletas (tanto llantas Sellomatic/Tubeless como llantas con neumático o cámara), además de reinicio de batería para carros y motos.',
  },
  {
    id: 'faq-tiempo-llegada',
    pregunta: '¿En cuánto tiempo llega el mecánico si mi moto no prende o me quedé varado?',
    respuesta:
      'En los municipios de Itagüí, Sabaneta, Envigado, La Estrella y el corredor de El Poblado / Guayabal nuestro tiempo promedio de arribo es de 20 a 30 minutos una vez compartes tu ubicación GPS por WhatsApp.',
  },
  {
    id: 'faq-scooter-inyeccion',
    pregunta:
      '¿Atienden motos Scooter automáticas y motos de Inyección Electrónica (Full Inyección / Fuel Injection)?',
    respuesta:
      'Sí, somos especialistas certificados en transmisión automática CVT de Scooters (NMAX, PCX, BWS, Agility, Victory, Kymco, SYM) y en sistemas de Inyección Electrónica — Fuel Injection (conocido también como Full Inyección FI). Llevamos escáner electrónico multimarca a domicilio para leer códigos de falla en tiempo real.',
  },
  {
    id: 'faq-motores-colision',
    pregunta: '¿Qué pasa si mi moto sufrió una colisión o necesita reparación de motor?',
    respuesta:
      'Para intervenciones mayores como reparación de motor (2T y 4T), reconstrucción por colisión, enderezado de chasis/barras o mantenimiento general profundo, coordinamos la recogida segura de tu motocicleta a domicilio y te entregamos cotización detallada con repuestos garantizados.',
  },
];
