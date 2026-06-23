"use client";

import { Button } from "@repo/ui";

interface SecretDiscoveryModalProps {
  continuing?: boolean;
  emoji?: string;
  title?: string;
  subtitle?: string;
  lore?: string;
  closeLabel?: string;
  startLabel?: string;
  onClose: () => void;
  onStart: () => void;
}

export function SecretDiscoveryModal({
  continuing,
  emoji = "🐉✨",
  title,
  subtitle,
  lore,
  closeLabel = "Ahora no",
  startLabel,
  onClose,
  onStart,
}: SecretDiscoveryModalProps) {
  const resolvedTitle =
    title ?? (continuing ? "El cofre te espera" : "¿Has sentido eso?");
  const resolvedSubtitle =
    subtitle ?? (continuing ? "Aún no has abierto el tesoro del dragón." : "Algo antiguo despierta…");
  const resolvedStart =
    startLabel ?? (continuing ? "Continuar" : "¡Abrir cofre!");

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
          {emoji}
        </p>
        <h2 className="mt-4 text-xl font-bold text-amber-200">{resolvedTitle}</h2>
        <p className="mt-2 text-sm text-slate-300">{resolvedSubtitle}</p>
        {lore && !continuing && (
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{lore}</p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            {closeLabel}
          </Button>
          <Button type="button" className="flex-1 bg-amber-600 hover:bg-amber-500" onClick={onStart}>
            {resolvedStart}
          </Button>
        </div>
      </div>
    </div>
  );
}
