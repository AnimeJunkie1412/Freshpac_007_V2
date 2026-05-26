"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createCustomerReorderDraftFromDb,
  getOrCreateCustomerDraftOrderFromDb
} from "@/lib/customer-portal/customer-portal-db";

export async function startCustomerOrder() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/trade-account");
  }

  const order = await getOrCreateCustomerDraftOrderFromDb({
    authUserId: user.id,
    email: user.email
  });

  const reference = order.reference || order.temporaryReference;

  if (!reference) {
    redirect("/trade-account?error=order");
  }

  redirect(`/trade-account/order/${encodeURIComponent(reference)}`);
}

export async function reorderCustomerOrder(formData: FormData) {
  const sourceReference = String(formData.get("sourceReference") || "").trim();

  if (!sourceReference) {
    redirect("/trade-account?error=reorder");
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/trade-account");
  }

  const draftOrder = await createCustomerReorderDraftFromDb({
    authUserId: user.id,
    email: user.email,
    sourceReference
  });

  const reference = draftOrder.reference || draftOrder.temporaryReference;

  if (!reference) {
    redirect("/trade-account?error=order");
  }

  redirect(`/trade-account/order/${encodeURIComponent(reference)}?saved=1`);
}