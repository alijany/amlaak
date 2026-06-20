import {
  BrowserCookie,
  BrowserHealth,
  BrowserTab,
  CreateTabOptions,
  PageSnapshot,
} from './browser.types';

/**
 * Abstraction over a remote, anti-detection browser.
 *
 * The shipped implementation ({@link CamofoxBrowserGateway}) talks HTTP to the
 * Camoufox sidecar, but providers depend only on this interface. A future
 * phase could provide an in-process Playwright implementation or a different
 * stealth service without changing a single provider.
 *
 * Resolve via the {@link BROWSER_GATEWAY} DI token.
 */
export interface BrowserGateway {
  /** Whether a browser backend is configured/reachable. */
  isAvailable(): Promise<boolean>;

  /** Structured availability info for monitoring/dashboard surfaces. */
  health(): Promise<BrowserHealth>;

  createTab(options: CreateTabOptions): Promise<BrowserTab>;

  navigate(tabId: string, url: string): Promise<void>;

  /** Accessibility snapshot with stable element refs. */
  snapshot(tabId: string): Promise<PageSnapshot>;

  click(tabId: string, ref: string): Promise<void>;

  type(tabId: string, ref: string, text: string): Promise<void>;

  /** Restore a previously persisted session. */
  importCookies(sessionId: string, cookies: BrowserCookie[]): Promise<void>;

  /** Export the current cookies for session persistence. */
  exportCookies(sessionId: string): Promise<BrowserCookie[]>;

  closeTab(tabId: string): Promise<void>;
}
