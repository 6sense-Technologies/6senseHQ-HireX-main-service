import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // const permission1 = await prisma.permission.create({
  //   data: {
  //     permissionName: 'Create Job',
  //   },
  // });

  // const permission2 = await prisma.permission.create({
  //   data: {
  //     permissionName: 'Create Interview',
  //   },
  // });

  // const permission3 = await prisma.permission.create({
  //   data: {
  //     permissionName: 'View Interview',
  //   },
  // });

  // await prisma.role.create({
  //   data: {
  //     roleName: 'admin',
  //     Permission: {
  //       connect: [
  //         { id: permission1.id },
  //         { id: permission2.id },
  //         { id: permission3.id },
  //       ],
  //     },
  //   },
  // });

  // await prisma.role.create({
  //   data: {
  //     roleName: 'hr',
  //     Permission: {
  //       connect: [{ id: permission2.id }, { id: permission3.id }],
  //     },
  //   },
  // });

  // await prisma.role.create({
  //   data: {
  //     roleName: 'interviewer',
  //     Permission: {
  //       connect: [{ id: permission3.id }],
  //     },
  //   },
  // });

  // Seed User
  const user = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      password: 'securepassword', // You should hash this in production
      is_verified: true,
      roleIds: [],
    },
  });

  // Seed JobPosition
  const jobPosition = await prisma.jobPosition.create({
    data: {
      jobPositionName: 'Software Engineer',
      createdBy: user.id,
      isDeleted: false,
    },
  });

  // Seed JobDepartment
  const jobDepartment = await prisma.jobDepartment.create({
    data: {
      jobDepartmentName: 'Engineering',
      createdBy: user.id,
      isDeleted: false,
    },
  });

  // Seed Candidate
  const candidate = await prisma.candidate.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  });

  // Seed Job
  await prisma.job.create({
    data: {
      jobName: 'Backend Developer',
      deadline: new Date('2025-02-01T00:00:00.000Z'),
      jobDescription: 'Develop and maintain backend systems.',
      jobKeywords: ['Node.js', 'Prisma', 'TypeScript'],
      vacancy: 3,
      createdBy: user.id, // Example ObjectId
      jobPositionId: jobPosition.jobPositionId,
      jobDepartmentId: jobDepartment.jobDpartmentId,
      candidateId: candidate.candidateId,
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
