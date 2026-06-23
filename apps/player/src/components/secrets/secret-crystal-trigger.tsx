"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { discoverOceanFishing } from "@/actions/secrets";
import { SecretDiscoveryModal } from "./secret-discovery-modal";

interface SecretCrystalTriggerProps {
  eligible: boolean;
  discovered: boolean;
  completed: boolean;
  children: React.ReactNode;
}

export function SecretCrystalTrigger({
  eligible,
  discovered,
  completed,
  children,
}: SecretCrystalTriggerProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  function handleClick(event: React.MouseEvent) {
    if (!eligible || completed) return;

    if (discovered) {
      event.preventDefault();
      setShowModal(true);
      return;
    }

    event.preventDefault();
    setHint("El mar susurra bajo los cristales…");
    setShowModal(true);
    void discoverOceanFishing();
  }

  return (
    <>
      <div
        onClickCapture={eligible && !completed ? handleClick : undefined}
        className={eligible && !completed ? "secret-crystal-glow inline-flex rounded-full" : "inline-flex"}
      >
        {children}
      </div>

      {hint && (
        <p className="absolute right-0 top-full mt-1 whitespace-nowrap text-[10px] text-cyan-300/90" role="status">
          {hint}
        </p>
      )}

      {showModal && (
        <SecretDiscoveryModal
          continuing={discovered}
          emoji="🎣🌊"
          title={discovered ? "La red te espera" : "¡Los cristales brillan!"}
          subtitle={
            discovered
              ? "Aún no has completado la pesca relámpago."
              : "42 cristales… el océano abre su secreto."
          }
          lore="Solo en el mundo océano, cuando la bolsa marca exactamente 42, aparece la pesca legendaria."
          startLabel={discovered ? "Continuar pesca" : "¡A pescar!"}
          onClose={() => setShowModal(false)}
          onStart={() => {
            setShowModal(false);
            router.push("/secreto/pesca-relampago");
          }}
        />
      )}
    </>
  );
}
