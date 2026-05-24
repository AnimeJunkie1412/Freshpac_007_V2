"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createManualOrderShellFromDb,
  getCreatedManualOrderReference
} from "@/lib/sales/manual-order-db";

export async function createManualOrder(formData: FormData) {
  const customerId = readRequiredFormValue(formData, "customerId");
  const intent = String(formData.get("intent") || "DRAFT_BASKET");

  const status = intent === "SUBMITTED" ? "SUBMITTED" : "DRAFT_BASKET";

  const order = await createManualOrderShellFromDb({
    customerId,
    status,
    customerPoNumber: String(formData.get("customerPoNumber") || ""),
    deliveryDay: String(formData.get("deliveryDay") || ""),
    driverOrCourier: String(formData.get("driverOrCourier") || ""),
    deliveryMethod: String(formData.get("deliveryMethod") || ""),
    customerNotes: String(formData.get("customerNotes") || ""),
    internalNotes: String(formData.get("internalNotes") || "")
  });

  const orderReference = getCreatedManualOrderReference(order);

  revalidatePath("/portal");
  revalidatePath("/portal/sales/orders");

  redirect(`/portal/sales/orders/${encodeURIComponent(orderReference)}`);
}

function readRequiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}