import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { AvatarCustomizer } from "@/components/avatar-customizer";

export default async function AvatarPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const character = await getCharacter();
  return (
    <AvatarCustomizer
      character={{
        name: character.name,
        gender: character.gender,
        themeKey: character.themeKey,
        avatarBase: character.avatarBase,
        avatarConfig: character.avatarConfig,
      }}
    />
  );
}
