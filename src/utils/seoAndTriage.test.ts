import test from 'node:test';
import assert from 'node:assert/strict';
import {
  construirTriageWhatsapp,
  filtrarServicios,
  validarSolicitudDespacho,
  obtenerMetadatosPorRuta,
  construirSchemaJsonLd,
  serializarJsonLdSeguro,
  obtenerAtributosImagenOptimizada,
  construirPayloadConversionGA4,
  resolverUbicacionGpsAburra,
} from './seoAndTriage';
import { SERVICIOS_16, ZONAS_COBERTURA, BRAND_CONFIG } from '../data/desvaresData';

test('resolverUbicacionGpsAburra detecta el municipio y barrio más cercano y formatea las coordenadas GPS', () => {
  const enSabaneta = resolverUbicacionGpsAburra(6.1518, -75.6162);
  assert.equal(enSabaneta.zonaSlug, 'sabaneta');
  assert.equal(enSabaneta.zonaNombre, 'Sabaneta');
  assert.ok(enSabaneta.barrioFormateado.includes('GPS: 6.1518, -75.6162'));

  const enEnvigado = resolverUbicacionGpsAburra(6.1701, -75.5880);
  assert.equal(enEnvigado.zonaSlug, 'envigado');
  assert.equal(enEnvigado.zonaNombre, 'Envigado');

  const enRobledo = resolverUbicacionGpsAburra(6.2762, -75.5980);
  assert.equal(enRobledo.zonaSlug, 'medellin');
  assert.ok(enRobledo.barrioFormateado.includes('Robledo'));

  const triageConPin = construirTriageWhatsapp({
    servicioId: 'la-moto-no-prende',
    zonaSlug: enRobledo.zonaSlug,
    barrio: enRobledo.barrioFormateado,
  });
  assert.ok(triageConPin.mensajeTextoPlano.includes('https://maps.google.com/?q=6.2762,-75.5980'));

  const fallback = resolverUbicacionGpsAburra(Number.NaN, Number.NaN, 'itagui');
  assert.equal(fallback.zonaSlug, 'itagui');
  assert.ok(fallback.barrioFormateado.includes('GPS:'));
});

test('construirPayloadConversionGA4 estructura el evento personalizado solicitar_rescate_ahora para GA4', () => {
  const evento = construirPayloadConversionGA4({
    ubicacionBoton: 'navbar_superior',
    servicioId: 'montallantas-carros-y-motos',
    zonaSlug: 'itagui',
    canalContacto: 'formulario_web',
  });

  assert.equal(evento.eventName, 'solicitar_rescate_ahora');
  assert.equal(evento.eventParams.event_category, 'conversion_rescate');
  assert.equal(evento.eventParams.button_text, 'Solicitar rescate ahora');
  assert.equal(evento.eventParams.ubicacion_boton, 'navbar_superior');
  assert.equal(evento.eventParams.currency, 'COP');
  assert.equal(evento.eventParams.value, 1);
});

test('Catálogo contiene exactamente los 16 servicios solicitados por el cliente sin propiedades obsoletas', () => {
  assert.equal(SERVICIOS_16.length, 16);
  const ids = SERVICIOS_16.map((s) => s.id);
  assert.ok(ids.includes('la-moto-no-prende'));
  assert.ok(ids.includes('montallantas-carros-y-motos'));
  assert.ok(ids.includes('experto-motos-scooter'));
  assert.ok(ids.includes('full-inyeccion'));
  assert.ok(ids.includes('scaner-motos'));
  assert.ok(ids.includes('colision-y-siniestros'));
  assert.ok(ids.includes('reparacion-de-motores'));

  const numerosUnicos = new Set(SERVICIOS_16.map((s) => s.numero));
  assert.equal(numerosUnicos.size, 16);
});

