import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SmsEntity } from './sms.entity';
import { SmsService } from './sms.service';

@Module({
  imports: [MikroOrmModule.forFeature([SmsEntity]), HttpModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
