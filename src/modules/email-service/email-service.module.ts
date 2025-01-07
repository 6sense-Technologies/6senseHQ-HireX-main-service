import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailServiceController } from './email.controller';

@Module({
  providers: [EmailService],
  controllers: [EmailServiceController],
})
export class EmailServiceModule {}
