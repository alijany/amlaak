FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN apk add --no-cache dumb-init \
    && corepack enable \
    && corepack prepare pnpm@9.14.4 --activate

WORKDIR /app

###################
# Dependencies stage - install ALL workspace dependencies
###################
FROM base AS dependencies

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/core-api/package.json apps/core-api/
COPY apps/pwa/package.json apps/pwa/

ARG PROJECT_NAME
RUN --mount=type=cache,id=${PROJECT_NAME}-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
