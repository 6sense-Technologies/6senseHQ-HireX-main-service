import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// async function seedPermissions() {
//   const permission1 = await prisma.permission.create({
//     data: { permissionName: 'Create Job' },
//   });

//   const permission2 = await prisma.permission.create({
//     data: { permissionName: 'Create Interview' },
//   });

//   const permission3 = await prisma.permission.create({
//     data: { permissionName: 'View Interview' },
//   });

//   return { permission1, permission2, permission3 };
// }

// async function seedRoles(permissions) {
//   await prisma.role.create({
//     data: {
//       roleName: 'admin',
//       Permission: {
//         connect: [
//           { id: permissions.permission1.id },
//           { id: permissions.permission2.id },
//           { id: permissions.permission3.id },
//         ],
//       },
//     },
//   });

//   await prisma.role.create({
//     data: {
//       roleName: 'hr',
//       Permission: {
//         connect: [
//           { id: permissions.permission2.id },
//           { id: permissions.permission3.id },
//         ],
//       },
//     },
//   });

//   await prisma.role.create({
//     data: {
//       roleName: 'interviewer',
//       Permission: {
//         connect: [{ id: permissions.permission3.id }],
//       },
//     },
//   });
// }

// async function seedUser() {
//   return await prisma.user.create({
//     data: {
//       name: 'Alice Smith00999',
//       email: 'alice.smith000999@example.com',
//       password: 'securepassword',
//       is_verified: true,
//       roleIds: [],
//     },
//   });
// }

// // async function seedJobPositions(userId) {
// //   // const position1 = await prisma.jobPosition.create({
// //   //   data: {
// //   //     jobPositionName: 'Software Engineer',
// //   //     createdBy: userId,
// //   //     isDeleted: false,
// //   //   },
// //   // });
// //   // const position2 = await prisma.jobPosition.create({
// //   //   data: { jobPositionName: 'None', createdBy: userId, isDeleted: false },
// //   // });
// //   // return [position1, position2];
// // }

// async function seedJobDepartments(userId) {
//   const dept1 = await prisma.jobDepartment.create({
//     data: {
//       jobDepartmentName: 'Engineering',
//       createdBy: userId,
//       isDeleted: false,
//     },
//   });

//   const dept2 = await prisma.jobDepartment.create({
//     data: { jobDepartmentName: 'None', createdBy: userId, isDeleted: false },
//   });
//   return [dept1, dept2];
// }
// async function seedDepartmentAndPositions(userId) {

//   // await prisma.jobDepartment.createMany({})
// }

// async function seedJobs(userId, jobPositionId, jobDepartmentId) {
//   return await prisma.job.create({
//     data: {
//       deadline: '',
//       jobResponsibility: 'Develop and maintain backend systems.',
//       jobKeywords: ['Node.js', 'Prisma', 'TypeScript'],
//       vacancy: 3,
//       createdBy: userId,
//       jobPositionId: jobPositionId,
//       jobDepartmentId: jobDepartmentId,
//     },
//   });
// }

// async function seedInterviewStages(userId) {
//   const stage1 = await prisma.interviewStage.create({
//     data: { interviewStageName: 'Phone Interview', createdBy: userId },
//   });

//   const stage2 = await prisma.interviewStage.create({
//     data: { interviewStageName: 'HR Interview', createdBy: userId },
//   });

//   return [stage1, stage2];
// }

// async function seedJobInterviewStages(userId, jobId, interviewStageId) {
//   return await prisma.jobInterviewStage.create({
//     data: {
//       jobId: jobId,
//       interviewStageId: interviewStageId,
//       interviewMedium: 'Online-Video',
//       interviewFormat: 'structured',
//       interviewType: 'Online',
//       createdBy: userId,
//     },
//   });
// }

// async function main() {
//   try {
//     const permissions = await seedPermissions();
//     await seedRoles(permissions);

//     const user = await seedUser();
//     await seedDepartmentAndPositions(user.id);
//     const jobPositions = await seedJobPositions(user.id);
//     const jobDepts = await seedJobDepartments(user.id);
//     console.log(jobPositions);
//     console.log(jobDepts);
//     const job = await seedJobs(
//       user.id,
//       jobPositions[0].jobPositionId,
//       jobDepts[0].jobDepartmentId,
//     );

//     const interviewStages = await seedInterviewStages(user.id);
//     await seedJobInterviewStages(
//       user.id,
//       job.jobId,
//       interviewStages[0].interviewStageId,
//     );

//     console.log('Seeding finished!');
//   } catch (error) {
//     console.error('Seeding error:', error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
async function seedVal() {
  const departmentWisePositions = {
    Development: [
      'Jr Backend Engineer',
      'Backend Engineer I',
      'Backend Engineer II',
      'Sr Backend Engineer',
      'Jr Frontend Engineer',
      'Frontend Engineer I',
      'Frontend Engineer II',
      'Sr Frontend Engineer',
      'Jr Android Engineer',
      'Android Engineer I',
      'Android Engineer II',
      'Sr Android Engineer',
    ],
    'Software Quality': [
      'Jr SQA Engineer',
      'SQA Engineer I',
      'SQA Engineer II',
      'Sr SQA Engineer',
    ],
    'Project Management': [
      'Jr Project Specialist',
      'Project Specialist I',
      'Project Specialist II',
      'Sr Project Specialist',
    ],
    Design: [
      'Jr UI Designer',
      'UI Designer I',
      'UI Designer II',
      'Sr UI Designer',
      'Jr UI/UX Designer',
      'UI/UX Designer I',
      'UI/UX Designer II',
      'Sr UI/UX Designer',
    ],
  };

  const depNames = Object.keys(departmentWisePositions);

  // Get the user
  const user = await prisma.user.findFirst({
    where: {
      email: 'alice.smith000999@example.com',
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Loop through departments
  for (const departmentName of depNames) {
    // Step 1: Create the department
    const jobDepartment = await prisma.jobDepartment.create({
      data: {
        jobDepartmentName: departmentName,
        createdBy: user.id,
        isDeleted: false,
      },
    });

    // Step 2: Prepare job positions for createMany
    const positions = departmentWisePositions[departmentName].map(
      (positionName) => ({
        jobPositionName: positionName,
        createdBy: user.id,
        isDeleted: false,
        jobDepartmentId: jobDepartment.jobDepartmentId, // Link to the department
      }),
    );

    // Step 3: Use createMany to insert job positions
    await prisma.jobPosition.createMany({
      data: positions,
    });
  }
}
seedVal();
