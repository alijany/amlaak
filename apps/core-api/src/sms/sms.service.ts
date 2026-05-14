import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Send SMS using Asanak API
   * @param message - Message content to send
   * @param destination - Recipient phone number (e.g., 989XXXXXXXXX)
   * @returns Promise with the API response
   */
  async sendSms(message: string, destination: string | string[]): Promise<any> {
    const apiUrl = this.configService.get<string>('ASANAK_API');
    const username = this.configService.get<string>('ASANAK_API_USER');
    const password = this.configService.get<string>('ASANAK_API_PASS');
    const source = this.configService.get<string>(
      'ASANAK_API_SOURCE',
      '989982003670',
    ); // fallback or add to env

    if (isNil(username) || isNil(password)) {
      throw new Error('SMS service credentials are not configured');
    }

    const isArray = Array.isArray(destination);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('source', source);
    formData.append('message', message);
    formData.append(
      'destination',
      isArray ? destination.join(',') : destination,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'development')
        console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error?.response?.data || error.message,
      };
    }
  }
}
