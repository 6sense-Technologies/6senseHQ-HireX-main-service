import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { UserInfo } from '../user/decorators/user.decorator';
import { UserInfoDto } from '../user/dto/user.dto';
import { EmailService } from './email.service';
import { ApiBearerAuth, ApiParam, ApiProperty } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { Response } from 'express';
@Controller('email-service')
export class EmailServiceController {
  constructor(private readonly emailService: EmailService) {}
  @Post('send')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiProperty()
  async generateVerificationURL(@UserInfo() userInfoDTO: UserInfoDto) {
    return this.emailService.sendVerficationEmail(userInfoDTO);
  }
  @Get('verify/:token')
  @ApiParam({
    name: 'token',
    required: true,
    description: 'The JWT verification token provided to the user',
    type: String,
    example: 'abc123def456',
  })
  async verifyUser(@Param('token') token: string, @Res() res: Response) {
    return this.emailService.verifyUser(token, res);
  }
}
