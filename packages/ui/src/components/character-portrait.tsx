"use client";

import { cn } from "../lib/utils";

export type PortraitGender = "boy" | "girl";
export type PortraitSize = "sm" | "md" | "lg" | "xl";

interface CharacterPortraitProps {
  roleKey: string;
  gender: PortraitGender;
  primaryColor?: string;
  secondaryColor?: string;
  size?: PortraitSize;
  className?: string;
}

const sizeMap: Record<PortraitSize, string> = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28",
  xl: "h-36 w-36",
};

function RoleAccessory({ roleKey, gender, primary, secondary }: {
  roleKey: string;
  gender: PortraitGender;
  primary: string;
  secondary: string;
}) {
  switch (roleKey) {
    case "warrior":
      return gender === "boy" ? (
        <g>
          <path d="M55 95 L45 130 L65 130 Z" fill={secondary} opacity="0.9" />
          <rect x="38" y="70" width="8" height="55" rx="2" fill="#94a3b8" />
          <rect x="36" y="68" width="12" height="6" rx="2" fill={primary} />
        </g>
      ) : (
        <g>
          <path d="M50 88 L42 125 L78 125 L70 88 Z" fill={primary} opacity="0.85" />
          <circle cx="60" cy="78" r="6" fill={secondary} />
        </g>
      );
    case "wizard":
      return (
        <g>
          <path d="M35 72 L60 45 L85 72 Z" fill={primary} />
          <path d="M38 72 L60 50 L82 72 Z" fill={secondary} opacity="0.5" />
          {gender === "girl" && <circle cx="75" cy="90" r="4" fill={secondary} opacity="0.8" />}
          {gender === "boy" && (
            <rect x="52" y="95" width="16" height="30" rx="3" fill={primary} opacity="0.7" />
          )}
        </g>
      );
    case "archer":
      return (
        <g>
          <path d="M78 85 Q95 100 78 115" fill="none" stroke={secondary} strokeWidth="3" />
          <line x1="78" y1="85" x2="78" y2="115" stroke="#94a3b8" strokeWidth="2" />
          <line x1="72" y1="100" x2="84" y2="100" stroke={primary} strokeWidth="2" />
        </g>
      );
    case "explorer":
      return (
        <g>
          <rect x="42" y="78" width="36" height="28" rx="4" fill={secondary} opacity="0.8" />
          <path d="M50 78 L60 65 L70 78" fill={primary} />
          <circle cx="60" cy="88" r="3" fill={primary} />
        </g>
      );
    case "mystic":
      return gender === "boy" ? (
        <g>
          <rect x="40" y="72" width="40" height="8" rx="2" fill="#1e293b" />
          <rect x="45" y="68" width="30" height="6" rx="2" fill={primary} />
        </g>
      ) : (
        <g>
          <ellipse cx="45" cy="75" rx="12" ry="8" fill={secondary} opacity="0.6" transform="rotate(-20 45 75)" />
          <ellipse cx="75" cy="75" rx="12" ry="8" fill={secondary} opacity="0.6" transform="rotate(20 75 75)" />
          <circle cx="60" cy="68" r="3" fill={primary} />
        </g>
      );
    case "hero":
      return gender === "boy" ? (
        <g>
          <path d="M30 80 L60 55 L90 80" fill="none" stroke={secondary} strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="52" r="5" fill={primary} />
        </g>
      ) : (
        <g>
          <path d="M35 70 L60 50 L85 70 L75 95 L45 95 Z" fill={primary} opacity="0.7" />
          <circle cx="50" cy="62" r="3" fill={secondary} />
          <circle cx="70" cy="62" r="3" fill={secondary} />
          <circle cx="60" cy="55" r="3" fill={secondary} />
        </g>
      );
    case "samurai":
      return (
        <g>
          <path d="M55 70 L60 45 L65 70" fill={secondary} />
          <rect x="52" y="70" width="16" height="4" rx="1" fill="#94a3b8" />
          <line x1="85" y1="80" x2="85" y2="120" stroke={primary} strokeWidth="3" />
        </g>
      );
    case "mecha":
      return gender === "boy" ? (
        <g>
          <rect x="38" y="75" width="44" height="35" rx="6" fill={secondary} opacity="0.8" />
          <rect x="48" y="82" width="10" height="8" rx="2" fill={primary} />
          <rect x="62" y="82" width="10" height="8" rx="2" fill={primary} />
          <rect x="55" y="95" width="10" height="4" rx="1" fill="#94a3b8" />
        </g>
      ) : (
        <g>
          <rect x="48" y="78" width="24" height="6" rx="3" fill={primary} />
          <circle cx="42" cy="80" r="4" fill={secondary} />
          <circle cx="78" cy="80" r="4" fill={secondary} />
        </g>
      );
    case "shinobi":
      return gender === "boy" ? (
        <g>
          <rect x="42" y="78" width="36" height="10" rx="2" fill="#1e293b" />
          <rect x="48" y="80" width="24" height="4" rx="1" fill={primary} />
        </g>
      ) : (
        <g>
          <path d="M40 78 Q60 68 80 78" fill="none" stroke={primary} strokeWidth="3" />
          <circle cx="48" cy="76" r="3" fill={secondary} />
          <circle cx="72" cy="76" r="3" fill={secondary} />
        </g>
      );
    case "student":
      return (
        <g>
          <rect x="45" y="82" width="30" height="22" rx="3" fill={gender === "boy" ? secondary : primary} opacity="0.8" />
          {gender === "girl" && (
            <path d="M50 82 L60 72 L70 82" fill={secondary} />
          )}
        </g>
      );
    case "pirate":
      return (
        <g>
          <path d="M38 72 L60 58 L82 72 L78 82 L42 82 Z" fill="#1e293b" />
          <circle cx="52" cy="74" r="3" fill={secondary} />
          <rect x="70" y="85" width="20" height="4" rx="2" fill="#92400e" transform="rotate(30 70 85)" />
        </g>
      );
    case "captain":
      return (
        <g>
          <path d="M40 72 L60 55 L80 72" fill={primary} />
          <circle cx="60" cy="78" r="4" fill={secondary} />
          <path d="M75 90 L95 105 L75 105 Z" fill={secondary} opacity="0.8" />
        </g>
      );
    case "diver":
      return (
        <g>
          <ellipse cx="60" cy="78" rx="22" ry="14" fill={secondary} opacity="0.5" />
          <rect x="48" y="74" width="24" height="10" rx="5" fill={primary} opacity="0.7" />
          <circle cx="54" cy="78" r="4" fill="#1e293b" opacity="0.6" />
          <circle cx="66" cy="78" r="4" fill="#1e293b" opacity="0.6" />
        </g>
      );
    case "angler":
      return gender === "boy" ? (
        <g>
          <line x1="75" y1="85" x2="95" y2="60" stroke="#92400e" strokeWidth="2" />
          <path d="M93 58 Q98 55 95 65" fill="none" stroke={secondary} strokeWidth="1.5" />
          <ellipse cx="60" cy="105" rx="18" ry="6" fill={primary} opacity="0.3" />
        </g>
      ) : (
        <g>
          <path d="M35 100 Q60 70 85 100" fill={secondary} opacity="0.5" />
          <path d="M50 95 Q55 80 60 95" fill={primary} opacity="0.6" />
          <circle cx="60" cy="72" r="5" fill={secondary} />
        </g>
      );
    default:
      return null;
  }
}

