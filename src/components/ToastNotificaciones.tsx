import React from 'react';
import { CheckCircle2, AlertCircle, MapPin, X } from 'lucide-react';

export type TipoToast = 'exito' | 'error' | 'info';

export interface NotificacionToast {
  id: string;
  tipo: TipoToast;
  titulo: string;
  mensaje: string;
}

interface ToastNotificacionesProps {
  notificaciones: NotificacionToast[];
  onCerrar: (id: string) => void;
}

/**
 * Sistema de notificaciones flotantes (Toast) accesible para confirmar envíos de órdenes,
 * errores de validación en formularios y detección automática de ubicación GPS.
 */
export const ToastNotificaciones: React.FC<ToastNotificacionesProps> = ({
  notificaciones,
  onCerrar,
}) => {
  if (notificaciones.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      data-testid="toast-container"
      className="fixed top-20 right-4 z-60 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
    >
      {notificaciones.map((item) => {
        const esError = item.tipo === 'error';
        const esExito = item.tipo === 'exito';

        return (
          <div
            key={item.id}
            role={esError ? 'alert' : 'status'}
            data-testid={`toast-${item.tipo}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
              esError
                ? 'bg-red-950/95 border-red-500/60 text-white'
                : esExito
                  ? 'bg-slate-900/95 border-emerald-500/60 text-white'
                  : 'bg-slate-900/95 border-[#FF5500]/60 text-white'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {esError ? (
                <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
              ) : esExito ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              ) : (
                <MapPin className="w-5 h-5 text-[#FF5500]" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold leading-snug">{item.titulo}</p>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{item.mensaje}</p>
            </div>

            <button
              type="button"
              onClick={() => onCerrar(item.id)}
              aria-label={`Cerrar notificación: ${item.titulo}`}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
