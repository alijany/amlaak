/**
 * Error raised by a {@link BrowserGateway} when a backend call fails.
 *
 * Wraps transport/HTTP failures from the browser sidecar into a single typed
 * error so providers can react uniformly (retry, surface to the user, mark a
 * target as errored) without depending on axios internals.
 */
export class BrowserGatewayError extends Error {
  constructor(
    message: string,
    readonly context: {
      /** Logical operation, e.g. `createTab`, `snapshot`. */
      operation: string;
      /** HTTP status from the sidecar, when the request reached it. */
      status?: number;
      /** Whether the failure looked transient (network/5xx/timeout). */
      transient?: boolean;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'BrowserGatewayError';
  }
}
