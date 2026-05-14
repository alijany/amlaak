import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: any) => {
              switch (key) {
                case 'ASANAK_API':
                  return 'https://example.local/sms';
                case 'ASANAK_API_USER':
                  return 'user';
                case 'ASANAK_API_PASS':
                  return 'pass';
                case 'ASANAK_API_SOURCE':
                  return '989000000000';
                default:
                  return fallback;
              }
            },
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of({ data: { success: true } })),
          },
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
