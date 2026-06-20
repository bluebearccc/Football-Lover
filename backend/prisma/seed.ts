import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? 'admin@football-lover.local';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin12345';
  const displayName = process.env.ADMIN_DISPLAY_NAME ?? 'Administrator';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`[seed] Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, displayName, passwordHash, role: Role.ADMIN, status: UserStatus.ACTIVE },
  });
  // eslint-disable-next-line no-console
  console.log(`[seed] Created admin: ${email} (password from ADMIN_PASSWORD or default)`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
