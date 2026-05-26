"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  saveCustomerBasketFromDb,
  submitCustomerBasketFromDb
} from "@/lib/customer-portal/customer-portal-db";

export async function saveCustomerBasket(formData: FormData) {
  const reference = readRequiredFormValue(formData, "reference");
  const customerPoNumber = String(formData.get("customerPoNumber") || "").trim();
  const customerNotes = String(formData.get("customerNotes") || "").trim();

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/trade-account");
  }

  const productIds = formData
    .getAll("productId")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const rows = productIds.map((productId) => ({
    productId,
    quantity: Number(formData.get(`quantity_${productId}`) || 0)
  }));

  await saveCustomerBasketFromDb({
    authUserId: user.id,
    email: user.email,
    reference,
    customerPoNumber,
    customerNotes,
    rows
  });

  revalidateCustomerOrderPaths(reference);
  redirect(`/trade-account/order/${encodeURIComponent(reference)}?saved=1`);
}

export async function submitCustomerBasket(formData: FormData) {
  const reference = readRequiredFormValue(formData, "reference");
  const customerPoNumber = String(formData.get("customerPoNumber") || "").trim();
  const customerNotes = String(formData.get("customerNotes") || "").trim();

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/trade-account");
  }

  await saveCustomerBasketFromDb({
    authUserId: user.id,
    email: user.email,
    reference,
    customerPoNumber,
    customerNotes,
    rows: readQuantityRows(formData)
  });

  await submitCustomerBasketFromDb({
    authUserId: user.id,
    email: user.email,
    reference
  });

  revalidateCustomerOrderPaths(reference);
  redirect("/trade-account?submitted=1");
}

function readQuantityRows(formData: FormData) {
  const productIds = formData
    .getAll("productId")
    .map((value) => String(value).trim())
    .filter(Boolean);

  return productIds.map((productId) => ({
    productId,
    quantity: Number(formData.get(`quantity_${productId}`) || 0)
  }));
}

function revalidateCustomerOrderPaths(reference: string) {
  revalidatePath("/trade-account");
  revalidatePath(`/trade-account/order/${encodeURIComponent(reference)}`);
  revalidatePath("/portal/sales/orders");
}

function readRequiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}