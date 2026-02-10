import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { type UserProfile, type UserRole } from "./user-profile";

const getServerSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
};

export const getUserProfileServer = async (): Promise<UserProfile | null> => {
  const supabaseServer = await getServerSupabase();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;
  return { id: user.id, role: profile.role as UserRole };
};
