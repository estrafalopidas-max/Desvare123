import express, { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  BRAND_CONFIG,
  SERVICIOS_16,
  ZONAS_COBERTURA,
} from './src/data/desvaresData';
import {
  obtenerMetadatosPorRuta,
  construirSchemaJsonLd,
  serializarJsonLdSeguro,
  validarSolicitudDespacho,
} from './src/utils/seoAndTriage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio persistente protegido (jamás expuesto como directorio estático público)
const DATA_DIR = fs.existsSync('/app')
  ? path.join('/app', 'data')
  : path.join(__dirname, 'data');
const ORDENES_FILE = path.join(DATA_DIR, 'ordenes_despacho.json');

// Límites defensivos contra agotamiento de disco y memoria (DoS)
const MAX_ORDENES_TOTALES = 500;
const MAX_ORDENES_POR_SESION = 25;
const VENTANA_RATE_LIMIT_MS = 60_000;
const MAX_POST_POR_VENTANA = 15;

const registroRateLimitIp = new Map<string, { conteo: number; expiraEn: number }>();

interface RegistroOrdenAlmacenada {
  id: string;
  sessionToken: string;
  codigoOrden: string;
  nombreCliente: string;
  telefonoContacto: string;
  zonaSlug: string;
  zonaNombre: string;
  barrio: string;
  servicioId: string;
  servicioTitulo: string;
  tipoVehiculo: string;
  referenciaVehiculo: string;
  detallesFalla: string;
  creadoEn: string;
}

function asegurarDirectorioDatos(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }
  if (!fs.existsSync(ORDENES_FILE)) {
    fs.writeFileSync(ORDENES_FILE, JSON.stringify([], null, 2), {
      encoding: 'utf-8',
      mode: 0o600,
    });
  }
}

function leerOrdenesPersistentes(): RegistroOrdenAlmacenada[] {
  asegurarDirectorioDatos();
  try {
    const contenido = fs.readFileSync(ORDENES_FILE, 'utf-8');
    const parseado = JSON.parse(contenido);
    return Array.isArray(parseado) ? parseado : [];
  } catch {
    return [];
  }
}

