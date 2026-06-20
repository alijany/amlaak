import { Injectable } from '@nestjs/common';
import { CrawlerAuthStatus } from '../../crawler.constants';
import {
  AuthChallenge,
  AuthResult,
  AuthSessionData,
  CrawlerAuthProvider,
  StartLoginInput,
  SubmitOtpInput,
} from '../crawler-auth.interface';

/**
 * Fully-working mock auth provider used to exercise the interactive OTP flow
 * end-to-end without a real target. `startLogin` "sends" a code; `submitOtp`
 * accepts any 4-digit code and returns a session.
 */
@Injectable()
export class MockAuthProvider implements CrawlerAuthProvider {
  async startLogin(input: StartLoginInput): Promise<AuthChallenge> {
    return {
      challengeRef: `mock-${input.sessionId}-${Date.now()}`,
      message: `کد تایید (آزمایشی) برای ${maskPhone(input.phone)} ارسال شد`,
    };
  }

  async submitOtp(input: SubmitOtpInput): Promise<AuthResult> {
    if (!/^\d{4,6}$/.test(input.otp)) {
      return { status: CrawlerAuthStatus.ERROR };
    }
    return {
      status: CrawlerAuthStatus.LOGGED_IN,
      session: {
        provider: 'mock',
        phone: input.phone,
        token: `mock-session-${input.challengeRef ?? input.sessionId}`,
        issuedAt: new Date().toISOString(),
      },
      // Mock sessions "expire" in 7 days to demonstrate the field.
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  async checkSession(session: AuthSessionData): Promise<CrawlerAuthStatus> {
    return session?.token
      ? CrawlerAuthStatus.LOGGED_IN
      : CrawlerAuthStatus.LOGIN_REQUIRED;
  }

  async logout(): Promise<void> {
    // Nothing to revoke for the mock provider.
  }
}

function maskPhone(phone: string): string {
  return phone.length > 4 ? `****${phone.slice(-4)}` : phone;
}
