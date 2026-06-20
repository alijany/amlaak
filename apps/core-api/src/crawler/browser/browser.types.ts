/**
 * Transport-agnostic types for the browser gateway.
 *
 * They mirror the primitives exposed by the Camoufox REST sidecar
 * (@askjo/camofox-browser): tabs, accessibility snapshots with stable element
 * refs, and basic interactions. Keeping them here (rather than importing from a
 * vendor SDK) means future phases can swap the underlying browser without
 * touching provider code.
 */

/** A handle to an open browser tab. */
export interface BrowserTab {
  id: string;
  url?: string;
}

/** A single node in an accessibility snapshot. */
export interface SnapshotNode {
  /** Stable reference (e.g. `e1`, `e2`) usable for click/type. */
  ref: string;
  role?: string;
  name?: string;
  value?: string;
  children?: SnapshotNode[];
}

/**
 * Accessibility snapshot of a page. Far smaller than raw HTML and a natural
 * input for future AI-powered extraction (snapshot -> LLM -> structured data).
 *
 * Camoufox returns the tree as a compact, indented text form with inline refs
 * (e.g. `- link "Learn more" [e1]`). That string is the primary representation
 * (`text`) and is ideal as direct LLM input; a structured `tree` is reserved
 * for a future parser and is not populated by the Camoufox gateway.
 */
export interface PageSnapshot {
  url: string;
  title?: string;
  /** Accessibility tree as compact text with stable element refs. */
  text: string;
  /** Number of interactable refs in the snapshot, when reported. */
  refsCount?: number;
  /** Optional structured tree (not emitted by the Camoufox gateway yet). */
  tree?: SnapshotNode[];
  /** Optional raw upstream payload for providers that need it. */
  raw?: unknown;
}

export interface CreateTabOptions {
  /** Logical owner of the tab; maps to Camoufox `userId`. */
  sessionId: string;
  url?: string;
}

export interface BrowserCookie {
  name: string;
  value: string;
  /** Camoufox requires a domain when importing cookies. */
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/** Health/availability snapshot of the browser backend, surfaced on the dashboard. */
export interface BrowserHealth {
  /** Backend is configured and reachable. */
  available: boolean;
  /** A base URL is configured (regardless of reachability). */
  configured: boolean;
  engine?: string;
  browserConnected?: boolean;
  activeTabs?: number;
  activeSessions?: number;
  /** Present when configured but unreachable/unhealthy. */
  error?: string;
}
