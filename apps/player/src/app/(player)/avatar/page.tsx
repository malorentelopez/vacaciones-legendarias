import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { getDragonChestStatus } from "@/actions/secrets";
import { AvatarCustomizerLazy } from "@/components/lazy/avatar-customizer-lazy";
import { ResetProgressButton } from "@/components/reset-progress-button";
import { parseAvatarConfig } from "@repo/domain";

const canResetProgress =
  process.env.NODE_ENV !== "production" ||
  process.env.ENABLE_PLAYER_PROGRESS_RESET === "true";

export default async function AvatarPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const [character, dragonStatus] = await Promise.all([
    getCharacter(),
    getDragonChestStatus().catch(() => ({ completed: false })),
  ]);

  const secrets = parseAvatarConfig(character.avatarConfig).secrets;

  return (
    <div className="space-y-6">
      <AvatarCustomizerLazy
        character={{
          name: character.name,
          gender: character.gender,
          themeKey: character.themeKey,
          avatarBase: character.avatarBase,
          avatarConfig: character.avatarConfig,
          level: character.level,
          secretCompleted:
            dragonStatus.completed ||
            !!secrets?.["dragon-chest"]?.completedAt ||
            !!secrets?.["manga-power-combo"]?.completedAt,
        }}
      />
      {canResetProgress && <ResetProgressButton />}
    </div>
  );
}
