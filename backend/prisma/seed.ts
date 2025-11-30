import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set');
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user ${email}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
