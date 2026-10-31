# Devcontainer runtime validation

Read only the section needed for the current validation task.

## Start the applications

Run the applications in separate terminals from the repository root:

```bash
pnpm dev:back    # NestJS on :4000, output mirrored to /tmp/back.log
pnpm dev:front   # Next.js on :8000
```

The devcontainer forwards nginx on port 80 as the canonical browser entrypoint:

- `http://127.0.0.1/` → frontend
- `http://127.0.0.1/api/v1/` → backend
- `http://127.0.0.1/rustfs/` → object storage

Use direct ports to isolate an app and nginx URLs to validate real routing. For
a normal smoke check, request both the changed page and one relevant API
endpoint; a successful frontend HTML response does not prove its data requests
work.

## Validate rendered pages with Playwright

Use the Playwright MCP server registered in the repository-root `.mcp.json`
(Codex reads the same server from `.codex/config.toml`). It is baked into
`.devcontainer/Dockerfile`, so no install step is needed. Its browser runs as a
child process inside the `app` container rather than in a sidecar with a
separate network namespace. Reach pages as `curl` would, through
`http://127.0.0.1/` or a direct app port; no hostname rewriting is required.

`.mcp.json` starts it through `.devcontainer/playwright-mcp.sh`, which pins the
browser to the build baked into the image at `/ms-playwright`. Without that, a
client whose harness does not apply `.mcp.json`'s `env` block resolves the empty
user cache instead and downloads a second Chromium into the runtime user's home.
**Never install a browser to work around a Playwright failure** — if the wrapper
reports that the expected revision is missing, rebuild the devcontainer so the
image and `@playwright/mcp` agree.

A minimal validation flow is:

1. Use `browser_navigate` for the changed route, for example
   `http://127.0.0.1/dashboard` (Persian, RTL) or `http://127.0.0.1/en/dashboard`
   (English, LTR).
2. Use `browser_snapshot` for the accessibility tree and
   `browser_take_screenshot` for visual evidence.
3. Exercise the changed interaction with `browser_click` or `browser_type`,
   then take another snapshot.
4. Use `browser_close` when done.

The language is negotiated per request (`docs/engine/localization.md`): an
explicit `/en` prefix wins, then the `NEXT_LOCALE` cookie, then the browser's
`Accept-Language`. Playwright's browser sends `en-US`, so an unprefixed URL
redirects to `/en/…` on a first visit, and visiting any `/en/…` page pins the
cookie to `en` until it is changed. To check Persian, open an unprefixed URL
after setting `NEXT_LOCALE=fa` (for example with `browser_evaluate`:
`document.cookie = 'NEXT_LOCALE=fa; path=/'`). Check both locales when layout
or copy can differ.

Font downloads differ between `next dev` and a production build. Verify font
loading only against `pnpm --filter pwa build` output, in a fresh browser
context per locale.

## Log in and reach admin-only routes

Login is phone plus OTP. The API loads `apps/core-api/.env`; the root `.env` is
for Compose. With `NODE_ENV=development`, the API prints the OTP instead of
sending an SMS. `pnpm dev:back` mirrors backend output to `/tmp/back.log`, so
after requesting a code read it with:

```bash
grep 'OTP for' /tmp/back.log | tail -1
```

`ADMIN_PHONE` in `apps/core-api/.env` is the admin identity. When it is set,
every boot ensures that user exists with the `admin` role, so use it for
admin-only routes such as `/dashboard/users`. Never add an auth bypass or relax
a route's roles to make validation easier.

In the browser, navigate to `/login` (Persian) or `/en/login` (English), fill
the mobile-number field (placeholder `شماره موبایل` / "Mobile number") with a
local number such as `0912…`, submit ("ارسال کد تایید" / "Send verification
code"), read the code from the log, fill the one-time-code field (placeholder
`کد تایید 4 رقمی` / "4-digit verification code"), and submit ("ورود" / "Sign
in"). The app lands on `/dashboard` or `/en/dashboard`, matching the login
page's locale.

The dashboard evaluates access against the *selected* role, which defaults to
the user's first role. If the user holds several, choose `admin` in the sidebar
role dropdown, or set `selected-role` in `localStorage` to that role's id.

For later runs, the tokens returned by the real endpoints can be reused: call
`POST /api/v1/auth/otp/send` (optionally with `"locale": "en"`, which only
chooses the SMS language), then `/verify` with the logged code, and use
`browser_evaluate` to set `auth_token` and `refresh_token` in `localStorage`
before navigating. Access tokens last 15 minutes by default
(`ACCESS_TOKEN_TTL`).

Verifying an unknown number creates a real user row, so reuse an existing
development number. Delete the row if validation does create one.

## Troubleshoot container reachability

Dev Containers assigns the Compose project name dynamically. If plain
`docker compose ... ps` shows no services, inspect `docker ps` for the actual
prefix and pass it with `docker compose -p <project> ...`. Never hardcode the
project name in repository files.

Some coding-agent command sandboxes use an isolated network namespace. If a
localhost probe fails there, repeat the reachability check in the
devcontainer's real network context before diagnosing nginx or changing bind
addresses.
