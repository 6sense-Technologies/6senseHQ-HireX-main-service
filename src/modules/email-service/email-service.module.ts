import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailServiceController } from './email.controller';
import { JwtModule } from '@nestjs/jwt';
import { appConfig } from 'src/configuration/app.config';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.EMAIL_VERIFICATION_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [EmailService, PrismaService],
  controllers: [EmailServiceController],
})
export class EmailServiceModule {}
