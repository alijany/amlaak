import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';
import { S3StorageService } from './s3-storage.service';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Generic authenticated image upload → S3. Returns the public URL, reused by
 * agency logo/banner and listing images.
 */
@Controller('storage')
@UseGuards(JwtAuthGuard)
export class S3StorageController {
  constructor(private readonly storage: S3StorageService) {}

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('فایلی آپلود نشده است');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('فرمت فایل نامعتبر است. فقط تصاویر مجاز هستند');
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('حجم فایل بیش از ۵ مگابایت است');
    }

    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const url = await this.storage.uploadBuffer(
      file.buffer,
      filename,
      file.mimetype,
      'uploads',
    );
    return { url };
  }
}
