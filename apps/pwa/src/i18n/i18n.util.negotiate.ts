import { locales, type LocaleConfidence } from './i18n.config';

/**
 * How much to trust the locale next-intl negotiated for this request.
 *
 * next-intl already does the matching itself (cookie → `accept-language` →
 * default). What it does not tell us is *why* it landed where it did, and that
 * matters: falling back to the default because the header was uninformative is
 * a very different outcome from honouring a header that explicitly asked for a
 * language we ship.
 *
 * Only the weak case is worth refining client-side with the timezone, so this
 * answers exactly that one question and deliberately does not re-implement the
 * matching. It is header parsing only — no `Intl` and no extra dependency, so
 * it stays cheap enough to run on every proxy invocation.
 */
export function negotiationConfidence(
  acceptLanguage: string | null
): LocaleConfidence {
  if (!acceptLanguage) return 'weak';

  const requested = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
        ?.slice(2);
      return { tag: tag.trim().toLowerCase(), quality: q ? Number(q) : 1 };
    })
    // `q=0` means "explicitly not this one", and `*` tells us nothing.
    .filter((entry) => entry.tag && entry.tag !== '*' && entry.quality > 0);

  // Strong only when the browser named a language we actually ship. Matching on
  // the primary subtag so `fa-IR`, `fa-AF` and bare `fa` all count.
  const supported = new Set<string>(locales);
  const named = requested.some((entry) =>
    supported.has(entry.tag.split('-')[0])
  );

  return named ? 'strong' : 'weak';
}
