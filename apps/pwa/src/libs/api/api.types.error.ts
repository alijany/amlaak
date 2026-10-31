/**
 * Values the API sends to interpolate into an `errors.*` catalog entry — the
 * counterpart of `ErrorParams` in `core-api`'s `libs/error/`. Never a rendered
 * sentence: the sentence is what the catalog owns.
 */
export type ErrorParams = Record<string, string | number>;

export interface ValidationIssue {
  /** DTO property path; nested inputs use dots, for example items.0.name. */
  field: string;
  /** Stable class-validator constraint names, never rendered backend copy. */
  rules: string[];
}

export class ApiError extends Error {
  status?: number;
  /**
   * Dot-delimited `domain.subject.reason` naming *why* the API refused, so the
   * display layer can render it in the reader's language. Absent on a throw
   * site the backend has not migrated yet — `message` is the fallback then.
   */
  code?: string;
  params?: ErrorParams;
  issues?: ValidationIssue[];
  info?: {
    message: string;
    [key: string]: unknown;
  };
}