export function CharacterPortrait({
  roleKey,
  gender,
  primaryColor = "#8b5cf6",
  secondaryColor = "#22c55e",
  size = "md",
  className,
}: CharacterPortraitProps) {
  const isGirl = gender === "girl";
  const skin = isGirl ? "#fcd9b6" : "#f5c99a";
  const hair = isGirl ? "#5c3d2e" : "#3d2914";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        sizeMap[size],
        className
      )}
      style={{
        background: `linear-gradient(160deg, ${primaryColor}35 0%, ${secondaryColor}25 100%)`,
      }}
    >
      <svg viewBox="0 0 120 140" className="h-full w-full" aria-hidden>
        <ellipse cx="60" cy="130" rx="35" ry="8" fill="#000" opacity="0.15" />

        <path
          d={isGirl
            ? "M35 105 Q60 95 85 105 L88 140 L32 140 Z"
            : "M38 105 L82 105 L85 140 L35 140 Z"
          }
          fill={primaryColor}
          opacity="0.85"
        />
        <path
          d={isGirl
            ? "M42 105 L60 98 L78 105"
            : "M45 105 L60 100 L75 105"
          }
          fill={secondaryColor}
          opacity="0.5"
        />

        <rect x="54" y="88" width="12" height="12" rx="3" fill={skin} />
        <ellipse cx="60" cy="72" rx="22" ry="24" fill={skin} />

        {isGirl ? (
          <g>
            <ellipse cx="60" cy="58" rx="24" ry="20" fill={hair} />
            <path d="M36 65 Q30 90 38 110 L42 108 Q34 88 40 68 Z" fill={hair} />
            <path d="M84 65 Q90 90 82 110 L78 108 Q86 88 80 68 Z" fill={hair} />
          </g>
        ) : (
          <path d="M38 68 Q60 42 82 68 L80 78 Q60 55 40 78 Z" fill={hair} />
        )}

        <ellipse cx="52" cy="72" rx="3" ry="4" fill="#1e293b" />
        <ellipse cx="68" cy="72" rx="3" ry="4" fill="#1e293b" />
        <circle cx="53" cy="71" r="1" fill="#fff" />
        <circle cx="69" cy="71" r="1" fill="#fff" />
        <path d="M54 82 Q60 86 66 82" fill="none" stroke="#c4845c" strokeWidth="1.5" strokeLinecap="round" />

        <RoleAccessory roleKey={roleKey} gender={gender} primary={primaryColor} secondary={secondaryColor} />
      </svg>
    </div>
  );
}
