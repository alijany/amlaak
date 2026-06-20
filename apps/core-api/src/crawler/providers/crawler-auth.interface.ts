import { CrawlerAuthStatus } from '../crawler.constants';

/**
 * Persisted authentication material for a target session. Shape is provider
 * defined (cookies, tokens, profile id, ...) and stored as JSON on the
 * CrawlSession entity. Treated as opaque by the rest of the system.
 */
export type AuthSessionData = Record<string, unknown>;

/** Result of starting a login — the OTP has (conceptually) been sent. */
export interface AuthChallenge {
  /** Opaque handle correlating start -> verify (e.g. a sidecar tab id). */
  challengeRef: string;
  /** Optional human-facing hint, e.g. "code sent to ****1234". */
  message?: string;
}

export interface StartLoginInput {
  sessionId: string;
  phone: string;
}

export interface SubmitOtpInput {
  sessionId: string;
  phone: string;
  otp: string;
  challengeRef?: string;
}

export interface AuthResult {
  status: CrawlerAuthStatus;
  session?: AuthSessionData;
  expiresAt?: Date;
}

/**
 * Pluggable authentication strategy for a target site.
 *
 * Implementations drive the interactive OTP state machine:
 *   LOGIN_REQUIRED --startLogin--> OTP_PENDING --submitOtp--> LOGGED_IN
 *
 * The mock implementation accepts any code; the Divar implementation is a
 * scaffold that will drive the browser gateway in a later phase.
 */
export interface CrawlerAuthProvider {
  /** Begin a login. Conceptually triggers an OTP to the user's phone. */
  startLogin(input: StartLoginInput): Promise<AuthChallenge>;

  /** Verify the OTP the user entered and produce a session. */
  submitOtp(input: SubmitOtpInput): Promise<AuthResult>;

  /** Re-validate a stored session (e.g. cookies still valid?). */
  checkSession(session: AuthSessionData): Promise<CrawlerAuthStatus>;

  /** Invalidate a session server-side where possible. */
  logout(session: AuthSessionData): Promise<void>;
}
