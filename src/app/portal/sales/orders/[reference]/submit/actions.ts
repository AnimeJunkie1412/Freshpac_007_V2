"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getSubmittedManualOrderReference,
  submitManualOrderFromDb
} from "@/lib/sales/manual-order-submit-db";

export async function submitManualOrder(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");

  const order = await submitManualOrderFromDb(orderReference);
  const redirectReference = getSubmittedManualOrderReference(order);

  revalidatePath("/portal");
  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(redirectReference)}`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(redirectReference)}/add-line`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(redirectReference)}/print`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(redirectReference)}/delivery-note`);
  revalidatePath("/portal/sales/orders/print");
  revalidatePath("/portal/sales/orders/delivery-notes");
  revalidatePath("/portal/sales/orders/pick-list");

  redirect(`/portal/sales/orders/${encodeURIComponent(redirectReference)}`);
}

function readRequiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}