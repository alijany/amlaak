import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points the plugin at this project's file naming convention rather than the
// library default (`./src/i18n/request.ts`).
const withNextIntl = createNextIntlPlugin("./src/i18n/i18n.request.ts");

const nextConfig: NextConfig = {
  images: {
    domains: ['*'],
  },
  output: 'standalone',
  // The dev server only trusts `localhost` by default, so requests carrying an
  // `Origin: http://127.0.0.1...` header get a 403 and every `_next/static`
  // chunk fails to load — the page renders as server HTML with no JS. Browsers
  // send that header where curl does not, so a 200 from curl hides it. Both
  // documented devcontainer entrypoints (nginx on :80 and the direct :8000
  // port) are 127.0.0.1, so it has to be trusted explicitly. Dev-only setting.
  allowedDevOrigins: ['127.0.0.1'],
};

export default withNextIntl(nextConfig);
