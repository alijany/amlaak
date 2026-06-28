# Custom Camoufox sidecar with GeoIP forced ON.
#
# Why this image exists
# ---------------------
# The stock `@askjo/camofox-browser` REST sidecar only enables Camoufox's geoip
# alignment when a proxy is configured (`geoip: !!launchProxy`) and, when there
# is NO proxy, it hard-codes a US fingerprint into every browser context:
#
#     contextOptions.locale      = 'en-US'
#     contextOptions.timezoneId  = 'America/Los_Angeles'
#     contextOptions.geolocation = { 37.7749, -122.4194 }   // San Francisco
#
# On a non-US residential IP (e.g. an Iranian connection) that makes the browser
# present "IP says Iran, but timezone/locale/WebRTC say California" — a glaring
# inconsistency that Google flags instantly with a /sorry/ "unusual traffic"
# block, even though the very same IP loads Google fine in a normal browser.
#
# The fix: build on the stock image and patch two lines so geoip is ALWAYS on.
# With `geoip: true` and no proxy, Camoufox derives locale/timezone/geolocation
# from the host's own public IP (your real exit IP) — so the fingerprint matches
# the connection and the block disappears. This mirrors the `geoip=True` recipe
# in this folder's original `main.py` example, but keeps the REST API the rest of
# the engine (gateway, parser, captcha, metrics) already depends on.
#
# Pin the base tag so the line patches below stay valid across rebuilds.
FROM ghcr.io/jo-inc/camofox-browser:1.11.2

# Patch 1: force geoip on at launch (was `geoip: !!launchProxy`). Two matches —
# the launchOptions() call and the launch log line — both made truthful.
# Patch 2: neutralize the hard-coded US locale/timezone/geo override so the
# geoip-derived values (from the real IP) actually take effect on each context.
RUN set -eux; \
    sed -i 's/geoip: !!launchProxy,/geoip: true,/g' server.js; \
    sed -i 's/if (!CONFIG.proxy.host) {/if (false) {/' server.js; \
    grep -q 'geoip: true,' server.js; \
    grep -q 'if (false) {' server.js

# Pre-download and extract UBlock Origin at build time so the container never
# needs outbound access to addons.mozilla.org at runtime (unreachable on prod).
RUN node --input-type=module -e "import {addDefaultAddons} from './node_modules/camoufox-js/dist/addons.js'; await addDefaultAddons([]);"
