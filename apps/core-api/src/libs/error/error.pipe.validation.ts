import {
  BadRequestException,
  ValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { NormalizeNumbersPipe } from '../utils/pipe.normalizeNumbers';

export interface ValidationIssue {
  field: string;
  rules: string[];
}

/**
 * Keeps class-validator's useful field/rule detail without sending a rendered
 * sentence whose language the API cannot know. Nested DTOs use dotted paths so
 * the client can still identify the failing input.
 */
export function toValidationIssues(
  errors: ValidationError[],
  parent = '',
): ValidationIssue[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const ownIssue = error.constraints
      ? [{ field, rules: Object.keys(error.constraints) }]
      : [];

    return [...ownIssue, ...toValidationIssues(error.children ?? [], field)];
  });
}

export function validationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    code: 'validation.failed',
    message: 'Validation failed.',
    issues: toValidationIssues(errors),
  });
}

/** Shared validation pipe: every HTTP DTO must expose the same error shape. */
export function createValidationPipe(
  options: ValidationPipeOptions = {},
): ValidationPipe {
  return new ValidationPipe({
    ...options,
    exceptionFactory: validationExceptionFactory,
  });
}

/**
 * What human-typed input goes through, in the only order that works.
 *
 * Nest applies global, controller and route pipes *before* parameter pipes
 * (`pipes.concat(paramPipes)` in `router-execution-context`). So a class-level
 * `@UsePipes(createValidationPipe())` runs ahead of a parameter-level
 * `@Body(NormalizeNumbersPipe)`, and someone typing a code as `۱۲۳۴` is refused
 * for a format the very next pipe was about to fix. Keeping both on the
 * parameter is what keeps them in order:
 *
 * ```ts
 * create(@Body(...formPipes) dto: CreateThingDto) {}
 * ```
 *
 * A controller that uses this must not also carry a class-level validation
 * pipe — that pipe would run first and re-introduce the same inversion. Use
 * {@link validationPipes} for its other parameters instead.
 */
export const formPipes = [
  NormalizeNumbersPipe,
  createValidationPipe({ transform: true, whitelist: true }),
];

/**
 * Validated and coerced, never numeral-normalised.
 *
 * For query strings — machine-built filters, where `@Type(() => Number)`
 * already coerces the digits that matter — and for a body that carries a
 * document rather than a form, whose own literals must arrive byte-for-byte.
 */
export const validationPipes = [
  createValidationPipe({ transform: true, whitelist: true }),
];
