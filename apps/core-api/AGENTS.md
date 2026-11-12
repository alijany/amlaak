# Core API

NestJS backend service providing RESTful APIs for authentication, user management, notifications, and file storage.

## Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with MikroORM
- **Cache/Queue**: Redis + BullMQ
- **Authentication**: Passport.js with JWT
- **File Storage**: AWS S3 SDK (RustFS for dev)

## Module Structure

Each feature follows this layout:

```
src/<feature>/
  <feature>.module.ts      NestJS module and DI wiring
  <feature>.controller.ts  HTTP request handlers
  <feature>.service.ts     business logic
  <feature>.entity.ts      MikroORM entity definition
  dtos/                    request/response validation DTOs
  # Optional sub-folders:
  providers/               custom providers
  strategies/              Passport strategies
  guards/                  auth/role guards
  channels/                notification delivery channels
```

### Core Modules

- **`auth/`**: OTP-based authentication, JWT token management, RBAC — [details](src/auth/README.md)
- **`user/`**: User registration, profile management, account verification
- **`notification/`**: Multi-channel notifications (SMS, Email, Push) — [details](src/notification/README.md)
- **`storage/`**: S3-compatible file storage with presigned URLs
- **`roles/`**: Role definitions and permission management
- **`sms/`**: SMS provider integration

### Shared Libraries (`src/libs/`)

- `error/`: coded exceptions, the global `CodedExceptionFilter`, and the
  `formPipes`/`validationPipes` validation lists — see Error Handling below.
- `i18n/`: backend locale constants and the SMS template catalog.
- `orm/`: persistence bases, below.

#### `src/libs/orm/`

Always extend these — never reimplement:

| File | Purpose |
|---|---|
| `orm.entity.base.ts` | Base entity: `id`, `createdAt`, `updatedAt`, soft-delete |
| `orm.provider.base.ts` | DI providers for MikroORM entity managers |
| `orm.repository.service.base.ts` | Reusable CRUD and transaction helpers |
| `orm.service.migration.ts` | Migration generation and execution |
| `orm.types.factory.ts` | Shared DB/TypeScript type helpers |

## Adding a New Module

1. Create `src/<feature>/` with the standard files
2. Define the entity extending `BaseEntity`:

```typescript
import { BaseEntity } from '@/libs/orm/orm.entity.base';

@Entity()
export class Item extends BaseEntity {
  @Property()
  name: string;
}
```

3. Create DTOs with `class-validator` decorators (no `message:` option) and bind
   them with `@Body(...formPipes)` / `@Query(...validationPipes)`
4. Implement service injecting `EntityManager` or extending the base repository service
5. Register the module in `src/app.module.ts`
6. Restart the dev server — `MigrationService` auto-generates and runs pending migrations on startup (non-prod only)

## File Naming Conventions

Pattern: `<feature>.<role>.ts`

```
user.service.ts
user.entity.ts
user.controller.ts
create-item.dto.ts
update-item.dto.ts
jwt-payload.interface.ts
notification-channel.type.ts
```

Test files: `<feature>.spec.ts` or `<feature>.test.ts`

## Error Handling

Every refusal a person can see carries a **code** the PWA translates; the API
never chooses the reader's language. Throw the per-status subclasses in
`src/libs/error/error.exception.coded.ts`:

```typescript
import { CodedNotFoundException } from 'src/libs/error/error.exception.coded';

throw new CodedNotFoundException(
  'item.not_found',           // domain.subject.reason — a key under errors.* in the PWA catalogs
  'Item not found',           // English, required: logs and non-PWA consumers
  { id },                     // optional interpolation values, never a sentence
);
```

Add the code to `apps/pwa/src/messages/fa.json`, then `en.json`. Validation goes
through `formPipes` (human-typed bodies: normalises Persian digits, then
validates) or `validationPipes` (queries and documents), applied per parameter —
never a class- or method-level `@UsePipes`, which runs before parameter pipes.
Both answer `code: "validation.failed"` with `issues: [{ field, rules }]`; a new
constraint key or user-visible field name goes under `errors.validation.*`.
Unexpected errors can stay plain `Error`s — the filter only reshapes
`HttpException`s. SMS copy lives in `src/libs/i18n/i18n.templates.sms.ts` with
both languages. See `docs/engine/localization.md` §"API errors".

## Code Organization

- Each module is self-contained — import only from `src/libs/` or other modules' exported services
- Use DTOs for all request/response boundaries
- Use `JwtAuthGuard` for authentication, `RolesGuard` for authorization
- Use `@Public()` on endpoints that skip JWT auth
- Use `@CurrentUser()` to access the authenticated user in controllers

## Commands

```bash
pnpm --filter core-api start:dev  # dev server with watch mode
pnpm --filter core-api build      # compile to dist/
pnpm --filter core-api lint       # ESLint check
```

Tests are currently unstable. Use `lint` as the normal verification loop; run a
focused test when relevant. Run `build` for build/runtime configuration changes
or when explicitly requested.

## API

- **Base URL**: `http://localhost:4000/api/v1`
- **Authentication**: `Authorization: Bearer <jwt-token>`
- **Content-Type**: `application/json`
