import { getCharacters } from "@/actions/admin";
import { CharactersManager } from "@/components/characters-manager";

export default async function CharactersPage() {
  const characters = await getCharacters();
  return <CharactersManager characters={characters} />;
}
