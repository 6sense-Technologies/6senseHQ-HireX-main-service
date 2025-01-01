import {
  IsString,
  IsArray,
  IsInt,
  IsDate,
  IsMongoId,
  IsOptional,
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
