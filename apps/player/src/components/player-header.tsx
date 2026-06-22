import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";

export function PlayerHeader({ name }: { name: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-sm text-slate-400">Hola, {name}</span>
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-3 w-3" />
          Salir
        </button>
      </form>
    </div>
  );
}
