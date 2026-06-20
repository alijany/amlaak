# Implementing Authentication Providers

A `CrawlerAuthProvider` (`providers/crawler-auth.interface.ts`) encapsulates how a site logs
in. The platform drives the interactive OTP state machine
([authentication-lifecycle.md](../architecture/authentication-lifecycle.md)) and calls your
provider at each transition.

## The interface

```ts
interface CrawlerAuthProvider {
  startLogin(input: StartLoginInput): Promise<AuthChallenge>;   // "send" the OTP
  submitOtp(input: SubmitOtpInput): Promise<AuthResult>;        // verify -> session
  checkSession(session: AuthSessionData): Promise<CrawlerAuthStatus>;
  logout(session: AuthSessionData): Promise<void>;
}
```

- `StartLoginInput` = `{ sessionId, phone }`. `sessionId` is stable per target
  (`target-<id>`) — use it as the browser-gateway `userId`/profile key.
- `AuthChallenge` = `{ challengeRef, message? }`. `challengeRef` correlates start→verify
  (e.g. the sidecar tab id); it is persisted on the session.
- `SubmitOtpInput` = `{ sessionId, phone, otp, challengeRef? }`.
- `AuthResult` = `{ status, session?, expiresAt? }`. On success return
  `status: LOGGED_IN` and an opaque `session` payload (cookies/tokens). The service stores it
  as `sessionData` and never returns it to the client.

## Contract & expectations

- **Idempotent-ish start.** `startLogin` may be called again if the user retries.
- **Don't throw for "wrong code".** Return `status: ERROR` for an invalid OTP; reserve
  thrown exceptions for unexpected failures (the service catches them → `ERROR` + `lastError`).
- **Keep `sessionData` opaque & minimal.** Only what `crawl()`/`checkSession()` need.
- **`checkSession`** lets the platform re-validate before a crawl (return `LOGGED_IN` or
  `LOGIN_REQUIRED`). **`logout`** should best-effort revoke server-side, then the service
  clears local state.

## Reference implementations

- **`MockAuthProvider`** — fully working. `startLogin` returns a challenge; `submitOtp`
  accepts any 4–6 digit code and returns a fake session. Use it as the template.
- **`DivarAuthProvider`** — scaffold over the `BrowserGateway`. Intended flow:
  `startLogin` → open tab, navigate to login, type phone, submit (site SMSes a code), return
  the tab id; `submitOtp` → type code, verify, `exportCookies` as the session. Methods throw
  `NotImplemented` until a live browser is available.

## Wiring

Register the auth provider class in `crawler.module.ts` and return it from your
`CrawlerProvider.getAuthProvider()`. The `CrawlSessionService` resolves it through the
provider — you never call it directly from controllers.
