import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroTriageSection } from './components/HeroTriageSection';
import { BentoCapabilities } from './components/BentoCapabilities';
import { Catalogo16Servicios } from './components/Catalogo16Servicios';
import { SiloCoberturaLocal } from './components/SiloCoberturaLocal';
import { ModalOrdenDespacho, OrdenRegistrada } from './components/ModalOrdenDespacho';
import { FaqAndFooter } from './components/FaqAndFooter';
import {
  ToastNotificaciones,
  NotificacionToast,
  TipoToast,
} from './components/ToastNotificaciones';
import {
  obtenerMetadatosPorRuta,
  construirSchemaJsonLd,
} from './utils/seoAndTriage';

const SESSION_STORAGE_KEY = 'desvares123_session_token';

function generarTokenSesionUnico(): string {
  try {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `s123_${hex}_${Date.now().toString(36)}`;
    }
  } catch {
    // Continúa a generador alfanumérico aleatorio por instancia
  }
  return (
    's123_' +
    Math.random().toString(36).substring(2, 12) +
    Math.random().toString(36).substring(2, 12) +
    '_' +
    Date.now().toString(36)
  );
}

function obtenerOCrearTokenSesion(): string {
  const nuevoToken = generarTokenSesionUnico();
  try {
    const guardado = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (guardado && guardado.length >= 16 && /^[a-zA-Z0-9_-]+$/.test(guardado)) {
      return guardado;
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, nuevoToken);
    return nuevoToken;
  } catch {
    return nuevoToken;
  }
}

