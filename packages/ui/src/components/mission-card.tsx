import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { SkillIcon } from "./skill-icon";
import { Button } from "./button";
import { CheckCircle2, Circle } from "lucide-react";

interface MissionCardProps {
  title: string;
  description?: string | null;
  xpReward: number;
  crystalReward?: number;
  skillIcon?: string;
  skillColor?: string;
  completed?: boolean;
  onComplete?: () => void;
  loading?: boolean;
}

export function MissionCard({
  title,
  description,
  xpReward,
  crystalReward = 0,
  skillIcon,
  skillColor,
  completed,
  onComplete,
  loading,
}: MissionCardProps) {
  return (
    <Card className={completed ? "opacity-75 border-emerald-700/50" : ""}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          {skillIcon && <SkillIcon icon={skillIcon} color={skillColor} size="sm" />}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
        {completed ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        ) : (
          <Circle className="h-6 w-6 text-slate-500" />
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="info">+{xpReward} XP</Badge>
          {crystalReward > 0 && <Badge variant="warning">+{crystalReward} 💎</Badge>}
        </div>
        {!completed && onComplete && (
          <Button size="sm" onClick={onComplete} disabled={loading}>
            {loading ? "..." : "Completar"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
