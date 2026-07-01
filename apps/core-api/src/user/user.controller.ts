import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as _ from 'lodash';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/roles/roles.constants';
import { S3StorageService } from 'src/storage/s3-storage.service';
import { v4 as uuidv4 } from 'uuid';
import { InviteUserDto } from './dtos/invitation.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { UsersGetDto } from './dtos/user.get.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  async inviteUser(@Body() inviteDto: InviteUserDto) {
    return this.userService.inviteUserByRole(inviteDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getAllUsers(@Query() filters?: UsersGetDto): Promise<{
    items: any[];
    meta: { page: number; limit: number; total: number; pageCount: number };
  }> {
    const { page = 0, limit = 10, ...rest } = filters;

    const [users, total] = await this.userService.findAll(rest, {
      orderBy: { created_at: 'DESC' },
      limit,
      offset: page * limit,
      populate: ['roles'] as never,
    });

    // Transform users to include unique roles as an array
    const items = users.map((user) => {
      const rolesArray = user.roles
        ? _.uniqBy(user.roles.getItems(), 'role').map((role) => role.role)
        : [];

      return {
        ...user,
        name: user.name,
        roles: rolesArray,
      };
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    const user = await this.userService.updateUserRole(
      id,
      updateUserRoleDto.role,
    );

    const rolesArray = user.roles
      ? _.uniqBy(user.roles.getItems(), 'role').map((role) => role.role)
      : [];

    return { ...user, name: user.name, roles: rolesArray };
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.userService.updateProfile(
      user.id,
      updateProfileDto,
    );
    return updatedUser;
  }

  @Post('profile/picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @CurrentUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('فایلی آپلود نشده است');
    }

    // Validate file type
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

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('حجم فایل بیش از 5 مگابایت است');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const fileUrl = await this.s3StorageService.uploadBuffer(
      file.buffer,
      filename,
      file.mimetype,
      'profile-pictures',
    );

    // Update user profile picture
    const updatedUser = await this.userService.updateProfilePicture(
      user.id,
      fileUrl,
    );

    return { profilePicture: updatedUser.profilePicture };
  }
}
