FROM node:23-slim AS base

# Environment setup - CI=true speeds up pnpm installs
ENV PNPM_HOME="/pnpm" 
ENV PATH="$PNPM_HOME:$PATH" 
ENV CI=true

# Install system dependencies and dumb-init in a single layer
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

WORKDIR /app

###################
# Dependencies stage - install ALL workspace dependencies
###################
FROM base AS dependencies

# Copy workspace configuration and ALL package.json files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/core-api/package.json apps/core-api/
COPY apps/pwa/package.json apps/pwa/

# Install all dependencies with cache mount
# This creates the proper pnpm workspace structure with symlinks
ARG PROJECT_NAME
RUN --mount=type=cache,id=${PROJECT_NAME}-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# The node_modules will contain:
# - Root node_modules with workspace-level packages
# - apps/core-api/node_modules with symlinks to workspace packages
# - apps/pwa/node_modules with symlinks to workspace packages
