import { prisma } from "../src/prisma-client";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const SKILLS = [
  { key: "wisdom", name: "Sabiduría", icon: "book", color: "#8b5cf6" },
  { key: "languages", name: "Idiomas", icon: "globe", color: "#3b82f6" },
  { key: "creativity", name: "Creatividad", icon: "palette", color: "#ec4899" },
  { key: "vitality", name: "Vitalidad", icon: "heart", color: "#22c55e" },
  { key: "responsibility", name: "Responsabilidad", icon: "shield", color: "#f59e0b" },
  { key: "discipline", name: "Disciplina", icon: "target", color: "#ef4444" },
];

const LEVELS = [
  { level: 1, xpRequired: 0, crystalReward: 0 },
  { level: 2, xpRequired: 100, crystalReward: 5 },
  { level: 3, xpRequired: 250, crystalReward: 10 },
  { level: 4, xpRequired: 500, crystalReward: 15 },
  { level: 5, xpRequired: 800, crystalReward: 20 },
  { level: 6, xpRequired: 1200, crystalReward: 25 },
  { level: 7, xpRequired: 1700, crystalReward: 30 },
  { level: 8, xpRequired: 2300, crystalReward: 40 },
  { level: 9, xpRequired: 3000, crystalReward: 50 },
  { level: 10, xpRequired: 4000, crystalReward: 75 },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { key: skill.key },
      update: skill,
      create: skill,
    });
  }

  for (const level of LEVELS) {
    await prisma.levelConfiguration.upsert({
      where: { level: level.level },
      update: level,
      create: level,
    });
  }

  await prisma.screenTimeConfiguration.deleteMany();
  await prisma.screenTimeConfiguration.createMany({
    data: [
      { minWeeklyPoints: 0, maxWeeklyPoints: 20, minutesAllowed: 30 },
      { minWeeklyPoints: 21, maxWeeklyPoints: 50, minutesAllowed: 60 },
      { minWeeklyPoints: 51, maxWeeklyPoints: 100, minutesAllowed: 90 },
      { minWeeklyPoints: 101, maxWeeklyPoints: 9999, minutesAllowed: 120 },
    ],
  });

  await prisma.crystalStoreConfiguration.upsert({
    where: { key: "max_daily_purchases" },
    update: { value: "3", description: "Máximo de compras diarias" },
    create: { key: "max_daily_purchases", value: "3", description: "Máximo de compras diarias" },
  });

  await prisma.avatarAccessory.createMany({
    data: [
      { key: "default", name: "Aventurero", type: "OUTFIT", icon: "user", isDefault: true },
      { key: "hat_star", name: "Gorro Estrella", type: "HAT", icon: "star", requiredLevel: 3 },
      { key: "pet_cat", name: "Gato Compañero", type: "PET", icon: "cat", requiredLevel: 5 },
      { key: "hat_dragon", name: "Gorro del Dragón", type: "HAT", icon: "flame" },
      { key: "bandana_hero", name: "Bandana del Héroe", type: "HAT", icon: "sparkles" },
      { key: "pet_fish", name: "Pececito Compañero", type: "PET", icon: "fish" },
    ],
    skipDuplicates: true,
  });

  const family = await prisma.family.upsert({
    where: { id: "demo-family" },
    update: {},
    create: { id: "demo-family", name: "Familia Demo" },
  });

  const parentPassword = await bcrypt.hash("parent123", 10);
  const parent = await prisma.user.upsert({
    where: { email: "parent@demo.com" },
    update: {},
    create: {
      email: "parent@demo.com",
      passwordHash: parentPassword,
      name: "Padre Demo",
      role: Role.PARENT,
      familyId: family.id,
    },
  });

  const childPin = await bcrypt.hash("1234", 10);
  const childUser = await prisma.user.upsert({
    where: { email: "child@demo.com" },
    update: {},
    create: {
      email: "child@demo.com",
      name: "Niño Demo",
      role: Role.CHILD,
      familyId: family.id,
    },
  });

  const skills = await prisma.skill.findMany();
  const existingCharacter = await prisma.character.findFirst({
    where: { familyId: family.id, name: "Aventurero" },
  });

  if (!existingCharacter) {
    const character = await prisma.character.create({
      data: {
        name: "Aventurero",
        gender: "GIRL",
        themeKey: "manga",
        avatarBase: "hero",
        pin: childPin,
        familyId: family.id,
        userId: childUser.id,
        skills: {
          create: skills.map((skill) => ({
            skillId: skill.id,
            xp: 0,
            level: 1,
          })),
        },
      },
    });

    await prisma.gameEvent.create({
      data: {
        characterId: character.id,
        type: "CHARACTER_CREATED",
        payload: { name: character.name },
      },
    });
  }

  const wisdomSkill = await prisma.skill.findUnique({ where: { key: "wisdom" } });
  const vitalitySkill = await prisma.skill.findUnique({ where: { key: "vitality" } });

  await prisma.mission.createMany({
    data: [
      { title: "Leer 30 minutos", description: "Lee un libro o cómic", frequency: "DAILY", type: "LEARNING", xpReward: 15, skillId: wisdomSkill?.id, familyId: family.id },
      { title: "Hacer la cama", description: "Ordena tu habitación", frequency: "DAILY", type: "CHORE", xpReward: 10, skillId: vitalitySkill?.id, familyId: family.id },
      { title: "Ejercicio", description: "30 minutos de actividad física", frequency: "DAILY", type: "HABIT", xpReward: 20, crystalReward: 2, skillId: vitalitySkill?.id, familyId: family.id },
      { title: "Proyecto creativo", description: "Dibuja, construye o crea algo", frequency: "WEEKLY", type: "CREATIVE", xpReward: 50, crystalReward: 5, familyId: family.id },
      { title: "Ayuda extra en casa", description: "Ayuda con una tarea sin que te lo pidan", frequency: "DAILY", type: "CHORE", xpReward: 15, familyId: family.id, isSideQuest: true },
      { title: "Acto de bondad", description: "Haz algo amable por alguien de la familia", frequency: "DAILY", type: "CUSTOM", xpReward: 10, crystalReward: 1, familyId: family.id, isSideQuest: true },
    ],
    skipDuplicates: true,
  });

  const seededMissions = await prisma.mission.findMany({ where: { familyId: family.id } });
  const readMission = seededMissions.find((m) => m.title.includes("Leer"));
  const bedMission = seededMissions.find((m) => m.title.includes("cama"));

  if (readMission) {
    const existing = await prisma.achievement.findFirst({ where: { title: "Primer paso", familyId: family.id } });
    if (!existing) {
      await prisma.achievement.create({
        data: {
          title: "Primer paso",
          description: "Completa tu primera misión de lectura",
          crystalReward: 5,
          familyId: family.id,
          missions: { create: [{ missionId: readMission.id }] },
        },
      });
    }
  }

  if (readMission && bedMission) {
    const existing = await prisma.achievement.findFirst({ where: { title: "Rutina matinal", familyId: family.id } });
    if (!existing) {
      await prisma.achievement.create({
        data: {
          title: "Rutina matinal",
          description: "Completa leer y hacer la cama",
          crystalReward: 15,
          familyId: family.id,
          missions: { create: [{ missionId: readMission.id }, { missionId: bedMission.id }] },
        },
      });
    }
  }

  await prisma.achievement.createMany({
    data: [
      { title: "Nivel 3", description: "Alcanza el nivel 3", requiredLevel: 3, crystalReward: 15, familyId: family.id },
    ],
    skipDuplicates: true,
  });

  if (readMission) {
    const existing = await prisma.achievement.findFirst({
      where: { title: "Lector voraz", familyId: family.id },
    });
    if (!existing) {
      await prisma.achievement.create({
        data: {
          title: "Lector voraz",
          description: "Completa la misión de lectura 5 veces",
          crystalReward: 20,
          familyId: family.id,
          targetMissionId: readMission.id,
          targetMissionCompletions: 5,
        },
      });
    }
  }

  const existingManual = await prisma.achievement.findFirst({
    where: { title: "Primer libro leído", familyId: family.id },
  });
  if (!existingManual) {
    await prisma.achievement.create({
      data: {
        title: "Primer libro leído",
        description: "Leer un libro completo de principio a fin",
        crystalReward: 25,
        familyId: family.id,
        isManual: true,
      },
    });
  }

  const existingSecret = await prisma.achievement.findFirst({
    where: { icon: "secret-dragon-chest", familyId: family.id },
  });
  if (!existingSecret) {
    await prisma.achievement.create({
      data: {
        title: "Guardián del Cofre",
        description: "Encontraste y abriste el cofre secreto del Dragón del Verano",
        icon: "secret-dragon-chest",
        crystalReward: 30,
        familyId: family.id,
        isHidden: true,
      },
    });
  }

  const existingMangaCombo = await prisma.achievement.findFirst({
    where: { icon: "secret-manga-combo", familyId: family.id },
  });
  if (!existingMangaCombo) {
    await prisma.achievement.create({
      data: {
        title: "Maestro del Combo",
        description: "Despertaste el combo de poder oculto en la barra POWER",
        icon: "secret-manga-combo",
        crystalReward: 20,
        familyId: family.id,
        isHidden: true,
      },
    });
  }

  const existingOceanFishing = await prisma.achievement.findFirst({
    where: { icon: "secret-ocean-fishing", familyId: family.id },
  });
  if (!existingOceanFishing) {
    await prisma.achievement.create({
      data: {
        title: "Pescador relámpago",
        description: "Atrapaste la pesca secreta cuando los cristales brillaron en 42",
        icon: "secret-ocean-fishing",
        crystalReward: 25,
        familyId: family.id,
        isHidden: true,
      },
    });
  }

  const existingStreakSpirit = await prisma.achievement.findFirst({
    where: { icon: "streak-spirit", familyId: family.id },
  });
  if (!existingStreakSpirit) {
    await prisma.achievement.create({
      data: {
        title: "Espíritu constante",
        description: "Mantén una racha de 3 días cumpliendo la ruta legendaria",
        icon: "streak-spirit",
        crystalReward: 0,
        familyId: family.id,
      },
    });
  }

  const dragonHat = await prisma.avatarAccessory.findUnique({ where: { key: "hat_dragon" } });
  const secretAchievement = await prisma.achievement.findFirst({
    where: { icon: "secret-dragon-chest", familyId: family.id },
  });
  if (dragonHat && secretAchievement && !dragonHat.achievementId) {
    await prisma.avatarAccessory.update({
      where: { key: "hat_dragon" },
      data: { achievementId: secretAchievement.id },
    });
  }

  await prisma.$executeRaw`UPDATE "CharacterAchievement" SET "claimedAt" = "unlockedAt" WHERE "claimedAt" IS NULL`;

  await prisma.reward.createMany({
    data: [
      { title: "Helado extra", description: "Un helado a elegir", crystalCost: 10, familyId: family.id },
      { title: "30 min extra de pantalla", description: "Tiempo extra de videojuegos", crystalCost: 15, familyId: family.id },
      {
        title: "Salida especial",
        description: "Elegir actividad familiar",
        crystalCost: 50,
        maxPurchases: 1,
        requiredLevel: 5,
        familyId: family.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.reward.updateMany({
    where: { familyId: family.id, title: "Salida especial" },
    data: { maxPurchases: 1, requiredLevel: 5 },
  });

  await prisma.bossBattle.createMany({
    data: [
      {
        title: "Boss de Julio: El Dragón del Verano",
        description: "Completa todos los objetivos de julio",
        month: 7,
        year: new Date().getFullYear(),
        xpReward: 200,
        crystalReward: 100,
        familyId: family.id,
      },
    ],
    skipDuplicates: true,
  });

  const character = await prisma.character.findFirst({
    where: { familyId: family.id, name: "Aventurero" },
  });

  if (character) {
    const existingSchedule = await prisma.scheduleBlock.findFirst({
      where: { characterId: character.id },
    });

    if (!existingSchedule) {
      const bedMission = seededMissions.find((m) => m.title.includes("cama"));
      const readMission = seededMissions.find((m) => m.title.includes("Leer"));
      const creativeMission = seededMissions.find((m) => m.title.includes("creativo"));

      const weekdayBlocks = [
        {
          order: 0,
          section: "Mañana",
          startTime: "08:00",
          endTime: "08:30",
          icon: "🚶",
          title: "Paseo con papá",
          description: "Algunos días podéis hacer pequeñas variaciones: escuchar música, identificar plantas, hablar sobre un tema, planificar el día, etc.",
        },
        {
          order: 1,
          startTime: "08:30",
          endTime: "09:00",
          title: "Desayuno y aseo",
        },
        {
          order: 2,
          startTime: "09:00",
          endTime: "09:15",
          title: "Hacer la cama y ordenar la habitación",
          missionIds: bedMission ? [bedMission.id] : [],
        },
        {
          order: 3,
          startTime: "09:15",
          endTime: "10:00",
          title: "Lectura",
          missionIds: readMission ? [readMission.id] : [],
        },
        {
          order: 4,
          startTime: "10:00",
          endTime: "10:45",
          title: "Francés",
        },
        {
          order: 5,
          startTime: "10:45",
          endTime: "11:15",
          title: "Descanso",
        },
        {
          order: 6,
          startTime: "11:15",
          endTime: "12:45",
          title: "Dibujo manga y creatividad",
          missionIds: creativeMission ? [creativeMission.id] : [],
        },
        {
          order: 7,
          startTime: "12:45",
          endTime: "13:15",
          title: "Tareas de casa",
        },
        {
          order: 8,
          section: "Tardes",
          startTime: "13:15",
          endTime: null,
          title: "Tiempo libre",
        },
      ] as const;

      for (const block of weekdayBlocks) {
        const { missionIds = [], ...blockData } = block as typeof block & { missionIds?: string[] };
        const created = await prisma.scheduleBlock.create({
          data: {
            characterId: character.id,
            dayType: "WEEKDAY",
            ...blockData,
            endTime: blockData.endTime ?? undefined,
          },
        });
        if (missionIds.length > 0) {
          await prisma.scheduleBlockMission.createMany({
            data: missionIds.map((missionId, order) => ({
              scheduleBlockId: created.id,
              missionId,
              order,
            })),
          });
        }
      }

      const fridayBlocks = [
        {
          order: 0,
          section: "Mañana",
          startTime: "09:00",
          endTime: "09:30",
          icon: "📋",
          title: "Repaso semanal",
          description: "Revisa lo aprendido esta semana y prepara el fin de semana.",
        },
        {
          order: 1,
          startTime: "09:30",
          endTime: "10:30",
          title: "Tareas semanales",
          missionIds: [bedMission, readMission, creativeMission].filter(Boolean).map((m) => m!.id),
        },
        {
          order: 2,
          startTime: "10:30",
          endTime: null,
          icon: "🎉",
          title: "¡Viernes legendario!",
          description: "Tiempo libre tras completar las tareas de la semana.",
        },
      ] as const;

      for (const block of fridayBlocks) {
        const { missionIds = [], ...blockData } = block as typeof block & { missionIds?: string[] };
        const created = await prisma.scheduleBlock.create({
          data: {
            characterId: character.id,
            dayType: "FRIDAY",
            ...blockData,
            endTime: blockData.endTime ?? undefined,
          },
        });
        if (missionIds.length > 0) {
          await prisma.scheduleBlockMission.createMany({
            data: missionIds.map((missionId, order) => ({
              scheduleBlockId: created.id,
              missionId,
              order,
            })),
          });
        }
      }

      await prisma.scheduleBlock.create({
        data: {
          characterId: character.id,
          dayType: "WEEKEND",
          section: "Mañana",
          order: 0,
          startTime: "09:00",
          endTime: "10:00",
          icon: "🌅",
          title: "Despertar tranquilo",
          description: "Sin prisas: desayuno, aseo y preparar la habitación.",
        },
      });

      await prisma.scheduleBlock.create({
        data: {
          characterId: character.id,
          dayType: "WEEKEND",
          section: "Tardes",
          order: 1,
          startTime: "13:00",
          endTime: null,
          title: "Tiempo libre y actividades familiares",
        },
      });
    }
  }

  const allFamilies = await prisma.family.findMany({ select: { id: true } });
  for (const { id: familyId } of allFamilies) {
    const secretAchievements = [
      {
        icon: "secret-dragon-chest",
        title: "Guardián del Cofre",
        description: "Encontraste y abriste el cofre secreto del Dragón del Verano",
        crystalReward: 30,
      },
      {
        icon: "secret-manga-combo",
        title: "Maestro del Combo",
        description: "Despertaste el combo de poder oculto en la barra POWER",
        crystalReward: 20,
      },
      {
        icon: "secret-ocean-fishing",
        title: "Pescador relámpago",
        description: "Atrapaste la pesca secreta cuando los cristales brillaron en 42",
        crystalReward: 25,
      },
    ] as const;

    for (const achievement of secretAchievements) {
      const existing = await prisma.achievement.findFirst({
        where: { icon: achievement.icon, familyId },
      });
      if (!existing) {
        await prisma.achievement.create({
          data: {
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            crystalReward: achievement.crystalReward,
            familyId,
            isHidden: true,
          },
        });
      }
    }
  }

  const dragonAccessory = await prisma.avatarAccessory.findUnique({ where: { key: "hat_dragon" } });
  if (dragonAccessory) {
    for (const { id: familyId } of allFamilies) {
      const secretAchievement = await prisma.achievement.findFirst({
        where: { icon: "secret-dragon-chest", familyId },
      });
      if (secretAchievement && dragonAccessory.achievementId !== secretAchievement.id) {
        await prisma.avatarAccessory.update({
          where: { key: "hat_dragon" },
          data: { achievementId: secretAchievement.id },
        });
        break;
      }
    }
  }

  console.log("✅ Seed completed");
  console.log(`   Parent: parent@demo.com / parent123`);
  console.log(`   Child PIN: 1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
