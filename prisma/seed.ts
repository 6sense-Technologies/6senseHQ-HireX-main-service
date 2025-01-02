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
      name: 'Alice Smith00999',
      email: 'alice.smith000999@example.com',
      password: 'securepassword',
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
  await prisma.jobPosition.create({
    data: {
      jobPositionName: 'None',
      createdBy: user.id,
      isDeleted: false,
    },
  });
  await prisma.jobDepartment.create({
    data: {
      jobDepartmentName: 'None',
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
  // const candidate = await prisma.candidate.create({
  //   data: {
  //     name: 'John Doe',
  //     email: 'john.doe@example.com',
  //   },
  // });

  // Seed Job
  const job = await prisma.job.create({
    data: {
      deadline: '',
      jobResponsibility: 'Develop and maintain backend systems.',
      jobKeywords: ['Node.js', 'Prisma', 'TypeScript'],
      vacancy: 3,
      createdBy: user.id, // Example ObjectId
      jobPositionId: jobPosition.jobPositionId,
      jobDepartmentId: jobDepartment.jobDepartmentId,
    },
  });
  const phoneInterview = await prisma.interviewStage.create({
    data: {
      interviewStageName: 'Phone Interview',
      createdBy: user.id,
    },
  });
  await prisma.interviewStage.create({
    data: {
      interviewStageName: 'HR Interview',
      createdBy: user.id,
    },
  });
  await prisma.jobInterviewStage.create({
    data: {
      jobId: job.jobId,
      interviewStageId: phoneInterview.interviewStageId,
      interviewFormat: 'Online Video',
      interviewType: 'Onlines',
      createdBy: user.id,
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
