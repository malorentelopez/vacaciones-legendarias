"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@repo/ui";
import type { DayScheduleType } from "@repo/database";
import {
  createScheduleBlock,
  updateScheduleBlock,
  deleteScheduleBlock,
  getScheduleBlocks,
  reorderScheduleBlocks,
} from "@/actions/admin";
import { Modal } from "@/components/ui/modal";
import { FormField, inputClass, selectClass, textareaClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButtons } from "@/components/ui/action-buttons";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { isSingleEmoji } from "@/lib/emoji-data";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

interface Character {
  id: string;
  name: string;
}

interface Mission {
  id: string;
  title: string;
  type: string;
  isSideQuest?: boolean;
}

interface ScheduleBlockMission {
  missionId: string;
  mission: Mission;
}

interface ScheduleBlock {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  startTime: string;
  endTime: string | null;
  section: string | null;
  order: number;
  missions: ScheduleBlockMission[];
}

const DAY_TYPES: { value: DayScheduleType; label: string }[] = [
  { value: "WEEKDAY", label: "Lunes a jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "WEEKEND", label: "Fin de semana" },
];

const emptyForm = {
  title: "",
  description: "",
  icon: "",
  startTime: "08:00",
  endTime: "09:00",
  section: "",
  missionIds: [] as string[],
};

function formatTimeRange(start: string, end: string | null) {
  return end ? `${start} – ${end}` : `${start} en adelante`;
}

function reorderBlocksList(blocks: ScheduleBlock[], fromIndex: number, toIndex: number) {
  const next = [...blocks];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function ScheduleManager({
  characters,
  missions,
  initialBlocks,
  initialCharacterId,
  initialDayType,
}: {
  characters: Character[];
  missions: Mission[];
  initialBlocks: ScheduleBlock[];
  initialCharacterId: string;
  initialDayType: DayScheduleType;
}) {
  const [characterId, setCharacterId] = useState(initialCharacterId);
  const [dayType, setDayType] = useState<DayScheduleType>(initialDayType);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  async function loadBlocks(charId: string, dt: DayScheduleType) {
    setLoading(true);
    try {
      const data = await getScheduleBlocks(charId, dt);
      setBlocks(data as ScheduleBlock[]);
    } finally {
      setLoading(false);
    }
  }

  function handleCharacterChange(charId: string) {
    setCharacterId(charId);
    loadBlocks(charId, dayType);
  }

  function handleDayTypeChange(dt: DayScheduleType) {
    setDayType(dt);
    loadBlocks(characterId, dt);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(block: ScheduleBlock) {
    setEditingId(block.id);
    setForm({
      title: block.title,
      description: block.description ?? "",
      icon: block.icon ?? "",
      startTime: block.startTime,
      endTime: block.endTime ?? "",
      section: block.section ?? "",
      missionIds: block.missions.map((m) => m.missionId),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.icon && !isSingleEmoji(form.icon)) {
      alert("El icono debe ser un único emoji.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        icon: form.icon || undefined,
        startTime: form.startTime,
        endTime: form.endTime || undefined,
        section: form.section || undefined,
        missionIds: form.missionIds,
      };

      let updated;
      if (editingId) {
        updated = await updateScheduleBlock(editingId, characterId, dayType, {
          ...payload,
          endTime: form.endTime || null,
          description: form.description || null,
          icon: form.icon || null,
          section: form.section || null,
        });
      } else {
        updated = await createScheduleBlock({
          characterId,
          dayType,
          order: blocks.length,
          ...payload,
        });
      }

      setBlocks(updated as ScheduleBlock[]);
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este bloque de la agenda?")) return;
    setLoading(true);
    try {
      const updated = await deleteScheduleBlock(id, characterId, dayType);
      setBlocks(updated as ScheduleBlock[]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  }

  function toggleMission(missionId: string) {
    setForm((prev) => ({
      ...prev,
      missionIds: prev.missionIds.includes(missionId)
        ? prev.missionIds.filter((id) => id !== missionId)
        : [...prev.missionIds, missionId],
    }));
  }

  async function persistOrder(nextBlocks: ScheduleBlock[]) {
    setBlocks(nextBlocks);
    setReorderLoading(true);
    try {
      const updated = await reorderScheduleBlocks(
        characterId,
        dayType,
        nextBlocks.map((b) => b.id)
      );
      setBlocks(updated as ScheduleBlock[]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al reordenar");
      await loadBlocks(characterId, dayType);
    } finally {
      setReorderLoading(false);
    }
  }

  async function moveBlock(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    await persistOrder(reorderBlocksList(blocks, index, targetIndex));
  }

  function handleDragStart(blockId: string) {
    setDraggingId(blockId);
  }

  function handleDragOver(e: React.DragEvent, blockId: string) {
    e.preventDefault();
    if (draggingId && draggingId !== blockId) {
      setDropTargetId(blockId);
    }
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = blocks.findIndex((b) => b.id === draggingId);
    const toIndex = blocks.findIndex((b) => b.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    setDraggingId(null);
    setDropTargetId(null);
    await persistOrder(reorderBlocksList(blocks, fromIndex, toIndex));
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTargetId(null);
  }

  let lastSection: string | null = null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda semanal"
        description="Define el horario por tipo de día. El viernes tiene su propia agenda para tareas semanales."
        actionLabel="Nuevo bloque"
        onAction={characterId ? openCreate : undefined}
      />

      <div className="flex flex-wrap gap-4">
        <div className="min-w-[200px]">
          <FormField label="Personaje">
            <select
              className={selectClass}
              value={characterId}
              onChange={(e) => handleCharacterChange(e.target.value)}
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex gap-2 self-end">
          {DAY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleDayTypeChange(value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                dayType === value
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && blocks.length === 0 ? (
        <p className="text-slate-400">Cargando agenda...</p>
      ) : blocks.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          No hay bloques definidos para este personaje. Añade el primero para empezar.
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Arrastra los bloques para cambiar el orden, o usa las flechas.
            {reorderLoading && <span className="ml-2 text-violet-400">Guardando orden…</span>}
          </p>
          {blocks.map((block, index) => {
            const showSection = block.section && block.section !== lastSection;
            if (showSection) lastSection = block.section;
            const isDragging = draggingId === block.id;
            const isDropTarget = dropTargetId === block.id;

            return (
              <div key={block.id}>
                {showSection && (
                  <h3 className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {block.section}
                  </h3>
                )}
                <Card
                  className={`p-4 transition-opacity ${isDragging ? "opacity-40" : ""} ${
                    isDropTarget ? "ring-2 ring-violet-500" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, block.id)}
                  onDrop={() => handleDrop(block.id)}
                  onDragLeave={() => {
                    if (dropTargetId === block.id) setDropTargetId(null);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", block.id);
                          handleDragStart(block.id);
                        }}
                        onDragEnd={handleDragEnd}
                        disabled={reorderLoading}
                        className="cursor-grab rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing disabled:opacity-40"
                        aria-label="Arrastrar para reordenar"
                        title="Arrastrar para reordenar"
                      >
                        <GripVertical className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0 || reorderLoading}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                        aria-label="Subir bloque"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(index, 1)}
                        disabled={index === blocks.length - 1 || reorderLoading}
                        className="rounded p-0.5 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                        aria-label="Bajar bloque"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant="default">{formatTimeRange(block.startTime, block.endTime)}</Badge>
                          {block.icon && <span className="text-lg">{block.icon}</span>}
                          <h4 className="font-semibold text-white">{block.title}</h4>
                        </div>
                        {block.description && (
                          <p className="text-sm text-slate-400">{block.description}</p>
                        )}
                        {block.missions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {block.missions.map(({ mission }) => (
                              <Badge key={mission.id} variant="warning">{mission.title}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ActionButtons
                        onEdit={() => openEdit(block)}
                        onDelete={() => handleDelete(block.id)}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar bloque" : "Nuevo bloque"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Hora inicio">
              <input
                type="time"
                className={inputClass}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Hora fin (opcional)">
              <input
                type="time"
                className={inputClass}
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Sección (opcional, ej. Mañana, Tardes)">
            <input
              className={inputClass}
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              placeholder="Mañana"
            />
          </FormField>

          <FormField label="Título">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Paseo con papá"
              required
            />
          </FormField>

          <FormField label="Icono (opcional)" hint="Busca por palabra clave y elige un emoji">
            <EmojiPicker
              key={editingId ?? "new"}
              value={form.icon}
              onChange={(icon) => setForm({ ...form, icon })}
            />
          </FormField>

          <FormField label="Descripción (opcional)">
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Variaciones: escuchar música, identificar plantas..."
              rows={3}
            />
          </FormField>

          <FormField label="Misiones asignadas (opcional)">
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/50 p-3">
              {missions.filter((m) => !m.isSideQuest).length === 0 ? (
                <p className="text-sm text-slate-500">No hay misiones principales disponibles</p>
              ) : (
                missions
                  .filter((m) => !m.isSideQuest)
                  .map((mission) => (
                  <label key={mission.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.missionIds.includes(mission.id)}
                      onChange={() => toggleMission(mission.id)}
                      className="rounded border-slate-600"
                    />
                    <span className="text-slate-300">{mission.title}</span>
                  </label>
                ))
              )}
            </div>
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
