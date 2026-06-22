import { cn } from "../lib/utils";
import {
  Book, Globe, Palette, Heart, Shield, Target, Star, Trophy, Gift, Sparkles, User, Cat,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: Book,
  globe: Globe,
  palette: Palette,
  heart: Heart,
  shield: Shield,
  target: Target,
  star: Star,
  trophy: Trophy,
  gift: Gift,
  sparkles: Sparkles,
  user: User,
  cat: Cat,
};

interface SkillIconProps {
  icon: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };

export function SkillIcon({ icon, color = "#6366f1", size = "md", className }: SkillIconProps) {
  const Icon = iconMap[icon] ?? Star;
  return (
    <div
      className={cn("flex items-center justify-center rounded-2xl", sizes[size], className)}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className={size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6"} />
    </div>
  );
}
