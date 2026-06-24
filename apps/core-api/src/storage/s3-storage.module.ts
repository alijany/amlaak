import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3StorageController } from './s3-storage.controller';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [S3StorageController],
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class S3StorageModule {}
