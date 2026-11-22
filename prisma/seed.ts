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
    email : "admin@test.lk",
    firstName : "Admintest",
    lastName : "Admintest",
    password : "$2a$12$jt5cxB1Uh6a9UG5VGpAsG.nRL4QPbUfT1ywA8kb1W4ftAbsydVVQO", //abc
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