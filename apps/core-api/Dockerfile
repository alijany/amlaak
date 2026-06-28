###################
# Builder stage
###################
ARG PROJECT_NAME=app
FROM ${PROJECT_NAME}-base:dependencies AS builder
WORKDIR /app

COPY pnpm-workspace.yaml package.json ./
COPY apps/core-api ./apps/core-api

RUN pnpm --filter core-api build

###################
# Production deps stage
###################
ARG PROJECT_NAME
FROM ${PROJECT_NAME}-base:dependencies AS prod-deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/core-api/package.json apps/core-api/

ARG PROJECT_NAME
RUN --mount=type=cache,id=${PROJECT_NAME}-pnpm,target=/pnpm/store \
    pnpm --filter core-api --prod deploy /prod/core-api

###################
# Production runtime stage
###################
FROM node:22-alpine AS core-api
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
WORKDIR /prod/core-api

COPY --chown=node:node --from=prod-deps /prod/core-api/node_modules ./node_modules
COPY --chown=node:node --from=prod-deps /prod/core-api/package.json ./package.json
COPY --chown=node:node --from=builder /app/apps/core-api/dist ./

# Copy city data files
COPY --chown=node:node --from=builder /app/apps/core-api/src/city/data/ ./src/city/data/

USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/main.js"]
