import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserInfoDto } from '../user/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { appConfig } from 'src/configuration/app.config';
import { Response } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}
  public async sendVerficationEmail(userInfoDTO: UserInfoDto) {
    console.log(appConfig.EMAIL_VERIFICATION_SECRET);
    const verificationToken = this.jwtService.sign(userInfoDTO, {
      secret: appConfig.EMAIL_VERIFICATION_SECRET,
    });
    const emailTemplate = `Dear User,Click the link to verify: ${appConfig.EMAIL_VERIFY_URL}:${appConfig.APP_PORT}/email-service/verify/${verificationToken}`;
    console.log(emailTemplate);
    const result = await this.mailerService.sendMail({
      from: `Ahmed Faiyaz ${appConfig.EMAIL_SENDER}`,
      to: userInfoDTO.email,
      subject: `Please Verify your account for ${userInfoDTO.email}-HireX`,
      text: emailTemplate,
    });

    return {
      result,
      emailBody: emailTemplate,
    };
  }
  public async verifyUser(token: string, res: Response) {
    try {
      const checkVerify = this.jwtService.verify(token, {
        secret: appConfig.EMAIL_VERIFICATION_SECRET,
      });
      if (checkVerify) {
        const info = this.jwtService.decode(token);
        const user = await this.prismaService.user.findFirst({
          where: {
            email: info.email,
          },
        });
        if (user) {
          await this.prismaService.user.update({
            where: {
              email: info.email,
            },
            data: {
              is_verified: true,
            },
          });
        } else {
          res.redirect(appConfig.EMAIL_VERIFICATION_FAILED_REDIRECT);
        }
        res.redirect(appConfig.EMAIL_VERIFICATION_SUCCESS_REDIRECT);
      } else {
        res.redirect(appConfig.EMAIL_VERIFICATION_FAILED_REDIRECT);
      }
    } catch (error) {
      console.error('Verification failed:', error.message);
      res.redirect(appConfig.EMAIL_VERIFICATION_FAILED_REDIRECT);
    }
  }
}