function guardarOrdenesPersistentes(ordenes: RegistroOrdenAlmacenada[]): void {
  asegurarDirectorioDatos();
  const acotadas = ordenes.slice(0, MAX_ORDENES_TOTALES);
  fs.writeFileSync(ORDENES_FILE, JSON.stringify(acotadas, null, 2), {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

/**
 * Middleware de validación explícita de token de sesión para proteger todos los endpoints de datos.
 */
function exigirSesionValida(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autorización requerida para operar con órdenes de despacho.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (token.length < 16 || token.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
    res.status(403).json({ error: 'Token de sesión inválido.' });
    return;
  }
  res.locals.sessionToken = token;
  next();
}

/**
 * Middleware de control de tasa (Rate Limiting) en memoria para proteger endpoints de escritura contra abuso.
 */
function limitarTasaEscritura(req: Request, res: Response, next: NextFunction): void {
  const ahora = Date.now();
  if (registroRateLimitIp.size > 1000) {
    for (const [ipKey, val] of registroRateLimitIp.entries()) {
      if (val.expiraEn <= ahora) registroRateLimitIp.delete(ipKey);
    }
  }

  const ipCliente = (req.ip || req.socket.remoteAddress || 'anon').slice(0, 64);
  const actual = registroRateLimitIp.get(ipCliente);

  if (!actual || actual.expiraEn <= ahora) {
    registroRateLimitIp.set(ipCliente, {
      conteo: 1,
      expiraEn: ahora + VENTANA_RATE_LIMIT_MS,
    });
    next();
    return;
  }

  if (actual.conteo >= MAX_POST_POR_VENTANA) {
    res.status(429).json({
      error: 'Demasiadas solicitudes en poco tiempo. Intenta nuevamente en un minuto.',
    });
    return;
  }

  actual.conteo += 1;
  next();
}

function escaparHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Valida el encabezado Host contra una lista blanca estricta para prevenir Host Header Poisoning.
 */
function obtenerBaseUrlSegura(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = (req.get('host') || '').trim();
  const hostConfiable = /^([a-zA-Z0-9-]+\.)*(desvares123\.com|localhost|127\.0\.0\.1|run\.app)(:\d+)?$/i.test(
    host
  );
  if (hostConfiable) {
    const protocolo = req.protocol === 'https' || host.endsWith('.run.app') ? 'https' : req.protocol;
    return `${protocolo}://${host}`;
  }
  return BRAND_CONFIG.dominio.replace(/\/$/, '');
}

/**
 * Inyecta de forma segura los metadatos SEO, OpenGraph, Twitter Cards y Schema.org JSON-LD en la plantilla HTML.
 */
function inyectarMetadatosSsr(template: string, pathname: string, baseUrl: string): string {
  const meta = obtenerMetadatosPorRuta(pathname, baseUrl);
  const schemaJson = serializarJsonLdSeguro(
    construirSchemaJsonLd(baseUrl, meta.zonaActiva?.slug)
  );
  const imagenSocial = `${baseUrl}/images/hero_motorcycle_rescue_1794237578669.jpg`;

  return template
    .replace(/<title>.*?<\/title>/s, `<title>${escaparHtml(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/>/s,
      `<meta name="description" content="${escaparHtml(meta.description)}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/>/s,
      `<link rel="canonical" href="${escaparHtml(meta.canonical)}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/>/s,
      `<meta property="og:title" content="${escaparHtml(meta.title)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/>/s,
      `<meta property="og:description" content="${escaparHtml(meta.description)}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/>/s,
      `<link_og_url_temp />`
    )
    .replace(
      /<link_og_url_temp \/>/s,
      `<meta property="og:url" content="${escaparHtml(meta.canonical)}" />`
    )
    .replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/>/s,
      `<meta property="og:image" content="${escaparHtml(imagenSocial)}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content=".*?"\s*\/>/s,
      `<meta name="twitter:title" content="${escaparHtml(meta.title)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content=".*?"\s*\/>/s,
      `<meta name="twitter:description" content="${escaparHtml(meta.description)}" />`
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content=".*?"\s*\/>/s,
      `<meta name="twitter:image" content="${escaparHtml(imagenSocial)}" />`
    )
    .replace(
      '</head>',
      `<script id="schema-jsonld-desvares123" type="application/ld+json">${schemaJson}</script></head>`
    );
}

async function iniciarServidor() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  // Cabeceras HTTP de seguridad defensiva
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), payment=(), geolocation=(self)'
    );
    next();
  });

  // Bloqueo explícito de cualquier intento de acceso HTTP a /data o /app/data
  app.use(['/data', '/app/data'], (_req: Request, res: Response) => {
    res.status(403).json({ error: 'Acceso denegado.' });
  });

  // Caché agresivo y resiliente para activos visuales WebP/JPG y video del Hero bajo redes móviles inestables
  app.use(['/images', '/assets/aistudio'], (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    next();
  });

  // Endpoint SEO Técnico: robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = obtenerBaseUrlSegura(req);
    const robotsTxt = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /data/',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.type('text/plain').send(robotsTxt);
  });

  // Endpoint SEO Técnico: sitemap.xml con Home y todas las rutas locales (/zona/:slug)
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = obtenerBaseUrlSegura(req);
    const fechaHoy = new Date().toISOString().split('T')[0];

    const urls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      ...ZONAS_COBERTURA.map((z) => ({
        loc: `${baseUrl}/zona/${z.slug}`,
        priority: z.destacadoAnilloSur ? '0.95' : '0.85',
        changefreq: 'daily',
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escaparHtml(u.loc)}</loc>
    <lastmod>${fechaHoy}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  });

  // API Protegida: Consultar únicamente las órdenes pertenecientes a la sesión del usuario
  app.get('/api/solicitudes', exigirSesionValida, (_req: Request, res: Response) => {
    const sessionToken = res.locals.sessionToken as string;
    const todas = leerOrdenesPersistentes();
    const misOrdenes = todas
      .filter((o) => o.sessionToken === sessionToken)
      .map(({ sessionToken: _oculto, ...publico }) => publico);

    res.json({ ordenes: misOrdenes });
  });

  // API Protegida: Registrar una nueva orden de despacho / cotización aislada por sesión y protegida por rate limit
  app.post(
    '/api/solicitudes',
    exigirSesionValida,
    limitarTasaEscritura,
    (req: Request, res: Response) => {
      const sessionToken = res.locals.sessionToken as string;
      const validacion = validarSolicitudDespacho(req.body);

      if (!validacion.valido) {
        res.status(400).json({
          error: 'Por favor revisa los campos obligatorios del formulario.',
          detalles: validacion.errores,
        });
        return;
      }

      const servicio =
        SERVICIOS_16.find((s) => s.id === req.body.servicioId) ?? SERVICIOS_16[0];
      const zona =
        ZONAS_COBERTURA.find((z) => z.slug === req.body.zonaSlug) ?? ZONAS_COBERTURA[0];

      const todas = leerOrdenesPersistentes();
      const consecutivo = 1230 + todas.length + 1;

      const nuevaOrden: RegistroOrdenAlmacenada = {
        id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        sessionToken,
        codigoOrden: `D123-${consecutivo}`,
        nombreCliente: String(req.body.nombreCliente).trim().slice(0, 80),
        telefonoContacto: String(req.body.telefonoContacto).trim().slice(0, 25),
        zonaSlug: zona.slug,
        zonaNombre: zona.nombre,
        barrio: String(req.body.barrio).trim().slice(0, 80),
        servicioId: servicio.id,
        servicioTitulo: servicio.tituloCorto,
        tipoVehiculo: String(req.body.tipoVehiculo || 'Moto').slice(0, 30),
        referenciaVehiculo: String(req.body.referenciaVehiculo).trim().slice(0, 80),
        detallesFalla: String(req.body.detallesFalla || '').trim().slice(0, 300),
        creadoEn: new Date().toISOString(),
      };

      // Aislamiento y límite por sesión para evitar acaparamiento de almacenamiento
      let conteoSesion = 0;
      const filtradasPorSesion = todas.filter((o) => {
        if (o.sessionToken !== sessionToken) return true;
        conteoSesion += 1;
        return conteoSesion < MAX_ORDENES_POR_SESION;
      });

      filtradasPorSesion.unshift(nuevaOrden);
      guardarOrdenesPersistentes(filtradasPorSesion);

      const { sessionToken: _omitir, ...ordenPublica } = nuevaOrden;
      res.status(201).json({ orden: ordenPublica });
    }
  );

  // API Protegida: Eliminar una orden perteneciente exclusivamente a la sesión del usuario
  app.delete('/api/solicitudes/:id', exigirSesionValida, (req: Request, res: Response) => {
    const sessionToken = res.locals.sessionToken as string;
    const idOrden = String(req.params.id || '').trim();
    const todas = leerOrdenesPersistentes();
    const indice = todas.findIndex((o) => o.id === idOrden && o.sessionToken === sessionToken);

    if (indice === -1) {
      res.status(404).json({ error: 'Orden no encontrada o sin permisos para eliminarla.' });
      return;
    }

    todas.splice(indice, 1);
    guardarOrdenesPersistentes(todas);
    res.json({ eliminado: true, id: idOrden });
  });

  const esProduccion = process.env.NODE_ENV === 'production';

  if (!esProduccion) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const url = req.originalUrl;
        const pathname = url.split('?')[0] || '/';
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);

        const baseUrl = obtenerBaseUrlSegura(req);
        const htmlInyectado = inyectarMetadatosSsr(template, pathname, baseUrl);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlInyectado);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        res.status(404).send('Aplicación en construcción.');
        return;
      }

      const pathname = (req.originalUrl || req.path || '/').split('?')[0] || '/';
      const template = fs.readFileSync(indexPath, 'utf-8');
      const baseUrl = obtenerBaseUrlSegura(req);
      const htmlInyectado = inyectarMetadatosSsr(template, pathname, baseUrl);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(htmlInyectado);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Desvares 123 activo en http://0.0.0.0:${PORT}`);
  });
}

iniciarServidor();
