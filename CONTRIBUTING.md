# Contributing to the platform

We welcome contributions to the platform! This document provides guidelines for contributing to the project, including development setup, coding standards, testing guidelines, and more. By following these guidelines, you can help us maintain a high-quality codebase and ensure a smooth development process.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Branch Strategy](#branch-strategy)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Remember we're all working toward helping children with cancer

## Getting Started

### Prerequisites

- Node.js (LTS version)
- pnpm package manager
- Docker and Docker Compose
- Git
- Basic knowledge of TypeScript, NestJS, and Next.js

### Development Setup

1. **Fork the repository**
   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/PROJECT_NAME.git
   cd PROJECT_NAME
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   # Set up backend environment
   cp apps/core-api/.env.example apps/core-api/.env
   
   # Set up frontend environment
   cp apps/pwa/.env.example apps/pwa/.env.local
   
   # Edit .env files with your local configuration
   ```

4. **Start backend (core API):**
   ```bash
   pnpm --filter core-api start:dev
   ```

5. **Start frontend (in a second terminal):**
   ```bash
   pnpm --filter pwa dev
   ```

### Developing inside the Dev Container

We provide a VS Code Dev Container (and GitHub Codespaces compatibility) so contributors can onboard fast without installing local runtimes. It defines a reproducible Linux environment with all required toolchains and backing services.

#### What Is a Dev Container?
A Dev Container is a Docker-based environment configuration. VS Code builds it and then attaches your editor session inside the container—ensuring everyone uses the same Node version, pnpm, OS packages, and service dependencies (like PostgreSQL & Redis) with zero host pollution.

#### Prerequisites (if NOT using Codespaces)
- Docker Engine / Docker Desktop running
- VS Code + Dev Containers extension (`ms-vscode-remote.remote-containers`)
- Git (to clone & branch)

You do NOT need to install: Node.js, pnpm, PostgreSQL, or Redis locally when working inside the Dev Container.

#### What's Included Inside the Container
- Node.js (project-supported version) & pnpm
- Git + ESLint + formatting/lint tooling
- PostgreSQL (development DB)
- Redis (cache + Bull/BullMQ queues)
- Any extra CLI utilities defined in the Dockerfile / config

PostgreSQL and Redis are started for you; the backend service can connect directly using default ports (or service hostnames, depending on compose layering).

#### Quick Start
1. Clone (If using windows, use WSL for best compatibility):
   ```bash
   git clone https://github.com/YOUR_USERNAME/PROJECT_NAME.git
   cd PROJECT_NAME
   ```
2. Copy env file in `.devcontainer` folder (do this BEFORE starting services):
   ```bash
   cd .devcontainer
   cp .env.example .env
   # adjust values as needed
   ```
3. Open folder in VS Code. When prompted, click "Reopen in Container" (or use Command Palette → `Dev Containers: Reopen in Container`).
4. Install workspace dependencies (usually auto-run, run manually if needed):
   ```bash
   pnpm install
   ```
5. Set up environment files for each service:
   ```bash
   # Set up backend environment
   cp apps/core-api/.env.example apps/core-api/.env
   
   # Set up frontend environment  
   cp apps/pwa/.env.example apps/pwa/.env.local
   ```
6. Start backend (core API):
   ```bash
   pnpm --filter core-api start:dev
   ```
7. Start frontend (in a second terminal):
   ```bash
   pnpm --filter pwa dev
   ```
8. Open the printed URLs in your browser.

#### Services & Ports (Defaults)
- PostgreSQL: 5432 (forward if you want external client access)
- Redis: 6379
Port forwarding can be configured via VS Code Ports view if you need host access, otherwise services remain internal.

#### Common Commands (Inside Container)
```bash
pnpm install                 # Install deps
pnpm --filter core-api start:dev   # Backend dev server
pnpm --filter pwa dev        # Frontend dev server
pnpm lint                    # Lint all packages
pnpm test                    # Run test suite
```

## Development Process

### Branch Strategy

We use a three-branch strategy:

- **`main`**: Production-ready stable code
- **`dev`**: Development branch for active development
- **`prd`**: Production staging branch

### Branch Naming Strategy

Use the format: `<type>/<short-description>` with lowercase letters, numbers, and hyphens only.

#### Branch Types

- **`feature/`** - New features: `feature/donation-tracking`
- **`fix/`** - Bug fixes: `fix/payment-validation-error`
- **`hotfix/`** - Critical production fixes (from `main`): `hotfix/security-vulnerability`
- **`refactor/`** - Code improvements: `refactor/donation-service-cleanup`
- **`docs/`** - Documentation: `docs/api-documentation`
- **`chore/`** - Maintenance: `chore/update-dependencies`
- **`test/`** - Testing: `test/donation-api-coverage`

#### Guidelines

- Be descriptive but concise (max 50 characters)
- Use hyphens, not underscores or spaces
- Include issue numbers: `feature/123-add-donation-goals`
- Use present tense verbs: `add`, `fix`, `update`, `remove`

#### Creating Branches

```bash
git checkout dev && git pull origin dev
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name
```

### Workflow

1. Create feature branches from `dev`
2. Develop and test your changes
3. Submit PR to `dev` branch
4. After review and approval, changes are merged
5. Periodic releases move from `dev` → `main` → `prd`

## Coding Standards

### General Guidelines

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Write self-documenting code with clear variable names
- Add comments for complex business logic
- Keep functions small and focused on single responsibilities


### ESLint

We use ESLint for code quality and formatting:

```bash
# Run linting
pnpm run lint

# Fix lint issues automatically
pnpm run lint:fix

```

## Testing Guidelines

### Testing Requirements

- Write unit tests for all services and utilities
- Add integration tests for API endpoints
- Include E2E tests for critical user flows
- Maintain minimum 80% code coverage

### Running Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode during development
pnpm run test:watch
```

### Testing Structure

```typescript
// Example unit test
describe('DonationService', () => {
  let service: DonationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonationService],
    }).compile();

    service = module.get<DonationService>(DonationService);
  });

  it('should create donation campaign', async () => {
    const createDto = { /* test data */ };
    const result = await service.create(createDto);
    expect(result).toBeDefined();
  });
});
```

## Commit Message Guidelines

We follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no code changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(donation): add campaign goal tracking functionality

- Add goal amount field to donation entity
- Implement progress calculation service
- Update donation API endpoints

Closes #123

fix(auth): resolve JWT token expiration issue

- Extend token validity period
- Add token refresh mechanism
- Update authentication middleware

chore(deps): update NestJS dependencies to latest version
```

## Pull Request Process

### Before Submitting

1. **Test your changes**
   ```bash
   pnpm run test
   pnpm run test:e2e
   pnpm run lint
   ```

2. **Update documentation** if needed

3. **Rebase on latest dev branch**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout your-feature-branch
   git rebase dev
   ```

### PR Requirements

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] PR description explains the changes
- [ ] Related issue referenced (if applicable)
- [ ] No merge conflicts with target branch

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Closes #[issue number]

