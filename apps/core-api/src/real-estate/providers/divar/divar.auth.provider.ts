import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BROWSER_GATEWAY,
  CrawlerAuthStatus,
} from '../../../crawler/crawler.constants';
import { BrowserGateway } from '../../../crawler/browser/browser-gateway.interface';
import {
  AuthChallenge,
  AuthResult,
  AuthSessionData,
  CrawlerAuthProvider,
  StartLoginInput,
  SubmitOtpInput,
} from '../../../crawler/providers/crawler-auth.interface';
import {
  DIVAR_ANCHORS,
  DIVAR_BASE_URL,
  DIVAR_LOGIN_TRIGGER_PATH,
} from './divar.constants';
import { findRef, findTextboxByPlaceholder } from './divar.parser';

/** Days a Divar session profile is assumed valid before re-login is prompted. */
const SESSION_TTL_DAYS = 30;

/**
 * Divar OTP auth, driven over the browser gateway.
 *
 *   startLogin: open the login modal -> type phone -> "بعدی" (Divar SMSes a code)
 *               -> keep the tab open, return its id as the challengeRef.
 *   submitOtp:  reuse that tab -> type the code -> confirm. On success the
 *               session cookies live in the Camoufox profile (keyed by sessionId),
 *               so we persist only a lightweight marker.
 *
 * The phone step is validated against the live site; the OTP step resolves its
 * input/button by role+name from the snapshot (Divar refs are per-snapshot).
 * Real session validation/teardown is Phase 4.
 */
@Injectable()
export class DivarAuthProvider implements CrawlerAuthProvider {
  private readonly logger = new Logger(DivarAuthProvider.name);

  constructor(
    @Inject(BROWSER_GATEWAY) private readonly browser: BrowserGateway,
  ) {}

  async startLogin(input: StartLoginInput): Promise<AuthChallenge> {
    const tab = await this.browser.createTab({
      sessionId: input.sessionId,
      url: `${DIVAR_BASE_URL}${DIVAR_LOGIN_TRIGGER_PATH}`,
    });
    await this.sleep(3000);

    // Open the login modal if a trigger button is shown.
    let snapshot = await this.browser.snapshot(tab.id);
    const loginBtn = findRef(snapshot.text, {
      role: 'button',
      nameIncludes: DIVAR_ANCHORS.loginButton,
    });
    if (loginBtn) {
      await this.browser.click(tab.id, loginBtn);
      await this.sleep(1500);
      snapshot = await this.browser.snapshot(tab.id);
    }

    const phoneRef = findTextboxByPlaceholder(
      snapshot.text,
      DIVAR_ANCHORS.phonePlaceholder,
    );
    if (!phoneRef) {
      await this.browser.closeTab(tab.id).catch(() => undefined);
      throw new Error('Divar login: phone-number field not found.');
    }
    await this.browser.type(tab.id, phoneRef, input.phone);

    const nextRef = findRef(snapshot.text, {
      role: 'button',
      nameIncludes: DIVAR_ANCHORS.nextButton,
    });
    if (nextRef) await this.browser.click(tab.id, nextRef);
    await this.sleep(1500);

    // Keep the tab open: submitOtp reuses it via the challengeRef.
    return {
      challengeRef: tab.id,
      message: `کد تأیید برای ${maskPhone(input.phone)} ارسال شد`,
    };
  }

  async submitOtp(input: SubmitOtpInput): Promise<AuthResult> {
    const tabId = input.challengeRef;
    if (!tabId) {
      throw new Error(
        'Divar OTP: no active login session (start login first).',
      );
    }

    try {
      const snapshot = await this.browser.snapshot(tabId);
      const otpRef = findRef(snapshot.text, { role: 'textbox' });
      if (!otpRef) throw new Error('Divar OTP: code field not found.');
      await this.browser.type(tabId, otpRef, input.otp);

      const confirmRef =
        findRef(snapshot.text, {
          role: 'button',
          nameIncludes: DIVAR_ANCHORS.confirmButton,
        }) ??
        findRef(snapshot.text, {
          role: 'button',
          nameIncludes: DIVAR_ANCHORS.nextButton,
        });
      if (confirmRef) await this.browser.click(tabId, confirmRef);
      await this.sleep(2500);

      // Logged in when the login trigger is no longer offered.
      const after = await this.browser.snapshot(tabId);
      const stillGuest = !!findRef(after.text, {
        role: 'button',
        nameIncludes: DIVAR_ANCHORS.loginButton,
      });
      if (stillGuest) {
        return { status: CrawlerAuthStatus.ERROR };
      }

      return {
        status: CrawlerAuthStatus.LOGGED_IN,
        session: {
          provider: 'divar',
          userId: input.sessionId,
          phone: input.phone,
          loggedInAt: new Date().toISOString(),
        },
        expiresAt: new Date(
          Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
        ),
      };
    } finally {
      await this.browser.closeTab(tabId).catch(() => undefined);
    }
  }

  async checkSession(session: AuthSessionData): Promise<CrawlerAuthStatus> {
    // Lightweight check; cookies persist in the Camoufox profile. Real
    // re-validation (navigate + detect logged-in state) is Phase 4.
    return session?.userId
      ? CrawlerAuthStatus.LOGGED_IN
      : CrawlerAuthStatus.LOGIN_REQUIRED;
  }

  async logout(session: AuthSessionData): Promise<void> {
    // Server-side profile teardown lands with session persistence (Phase 4).
    this.logger.debug(`Divar logout for ${session?.userId ?? 'unknown'}.`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function maskPhone(phone: string): string {
  return phone.length > 4 ? `****${phone.slice(-4)}` : phone;
}
