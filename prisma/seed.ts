import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permission1 = await prisma.permission.create({
    data: {
      permissionName: 'Create Job',
    },
  });

  const permission2 = await prisma.permission.create({
    data: {
      permissionName: 'Create Interview',
    },
  });

  const permission3 = await prisma.permission.create({
    data: {
      permissionName: 'View Interview',
    },
  });

  await prisma.role.create({
    data: {
      roleName: 'admin',
      Permission: {
        connect: [
          { id: permission1.id },
          { id: permission2.id },
          { id: permission3.id },
        ],
      },
    },
  });

  await prisma.role.create({
    data: {
      roleName: 'hr',
      Permission: {
        connect: [{ id: permission2.id }, { id: permission3.id }],
      },
    },
  });

  await prisma.role.create({
    data: {
      roleName: 'interviewer',
      Permission: {
        connect: [{ id: permission3.id }],
      },
    },
  });

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
