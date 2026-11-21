
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Offices
  await prisma.office.upsert({
    where: { id: "OSL" },
    update: {},
    create: {
      id: "OSL",
      name: "Oslo",
      country: "Norway",
      currency: "NOK",
      monthlyBudget: 6000,
    },
  });

  await prisma.office.upsert({
    where: { id: "BLR" },
    update: {},
    create: {
      id: "BLR",
      name: "Bengaluru",
      country: "India",
      currency: "INR",
      monthlyBudget: 15000,
    },
  });

  // Volunteers
  const volunteers = [
    { id: "VOL001", name: "Ananya Sharma", email: "ananya@example.com", officeId: "BLR" },
    { id: "VOL002", name: "Rahul Mehta", email: "rahul@example.com", officeId: "BLR" },
    { id: "VOL003", name: "Emma Hansen", email: "emma@example.com", officeId: "OSL" },
    { id: "VOL004", name: "Lars Olsen", email: "lars@example.com", officeId: "OSL" },
  ];

  for (const volunteer of volunteers) {
    await prisma.volunteer.upsert({
      where: { id: volunteer.id },
      update: {},
      create: volunteer,
    });
  }

  console.log("Seed completed: 2 offices and 4 volunteers.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
