import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { BROWSER_GATEWAY } from '../../crawler.constants';
import { BrowserGateway } from '../../browser/browser-gateway.interface';
import {
  AuthChallenge,
  AuthResult,
  AuthSessionData,
  CrawlerAuthProvider,
  StartLoginInput,
  SubmitOtpInput,
} from '../crawler-auth.interface';
import { CrawlerAuthStatus } from '../../crawler.constants';

/**
 * SCAFFOLD — Divar OTP auth over the browser gateway.
 *
 * The intended flow (to be implemented when live browser access exists):
 *   startLogin:  open tab -> navigate to login -> type phone -> submit
 *                (Divar sends an OTP SMS) -> return the tab id as challengeRef.
 *   submitOtp:   reuse the tab -> type the OTP -> verify -> export cookies as
 *                the session.
 *
 * Until then every method throws a clear NotImplemented so the extension point
 * is obvious and nothing silently pretends to work.
 */
@Injectable()
export class DivarAuthProvider implements CrawlerAuthProvider {
  constructor(
    @Inject(BROWSER_GATEWAY) private readonly browser: BrowserGateway,
  ) {}

  async startLogin(input: StartLoginInput): Promise<AuthChallenge> {
    void input;
    throw new NotImplementedException(
      'Divar login is not implemented yet (requires live browser access). ' +
        'See divar.auth.provider.ts and docs/roadmap.md.',
    );
  }

  async submitOtp(input: SubmitOtpInput): Promise<AuthResult> {
    void input;
    throw new NotImplementedException(
      'Divar OTP verification is not implemented yet.',
    );
  }

  async checkSession(session: AuthSessionData): Promise<CrawlerAuthStatus> {
    void session;
    return CrawlerAuthStatus.LOGIN_REQUIRED;
  }

  async logout(session: AuthSessionData): Promise<void> {
    void session;
    // No-op until session management is implemented.
  }
}
