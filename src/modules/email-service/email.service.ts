import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserInfoDto } from '../user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/configuration/app.config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}
  public async sendVerficationEmail(userInfoDTO: UserInfoDto) {
    console.log(appConfig.EMAIL_VERIFICATION_SECRET);
    const verificationToken = this.jwtService.sign(userInfoDTO, {
      secret: appConfig.EMAIL_VERIFICATION_SECRET,
    });
    console.log(verificationToken);
    // const result = await this.mailerService.sendMail({
    //   from: 'Ahmed Faiyaz <***REMOVED***>',
    //   to: userInfoDTO.email,
    //   subject: `Please Verify your account-HireX`,
    //   text: `Click the link to verify ${verificationToken}`,
    // });
    // return result;
  }
}
