import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCharacter } from "@/actions/game";
import { AvatarCustomizer } from "@/components/avatar-customizer";

export default async function AvatarPage() {
  const session = await getSession();
  if (!session?.characterId) redirect("/");

  const character = await getCharacter();
  return <AvatarCustomizer currentAvatar={character.avatarBase} />;
}
