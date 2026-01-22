import { supabase } from "./supabase";

export type UserRole = "manager" | "staff";

export type UserProfile = {
  id: string;
  role: UserRole;
};

export const getUserProfileClient = async (): Promise<UserProfile | null> => {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    const message =
      error?.message ?? "Profile not found. Ensure profiles row exists.";
    throw new Error(message);
  }
  console.log("Resolved role:", profile.role);
  return { id: userId, role: profile.role as UserRole };
};

export const getUserProfileByIdClient = async (
  userId: string
): Promise<UserProfile | null> => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;
  return { id: userId, role: profile.role as UserRole };
};
