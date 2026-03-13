import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email    = "admin@example.com"; // 👈 change this to your login email
  const password = "password123";       // 👈 change this to your desired password
  const name     = "Admin User";        // 👈 change this to your name

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where:  { email },
    update: { password: hashed },
    create: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("✅ User created/updated:", user.email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());