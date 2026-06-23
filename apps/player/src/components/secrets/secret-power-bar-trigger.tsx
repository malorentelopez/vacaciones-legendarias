"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { discoverMangaPowerCombo } from "@/actions/secrets";
import { SecretDiscoveryModal } from "./secret-discovery-modal";

const TAP_WINDOW_MS = 3000;
const TAP_COUNT = 5;

interface SecretPowerBarTriggerProps {
  eligible: boolean;
  discovered: boolean;
  completed: boolean;
  children: ReactNode;
}

export function SecretPowerBarTrigger({
  eligible,
  discovered,
  completed,
  children,
}: SecretPowerBarTriggerProps) {
  const router = useRouter();
  const tapTimesRef = useRef<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [glowing, setGlowing] = useState(false);

  const handleTap = useCallback(() => {
    if (!eligible) return;

    if (completed) return;

    if (discovered) {
      setShowModal(true);
      return;
    }

    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].filter((t) => now - t <= TAP_WINDOW_MS);

    if (tapTimesRef.current.length >= TAP_COUNT) {
      tapTimesRef.current = [];
      setGlowing(true);
      setTimeout(() => setGlowing(false), 500);
      setShowModal(true);
      void discoverMangaPowerCombo();
      return;
    }

    if (tapTimesRef.current.length >= 3) {
      setHint("La barra POWER vibra…");
    }
  }, [eligible, discovered, completed]);

  return (
    <>
      <button
        type="button"
        onClick={handleTap}
        className={`w-full rounded-lg text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 ${
          eligible && !completed ? "cursor-pointer" : "cursor-default"
        } ${glowing ? "secret-power-glow" : ""}`}
        aria-label={
          eligible && !completed
            ? discovered
              ? "Continuar combo de poder secreto"
              : "Barra de poder. ¿Hay un combo oculto?"
            : undefined
        }
      >
        {children}
        {hint && (
          <p className="mt-1 text-center text-[10px] text-pink-300/90 sm:text-xs" role="status">
            {hint}
          </p>
        )}
      </button>

      {showModal && (
        <SecretDiscoveryModal
          continuing={discovered}
          emoji="⚡🥷"
          title={discovered ? "El combo te espera" : "¡La barra despierta!"}
          subtitle={
            discovered
              ? "Aún no has completado el combo de poder."
              : "Tu energía concentra un movimiento secreto…"
          }
          lore="Solo los héroes manga que dominan la secuencia pueden despertar la bandana legendaria."
          startLabel={discovered ? "Continuar combo" : "¡Activar combo!"}
          onClose={() => setShowModal(false)}
          onStart={() => {
            setShowModal(false);
            router.push("/secreto/combo-poder");
          }}
        />
      )}
    </>
  );
}
