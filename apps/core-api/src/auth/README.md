# Authentication Module

The Authentication module provides comprehensive authentication and authorization functionality. It implements JWT-based authentication with OTP (One-Time Password) verification, refresh token functionality, and role-based access control.

## Overview

The authentication system uses a **dual token architecture** for enhanced security:
- **Access tokens**: Short-lived (15 minutes) for API authorization
- **Refresh tokens**: Long-lived (30 days) for automatic token renewal

## Architecture

### Token Management
- **Access tokens** are stored in localStorage and sent via Authorization header
- **Refresh tokens** are stored in httpOnly cookies for security
- **Automatic rotation**: new refresh tokens are issued on each refresh request
- **Stateless design**: no database persistence required for token management

The authentication system is designed to provide secure, user-friendly access to the platform through:
- OTP-based phone number authentication (passwordless login)
- JWT token-based session management
- Role-based access control with admin privileges
- Secure user registration and profile management

## Architecture

### Core Components

#### Controller (`auth.controller.ts`)
Handles HTTP requests for authentication-related operations:
- **`GET /auth/profile`**: Retrieves authenticated user profile
- **`POST /auth/otp/send`**: Sends OTP to user's phone number
- **`POST /auth/otp/verify`**: Verifies OTP and returns JWT token

#### Service (`auth.service.ts`)
Contains the business logic for authentication operations:
- **OTP Management**: Generation, storage, and validation of OTPs
- **JWT Token Management**: Creation and validation of JWT tokens
- **User Authentication**: Phone number validation and user creation
- **Role Management**: Handling user roles and permissions

#### Module (`auth.module.ts`)
Configures the authentication module with necessary dependencies and providers.

## Features

### 1. OTP Authentication Flow

The system uses a passwordless authentication approach with SMS-based OTP verification:

1. **Send OTP** (`/auth/otp/send`)
   - Validates phone number format (Iranian format)
   - Generates secure 4-digit OTP using crypto.randomInt
   - Stores OTP in Redis cache with 5-minute TTL
   - Sends OTP via SMS service

2. **Verify OTP** (`/auth/otp/verify`)
   - Validates phone number and OTP
   - Creates user account if doesn't exist
   - Assigns default USER role to new users
   - Accepts pending role invitations automatically
   - Returns JWT access token, refresh token and user profile
   - Supports optional device fingerprinting

### 2. JWT Token Management

- **Access Token Structure**: Contains user ID, phone number, and admin status
- **Refresh Token Structure**: Contains user ID, token type, and optional device ID
- **Security**: Signed using separate configurable secret keys
- **Dual Payload Types**: Access and refresh tokens with different structures

```typescript
interface JwtPayload {
  username: string;  // Phone number
  sub: string;       // User ID
  isAdmin: boolean;  // Admin role flag
  iat?: number;      // Issued at
  exp?: number;      // Expires at
}

interface RefreshJwtPayload {
  sub: string;           // User ID
  type: 'refresh';       // Token type identifier
  deviceId?: string;     // Optional device fingerprinting
  iat: number;          // Issued at
  exp: number;          // Expires at
}
```

### 3. Role-Based Access Control

The module integrates with the roles system to provide:
- **User Role**: Default role for regular users
- **Admin Role**: Administrative privileges
- **Role Guards**: Protect endpoints based on user roles
- **Invitation System**: Handle pending role invitations

### 4. Security Features

- **Cryptographically Secure OTP**: Uses `crypto.randomInt` for OTP generation
- **Phone Number Validation**: Uses `libphonenumber-js` for international phone validation
- **Password Hashing**: Uses bcrypt for password security (legacy support)
- **Cache-based OTP Storage**: Redis caching with automatic expiration
- **Input Validation**: Comprehensive DTO validation with class-validator

## Directory Structure

