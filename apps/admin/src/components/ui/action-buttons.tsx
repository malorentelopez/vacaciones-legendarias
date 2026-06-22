"use client";

import { Button } from "@repo/ui";
import { Pencil, Power, Trash2 } from "lucide-react";

interface ActionButtonsProps {
  onEdit?: () => void;
  onToggle?: () => void;
  isActive?: boolean;
  onDelete?: () => void;
  editLabel?: string;
}

export function ActionButtons({
  onEdit,
  onToggle,
  isActive = true,
  onDelete,
  editLabel = "Editar",
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <Button
          size="icon"
          variant="outline"
          onClick={onEdit}
          title={editLabel}
          className="h-9 w-9"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onToggle && (
        <Button
          size="icon"
          variant={isActive ? "ghost" : "secondary"}
          onClick={onToggle}
          title={isActive ? "Desactivar" : "Activar"}
          className="h-9 w-9"
        >
          <Power className={`h-4 w-4 ${isActive ? "" : "text-emerald-400"}`} />
        </Button>
      )}
      {onDelete && (
        <Button
          size="icon"
          variant="destructive"
          onClick={onDelete}
          title="Eliminar"
          className="h-9 w-9"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
