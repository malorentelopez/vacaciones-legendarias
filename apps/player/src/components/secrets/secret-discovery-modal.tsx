"use client";

import { Button } from "@repo/ui";

interface SecretDiscoveryModalProps {
  continuing?: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function SecretDiscoveryModal({ continuing, onClose, onStart }: SecretDiscoveryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-amber-500/30 bg-slate-900 p-6 text-center shadow-2xl">
        <p className="text-4xl" aria-hidden>
          🐉✨
        </p>
        <h2 className="mt-4 text-xl font-bold text-amber-200">
          {continuing ? "El cofre te espera" : "¿Has sentido eso?"}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {continuing ? "Aún no has abierto el tesoro del dragón." : "Algo antiguo despierta…"}
        </p>
        {!continuing && (
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Una leyenda dice que el Dragón del Verano guarda un cofre para los héroes más atentos.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Ahora no
          </Button>
          <Button type="button" className="flex-1 bg-amber-600 hover:bg-amber-500" onClick={onStart}>
            {continuing ? "Continuar" : "¡Abrir cofre!"}
          </Button>
        </div>
      </div>
    </div>
  );
}
