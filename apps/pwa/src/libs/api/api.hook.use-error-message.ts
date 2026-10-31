'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type {
  ApiError,
  ErrorParams,
  ValidationIssue,
} from './api.types.error';

/**
 * The catalog is keyed by strings the *API* chooses at runtime, so the key
 * cannot be one of the statically known literals `useTranslations` expects.
 * `has()` is the runtime guard that replaces the compile-time check — this cast
 * narrows the translator to that dynamic contract and nothing else.
 */
type CodeTranslator = {
  (key: string, values?: ErrorParams): string;
  has(key: string): boolean;
};

function fieldName(field: string): string {
  const parts = field.split('.').filter((part) => !/^\d+$/.test(part));
  return parts.at(-1) ?? field;
}

function translateValidationIssues(
  issues: ValidationIssue[],
  t: CodeTranslator,
): string | undefined {
  const messages = issues.flatMap((issue) => {
    const name = fieldName(issue.field);
    const fieldKey = `validation.fields.${name}`;
    const field = t.has(fieldKey)
      ? t(fieldKey)
      : t('validation.fields.generic');
    const rule = issue.rules.find((candidate) =>
      t.has(`validation.rules.${candidate}`),
    );

    return rule
      ? [t(`validation.rules.${rule}`, { field })]
      : [t('validation.rules.invalid', { field })];
  });

  const unique = [...new Set(messages)];
  return unique.length ? unique.join(' ') : undefined;
}

/**
 * Turns anything thrown by `fetcher` into copy in the reader's language.
 *
 * Order: the catalog entry for the API's `code`, then the API's own `message`
 * (English, and the reason an un-migrated backend throw still says something
 * useful), then the caller's fallback, then generic copy. A code the catalog
 * has never heard of falls through the same way, so a newly deployed backend
 * error can never render as a bare `auth.otp.invalid` to a user.
 *
 * The `message` step is a backstop, not a plan: it renders English to a Persian
 * reader. Every refusal the backend produces for a person carries a code.
 *
 * Needs the `errors` namespace in the nearest `NextIntlClientProvider` — the
 * dashboard layout and the login page ship it.
 */
export function useApiErrorMessage() {
  const t = useTranslations('errors') as unknown as CodeTranslator;
  const tCommon = useTranslations('common');

  return useCallback(
    (error: unknown, fallback?: string): string => {
      const apiError = error as Partial<ApiError> | null | undefined;
      const code = apiError?.code;

      if (code === 'validation.failed' && apiError?.issues?.length) {
        const detail = translateValidationIssues(apiError.issues, t);
        if (detail) return detail;
      }

      if (code && t.has(code)) {
        return t(code, apiError?.params);
      }

      return apiError?.message || fallback || tCommon('unknownError');
    },
    [t, tCommon],
  );
}
