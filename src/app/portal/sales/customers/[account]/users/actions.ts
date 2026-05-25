"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/auth/supabase-admin";
import {
  createCustomerUserProfileFromAuthUser,
  getCustomerWithUsersFromDb,
  getExistingCustomerUserProfileByEmail,
  setCustomerUserActiveStateFromDb
} from "@/lib/sales/customer-users-db";

export async function createCustomerLogin(formData: FormData) {
  const accountNumber = readRequiredFormValue(formData, "accountNumber");
  const customerAccountId = readRequiredFormValue(formData, "customerAccountId");
  const email = readRequiredFormValue(formData, "email").toLowerCase();
  const fullName = readRequiredFormValue(formData, "fullName");
  const password = readRequiredFormValue(formData, "password");
  const role = readCustomerUserRole(formData);
  const active = String(formData.get("active") || "") === "on";

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const customer = await getCustomerWithUsersFromDb(accountNumber);

  if (!customer || customer.id !== customerAccountId) {
    throw new Error("Customer account was not found.");
  }

  const existingProfile = await getExistingCustomerUserProfileByEmail(email);

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
      customerAccountId,
      accountNumber
    }
  });

  if (createdAuthUser.error || !createdAuthUser.data.user) {
    throw new Error(createdAuthUser.error?.message || "Supabase could not create this customer login.");
  }

  const authUserId = createdAuthUser.data.user.id;

  try {
    await createCustomerUserProfileFromAuthUser({
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

  revalidateCustomerUserPaths(accountNumber);
  redirect(`/portal/sales/customers/${encodeURIComponent(accountNumber)}/users?created=1`);
}

export async function disableCustomerLogin(formData: FormData) {
  const accountNumber = readRequiredFormValue(formData, "accountNumber");
  const customerAccountId = readRequiredFormValue(formData, "customerAccountId");
  const userId = readRequiredFormValue(formData, "userId");

  await setCustomerUserActiveStateFromDb({
    userId,
    customerAccountId,
    active: false
  });

  revalidateCustomerUserPaths(accountNumber);
  redirect(`/portal/sales/customers/${encodeURIComponent(accountNumber)}/users?disabled=1`);
}

export async function enableCustomerLogin(formData: FormData) {
  const accountNumber = readRequiredFormValue(formData, "accountNumber");
  const customerAccountId = readRequiredFormValue(formData, "customerAccountId");
  const userId = readRequiredFormValue(formData, "userId");

  await setCustomerUserActiveStateFromDb({
    userId,
    customerAccountId,
    active: true
  });

  revalidateCustomerUserPaths(accountNumber);
  redirect(`/portal/sales/customers/${encodeURIComponent(accountNumber)}/users?enabled=1`);
}

function revalidateCustomerUserPaths(accountNumber: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/settings/users");
  revalidatePath("/portal/sales/customers");
  revalidatePath(`/portal/sales/customers/${encodeURIComponent(accountNumber)}`);
  revalidatePath(`/portal/sales/customers/${encodeURIComponent(accountNumber)}/users`);
}

function readRequiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function readCustomerUserRole(formData: FormData) {
  const value = String(formData.get("role") || "").trim();

  if (value !== "PARENT_USER" && value !== "CHILD_USER") {
    throw new Error("Customer login role must be Parent Customer or Child Customer.");
  }

  return value as UserRole;
}