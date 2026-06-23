"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CharacterPortrait } from "@repo/ui";
import { discoverDragonChest } from "@/actions/secrets";
import { PetCompanion } from "@/components/pet-companion";
import { SecretDiscoveryModal } from "./secret-discovery-modal";

const TAP_WINDOW_MS = 3000;
const TAP_COUNT = 5;

interface SecretPortraitTriggerProps {
  imageSrc: string;
  alt: string;
  primaryColor: string;
  secondaryColor: string;
  eligible: boolean;
  discovered: boolean;
  completed: boolean;
  hatEmoji?: string | null;
  petEmoji?: string | null;
  petMood?: "sleep";
}

export function SecretPortraitTrigger({
  imageSrc,
  alt,
  primaryColor,
  secondaryColor,
  eligible,
  discovered,
  completed,
  hatEmoji,
  petEmoji,
  petMood,
}: SecretPortraitTriggerProps) {
  const router = useRouter();
  const tapTimesRef = useRef<number[]>([]);
  const [shaking, setShaking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleTap = useCallback(() => {
    if (!eligible) return;

    if (completed) {
      setHint("Ya abriste el cofre del dragón 🐉");
      return;
    }

    if (discovered) {
      setShowModal(true);
      return;
    }

    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].filter((t) => now - t <= TAP_WINDOW_MS);

    if (tapTimesRef.current.length >= TAP_COUNT) {
      tapTimesRef.current = [];
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      setShowModal(true);
      void discoverDragonChest();
      return;
    }

    if (tapTimesRef.current.length >= 3) {
      setHint("Algo brilla bajo tu héroe…");
    }
  }, [eligible, discovered, completed]);

  return (
    <>
      <button
        type="button"
        onClick={handleTap}
        className={`relative shrink-0 rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
          shaking ? "animate-pulse scale-105" : ""
        } ${eligible && !completed ? "cursor-pointer" : "cursor-default"}`}
        aria-label={
          eligible && !completed
            ? discovered
              ? "Continuar la aventura secreta"
              : "Retrato del héroe. ¿Hay algo oculto?"
            : alt
        }
      >
        <CharacterPortrait
          imageSrc={imageSrc}
          alt={alt}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          size="lg"
          className={`theme-ring ring-2 ${eligible && !completed ? "secret-portrait-glow" : ""}`}
        />
        {hatEmoji && (
          <span
            className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-lg shadow-lg ring-2 ring-amber-400/50"
            aria-hidden
          >
            {hatEmoji}
          </span>
        )}
        {petEmoji && (
          <PetCompanion
            emoji={petEmoji}
            size="md"
            reaction={petMood === "sleep" ? "sleep" : undefined}
          />
        )}
      </button>

      {hint && (
        <p className="mt-1 text-center text-xs text-amber-300/90" role="status">
          {hint}
        </p>
      )}

      {showModal && (
        <SecretDiscoveryModal
          continuing={discovered}
          onClose={() => setShowModal(false)}
          onStart={() => {
            setShowModal(false);
            router.push("/secreto/cofre-dragon");
          }}
        />
      )}
    </>
  );
}
