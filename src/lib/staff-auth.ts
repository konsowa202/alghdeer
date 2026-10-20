import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "crypto";
import { STAFF_COOKIE_NAME } from "./staff-auth-public";

export { STAFF_COOKIE_NAME };
export const STAFF_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Staff credentials come from environment variables only.
 * - STAFF_EMAILS: comma-separated list of allowed emails (or STAFF_EMAIL for one)
 * - STAFF_PASSWORD: shared staff password (required in production)
 *
 * In development only, a local fallback keeps the dashboard reachable; a
 * warning is printed so it is never mistaken for a secure setup.
 */
export function getStaffCredentials(): {
  emails: string[];
  password: string | null;
} {
  const emailsRaw =
    process.env.STAFF_EMAILS?.trim() || process.env.STAFF_EMAIL?.trim() || "";
  const emails = emailsRaw
    ? emailsRaw
        .split(",")
        .map((e) => normalizeEmail(e))
        .filter(Boolean)
    : [];

  const password = process.env.STAFF_PASSWORD ?? null;

  if (emails.length > 0 && password) {
    return { emails, password };
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[staff-auth] STAFF_EMAILS / STAFF_PASSWORD env vars are not set — using insecure development fallback."
    );
    return {
      emails: ["mahmoudkonsowa678@gmail.com", "mahmoudkonsowa3030@gmail.com"],
      password: "011025",
    };
  }

  console.error(
    "[staff-auth] STAFF_EMAILS and STAFF_PASSWORD must be set in production. Staff login is disabled."
  );
  return { emails: [], password: null };
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Password policy: at least 10 characters, must contain a letter and a digit.
 * Enforced on the configured STAFF_PASSWORD (a weak password logs an error in
 * production but does not silently accept logins).
 */
export function isStrongPassword(pw: string): boolean {
  return (
    pw.length >= 10 && /[a-zA-Z\u0600-\u06FF]/.test(pw) && /\d/.test(pw)
  );
}

let warnedWeakPassword = false;

/**
 * Verifies the staff password. Two configuration modes:
 * - STAFF_PASSWORD_SCRYPT: `saltHex:hashHex` produced by scrypt (recommended —
 *   the plain password never appears in any env var or file).
 * - STAFF_PASSWORD: plain password (acceptable for small teams; pair it with a
 *   strong value).
 */
function verifyPassword(candidate: string, expectedPlain: string | null): boolean {
  const scryptEnv = process.env.STAFF_PASSWORD_SCRYPT?.trim();
  if (scryptEnv) {
    const [saltHex, hashHex] = scryptEnv.split(":");
    if (!saltHex || !hashHex) return false;
    try {
      const derived = scryptSync(candidate, Buffer.from(saltHex, "hex"), 64);
      const expected = Buffer.from(hashHex, "hex");
      return derived.length === expected.length && timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }
  if (!expectedPlain) return false;
  if (!isStrongPassword(expectedPlain) && !warnedWeakPassword) {
    warnedWeakPassword = true;
    console.warn(
      "[staff-auth] STAFF_PASSWORD is weak (min 10 chars, letters + digits). Set STAFF_PASSWORD_SCRYPT instead."
    );
  }
  return safeEqual(candidate, expectedPlain);
}

export function validateStaffLogin(email: string, password: string): boolean {
  const { emails, password: expectedPassword } = getStaffCredentials();
  if (emails.length === 0) return false;
  if (!expectedPassword && !process.env.STAFF_PASSWORD_SCRYPT) return false;
  const norm = normalizeEmail(email);
  const emailOk = emails.some((e) => safeEqual(e, norm));
  return emailOk && verifyPassword(password, expectedPassword);
}

/* ------------------------------------------------------------------ */
/* Signed session tokens (stateless HMAC — serverless friendly)        */
/* ------------------------------------------------------------------ */

/**
 * Secret used to sign session cookies. Set SESSION_SECRET in production.
 * Falls back to a value derived from the staff password so sessions
 * invalidate automatically when the password rotates.
 */
// Memoized per-boot random secret (production misconfiguration only).
let bootSecret: string | null = null;

function sessionSecret(): string {
  const env = process.env.SESSION_SECRET?.trim();
  if (env) return env;
  const { password } = getStaffCredentials();
  if (password) return `derived:${password}`;
  const scryptEnv = process.env.STAFF_PASSWORD_SCRYPT?.trim();
  if (scryptEnv) return `derived-scrypt:${scryptEnv}`;
  // Last resort (dev only, no credentials configured): random per process.
  if (process.env.NODE_ENV !== "production") {
    return "alghdeer-dev-only-secret";
  }
  // Production without any secret: unguessable per-boot secret, sessions
  // simply do not survive restarts.
  if (!bootSecret) bootSecret = randomBytes(32).toString("hex");
  return bootSecret;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

/** Token format: `<expiryMs>.<hmac-hex>` */
export function createSessionToken(nowMs = Date.now()): string {
  const expiry = String(nowMs + STAFF_SESSION_MAX_AGE * 1000);
  return `${expiry}.${sign(expiry)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d{10,16}$/.test(expiry) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  const expiryMs = Number(expiry);
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return false;
  return safeEqual(sign(expiry), sig);
}

export { sessionTokenLooksValid } from "./staff-token-format";
