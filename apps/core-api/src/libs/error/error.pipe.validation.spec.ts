import type { ValidationError } from 'class-validator';
import {
  toValidationIssues,
  validationExceptionFactory,
} from './error.pipe.validation';

describe('localized validation error contract', () => {
  const errors: ValidationError[] = [
    {
      property: 'firstName',
      constraints: {
        isString: 'firstName must be a string',
        maxLength: 'firstName is too long',
      },
      children: [],
    },
    {
      property: 'contacts',
      children: [
        {
          property: '0',
          children: [
            {
              property: 'phone',
              constraints: { isString: 'phone must be a string' },
              children: [],
            },
          ],
        },
      ],
    },
  ];

  it('preserves fields and validator rules, including nested DTO paths', () => {
    expect(toValidationIssues(errors)).toEqual([
      { field: 'firstName', rules: ['isString', 'maxLength'] },
      { field: 'contacts.0.phone', rules: ['isString'] },
    ]);
  });

  it('returns a stable machine-readable refusal body', () => {
    expect(validationExceptionFactory(errors).getResponse()).toEqual({
      code: 'validation.failed',
      message: 'Validation failed.',
      issues: [
        { field: 'firstName', rules: ['isString', 'maxLength'] },
        { field: 'contacts.0.phone', rules: ['isString'] },
      ],
    });
  });
});
