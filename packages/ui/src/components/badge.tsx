import { cn } from "../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const variants = {
  default: "bg-slate-700 text-slate-200",
  success: "bg-emerald-900/50 text-emerald-300 border border-emerald-700",
  warning: "bg-amber-900/50 text-amber-300 border border-amber-700",
  info: "bg-violet-900/50 text-violet-300 border border-violet-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
