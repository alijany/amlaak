import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (options?: { optional: boolean }) =>
  SetMetadata(IS_PUBLIC_KEY, {
    isPublic: true,
    isOptional: options?.optional ?? false,
  });
