import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { BrowserGateway } from './browser-gateway.interface';
import { BrowserGatewayError } from './browser-gateway.error';
import {
  BrowserCookie,
  BrowserHealth,
  BrowserTab,
  CreateTabOptions,
  PageSnapshot,
} from './browser.types';

/**
 * HTTP client for the Camoufox stealth browser sidecar
 * (https://github.com/jo-inc/camofox-browser, default port 9377).
 *
 * Validated against camofox-browser v1.11.x. Notable traits of that REST API
 * that this gateway adapts to:
 *  - every tab operation (navigate/click/type/snapshot/close) must carry the
 *    owning `userId`; the {@link BrowserGateway} interface only passes a tabId,
 *    so we remember the tab -> session mapping created in {@link createTab}.
 *  - tab creation needs both `userId` and a `sessionKey` (tab group) and
 *    returns `{ tabId }` (not `{ id }`).
 *  - snapshots come back as a compact text tree (`{ snapshot, refsCount }`),
 *    not a JSON node tree.
 *  - cookie import is gated behind bearer auth (CAMOFOX_API_KEY); there is no
 *    cookie *export* endpoint (profiles persist server-side per userId).
 *
 * Configuration:
 *   CAMOFOX_BASE_URL          e.g. http://camofox:9377 (required to be available)
 *   CAMOFOX_API_KEY           bearer token for guarded endpoints (cookies)
 *   CAMOFOX_TIMEOUT_MS        per-request timeout (default 30000)
 *   CAMOFOX_MAX_RETRIES       transient-failure retries (default 2)
 *   CAMOFOX_RETRY_DELAY_MS    base backoff between retries (default 500)
 *   CAMOFOX_HEALTH_TIMEOUT_MS health-probe timeout (default 5000)
 */
@Injectable()
export class CamofoxBrowserGateway implements BrowserGateway {
  private readonly logger = new Logger(CamofoxBrowserGateway.name);
  private readonly baseUrl?: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly healthTimeoutMs: number;