```
src/auth/
├── auth.controller.ts       # HTTP request handlers
├── auth.service.ts          # Business logic and authentication operations
├── auth.module.ts          # Module configuration
├── decorators/
│   ├── current-user.decorator.ts    # Extract current user from request
│   ├── public.decorator.ts          # Mark endpoints as public
│   └── roles.decorator.ts           # Role-based access control
├── dtos/
│   └── otp.dto.ts          # Data transfer objects for OTP operations
├── guards/
│   ├── jwt-auth.guard.ts   # JWT authentication guard
│   └── roles.guard.ts      # Role-based authorization guard
├── strategies/
│   ├── jwt.strategy.ts     # JWT passport strategy
│   └── local.strategy.ts   # Local authentication strategy
└── types/
    └── jwt-payload.interface.ts  # JWT payload type definitions
```

## Usage Examples

### Protecting Endpoints with Authentication

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/user.entity';

@Controller('protected')
export class ProtectedController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserEntity) {
    return { user };
  }
}
```

### Making Endpoints Public

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getPublicInfo() {
    return { message: 'This is public' };
  }
}
```

### Role-Based Protection

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../roles/roles.constants';

@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('dashboard')
  getAdminDashboard() {
    return { message: 'Admin only content' };
  }
}
```

## API Endpoints

### Send OTP
```http
POST /api/v1/auth/otp/send
Content-Type: application/json

{
  "phoneNumber": "+989123456789"
}
```

**Response:**
```json
{
  "message": "رمز یکبار مصرف با موفقیت ارسال شد."
}
```

### Verify OTP
```http
POST /api/v1/auth/otp/verify
Content-Type: application/json

{
  "phoneNumber": "+989123456789",
  "otp": "1234",
  "deviceId": "optional-device-fingerprint"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "phone": "+989123456789",
    "name": null,
    "isAdmin": false,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "deviceId": "optional-device-fingerprint"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "phone": "+989123456789",
    "name": null,
    "isAdmin": false,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Configuration

The authentication module requires the following environment variables:

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-separate-refresh-secret-key
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d

# Redis Configuration (for OTP storage)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional-password

# SMS Service Configuration
SMS_PROVIDER_API_KEY=your-sms-api-key
SMS_PROVIDER_URL=https://api.sms-provider.com
```

## Security Considerations

1. **OTP Security**:
   - 4-digit OTP with cryptographically secure generation
   - 5-minute expiration time
   - Single-use tokens (deleted after verification)

2. **JWT Security**:
   - Separate secrets for access and refresh tokens
   - Short-lived access tokens (15 minutes) reduce exposure window
   - Automatic token rotation on refresh
   - Stateless authentication without database overhead

3. **Refresh Token Security**:
   - Dedicated `JWT_REFRESH_SECRET` for signing refresh tokens
   - Optional device binding through `deviceId` claim
   - Automatic invalidation on token refresh

4. **Phone Number Validation**:
   - International format validation
   - Iranian phone number support
   - Consistent formatting across the system

5. **Input Validation**:
   - DTO-based request validation
   - Phone number format verification
   - OTP length and format checks

## Error Handling

The module provides comprehensive error handling with localized Persian messages:

- **Invalid Phone Number**: `فرمت شماره تلفن نامعتبر است.`
- **Invalid OTP**: `رمز یکبار مصرف نامعتبر است.`
- **Expired OTP**: `رمز یکبار مصرف منقضی شده یا یافت نشد.`
- **SMS Failure**: `ارسال رمز یکبار مصرف ناموفق بود.`
- **User Creation Error**: `پردازش حساب کاربری ناموفق بود.`

## Dependencies

- **@nestjs/jwt**: JWT token management
- **@nestjs/passport**: Authentication strategies
- **@nestjs/cache-manager**: OTP caching
- **bcrypt**: Password hashing (legacy support)
- **libphonenumber-js**: Phone number validation
- **class-validator**: Input validation
- **crypto**: Secure OTP generation

## Testing

The authentication module should be tested with:
- OTP generation and validation
- JWT token creation and verification
- Phone number validation
- Role-based access control
- Error handling scenarios

## Future Enhancements

Potential improvements for the authentication system:
- Multi-factor authentication (MFA)
- Social media login integration
- Biometric authentication support
- Session management and refresh tokens
- Rate limiting for OTP requests
- Audit logging for authentication events
