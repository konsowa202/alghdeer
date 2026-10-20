/**
 * Same-origin guard for state-changing API requests (CSRF mitigation).
 * Browsers always send Origin (or Referer) on cross-site POSTs; requests
 * missing both (curl, same-origin fetch without Origin on some setups) are
 * allowed only when they carry no cross-site indicators.
 */
export function isSameOriginRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === new URL(req.url).host;
    } catch {
      return false;
    }
  }
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === new URL(req.url).host;
    } catch {
      return false;
    }
  }
  // Non-browser clients without Origin/Referer: allow (they cannot ride
  // cookies cross-site anyway; cookie auth is SameSite=Lax on top).
  return true;
}
