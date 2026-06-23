import { cn } from "../lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  color?: string;
  barStyle?: React.CSSProperties;
}

export function Progress({ value, className, color = "bg-violet-500", barStyle }: ProgressProps) {
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-slate-700", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", !barStyle && color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, ...barStyle }}
      />
    </div>
  );
}
