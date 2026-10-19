/** Staff session cookie — set only via /api/auth/login (httpOnly). */
export const STAFF_COOKIE_NAME = "alghdeer_staff";
export const STAFF_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const ALLOWED_STAFF_EMAILS = [
  "mahmoudkonsowa678@gmail.com",
  "mahmoudkonsowa3030@gmail.com",
];

export function getStaffCredentials() {
  const envEmail = process.env.STAFF_EMAIL?.trim();
  const primaryEmail = envEmail || "mahmoudkonsowa678@gmail.com";
  const password = process.env.STAFF_PASSWORD ?? "011025";
  return { email: normalizeEmail(primaryEmail), password };
}

export function validateStaffLogin(email: string, password: string): boolean {
  const { email: primaryEmail, password: expectedPassword } =
    getStaffCredentials();
  const norm = normalizeEmail(email);
  const isValidEmail =
    norm === primaryEmail || ALLOWED_STAFF_EMAILS.includes(norm);
  return isValidEmail && password === expectedPassword;
}
