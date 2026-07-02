import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { LeadController } from './lead.controller';
import { LeadEntity } from './lead.entity';
import { LeadService } from './lead.service';

@Module({
  imports: [MikroOrmModule.forFeature([LeadEntity])],
  providers: [LeadService],
  controllers: [LeadController],
})
export class LeadModule {}
