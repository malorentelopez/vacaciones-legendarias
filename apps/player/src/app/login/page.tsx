"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { loginWithPin } from "@/actions/auth";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await loginWithPin(pin);
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error ?? "Error al iniciar sesión");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-violet-500/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20">
            <Sparkles className="h-8 w-8 text-violet-400" />
          </div>
          <CardTitle className="text-2xl text-violet-300">Verano Nivel 3</CardTitle>
          <p className="text-slate-400">Introduce tu PIN para empezar la aventura</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-center text-2xl tracking-[0.5em] focus:border-violet-500 focus:outline-none"
            />
            {error && <p className="text-center text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || pin.length < 4}>
              {loading ? "Entrando..." : "¡A jugar!"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
