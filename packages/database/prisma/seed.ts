import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
    ],
    skipDuplicates: true,
  });

  await prisma.achievement.createMany({
    data: [
      { title: "Primer paso", description: "Completa tu primera misión", requiredMissions: 1, crystalReward: 5, familyId: family.id },
      { title: "Explorador", description: "Completa 10 misiones", requiredMissions: 10, crystalReward: 20, familyId: family.id },
      { title: "Nivel 3", description: "Alcanza el nivel 3", requiredLevel: 3, crystalReward: 15, familyId: family.id },
    ],
    skipDuplicates: true,
  });

  await prisma.reward.createMany({
    data: [
      { title: "Helado extra", description: "Un helado a elegir", crystalCost: 10, familyId: family.id },
      { title: "30 min extra de pantalla", description: "Tiempo extra de videojuegos", crystalCost: 15, familyId: family.id },
      { title: "Salida especial", description: "Elegir actividad familiar", crystalCost: 50, familyId: family.id },
    ],
    skipDuplicates: true,
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
