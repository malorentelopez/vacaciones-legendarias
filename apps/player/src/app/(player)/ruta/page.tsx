import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getAgenda, getCharacter } from "@/actions/game";
import { DailyAgendaLazy } from "@/components/lazy/secret-games-lazy";
import {
  formatAgendaDate,
  getDayScheduleTypeLabel,
  getCharacterPortraitSrc,
  getRoleName,
  normalizeRoleKey,
  parseAvatarConfig,
  toLocalDateKey,
} from "@repo/domain";
import {
  buildRouteCompleteDialogue,
  getDialogueKey,
  hasSeenDialogue,
} from "@/lib/dialogue-scripts";
import { getDayMoodEmoji } from "@/lib/day-mood";

export default async function RutaPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const [agenda, character] = await Promise.all([getAgenda(), getCharacter()]);
  const dayTypeLabel = getDayScheduleTypeLabel(agenda.dayType);

  const completedQuests = agenda.blocks.reduce(
    (sum, block) => sum + block.missions.filter((m) => m.completed).length,
    0
  );
  const totalQuests = agenda.blocks.reduce((sum, block) => sum + block.missions.length, 0);

  const dateKey = toLocalDateKey(new Date());
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const roleName = getRoleName(
    character.themeKey,
    genderKey,
    normalizeRoleKey(character.themeKey, character.avatarBase)
  );
  const portraitSrc = getCharacterPortraitSrc(character);
  const dialoguesSeen = parseAvatarConfig(character.avatarConfig).dialoguesSeen;
  const routeCompleteKey = getDialogueKey(dateKey, "route-complete");
  const routeCompleteScript =
    totalQuests > 0 && completedQuests === totalQuests
      ? buildRouteCompleteDialogue({
          themeKey: character.themeKey,
          characterName: character.name,
          dayType: agenda.dayType,
        })
      : null;

  const dayMoodEmoji = getDayMoodEmoji({
    isFreeDay: agenda.isFreeDay,
    dayType: agenda.dayType,
    dateKey,
  });

  return (
    <DailyAgendaLazy
      dateLabel={formatAgendaDate(new Date())}
      dayTypeLabel={dayTypeLabel}
      dayType={agenda.dayType}
      blocks={agenda.blocks}
      completedQuests={completedQuests}
      totalQuests={totalQuests}
      isFreeDay={agenda.isFreeDay}
      freeDayLabel={agenda.isFreeDay ? agenda.freeDayLabel : undefined}
      routeCompleteDialogue={
        routeCompleteScript
          ? {
              dialogueKey: routeCompleteKey,
              script: routeCompleteScript,
              portraitSrc,
              portraitAlt: roleName,
              alreadySeen: hasSeenDialogue(dialoguesSeen, routeCompleteKey),
            }
          : undefined
      }
      dayMoodEmoji={dayMoodEmoji}
    />
  );
}
