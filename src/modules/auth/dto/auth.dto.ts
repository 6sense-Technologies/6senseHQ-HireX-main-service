import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  IsStrongPassword,
  ArrayNotEmpty,
  ArrayUnique,
  IsIn,
  Matches,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    description:
      'The password for the user account, must meet strong password criteria',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    description: 'Array of role IDs assigned to the user',
    type: [String],
    example: ['admin', 'hr'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  @IsIn(['admin', 'hr', 'interviewer'], { each: true })
  roleNames: string[];
}

export class LoginDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'StrongP@ssw0rd!',
  })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
    },
    { message: 'Invalid password format' },
  )
  password: string;
}
export class EmailDTO {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;
}
export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token issued to the user',
    example: 'some-valid-refresh-token',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token should not be empty' })
  refreshToken: string;
}
export class EmailAndRefreshTokenDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @ApiProperty({
    description: 'The refresh token issued to the user',
    example: 'some-valid-refresh-token',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token should not be empty' })
  refreshToken: string;
}

export class SocialLoginDto {
  @ApiProperty({
    description: 'The social login provider (e.g., Google)',
    example: 'google',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider should not be empty' })
  provider: string;

  @ApiProperty({
    description: 'The ID token issued by the social provider',
    example: 'some-valid-id-token',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID token should not be empty' })
  idToken: string;
}
