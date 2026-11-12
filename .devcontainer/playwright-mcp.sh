#!/usr/bin/env bash
set -euo pipefail

# Launch the Playwright MCP server against the Chromium already baked into this
# image, never a freshly downloaded one.
#
# Why a wrapper at all: `.mcp.json` sets PLAYWRIGHT_BROWSERS_PATH, but that only
# reaches the server when the client honours the `env` block, and not every
# agent harness in this repository reads `.mcp.json`. When the variable is
# missing, Playwright resolves the default user cache instead —
# `/home/node/.cache/ms-playwright/chromium-<rev>/chrome-linux64/chrome` — finds
# nothing there, and downloads a second copy into the runtime user's home. This
# script makes the location independent of the caller's environment.
#
# It selects the revision @playwright/mcp itself pins, read from its own nested
# playwright-core, rather than whatever happens to be newest under the shared
# path. The image can hold several builds at once (an upgrade leaves the old one
# behind), and Playwright resolves a browser by that pinned build number — so
# "newest wins" would quietly hand the server a mismatched binary after an
# upgrade, where naming the expected revision fails immediately and says which
# one to install.

browser_root="${PLAYWRIGHT_BROWSERS_PATH:-/ms-playwright}"
export PLAYWRIGHT_BROWSERS_PATH="$browser_root"

# Ask the installed MCP which Chromium build it expects.
revision="$(node -e '
const fs = require("node:fs"), path = require("node:path");
const pkgDir = path.dirname(fs.realpathSync(process.argv[1]));
const manifest = path.join(pkgDir, "node_modules", "playwright-core", "browsers.json");
const chromium = JSON.parse(fs.readFileSync(manifest, "utf8")).browsers
  .find((b) => b.name === "chromium");
process.stdout.write(String(chromium.revision));
' "$(command -v playwright-mcp)" 2>/dev/null || true)"

if [[ -z "$revision" ]]; then
  echo "playwright-mcp.sh: could not read the Chromium revision @playwright/mcp pins." >&2
  exit 1
fi

browser_executable="$browser_root/chromium-$revision/chrome-linux64/chrome"

if [[ ! -x "$browser_executable" ]]; then
  echo "playwright-mcp.sh: @playwright/mcp expects Chromium $revision, which is not installed at $browser_executable." >&2
  echo "Rebuild the devcontainer so the image bakes the matching build (see .devcontainer/Dockerfile)." >&2
  exit 1
fi

exec playwright-mcp --browser chromium --executable-path "$browser_executable" "$@"