export default function App() {
  const [tokenSesion] = useState<string>(() => obtenerOCrearTokenSesion());
  const [pathnameActual, setPathnameActual] = useState<string>(() => window.location.pathname);

  const metaInicial = obtenerMetadatosPorRuta(window.location.pathname);
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<string>('la-moto-no-prende');
  const [zonaSeleccionadaSlug, setZonaSeleccionadaSlug] = useState<string>(
    metaInicial.zonaActiva?.slug ?? 'itagui'
  );
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [datosModal, setDatosModal] = useState<{
    servicioId: string;
    zonaSlug: string;
    barrio: string;
    tipoVehiculo: 'Moto' | 'Scooter' | 'Carro / Camioneta';
    referenciaVehiculo: string;
  }>({
    servicioId: 'la-moto-no-prende',
    zonaSlug: metaInicial.zonaActiva?.slug ?? 'itagui',
    barrio: '',
    tipoVehiculo: 'Moto',
    referenciaVehiculo: '',
  });
  const [ordenesSesion, setOrdenesSesion] = useState<OrdenRegistrada[]>([]);
  const [notificacionesToast, setNotificacionesToast] = useState<NotificacionToast[]>([]);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const alExcederCuotaGmp = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', alExcederCuotaGmp);
    return () => window.removeEventListener('gmp-quota-exceeded', alExcederCuotaGmp);
  }, []);

  const cerrarToast = useCallback((id: string) => {
    setNotificacionesToast((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (nuevo: { tipo: TipoToast; titulo: string; mensaje: string }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setNotificacionesToast((prev) => [{ id, ...nuevo }, ...prev.slice(0, 2)]);
      window.setTimeout(() => {
        setNotificacionesToast((prev) => prev.filter((item) => item.id !== id));
      }, 5000);
    },
    []
  );

  // Sincronizar metadatos dinámicos del documento y JSON-LD en el cliente
  useEffect(() => {
    const meta = obtenerMetadatosPorRuta(pathnameActual, window.location.origin);
    document.title = meta.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', meta.description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', meta.canonical);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', meta.canonical);

    // Actualizar o inyectar Schema.org JSON-LD en el head
    let scriptSchema = document.getElementById('schema-jsonld-desvares123') as HTMLScriptElement | null;
    if (!scriptSchema) {
      scriptSchema = document.createElement('script');
      scriptSchema.id = 'schema-jsonld-desvares123';
      scriptSchema.type = 'application/ld+json';
      document.head.appendChild(scriptSchema);
    }
    scriptSchema.textContent = JSON.stringify(
      construirSchemaJsonLd(window.location.origin, meta.zonaActiva?.slug)
    );
  }, [pathnameActual]);

  // Cargar órdenes registradas previamente por la sesión del usuario
  useEffect(() => {
    let cancelado = false;
    fetch('/api/solicitudes', {
      headers: {
        Authorization: `Bearer ${tokenSesion}`,
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelado && data && Array.isArray(data.ordenes)) {
          setOrdenesSesion(data.ordenes);
        }
      })
      .catch(() => {
        // Modo resiliente si se sirve sin backend
      });
    return () => {
      cancelado = true;
    };
  }, [tokenSesion]);

  // Escuchar cambios de navegación atrás/adelante
  useEffect(() => {
    const alCambiarPopState = () => {
      const nuevaRuta = window.location.pathname;
      setPathnameActual(nuevaRuta);
      const meta = obtenerMetadatosPorRuta(nuevaRuta);
      if (meta.zonaActiva) {
        setZonaSeleccionadaSlug(meta.zonaActiva.slug);
      }
    };
    window.addEventListener('popstate', alCambiarPopState);
    return () => window.removeEventListener('popstate', alCambiarPopState);
  }, []);

  const cambiarZona = useCallback((slug: string, actualizarUrl = false) => {
    setZonaSeleccionadaSlug(slug);
    setBarrioSeleccionado('');
    if (actualizarUrl) {
      const nuevaUrl = `/zona/${slug}`;
      window.history.pushState({}, '', nuevaUrl);
      setPathnameActual(nuevaUrl);
    }
  }, []);

  const resetearZonaHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    setPathnameActual('/');
  }, []);

  const seleccionarBarrio = useCallback((zonaSlug: string, barrio: string) => {
    setZonaSeleccionadaSlug(zonaSlug);
    setBarrioSeleccionado(barrio);
    const nuevaUrl = `/zona/${zonaSlug}`;
    window.history.pushState({}, '', nuevaUrl);
    setPathnameActual(nuevaUrl);
    document.getElementById('asistencia-inmediata')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const seleccionarServicioYDespachar = useCallback(
    (servicioId: string) => {
      setServicioSeleccionadoId(servicioId);
      setDatosModal((prev) => ({
        ...prev,
        servicioId,
        zonaSlug: zonaSeleccionadaSlug,
        barrio: barrioSeleccionado,
      }));
      setModalAbierto(true);
    },
    [zonaSeleccionadaSlug, barrioSeleccionado]
  );

  const metaRuta = obtenerMetadatosPorRuta(pathnameActual);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <ToastNotificaciones
        notificaciones={notificacionesToast}
        onCerrar={cerrarToast}
      />

      <Navbar
        onAbrirModalDespacho={() => {
          setDatosModal({
            servicioId: servicioSeleccionadoId,
            zonaSlug: zonaSeleccionadaSlug,
            barrio: barrioSeleccionado,
            tipoVehiculo: 'Moto',
            referenciaVehiculo: '',
          });
          setModalAbierto(true);
        }}
        onResetearZona={resetearZonaHome}
      />

      <main className="flex-1">
        <HeroTriageSection
          servicioSeleccionadoId={servicioSeleccionadoId}
          onSelectServicio={setServicioSeleccionadoId}
          zonaSeleccionadaSlug={zonaSeleccionadaSlug}
          onSelectZona={(slug) => cambiarZona(slug, true)}
          barrioSeleccionado={barrioSeleccionado}
          onChangeBarrio={setBarrioSeleccionado}
          zonaRutaActiva={metaRuta.zonaActiva}
          onAbrirModalConDatos={(params) => {
            setDatosModal(params);
            setModalAbierto(true);
          }}
          onMostrarToast={mostrarToast}
        />

        <BentoCapabilities
          onSeleccionarEspecialidad={(servicioId) => {
            setServicioSeleccionadoId(servicioId);
            document
              .getElementById('asistencia-inmediata')
              ?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <Catalogo16Servicios
          zonaActualSlug={zonaSeleccionadaSlug}
          barrioActual={barrioSeleccionado}
          onSeleccionarServicioParaDespacho={seleccionarServicioYDespachar}
        />

        <SiloCoberturaLocal
          zonaActivaSlug={zonaSeleccionadaSlug}
          barrioSeleccionado={barrioSeleccionado}
          onCambiarZona={cambiarZona}
          onSeleccionarBarrio={seleccionarBarrio}
        />

        <FaqAndFooter
          ordenesSesion={ordenesSesion}
          onAbrirModalDespacho={() => {
            setDatosModal({
              servicioId: servicioSeleccionadoId,
              zonaSlug: zonaSeleccionadaSlug,
              barrio: barrioSeleccionado,
              tipoVehiculo: 'Moto',
              referenciaVehiculo: '',
            });
            setModalAbierto(true);
          }}
          onCambiarZona={cambiarZona}
        />
      </main>

      <ModalOrdenDespacho
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        valoresIniciales={datosModal}
        onOrdenCreada={(nuevaOrden) => {
          setOrdenesSesion((prev) => [nuevaOrden, ...prev]);
        }}
        tokenSesion={tokenSesion}
        onMostrarToast={mostrarToast}
      />
    </div>
  );
}

