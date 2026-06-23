import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { getDragonChestStatus } from "@/actions/secrets";
import { AvatarCustomizer } from "@/components/avatar-customizer";
import { parseAvatarConfig } from "@repo/domain";

export default async function AvatarPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const [character, dragonStatus] = await Promise.all([
    getCharacter(),
    getDragonChestStatus().catch(() => ({ completed: false })),
  ]);

  const secrets = parseAvatarConfig(character.avatarConfig).secrets;

  return (
    <AvatarCustomizer
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
  );
}
