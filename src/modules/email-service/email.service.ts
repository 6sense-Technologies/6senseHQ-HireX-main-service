import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserInfoDto } from '../user/dto/user.dto';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  public async sendVerficationEmail(userInfoDTO: UserInfoDto) {
    const result = await this.mailerService.sendMail({
      from: 'tesrt <***REMOVED***>',
      to: userInfoDTO.email,
      subject: `Test Email`,
      text: `Testing email service.Proof of work`,
    });
    return result;
  }
}
