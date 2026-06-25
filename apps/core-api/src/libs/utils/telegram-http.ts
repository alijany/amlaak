import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { AxiosRequestConfig } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';

const logger = new Logger('TelegramHttp');

/**
 * Builds the axios request options for a Telegram Bot API call, attaching a
 * SOCKS proxy agent when TELEGRAM_PROXY_URL is set. Telegram's API is HTTPS,
 * so the agent is registered as `httpsAgent`.
 *
 * Opt-in and best-effort: when TELEGRAM_PROXY_URL is unset this returns `{}`,
 * so requests go out directly and nothing changes for environments that don't
 * need a proxy. Expected URL form: socks5://[user:pass@]host:port
 * (socks5h:// is recommended so DNS is resolved through the proxy).
 */
export function telegramRequestConfig(
  config: ConfigService,
): AxiosRequestConfig {
  const proxyUrl = config.get<string>('TELEGRAM_PROXY_URL');
  if (!proxyUrl) {
    return {};
  }

  const agent = new SocksProxyAgent(proxyUrl);
  logger.debug(`Routing Telegram request through SOCKS proxy ${proxyUrl}`);

  return {
    httpAgent: agent,
    httpsAgent: agent,
  };
}
