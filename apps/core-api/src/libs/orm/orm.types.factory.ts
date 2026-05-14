import { ConfigService } from '@nestjs/config';

/**
 * Represents a function that returns options for the ORM model factory.
 * @param configService - The configuration service.
 * @returns An object containing the options for the ORM model factory.
 */
export type OptionsFunction = (configService: ConfigService) => {
  migrationsPath: string;
  prefix?: string;
};
