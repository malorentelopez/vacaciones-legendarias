export type MissionProgressRef = {
  missionId: string;
  periodKey: string;
};

export type CharacterMissionProgressRef = MissionProgressRef & {
  characterId: string;
};

export function missionProgressKey(missionId: string, periodKey: string): string {
  return `${missionId}:${periodKey}`;
}

export function characterMissionProgressKey(
  characterId: string,
  missionId: string,
  periodKey: string
): string {
  return `${characterId}:${missionId}:${periodKey}`;
}

export function dedupeMissionProgressRefs(items: MissionProgressRef[]): MissionProgressRef[] {
  const unique = new Map<string, MissionProgressRef>();
  for (const item of items) {
    unique.set(missionProgressKey(item.missionId, item.periodKey), item);
  }
  return [...unique.values()];
}

export function dedupeCharacterMissionProgressRefs(
  items: CharacterMissionProgressRef[]
): CharacterMissionProgressRef[] {
  const unique = new Map<string, CharacterMissionProgressRef>();
  for (const item of items) {
    unique.set(
      characterMissionProgressKey(item.characterId, item.missionId, item.periodKey),
      item
    );
  }
  return [...unique.values()];
}
