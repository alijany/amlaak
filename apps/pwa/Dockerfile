###################
# Builder stage
###################
ARG PROJECT_NAME = app
FROM ${PROJECT_NAME}-base:dependencies AS builder
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./

# Copy source files needed for build
COPY apps/pwa ./apps/pwa

# Build arguments for Next.js public environment variables
# These must be set at build time to be embedded in the client bundle
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ARG NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS

# Build with Next.js standalone output and cache mount
ENV NEXT_TELEMETRY_DISABLED=1
ARG PROJECT_NAME
RUN --mount=type=cache,id=${PROJECT_NAME}-nextjs,target=/app/apps/pwa/.next/cache \
    pnpm --filter pwa build

###################
# Production runtime stage
###################
ARG PROJECT_NAME
FROM ${PROJECT_NAME}-base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy Next.js standalone build and static assets
COPY --from=builder /app/apps/pwa/.next/standalone ./
COPY --from=builder /app/apps/pwa/.next/static ./apps/pwa/.next/static
COPY --from=builder /app/apps/pwa/public ./apps/pwa/public

USER node
WORKDIR /app/apps/pwa/
EXPOSE 8000

CMD ["node", "server.js"]
