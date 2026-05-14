###################
# Builder stage
###################
# set defaul value
ARG PROJECT_NAME = app
FROM ${PROJECT_NAME}-base:dependencies AS builder
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./

# Copy source files needed for build
COPY apps/core-api ./apps/core-api

# Build the application
RUN pnpm --filter core-api build

###################
# Production deps stage - only production dependencies
###################
ARG PROJECT_NAME
FROM ${PROJECT_NAME}-base AS prod-deps
WORKDIR /app

# Copy workspace config and package files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/core-api/package.json apps/core-api/

# Install only production dependencies for core-api with cache mount
ARG PROJECT_NAME
RUN --mount=type=cache,id=${PROJECT_NAME}-pnpm,target=/pnpm/store \
    pnpm --filter core-api --prod deploy /prod/core-api

###################
# Production runtime stage
###################
ARG PROJECT_NAME
FROM ${PROJECT_NAME}-base AS core-api
ENV NODE_ENV=production
WORKDIR /prod/core-api

# Copy production dependencies from dedicated stage
COPY --chown=node:node --from=prod-deps /prod/core-api/node_modules ./node_modules
COPY --chown=node:node --from=prod-deps /prod/core-api/package.json ./package.json

# Copy build artifacts (includes compiled migrations in dist/migrations)
COPY --chown=node:node --from=builder /app/apps/core-api/dist ./

USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/main.js"]
