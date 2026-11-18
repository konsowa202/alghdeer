export function getSupabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const publishableKey = (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!url || !publishableKey) {
    throw new Error("Supabase Auth environment is not configured.");
  }

  return { url, publishableKey };
}

/**
 * fetch with a hard deadline. Supabase Auth/PostgREST calls made through
 * supabase-js have no timeout of their own, so a stalled connection could keep
 * a dashboard request (and the browser) waiting until the platform kills it.
 */
export function fetchWithTimeout(ms = 8000): typeof fetch {
  return (input, init = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const upstream = init.signal;
    if (upstream) {
      if (upstream.aborted) controller.abort();
      else upstream.addEventListener("abort", () => controller.abort(), { once: true });
    }
    return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
  };
}
