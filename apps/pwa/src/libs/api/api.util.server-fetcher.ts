// Server-only — no auth token. For use in RSC pages and generateMetadata.
export async function serverFetcher<T>(path: string, revalidate = 3600): Promise<T> {
  const base = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';
  const res = await fetch(`${base}${path}`, {
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`serverFetcher: ${res.status} ${path}`);
  return res.json();
}

// Like serverFetcher but returns the HTTP status alongside the data.
// Used for blog post pages that need to handle 410 Gone and 301 Redirect.
export async function serverFetcherWithStatus<T>(
  path: string,
  revalidate = 3600,
): Promise<{ data: T | null; status: number }> {
  const base = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';
  const res = await fetch(`${base}${path}`, {
    next: { revalidate },
  });
  const data = await res.json().catch(() => null);
  return { data: data as T | null, status: res.status };
}
