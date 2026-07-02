import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { S3StorageModule } from 'src/storage/s3-storage.module';
import { BlogCategoryEntity } from './blog-category.entity';
import { BlogCategoryService } from './blog-category.service';
import { BlogController } from './blog.controller';
import { BlogPostEntity } from './blog-post.entity';
import { BlogPostService } from './blog-post.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([BlogPostEntity, BlogCategoryEntity]),
    S3StorageModule,
  ],
  providers: [BlogPostService, BlogCategoryService],
  controllers: [BlogController],
})
export class BlogModule {}
