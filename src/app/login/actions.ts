"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STAFF_PORTAL_ROLES = [
  "MASTER_USER",
  "ADMIN_USER",
  "CHIEF_ENGINEER",
  "ENGINEER"
];

const CUSTOMER_PORTAL_ROLES = [
  "PARENT_USER",
  "CHILD_USER"
];

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
  const requestedRedirectTo = String(formData.get("redirectTo") || "");

  if (!username || !password) {
    redirect("/login?error=missing");
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToAuthEmail(username),
    password
  });

  if (error || !data.user) {
    redirect("/login?error=invalid");
  }

  const profile = await prisma.userProfile.findFirst({
    where: {
      OR: [
        {
          authUserId: data.user.id
        },
        {
          email: data.user.email || usernameToAuthEmail(username)
        }
      ]
    },
    select: {
      id: true,
      role: true,
      active: true,
      customerAccountId: true
    }
  });

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=profile");
  }

  if (!profile.active) {
    await supabase.auth.signOut();
    redirect("/login?error=disabled");
  }

  if (CUSTOMER_PORTAL_ROLES.includes(profile.role)) {
    if (!profile.customerAccountId) {
      await supabase.auth.signOut();
      redirect("/login?error=customer");
    }

    redirect(getSafeCustomerRedirect(requestedRedirectTo));
  }

  if (STAFF_PORTAL_ROLES.includes(profile.role)) {
    redirect(getSafeStaffRedirect(requestedRedirectTo));
  }

  await supabase.auth.signOut();
  redirect("/login?error=forbidden");
}

export async function logout() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function getSafeStaffRedirect(redirectTo: string) {
  if (redirectTo.startsWith("/portal")) {
    return redirectTo;
  }

  return "/portal";
}

function getSafeCustomerRedirect(redirectTo: string) {
  if (redirectTo.startsWith("/trade-account")) {
    return redirectTo;
  }

  return "/trade-account";
}