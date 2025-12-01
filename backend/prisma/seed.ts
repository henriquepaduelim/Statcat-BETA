import {
  AthleteStatus,
  PrismaClient,
  Role,
  TeamStatus,
  UserStatus,
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const seedUsers: Array<{
    email?: string;
    password?: string;
    role: Role;
    firstName: string;
    lastName: string;
  }> = [
    {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: Role.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
    },
    {
      email: process.env.SEED_STAFF_EMAIL,
      password: process.env.SEED_STAFF_PASSWORD,
      role: Role.STAFF,
      firstName: 'Staff',
      lastName: 'User',
    },
    {
      email: process.env.SEED_COACH_EMAIL,
      password: process.env.SEED_COACH_PASSWORD,
      role: Role.COACH,
      firstName: 'Coach',
      lastName: 'User',
    },
    {
      email: process.env.SEED_ATHLETE_EMAIL,
      password: process.env.SEED_ATHLETE_PASSWORD,
      role: Role.ATHLETE,
      firstName: 'Athlete',
      lastName: 'User',
    },
  ];

  const requiredAdmin =
    seedUsers[0].email && seedUsers[0].password ? undefined : 'Admin seed credentials missing';
  if (requiredAdmin) {
    throw new Error(
      `${requiredAdmin}. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to seed the admin account.`,
    );
  }

  const defaultBulkPassword =
    process.env.SEED_BULK_PASSWORD ?? 'ChangeMe123!';
  const defaultBulkPasswordHash = await hash(defaultBulkPassword, 10);

  for (const user of seedUsers) {
    await upsertUser({
      email: user.email,
      password: user.password,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  await seedTeamsWithCoachesAndAthletes({
    defaultPasswordHash: defaultBulkPasswordHash,
  });
}

type UpsertUserParams = {
  email?: string;
  password?: string;
  role: Role;
  firstName: string;
  lastName: string;
};

async function upsertUser({
  email,
  password,
  role,
  firstName,
  lastName,
}: UpsertUserParams): Promise<string | null> {
  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn(`Skipping ${role} seed: missing email/password env vars`);
    return null;
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
      firstName,
      lastName,
    },
    create: {
      email,
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
      firstName,
      lastName,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded ${role.toLowerCase()} user ${email}`);
  return user.id;
}

async function seedTeamsWithCoachesAndAthletes({
  defaultPasswordHash,
}: {
  defaultPasswordHash: string;
}) {
  const teams = [
    { name: 'Lions U18', code: 'lions' },
    { name: 'Falcons U16', code: 'falcons' },
    { name: 'First Team', code: 'first' },
  ];

  for (const teamMeta of teams) {
    const team = await prisma.team.upsert({
      where: { name: teamMeta.name },
      update: { status: TeamStatus.ACTIVE },
      create: { name: teamMeta.name, status: TeamStatus.ACTIVE },
    });

    // Coaches (2 per team)
    for (let i = 1; i <= 2; i++) {
      const email = `${teamMeta.code}-coach${i}@example.com`;
      const coach = await prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: defaultPasswordHash,
          role: Role.COACH,
          status: UserStatus.ACTIVE,
          firstName: `${teamMeta.code} Coach ${i}`,
          lastName: 'Seed',
        },
        create: {
          email,
          passwordHash: defaultPasswordHash,
          role: Role.COACH,
          status: UserStatus.ACTIVE,
          firstName: `${teamMeta.code} Coach ${i}`,
          lastName: 'Seed',
        },
      });

      await prisma.teamCoach.upsert({
        where: {
          teamId_coachId: {
            teamId: team.id,
            coachId: coach.id,
          },
        },
        update: {},
        create: {
          teamId: team.id,
          coachId: coach.id,
        },
      });
    }

    // Athletes (11 per team)
    for (let i = 1; i <= 11; i++) {
      const email = `${teamMeta.code}-athlete${i}@example.com`;
      const athleteUser = await prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: defaultPasswordHash,
          role: Role.ATHLETE,
          status: UserStatus.ACTIVE,
          firstName: `${teamMeta.code} Athlete ${i}`,
          lastName: 'Seed',
        },
        create: {
          email,
          passwordHash: defaultPasswordHash,
          role: Role.ATHLETE,
          status: UserStatus.ACTIVE,
          firstName: `${teamMeta.code} Athlete ${i}`,
          lastName: 'Seed',
        },
      });

      const athlete = await prisma.athlete.upsert({
        where: { userId: athleteUser.id },
        update: {
          status: AthleteStatus.ACTIVE,
        },
        create: {
          userId: athleteUser.id,
          status: AthleteStatus.ACTIVE,
        },
      });

      await prisma.teamAthlete.upsert({
        where: {
          teamId_athleteId: {
            teamId: team.id,
            athleteId: athlete.id,
          },
        },
        update: {},
        create: {
          teamId: team.id,
          athleteId: athlete.id,
        },
      });
    }

    // eslint-disable-next-line no-console
    console.log(
      `Seeded team "${teamMeta.name}" with 2 coaches and 11 athletes (default password for bulk users)`,
    );
  }
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
