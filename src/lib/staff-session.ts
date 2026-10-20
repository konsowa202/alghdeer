import { cookies } from "next/headers";
import { STAFF_COOKIE_NAME, verifySessionToken } from "@/lib/staff-auth";

/** True only when the request carries a valid, unexpired, HMAC-signed staff session. */
export function isStaffSession(): boolean {
  return verifySessionToken(cookies().get(STAFF_COOKIE_NAME)?.value);
}
