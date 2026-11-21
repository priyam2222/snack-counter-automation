
import { prisma } from "../../config/prisma.js";

export async function getAllVolunteers() {
  return prisma.volunteer.findMany({
    include: {
      office: true,
    },
  });
}

export async function getVolunteersByOffice(officeId: string) {
  return prisma.volunteer.findMany({
    where: {
      officeId,
    },
    include: {
      office: true,
    },
  });
}

export async function getVolunteerById(id: string) {
  return prisma.volunteer.findUnique({
    where: {
      id,
    },
    include: {
      office: true,
    },
  });
}
