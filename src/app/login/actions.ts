"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function usernameToAuthEmail(usernameOrEmail: string) {
  const value = usernameOrEmail.trim().toLowerCase();

  if (value.includes("@")) {
    return value;
  }

  return `${value}@freshpac.local`;
}

export async function loginWithPassword(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/portal");

  if (!username || !password) {
    redirect("/login?error=missing");
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToAuthEmail(username),
    password
  });

  if (error) {
    redirect("/login?error=invalid");
  }

  redirect(redirectTo.startsWith("/portal") ? redirectTo : "/portal");
}

export async function logout() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}