## Screenshots (if applicable)
Add screenshots to help explain your changes.
```

## Issue Reporting

We use structured GitHub Issue Forms to streamline triage. When opening a new issue, select the template that best fits:

Template Types
- 🐞 Bug Report – Reproducible defects or regressions
- ✨ Feature Request – New capabilities aligned with the mission
- 🛠 Improvement / Refactor – Code quality, performance, DX improvements
- 📝 Documentation Update – README / guides / inline docs corrections
- ❓ Question – Targeted, answerable questions (use Discussions for open-ended topics)

General Guidelines
- Search existing issues & discussions before filing
- One focused issue per ticket
- Provide minimal reproducible examples for bugs
- Clearly state user/business value for features
- Mark breaking changes and migration needs

Security
- DO NOT file public issues for vulnerabilities—use the private security contact listed in the issue chooser.

Triage Process
1. New issues get `needs-triage`
2. Maintainers classify (add labels: `bug`, `enhancement`, `refactor`, `documentation`, etc.)
3. Priority assigned (`p0`, `p1`, `p2`) where applicable
4. Milestone set (optional) and assignee added when work is accepted

Good Bug Report Includes
- Summary (1 line)
- Steps to reproduce (numbered, minimal)
- Expected vs Actual
- Environment (OS, Browser, Node, Docker, DB)
- Relevant logs / stack trace

Good Feature Request Includes
- Problem / motivation (why)
- Proposed solution (how)
- Alternatives considered
- Risks / impact (performance, security, migrations)

Refactors / Improvements Should Cover
- Current pain or limitation
- Proposed structural change
- Expected benefits (quantify where possible)

Documentation Updates Should Include
- Location(s) (file + section)
- Suggested wording or outline

Questions
- Keep them specific. If it's exploratory or architectural, open a Discussion instead.

Automated templates already prompt you for the required fields—follow them thoroughly for fastest resolution.

## Architecture Guidelines

### Backend (Core-API)

- Use NestJS modules for feature organization
- Implement proper dependency injection
- Follow repository pattern for data access
- Use DTOs for request/response validation
- Implement proper error handling with custom exceptions

### Frontend (PWA)

- Use Next.js App Router for routing
- Implement responsive design with Tailwind CSS
- Use React hooks for state management
- Optimize for performance and accessibility
- Ensure PWA capabilities are maintained

### Database

- Use MikroORM for type-safe database operations
- Write migrations for schema changes
- Follow proper indexing strategies
- Maintain data integrity with constraints

## Security Guidelines

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security best practices
- Use HTTPS in production
- Implement rate limiting for APIs

## Performance Guidelines

- Optimize database queries
- Use caching where appropriate (Redis)
- Implement pagination for large datasets
- Optimize images and static assets
- Monitor application performance

## Documentation

- Update README files for significant changes
- Document API endpoints with proper examples
- Add inline comments for complex business logic
- Keep architecture documentation current
- Update deployment guides when needed

## Getting Help

- Check existing documentation first
- Search existing issues and discussions
- Create a new issue with detailed information
- Join our development discussions
- Contact maintainers for urgent matters

## Recognition

We appreciate all contributors! Contributors will be:
- Added to our contributors list
- Recognized in release notes for significant contributions
- Invited to contribute to project roadmap discussions

Thank you for helping us support children with cancer through technology! 🎗️

---

*This contributing guide is subject to updates. Please check back regularly for the latest guidelines.*
