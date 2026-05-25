"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getEditableManualOrderReference,
  updateManualOrderHeaderFromDb
} from "@/lib/sales/manual-order-edit-db";

export async function updateManualOrderHeader(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");

  const order = await updateManualOrderHeaderFromDb({
    orderReference,
    customerPoNumber: String(formData.get("customerPoNumber") || ""),
    deliveryDay: String(formData.get("deliveryDay") || ""),
    driverOrCourier: String(formData.get("driverOrCourier") || ""),
    deliveryMethod: String(formData.get("deliveryMethod") || ""),
    customerNotes: String(formData.get("customerNotes") || ""),
    internalNotes: String(formData.get("internalNotes") || "")
  });

  const redirectReference = getEditableManualOrderReference(order);

  revalidatePath("/portal");
  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(redirectReference)}`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(redirectReference)}/edit`);
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