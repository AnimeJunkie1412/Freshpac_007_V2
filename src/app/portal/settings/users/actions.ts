"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import {
  createUserProfileFromAuthUser,
  getExistingUserProfileByEmail,
  setUserActiveStateFromDb
} from "@/lib/settings/users-db";

export async function createPortalUser(formData: FormData) {
  const email = readRequiredFormValue(formData, "email").toLowerCase();
  const fullName = readRequiredFormValue(formData, "fullName");
  const password = readRequiredFormValue(formData, "password");
  const role = readUserRole(formData);
  const active = String(formData.get("active") || "") === "on";
  const customerAccountId = String(formData.get("customerAccountId") || "").trim() || null;

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if ((role === "PARENT_USER" || role === "CHILD_USER") && !customerAccountId) {
    throw new Error("Customer users must be linked to a customer account.");
  }

  if (role !== "PARENT_USER" && role !== "CHILD_USER" && customerAccountId) {
    throw new Error("Only Parent User and Child User roles should be linked to a customer account.");
  }

  const existingProfile = await getExistingUserProfileByEmail(email);

  if (existingProfile) {
    throw new Error("A user profile already exists for this email.");
  }

  const supabase = getSupabaseAdminClient();

  const createdAuthUser = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      fullName,
      role,
      customerAccountId
    }
  });

  if (createdAuthUser.error || !createdAuthUser.data.user) {
    throw new Error(createdAuthUser.error?.message || "Supabase could not create this login.");
  }

  const authUserId = createdAuthUser.data.user.id;

  try {
    await createUserProfileFromAuthUser({
      authUserId,
      email,
      fullName,
      role,
      active,
      customerAccountId
    });
  } catch (error) {
    await supabase.auth.admin.deleteUser(authUserId);
    throw error;
  }

  revalidatePath("/portal/settings/users");
  redirect("/portal/settings/users?created=1");
}

export async function disablePortalUser(formData: FormData) {
  const userId = readRequiredFormValue(formData, "userId");

  await setUserActiveStateFromDb({
    userId,
    active: false
  });

  revalidatePath("/portal/settings/users");
  redirect("/portal/settings/users?disabled=1");
}

export async function enablePortalUser(formData: FormData) {
  const userId = readRequiredFormValue(formData, "userId");

  await setUserActiveStateFromDb({
    userId,
    active: true
  });

  revalidatePath("/portal/settings/users");
  redirect("/portal/settings/users?enabled=1");
}

function readRequiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function readUserRole(formData: FormData) {
  const value = String(formData.get("role") || "").trim();
  const allowedRoles = Object.values(UserRole);

  if (!allowedRoles.includes(value as UserRole)) {
    throw new Error("Invalid user role.");
  }

  return value as UserRole;
}