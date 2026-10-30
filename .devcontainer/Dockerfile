FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm install -g <your-package-list-here>"

# Playwright MCP server (see ../.mcp.json) — the default browser for agents to
# drive apps/pwa during manual QA. Chromium + its OS deps are baked in here so
# the `playwright-mcp` global bin (installed below) runs fully offline —
# `npx @playwright/mcp` would still be a registry lookup since the bin name
# doesn't match the package name, so .mcp.json invokes `playwright-mcp`
# directly. Browsers go to a shared, world-readable path since this RUN
# executes as root but the container runs as "node".
#
# The browser download MUST run through @playwright/mcp's own nested playwright
# CLI: it pins a playwright-core prerelease whose expected chromium build differs
# from what a top-level `playwright@latest` would fetch, and the server resolves
# the executable by its own pinned build number, not by whatever is present.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npm install -g @playwright/mcp@latest \
    && "$(npm root -g)/@playwright/mcp/node_modules/.bin/playwright" install --with-deps chromium \
    && chmod -R o+rx /ms-playwright
