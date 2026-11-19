import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    email : "admin@saloon-neo.lk",
    firstName : "Admin",
    lastName : "Admin",
    password : "$2y$10$bGN8aJ2VoUDGWOqg.pzfye1qBMZLGC3B.azcjPkvCOjIq/cdlvO2O",
    privileges : [],
    role : "ADMIN",
  }
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();