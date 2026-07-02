import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { S3StorageService } from 'src/storage/s3-storage.service';
import { UserEntity } from 'src/user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { BlogCategoryService } from './blog-category.service';
import { BlogPostService } from './blog-post.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostsFilterDto } from './dtos/posts-filter.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { BlogPostStatus } from './blog-post.entity';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogPostService: BlogPostService,
    private readonly blogCategoryService: BlogCategoryService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  // ─── Public endpoints ───────────────────────────────────────────────────────

  @Get()
  @Public()
  async getPublishedPosts(@Query() filters: PostsFilterDto) {
    return this.blogPostService.findPosts({
      ...filters,
      status: BlogPostStatus.PUBLISHED,
    });
  }

  @Get('categories')
  @Public()
  async getCategories() {
    const [items] = await this.blogCategoryService.findAll();
    return items;
  }

  @Get(':slug')
  @Public()
  async getPostBySlug(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const post = await this.blogPostService.findOneBySlug(slug);

    if (post.status === BlogPostStatus.GONE) {
      res.status(410);
      return { gone: true, slug };
    }

    if (post.status === BlogPostStatus.REDIRECT && post.redirectUrl) {
      res.status(301);
      res.setHeader('Location', post.redirectUrl);
      return { redirect: true, url: post.redirectUrl };
    }

    return post;
  }

  // ─── Protected endpoints ─────────────────────────────────────────────────────

  @Get('manage/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getManagedPosts(@Query() filters: PostsFilterDto) {
    return this.blogPostService.findPosts(filters);
  }

  @Get('manage/posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async getManagedPost(@Param('id', ParseIntPipe) id: number) {
    return this.blogPostService.findOneById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async createPost(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreatePostDto,
  ) {
    return this.blogPostService.createPost(user, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.blogPostService.updatePost(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    await this.blogPostService.deletePost(id);
    return { success: true };
  }

  @Post('cover-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoverImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('فایلی آپلود نشده است');

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'فرمت فایل نامعتبر است. فقط تصاویر مجاز هستند',
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('حجم فایل بیش از 5 مگابایت است');
    }

    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const url = await this.s3StorageService.uploadBuffer(
      file.buffer,
      filename,
      file.mimetype,
      'blog-covers',
    );

    return { url };
  }

  @Delete('cover-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async deleteCoverImage(@Body() body: { url: string }) {
    if (!body?.url) throw new BadRequestException('آدرس تصویر الزامی است');
    await this.s3StorageService.deleteByUrl(body.url);
    return { success: true };
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.blogCategoryService.createCategory(dto);
  }
}
