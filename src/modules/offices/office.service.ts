
import { prisma } from "../../config/prisma.js";

export async function getAllOffices() {
  return prisma.office.findMany({
    include: {
      _count: {
        select: {
          volunteers: true,
        },
      },
    },
  });
}

export async function getOfficeById(id: string) {
  return prisma.office.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          volunteers: true,
        },
      },
    },
  });
}
