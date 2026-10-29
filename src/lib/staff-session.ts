import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffContext = {
  userId: string;
  email: string;
  accessToken: string;
};

/**
 * Validates the user with Supabase Auth, then checks the active staff grant.
 * A valid Auth account alone never grants access to dashboard customer data.
 */
export async function getStaffContext(): Promise<StaffContext | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("staff_members")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (membershipError || !membership) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  return {
    userId: user.id,
    email: user.email || "",
    accessToken: session.access_token,
  };
}

export async function isStaffSession(): Promise<boolean> {
  return Boolean(await getStaffContext());
}
