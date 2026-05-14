import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RolesEntity } from './roles.entity';
import { RolesService } from './roles.service';

@Module({
  imports: [MikroOrmModule.forFeature([RolesEntity])],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
