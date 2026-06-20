import {
  BrowserCookie,
  BrowserHealth,
  BrowserImage,
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

  /** Extract the images present on the current page. */
  listImages(tabId: string): Promise<BrowserImage[]>;

  click(tabId: string, ref: string): Promise<void>;

  type(tabId: string, ref: string, text: string): Promise<void>;

  /** Scroll the page (e.g. to trigger infinite-scroll loading). */
  scroll(
    tabId: string,
    opts?: { direction?: 'up' | 'down'; amount?: number },
  ): Promise<void>;

  /** Wait for a selector to appear, or just a timeout (ms) when omitted. */
  wait(
    tabId: string,
    opts: { selector?: string; timeout?: number },
  ): Promise<void>;

  /** Restore a previously persisted session. */
  importCookies(sessionId: string, cookies: BrowserCookie[]): Promise<void>;

  /** Export the current cookies for session persistence. */
  exportCookies(sessionId: string): Promise<BrowserCookie[]>;

  /** Destroy a session/profile server-side (cookies, tabs) — used by logout. */
  destroySession(sessionId: string): Promise<void>;

  closeTab(tabId: string): Promise<void>;
}
