FROM ghcr.io/jo-inc/camofox-browser:latest
WORKDIR /app
# Pre-download and extract UBlock Origin at build time so the container never
# needs outbound access to addons.mozilla.org at runtime (unreachable on prod).
RUN node --input-type=module -e "import {addDefaultAddons} from './node_modules/camoufox-js/dist/addons.js'; await addDefaultAddons([]);"
