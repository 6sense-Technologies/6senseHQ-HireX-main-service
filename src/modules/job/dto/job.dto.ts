import {
  IsString,
  IsArray,
  IsInt,
  IsDate,
  IsMongoId,
  IsOptional,
  IsNotEmpty,
  IsIn,
  ValidateNested,
  ArrayNotEmpty,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    description: 'Name of the job',
    example: 'Software Engineer',
  })
  @IsString()
  jobName: string;

  @ApiProperty({
    description: 'Deadline for the job application',
    example: '2025-01-31T23:59:59Z',
  })
  @IsDate()
  @Type(() => Date)
  deadline: Date;

  @ApiProperty({
    description: 'Description of the job',
    example: 'Responsible for developing software applications.',
  })
  @IsString()
  jobDescription: string;

  @ApiProperty({
    description: 'List of keywords associated with the job',
    example: ['software', 'engineer', 'developer'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  jobKeywords: string[];

  @ApiProperty({
    description: 'Number of vacancies available for this job',
    example: 5,
  })
  @IsInt()
  vacancy: number;

  @ApiProperty({
    description: 'ID of the user who created the job',
    example: '60c72b2f9e1d4d1fa24d4f9b',
  })
  @IsMongoId()
  createdBy: string;

  @ApiProperty({
    description: 'Optional ID of the job position',
    example: '60c72b2f9e1d4d1fa24d4f9c',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  jobPositionId?: string;

  @ApiProperty({
    description: 'Optional ID of the job department',
    example: '60c72b2f9e1d4d1fa24d4f9d',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  jobDepartmentId?: string;

  @ApiProperty({
    description: 'Optional ID of the candidate',
    example: '60c72b2f9e1d4d1fa24d4f9e',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  candidateId?: string;
}
export class UserInfoDto {
  userId: string;
  email: string;
}
export class InterviewStageDto {
  @ApiProperty({
    description: 'Name of the interview stage',
    example: 'Phone Interview',
    type: String,
  })
  @IsString({ message: 'Interview Stage must be a string' })
  @IsNotEmpty({ message: 'Interview Stage must not be empty' })
  interviewStageName: string;

  @ApiProperty({
    description: 'Interview medium name',
    example: 'Online-Video',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Online-Video', 'Online-Voice', 'Online-Quiz', 'Offline'], {
    message:
      'interviewMedium must be either Online-Video, Online-Voice, Online-Quiz or Offline.',
  })
  interviewMedium: string;
}

export class CreateJobDtoUsingName {
  @ApiProperty({
    description: 'Responsibility of the job',
    example: 'Responsible for developing software applications.',
  })
  @IsNotEmpty()
  @IsString()
  jobResponsibility: string;

  @ApiProperty({
    description: 'List of keywords associated with the job',
    example: ['software', 'engineer', 'developer'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  jobKeywords: string[];

  @ApiProperty({
    description: 'Number of vacancies available for this job',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumberString()
  vacancy: string;

  @ApiProperty({
    description: 'Optional name of the job position',
    example: 'Software Engineer',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  jobPositionName: string;

  @ApiProperty({
    description: 'Optional name of the job department',
    example: 'Engineering',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobDepartmentName?: string;

  @ApiProperty({
    description: 'Array of interview stages with their medium',
    example: [
      {
        interviewStageName: 'Phone Interview',
        interviewMedium: 'Online-Video',
      },
      { interviewStageName: 'HR Interview', interviewMedium: 'Offline' },
    ],
    type: [InterviewStageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewStageDto)
  @ArrayNotEmpty()
  interviewStages: InterviewStageDto[];
}
