import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Normalises every `HttpException` body and stamps the one code Nest itself
 * produces.
 *
 * Scoped to `HttpException` on purpose: an unexpected throw stays with Nest's
 * default handler, which already logs it and answers a bare 500. Catching
 * everything here would mean re-implementing that logging to keep it.
 */
@Catch(HttpException)
export class CodedExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    const body: Record<string, unknown> =
      typeof payload === 'string'
        ? { statusCode: status, message: payload }
        : { statusCode: status, ...(payload as Record<string, unknown>) };

    // Compatibility for any route that has not adopted `createValidationPipe`.
    // New validation errors already carry `code` plus structured `issues`.
    if (!body.code && Array.isArray(body.message)) {
      body.code = 'validation.failed';
    }

    response.status(status).json(body);
  }
}
