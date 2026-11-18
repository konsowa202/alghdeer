/**
 * Keep work running after the HTTP response has been sent.
 *
 * On Vercel the platform exposes a request context with `waitUntil` (the same
 * hook `@vercel/functions` uses), which keeps the function alive until the
 * promise settles. Elsewhere (local dev, other hosts) the Node process stays
 * up anyway, so the promise simply continues in the background.
 */
type RequestContext = { get?: () => { waitUntil?: (p: Promise<unknown>) => void } | undefined };

export function runAfterResponse(task: Promise<unknown>): void {
  const settled = task.catch((err) => console.error("[after-response] background task failed:", err));
  try {
    const ctx = (globalThis as Record<symbol, unknown>)[Symbol.for("@vercel/request-context")] as
      | RequestContext
      | undefined;
    ctx?.get?.()?.waitUntil?.(settled);
  } catch {
    // No platform hook — the promise keeps running on its own.
  }
}
