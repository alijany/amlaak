import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Interpolation values for the client's catalog entry — never a rendered
 * sentence. `{ megabytes: 5 }` travels; "must be under 5 MB" does not, because
 * the client is what knows which language to render it in.
 */
export type ErrorParams = Record<string, string | number>;

/**
 * The wire shape every coded failure produces.
 *
 * `message` is English and required. It is what a non-PWA consumer and an
 * operator reading logs see, and keeping it is what lets a throw site that has
 * no code yet still say something useful.
 */
export interface CodedErrorBody {
  statusCode: number;
  code: string;
  params?: ErrorParams;
  message: string;
}

/**
 * An `HttpException` that also names *why* it was thrown, so the client can
 * translate it.
 *
 * `code` is dot-delimited `domain.subject.reason`, snake_case in the final
 * segment, and matches a key under `errors.*` in the PWA's message catalog.
 * Adding a new backend failure means adding one catalog key — not editing
 * backend copy, and not negotiating a language on the request.
 */
export class CodedHttpException extends HttpException {
  constructor(
    readonly code: string,
    message: string,
    status: HttpStatus,
    readonly params?: ErrorParams,
  ) {
    const body: CodedErrorBody = { statusCode: status, code, message };
    if (params) body.params = params;
    super(body, status);
  }
}

/**
 * Per-status subclasses mirroring Nest's own exception family, so coding a
 * throw site is a rename plus a code rather than a restructure.
 */
export class CodedBadRequestException extends CodedHttpException {
  constructor(code: string, message: string, params?: ErrorParams) {
    super(code, message, HttpStatus.BAD_REQUEST, params);
  }
}

export class CodedUnauthorizedException extends CodedHttpException {
  constructor(code: string, message: string, params?: ErrorParams) {
    super(code, message, HttpStatus.UNAUTHORIZED, params);
  }
}

export class CodedNotFoundException extends CodedHttpException {
  constructor(code: string, message: string, params?: ErrorParams) {
    super(code, message, HttpStatus.NOT_FOUND, params);
  }
}

export class CodedConflictException extends CodedHttpException {
  constructor(code: string, message: string, params?: ErrorParams) {
    super(code, message, HttpStatus.CONFLICT, params);
  }
}

export class CodedInternalServerErrorException extends CodedHttpException {
  constructor(code: string, message: string, params?: ErrorParams) {
    super(code, message, HttpStatus.INTERNAL_SERVER_ERROR, params);
  }
}
