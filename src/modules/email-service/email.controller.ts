import { Controller, Post, UseGuards } from '@nestjs/common';
import { UserInfo } from '../user/decorators/user.decorator';
import { UserInfoDto } from '../user/dto/user.dto';
import { EmailService } from './email.service';
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
@UseGuards(AccessTokenGuard)
@Controller('email-service')
export class EmailServiceController {
  constructor(private readonly emailService: EmailService) {}
  @Post('send')
  @ApiBearerAuth()
  @ApiProperty()
  async create(@UserInfo() userInfoDTO: UserInfoDto) {
    return this.emailService.sendVerficationEmail(userInfoDTO);
  }
}
