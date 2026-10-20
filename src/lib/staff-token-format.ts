/**
 * Edge-safe (no node:crypto) structural check of a staff session token.
 * Used by middleware for redirects only — cryptographic verification lives
 * in `staff-auth.ts` (`verifySessionToken`) and runs on the Node server.
 */
export function sessionTokenLooksValid(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d{10,16}$/.test(expiry) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  return Number(expiry) >= Date.now();
}
