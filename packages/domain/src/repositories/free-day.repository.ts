import { prisma } from "@repo/database";
import { parseLocalDateKey } from "../utils/schedule";

export class FreeDayRepository {
  async findByFamilyAndMonth(familyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    return prisma.freeDay.findMany({
      where: {
        familyId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });
  }

  async findByFamilyAndDate(familyId: string, date: Date) {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return prisma.freeDay.findUnique({
      where: {
        familyId_date: { familyId, date: day },
      },
    });
  }

  async toggle(familyId: string, dateKey: string, label?: string) {
    const date = parseLocalDateKey(dateKey);
    const existing = await this.findByFamilyAndDate(familyId, date);

    if (existing) {
      await prisma.freeDay.delete({ where: { id: existing.id } });
      return { isFree: false as const };
    }

    await prisma.freeDay.create({
      data: {
        familyId,
        date,
        label: label || null,
      },
    });
    return { isFree: true as const };
  }
}