test('obtenerAtributosImagenOptimizada y serializarJsonLdSeguro aplican optimización WebP y escape XSS', () => {
  const attrsBento = obtenerAtributosImagenOptimizada(BRAND_CONFIG.imagenes.montallantas);
  assert.equal(attrsBento.loading, 'lazy');
  assert.equal(attrsBento.decoding, 'async');
  assert.equal(attrsBento.fetchPriority, 'low');
  assert.ok(attrsBento.webpSrcSet.includes('_640w.webp 640w'));
  assert.ok(attrsBento.webpSrcSet.includes('.webp 1280w'));

  const attrsHero = obtenerAtributosImagenOptimizada(BRAND_CONFIG.imagenes.hero, {
    esPrioritaria: true,
  });
  assert.equal(attrsHero.loading, 'eager');
  assert.equal(attrsHero.fetchPriority, 'high');
  assert.ok(attrsHero.webpSrcSet.includes('_640w.webp 640w'));

  const jsonEscapado = serializarJsonLdSeguro({ prueba: '</script><script>alert(1)</script>' });
  assert.ok(!jsonEscapado.includes('</script>'));
  assert.ok(jsonEscapado.includes('\\u003c/script\\u003e'));
});

test('construirTriageWhatsapp incluye el número +57 300 603 6253 y cotización gratis sin barrera de cobro previo', () => {
  const resultado = construirTriageWhatsapp({
    servicioId: 'montallantas-carros-y-motos',
    zonaSlug: 'sabaneta',
    barrio: 'Aves María',
    tipoVehiculo: 'Carro / Camioneta',
    vehiculoMarcaModelo: 'Mazda CX-30',
  });

  assert.equal(resultado.zona.nombre, 'Sabaneta');
  assert.ok(resultado.urlWhatsapp.startsWith(`https://wa.me/${BRAND_CONFIG.whatsappNumero}?text=`));
  assert.ok(resultado.mensajeTextoPlano.includes('Aves María'));
  assert.ok(resultado.mensajeTextoPlano.includes('cotización gratis'));
  assert.ok(!resultado.mensajeTextoPlano.includes('30.000'));
  assert.ok(resultado.mensajeTextoPlano.includes('Mazda CX-30'));
});

test('filtrarServicios filtra por categoría y término de búsqueda correctamente', () => {
  const todos = filtrarServicios('todos', '');
  assert.equal(todos.length, 16);

  const urgencias = filtrarServicios('urgencia_vial', '');
  assert.equal(urgencias.length, 4);

  const scooters = filtrarServicios('todos', 'scooter');
  assert.ok(scooters.length >= 1);
  assert.ok(scooters.some((s) => s.id === 'experto-motos-scooter'));

  const vacio = filtrarServicios('todos', 'servicio-inexistente-xyz');
  assert.equal(vacio.length, 0);
});

test('validarSolicitudDespacho exige campos básicos sin bloqueo por tarifa previa', () => {
  const invalido = validarSolicitudDespacho({
    nombreCliente: '',
    telefonoContacto: '123',
    zonaSlug: 'itagui',
    barrio: '',
    servicioId: 'la-moto-no-prende',
    tipoVehiculo: 'Moto',
    referenciaVehiculo: '',
    detallesFalla: '',
  });

  assert.equal(invalido.valido, false);
  assert.ok(invalido.errores.nombreCliente);
  assert.ok(invalido.errores.telefonoContacto);
  assert.ok(invalido.errores.barrio);
  assert.ok(invalido.errores.referenciaVehiculo);

  const valido = validarSolicitudDespacho({
    nombreCliente: 'Carlos Ramírez',
    telefonoContacto: '3001899288',
    zonaSlug: 'envigado',
    barrio: 'Las Vegas',
    servicioId: 'scaner-motos',
    tipoVehiculo: 'Scooter',
    referenciaVehiculo: 'Yamaha NMAX 155',
    detallesFalla: 'Testigo FI encendido',
  });

  assert.equal(valido.valido, true);
  assert.equal(Object.keys(valido.errores).length, 0);
});

test('obtenerMetadatosPorRuta y construirSchemaJsonLd devuelven SEO local exacto por municipio', () => {
  const metaItagui = obtenerMetadatosPorRuta('/zona/itagui', 'https://mecanicosadomicilio.org');
  assert.ok(metaItagui.title.includes('Itagüí'));
  assert.equal(metaItagui.canonical, 'https://mecanicosadomicilio.org/zona/itagui');
  assert.equal(metaItagui.zonaActiva?.slug, 'itagui');

  const schema = construirSchemaJsonLd('https://mecanicosadomicilio.org', 'envigado');
  assert.equal(schema['@graph'].length, 2);
  const negocio = schema['@graph'][0] as Record<string, unknown>;
  assert.ok(negocio.aggregateRating);
  assert.ok(Array.isArray(negocio.review) && negocio.review.length >= 3);
  assert.equal(ZONAS_COBERTURA.length, 5);
});

