"use client";

import { useState } from "react";
import { Card, Button } from "@repo/ui";
import { updateAccountProfile, changePassword } from "@/actions/settings";
import { FormField, inputClass } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";

export function AccountSettings({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const [profile, setProfile] = useState({ name: initialName, email: initialEmail });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    const result = await updateAccountProfile(profile);
    if (result.success) {
      setProfileMessage({ type: "ok", text: "Datos actualizados correctamente" });
    } else {
      setProfileMessage({ type: "error", text: result.error });
    }
    setProfileLoading(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas nuevas no coinciden" });
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });
    if (result.success) {
      setPasswordMessage({ type: "ok", text: "Contraseña actualizada" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPasswordMessage({ type: "error", text: result.error });
    }
    setPasswordLoading(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi cuenta"
        description="Actualiza tu nombre, email de acceso y contraseña."
      />

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Datos de acceso</h2>
        <form onSubmit={handleProfileSubmit} className="max-w-md space-y-4">
          <FormField label="Nombre">
            <input
              className={inputClass}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className={inputClass}
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </FormField>
          {profileMessage && (
            <p className={`text-sm ${profileMessage.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {profileMessage.text}
            </p>
          )}
          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          <FormField label="Contraseña actual">
            <input
              type="password"
              className={inputClass}
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Nueva contraseña">
            <input
              type="password"
              className={inputClass}
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              minLength={6}
              required
            />
          </FormField>
          <FormField label="Confirmar nueva contraseña">
            <input
              type="password"
              className={inputClass}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              minLength={6}
              required
            />
          </FormField>
          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {passwordMessage.text}
            </p>
          )}
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Actualizando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