  /** tabId -> owning sessionId (userId), required by every tab operation. */
  private readonly tabSessions = new Map<string, string>();

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService
      .get<string>('CAMOFOX_BASE_URL')
      ?.replace(/\/+$/, '');
    this.apiKey = this.configService.get<string>('CAMOFOX_API_KEY');
    this.timeoutMs = this.num('CAMOFOX_TIMEOUT_MS', 30_000);
    this.maxRetries = this.num('CAMOFOX_MAX_RETRIES', 2);
    this.retryDelayMs = this.num('CAMOFOX_RETRY_DELAY_MS', 500);
    this.healthTimeoutMs = this.num('CAMOFOX_HEALTH_TIMEOUT_MS', 5_000);
  }

  async isAvailable(): Promise<boolean> {
    return (await this.health()).available;
  }

  async health(): Promise<BrowserHealth> {
    if (!this.baseUrl) return { available: false, configured: false };
    try {
      const data = await this.request<{
        ok?: boolean;
        engine?: string;
        browserConnected?: boolean;
        activeTabs?: number;
        activeSessions?: number;
      }>('health', 'get', '/health', {
        timeout: this.healthTimeoutMs,
        retries: 0,
      });
      return {
        available: data.ok !== false,
        configured: true,
        engine: data.engine,
        browserConnected: data.browserConnected,
        activeTabs: data.activeTabs,
        activeSessions: data.activeSessions,
      };
    } catch (err) {
      return {
        available: false,
        configured: true,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async createTab(options: CreateTabOptions): Promise<BrowserTab> {
    const data = await this.request<{ tabId: string; url?: string }>(
      'createTab',
      'post',
      '/tabs',
      {
        body: {
          userId: options.sessionId,
          // Scope tabs to the session so cookies/state stay per target.
          sessionKey: options.sessionId,
          url: options.url,
        },
      },
    );
    this.tabSessions.set(data.tabId, options.sessionId);
    return { id: data.tabId, url: data.url };
  }

  async navigate(tabId: string, url: string): Promise<void> {
    await this.request('navigate', 'post', `/tabs/${tabId}/navigate`, {
      body: { userId: this.userIdFor(tabId), url },
    });
  }

  async snapshot(tabId: string): Promise<PageSnapshot> {
    const data = await this.request<{
      url: string;
      snapshot: string;
      refsCount?: number;
    }>('snapshot', 'get', `/tabs/${tabId}/snapshot`, {
      query: { userId: this.userIdFor(tabId) },
    });
    return {
      url: data.url,
      text: data.snapshot ?? '',
      refsCount: data.refsCount,
      raw: data,
    };
  }

  async click(tabId: string, ref: string): Promise<void> {
    await this.request('click', 'post', `/tabs/${tabId}/click`, {
      body: { userId: this.userIdFor(tabId), ref },
    });
  }

  async type(tabId: string, ref: string, text: string): Promise<void> {
    await this.request('type', 'post', `/tabs/${tabId}/type`, {
      body: { userId: this.userIdFor(tabId), ref, text },
    });
  }

  async scroll(
    tabId: string,
    opts: { direction?: 'up' | 'down'; amount?: number } = {},
  ): Promise<void> {
    await this.request('scroll', 'post', `/tabs/${tabId}/scroll`, {
      body: {
        userId: this.userIdFor(tabId),
        direction: opts.direction ?? 'down',
        amount: opts.amount,
      },
    });
  }

  async wait(
    tabId: string,
    opts: { selector?: string; timeout?: number },
  ): Promise<void> {
    await this.request('wait', 'post', `/tabs/${tabId}/wait`, {
      body: {
        userId: this.userIdFor(tabId),
        selector: opts.selector,
        timeout: opts.timeout,
      },
    });
  }

  async importCookies(
    sessionId: string,
    cookies: BrowserCookie[],
  ): Promise<void> {
    await this.request(
      'importCookies',
      'post',
      `/sessions/${sessionId}/cookies`,
      {
        body: { cookies },
        auth: true,
      },
    );
  }

  async exportCookies(sessionId: string): Promise<BrowserCookie[]> {
    // Camoufox has no cookie-export endpoint; profiles/cookies are persisted
    // server-side per userId by the persistence plugin. Durable session
    // export/reconciliation is Phase 4 — fail loudly rather than silently
    // returning an empty (and misleading) cookie set.
    void sessionId;
    throw new BrowserGatewayError(
      'Camoufox does not expose a cookie-export endpoint; sessions persist ' +
        'server-side per profile. See docs/roadmap.md (Phase 4).',
      { operation: 'exportCookies' },
    );
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.request('destroySession', 'delete', `/sessions/${sessionId}`, {
      auth: true,
    });
  }

  async closeTab(tabId: string): Promise<void> {
    const userId = this.tabSessions.get(tabId);
    try {
      await this.request('closeTab', 'delete', `/tabs/${tabId}`, {
        query: userId ? { userId } : undefined,
      });
    } finally {
      this.tabSessions.delete(tabId);
    }
  }

  // --- internals ---------------------------------------------------------

  private userIdFor(tabId: string): string {
    const userId = this.tabSessions.get(tabId);
    if (!userId) {
      throw new BrowserGatewayError(
        `Unknown tab "${tabId}" (was it created by this gateway?).`,
        { operation: 'resolveTab' },
      );
    }
    return userId;
  }

  private num(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    const n = raw === undefined ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  private get authHeaders(): Record<string, string> {
    return this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {};
  }

  /**
   * Single entry point for every sidecar call: applies base URL, timeout,
   * bearer auth, transient-failure retries with backoff, and maps any failure
   * to a {@link BrowserGatewayError}.
   */
  private async request<T>(
    operation: string,
    method: 'get' | 'post' | 'delete',
    path: string,
    opts: {
      body?: unknown;
      query?: Record<string, unknown>;
      auth?: boolean;
      timeout?: number;
      retries?: number;
    } = {},
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new BrowserGatewayError(
        'Camoufox browser is not configured (set CAMOFOX_BASE_URL).',
        { operation },
      );
    }

    const config: AxiosRequestConfig = {
      method,
      url: `${this.baseUrl}${path}`,
      data: opts.body,
      params: opts.query,
      timeout: opts.timeout ?? this.timeoutMs,
      headers: opts.auth ? this.authHeaders : undefined,
    };

    const retries = opts.retries ?? this.maxRetries;
    let lastError: BrowserGatewayError | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await firstValueFrom(this.http.request<T>(config));
        return res.data;
      } catch (err) {
        lastError = this.toGatewayError(operation, err);
        if (!lastError.context.transient || attempt === retries) break;
        const delay = this.retryDelayMs * 2 ** attempt;
        this.logger.warn(
          `Camoufox ${operation} failed (attempt ${attempt + 1}/${
            retries + 1
          }): ${lastError.message}; retrying in ${delay}ms`,
        );
        await this.sleep(delay);
      }
    }
    throw lastError;
  }

  private toGatewayError(operation: string, err: unknown): BrowserGatewayError {
    const axiosErr = err as AxiosError<{ error?: string; message?: string }>;
    const status = axiosErr.response?.status;
    const upstream =
      axiosErr.response?.data?.error ??
      axiosErr.response?.data?.message ??
      axiosErr.message;
    // No response => network/DNS/timeout; 5xx and 429 are retryable too.
    const transient =
      !axiosErr.response ||
      status === 429 ||
      (status !== undefined && status >= 500) ||
      axiosErr.code === 'ECONNABORTED';
    return new BrowserGatewayError(
      `Camoufox ${operation} failed${status ? ` (HTTP ${status})` : ''}: ${
        upstream ?? 'unknown error'
      }`,
      { operation, status, transient, cause: err },
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
