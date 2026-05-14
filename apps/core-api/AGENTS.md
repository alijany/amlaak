# Core API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

The Core API is the backend service for the platform, built with NestJS framework. It provides RESTful APIs for donation management, user authentication, payment processing, and notification services.

## Architecture Overview

This API follows a modular architecture with each feature isolated in its own module. The design enables easy scaling and potential migration to microservices in the future.

### Key Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Donation Management**: Campaign creation, tracking, and reporting
- **Payment Integration**: Secure payment processing with Jibit gateway
- **Notification System**: Multi-channel notifications (SMS, Email, Push)
- **User Management**: Comprehensive user profiles and account management
- **Digital Wallet**: Transaction tracking and donation history
- **File Storage**: AWS S3 integration for documents and media
- **URL Shortening**: Campaign link management

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with MikroORM
- **Cache/Queue**: Redis with Bull Queue
- **Authentication**: Passport.js with JWT
- **File Storage**: AWS S3
- **Payment**: Jibit Payment Gateway
- **Testing**: Jest, Playwright

## Module Structure

### Core-API Module Structure

Each module in the core-api follows NestJS conventions and includes:
- **`[module].controller.ts`**: Handles HTTP requests and API endpoints
- **`[module].service.ts`**: Contains business logic and data processing
- **`[module].entity.ts`**: Database entity definitions using MikroORM
- **`[module].module.ts`**: Module definition and dependency injection
- **`dtos/`**: Data Transfer Objects for request/response validation
- **Custom folders**: Additional folders like `providers/`, `strategies/`, `channels/`, etc., based on specific module requirements (e.g., authentication strategies, notification channels)

### Core Modules

- **`auth/`**: Authentication and authorization
  - OTP-based phone number authentication
  - JWT token management
  - Role-based access control
  - [Read more](src/auth/README.md)

- **`donation/`**: Donation management
  - Responsibilities: creating and managing donation campaigns, handling donation claims, currency/exchange flows, retrying failed donations, and exposing donation-related endpoints.
  - See `src/donation/README.md` for implementation details and examples.

- **`payment/`**: Payment processing
  - Jibit payment gateway integration
  - Transaction security and validation
  - Payment status tracking and webhooks
  - [Read more](src/payment/README.md)

- **`notification/`**: Multi-channel notifications
  - SMS notifications via third-party providers
  - Email notification templates
  - Push notification support
  - Notification channels and preferences
  - [Read more](src/notification/README.md)

- **`user/`**: User management
  - User registration and profile management
  - Account verification and validation
  - User preferences and settings

- **`wallet/`**: Digital wallet functionality
  - Responsibilities: managing user wallets, recording wallet transactions, processing withdrawal requests, and exposing wallet-related endpoints.
  - Features: transaction history, donation tracking, balance management, withdrawal request lifecycle (create/approve/reject), and API endpoints for client integrations.

### Supporting Modules

- **`storage/`**: File storage management (S3 integration)
- **`shortlink/`**: URL shortening for campaign links  
- **`sms/`**: SMS service integration
- **`roles/`**: Role-based permission management
- **`transaction/`**: Financial transaction tracking
- **`events/`**: Event-driven system notifications
- **`contact-message/`**: Contact form handling

### Shared Libraries (`libs/`)

The core-api includes a `libs/` directory that contains shared code and utilities used across multiple modules:

These shared libraries provide:
- **ORM Utilities**: Common database operations, base entities, and migration tools using MikroORM
- **Date Utilities**: Date formatting and manipulation functions
- **Duration Utilities**: Duration parsing and calculation utilities
- **General Utils**: Common utility functions like number normalization pipes

## Environment Variables

Create a `.env` file in the root directory based on the `.env.example` template.

## Tooling and commands

- Use Node 20+ with pnpm via corepack; install deps with `pnpm install` (do not cancel).
- Build and lint: `pnpm --filter core-api build`, `pnpm --filter core-api lint`.
- Tests: `pnpm --filter core-api test` and `test:e2e` are currently unstable; prefer lint/build plus manual checks.

## Running the app

```bash
# development
$ pnpm run start

# watch mode (recommended for development)
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Database Operations

The project centralizes database helpers in `src/libs/orm/`. These are small, composable building blocks used across modules:

- `orm.entity.base.ts` — base entity classes and shared entity-level helpers (common fields, soft-delete/timestamps, helpers).
- `orm.provider.base.ts` — dependency-injection providers that expose MikroORM connections/entity managers to services.
- `orm.service.base.ts` — a reusable ORM service with common CRUD and transaction helpers used by repositories/services.
- `orm.service.migration.ts` — migration-focused service for generating and running migrations programmatically.
- `orm.types.factory.ts` — factory helpers for mapping and reusing DB/TypeScript types across entities and migrations.

Usage note: extend the base entity types in your entities and import the provided ORM services/providers in module files. For migrations, use the migration service in `src/libs/orm/` or the repository's migration scripts (see `package.json`) to generate and run migrations.


## Testing

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov

# watch mode for development
$ pnpm run test:watch
```

## API Documentation

The API follows RESTful conventions with the following base structure:

- **Base URL**: `http://localhost:4000/api/v1`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Development Guidelines

### File Naming Conventions

#### General Guidelines

- Use lowercase letters for file and directory names.
- Use dots (`.`) to separate words in file names.
- Use descriptive and meaningful names that reflect the purpose of the file or directory.

#### File Extensions

- Use the `.spec.ts` or `.test.ts` extension for test files.
- Use the `.d.ts` extension for TypeScript declaration files.
- Use the `.config.ts` or `.config.js` extension for configuration files.
- Use the `.interface.ts` extension for interface files.
- Use the `.type.ts` extension for type definition files.
- Use the `.dto.ts` extension for Data Transfer Object files.
- Use the `.entity.ts` extension for entity files representing database models.
- Use the `.controller.ts`, `.service.ts`, `.middleware.ts`, and `.repository.ts` extensions for respective architectural components.

#### Prefixes

- Use prefixes to group related files and indicate their purpose or scope.
- Use the `[feature].` prefix for files related to specific features or modules within the project.

#### Index Files

- Use `index.ts` as the entry point file for a directory or module.

### Code Organization

- Each module should be self-contained
- Use DTOs for request/response validation
- Implement proper error handling with custom exceptions
- Follow dependency injection patterns
- Use guards for authentication and authorization

### Error Handling

#### Exception Hierarchy

- **Custom Exceptions**: Create a hierarchy of custom exceptions for application-specific errors.
- **Base Exception**: Extend a base `HttpException` class to maintain consistency.

#### Throwing Standard Exceptions

- Use built-in `HttpException` class for common HTTP errors.
- Include appropriate `statusCode` and `message` properties.

#### Custom Exceptions Example

```typescript
// src/errors/forbidden.exception.ts
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}
```

#### Exception Filters

- Implement global exception filters to handle unhandled exceptions.
- Customize responses and logging as needed.

## Contributing

Please read the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on contributing to this project.
