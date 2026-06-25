import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { CityEntity } from './city.entity';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CitySeeder } from './city.seeder';

@Module({
  imports: [MikroOrmModule.forFeature([CityEntity])],
  providers: [CityService, CitySeeder],
  controllers: [CityController],
  exports: [CityService],
})
export class CityModule {}
