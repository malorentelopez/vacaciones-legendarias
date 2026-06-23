import { prisma } from "@repo/database";
import { dateKeyToDbDate, dbDateToDateKey, toLocalDateKey } from "../utils/schedule";

export class FreeDayRepository {
  async findByFamilyAndMonth(familyId: string, year: number, month: number) {
    const monthIndex = month - 1;
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));

    return prisma.freeDay.findMany({
      where: {
        familyId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });
  }

  async findByFamilyAndDate(familyId: string, date: Date) {
    const dateKey = toLocalDateKey(date);
    return prisma.freeDay.findUnique({
      where: {
        familyId_date: { familyId, date: dateKeyToDbDate(dateKey) },
      },
    });
  }

  async toggle(familyId: string, dateKey: string, label?: string) {
    const dbDate = dateKeyToDbDate(dateKey);
    const existing = await prisma.freeDay.findUnique({
      where: {
        familyId_date: { familyId, date: dbDate },
      },
    });

    if (existing) {
      await prisma.freeDay.delete({ where: { id: existing.id } });
      return { isFree: false as const, dateKey: dbDateToDateKey(dbDate) };
    }

    await prisma.freeDay.create({
      data: {
        familyId,
        date: dbDate,
        label: label || null,
      },
    });
    return { isFree: true as const, dateKey: dbDateToDateKey(dbDate) };
  }
}
