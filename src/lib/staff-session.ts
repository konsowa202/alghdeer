import { cookies } from "next/headers";
import { STAFF_COOKIE_NAME } from "@/lib/staff-auth";

export function isStaffSession(): boolean {
  return cookies().get(STAFF_COOKIE_NAME)?.value === "1";
}
