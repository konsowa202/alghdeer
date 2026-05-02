/** Staff session cookie — set only via /api/auth/login (httpOnly). */
export const STAFF_COOKIE_NAME = "alghdeer_staff";
export const STAFF_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getStaffCredentials() {
  const email =
    process.env.STAFF_EMAIL?.trim() ||
    "mahmoudkonsowa3030@gmail.com";
  const password = process.env.STAFF_PASSWORD ?? "011025";
  return { email: normalizeEmail(email), password };
}

export function validateStaffLogin(email: string, password: string): boolean {
  const { email: expectedEmail, password: expectedPassword } =
    getStaffCredentials();
  return (
    normalizeEmail(email) === expectedEmail && password === expectedPassword
  );
}
