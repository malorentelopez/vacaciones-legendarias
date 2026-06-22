"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@repo/ui";
import { filterEmojis, isSingleEmoji } from "@/lib/emoji-data";
import { inputClass } from "@/components/ui/form-field";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterEmojis(query), [query]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-2xl",
            value ? "border-violet-500/50 bg-violet-500/10" : "border-slate-600 bg-slate-800 text-slate-500"
          )}
          aria-label={value ? `Icono seleccionado: ${value}` : "Sin icono seleccionado"}
        >
          {value || "—"}
        </div>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar emoji: paseo, lectura, casa..."
            className={cn(inputClass, "pl-9")}
          />
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-600 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Quitar icono"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/50 p-2">
        {results.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-slate-500">
            No hay emojis que coincidan. Prueba con otra palabra.
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
            {results.map(({ emoji }) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(emoji)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-slate-800",
                  value === emoji && "bg-violet-600/30 ring-1 ring-violet-500"
                )}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {value && !isSingleEmoji(value) && (
        <p className="text-xs text-red-400">Solo se permite un emoji como icono.</p>
      )}
    </div>
  );
}
