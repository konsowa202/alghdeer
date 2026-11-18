import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffContext = {
  userId: string;
  email: string;
  accessToken: string;
};

/**
 * Verifies the signed-in user, then checks the active staff grant.
 * A valid Auth account alone never grants access to dashboard customer data.
 *
 * - getClaims() verifies the JWT signature (locally with the project's signing
 *   keys, or via the Auth server for legacy keys) instead of always doing an
 *   extra network round trip like getUser().
 * - cache() runs the check once per request, so the layout and the page of
 *   the same dashboard render share one result instead of repeating it.
 */
export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (error || !claims?.sub) return null;

  const [{ data: membership, error: membershipError }, { data: sessionData }] = await Promise.all([
    supabase
      .from("staff_members")
      .select("user_id")
      .eq("user_id", claims.sub)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.auth.getSession(),
  ]);
  if (membershipError || !membership) return null;

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return null;

  return {
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    accessToken,
  };
});

export async function isStaffSession(): Promise<boolean> {
  return Boolean(await getStaffContext());
}
