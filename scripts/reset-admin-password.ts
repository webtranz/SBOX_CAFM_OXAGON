import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_RESET_EMAIL || "admin@cafm.local";
  const password = process.env.ADMIN_RESET_PASSWORD;

  if (!password) {
    throw new Error("Set ADMIN_RESET_PASSWORD before running this script.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      role: "Admin",
      active: true,
    },
    select: { email: true },
  });

  console.log(`Password reset for ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
