import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OnlyInterviewStage {
  @ApiProperty({
    description: 'Name of the interview stage',
    example: 'Phone Interview',
    type: String,
  })
  @IsString({ message: 'Interview Stage must be a string' })
  @IsNotEmpty({ message: 'Interview Stage must not be empty' })
  interviewStageName: string;
}
