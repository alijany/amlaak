###################
# Builder stage
###################
ARG PROJECT_NAME=app
FROM ${PROJECT_NAME}-base:dependencies AS builder
WORKDIR /app

COPY pnpm-workspace.yaml package.json ./
COPY apps/pwa ./apps/pwa

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID

ENV NEXT_TELEMETRY_DISABLED=1
ARG PROJECT_NAME
RUN --mount=type=cache,id=${PROJECT_NAME}-nextjs,target=/app/apps/pwa/.next/cache \
    pnpm --filter pwa build

###################
# Production runtime stage
###################
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --chown=node:node --from=builder /app/apps/pwa/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/pwa/.next/static ./apps/pwa/.next/static
COPY --chown=node:node --from=builder /app/apps/pwa/public ./apps/pwa/public

USER node
WORKDIR /app/apps/pwa/
EXPOSE 8000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
