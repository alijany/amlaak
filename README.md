# Platform descriptions

<!-- TODO: Add platform descriptions -->

## Project Structure

This project uses a monorepo architecture with a NestJS backend service and Next.js frontend. While we used a standard NestJS project structure for our backend service, we tried to make each module isolated and independent to make it easier to migrate to a microservice structure in the future. The main project structure is a monorepo consisting of:
- **[PWA](apps/pwa/README.md)**: Next.js frontend Progressive Web Application
- **[Core-API](apps/core-api/README.md)**: NestJS backend service


## Terms and Definitions

- **Application (App)**: A collection of multiple services that together form the complete system.
- **Service**: An individual microservice, encapsulated within its own directory, responsible for specific functionality.
- **libs**: Shared code or functionality that can be used across multiple services.

### Monorepo Setup

- **Package Manager**: [pnpm](https://pnpm.io/) is used for efficient dependency management and workspace support.
- **Root Directory**: Contains centralized configuration files and shared dependencies.
  - **Files**:
    - `package.json`: Root dependencies and scripts for the workspace.
    - `pnpm-workspace.yaml`: Defines the workspace and included packages (`apps/*`).
    - `docker-compose.yml`: Docker services configuration including Traefik reverse proxy, PostgreSQL database, and Redis.
    - `init.sh`: Server setup and preparation script.
    - `README.md`: Project documentation.
    - `.drone.yml`: CI/CD pipeline configuration for Drone CI.
    - `reverse-proxy.conf`: Nginx reverse proxy configuration.

### Branch Strategy

The project follows a three-branch strategy:
- **`main`**: Stable production-ready code
- **`dev`**: Development branch for ongoing development and testing
- **`prd`**: Production release branch containing stable changes from main that are ready to be deployed

## Technology Stack

### Backend (Core-API)
- **Framework**: NestJS with TypeScript
  - **Advantages**: Scalable architecture, dependency injection, decorator-based development
  - **Configuration**: Modular structure with isolated business logic modules

- **Database**: PostgreSQL with MikroORM
  - **Advantages**: ACID compliance, complex queries, data integrity
  - **ORM**: MikroORM for type-safe database operations and migrations
  - **Connection**: Configured with connection pooling and health checks

- **Cache & Message Queue**: Redis
  - **Usage**: Session storage, caching, and Bull queue for background jobs
  - **Integration**: BullMQ for job processing and queue management

- **Authentication**: JWT-based authentication with Passport.js
  - **Strategy**: Local authentication with role-based access control

- **File Storage**: S3-compatible storage
  - **Development**: Local MinIO instance for development and testing
  - **Production**: AWS S3 or Arvan Cloud S3 integration with presigned URL support

- **Payment Integration**: Jibit Payment Gateway
  - **Purpose**: Facilitates secure online payments

### Frontend (PWA)
- **Framework**: Next.js 15 with React 19
  - **Features**: App Router, Server-Side Rendering, Progressive Web App capabilities
  - **Styling**: Tailwind CSS for responsive design

- **UI Components**: 
  - Headless UI for accessible components
  - Tabler Icons and Hugeicons for iconography
  - Embla Carousel for image carousels

- **Form Management**: React Hook Form with validation
- **Analytics**: Microsoft Clarity integration

### DevOps & Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Reverse Proxy**: Traefik for load balancing and SSL termination
- **Package Manager**: pnpm for efficient dependency management
- **Database Backup**: Automated PostgreSQL backup service
- **Object Storage**: MinIO for local development, S3-compatible storage for production

## CI / Drone

Drone CI is used for production builds and deploys. The pipeline is defined in `.drone.yml` at the repository root and is scoped to the `prd` branch. It sends Telegram notifications, builds a shared base image, builds and deploys the `pwa` and `core-api` services in parallel, and prunes unused images. For full details, secrets guidance, and troubleshooting steps see **[CI-DRONE.md](docs/CI-DRONE.md)**.

### Branch Management

- **`main`**: Production-ready stable code
- **`dev`**: Active development branch
- **`prd`**: Production release staging

### Testing Strategy

- **Unit Tests**: Jest for isolated component testing
- **Integration Tests**: E2E testing with database integration
- **API Testing**: Playwright for API endpoint testing

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
