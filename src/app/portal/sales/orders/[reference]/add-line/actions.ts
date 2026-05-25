"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseMoneyToPence,
  syncManualOrderPadFromDb
} from "@/lib/sales/manual-order-lines-db";

export async function saveManualOrderPad(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");
  const q = String(formData.get("q") || "");
  const activeOnly = String(formData.get("activeOnly") || "") === "1";

  const productIds = formData
    .getAll("productId")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const rows = productIds.map((productId) => ({
    productId,
    quantity: Number(formData.get(`quantity_${productId}`) || 0),
    priceExVatPence: parseMoneyToPence(String(formData.get(`priceExVat_${productId}`) || ""))
  }));

  await syncManualOrderPadFromDb({
    orderReference,
    rows
  });

  revalidateManualOrderPaths(orderReference);

  redirectToOrderPad(orderReference, q, activeOnly);
}

function revalidateManualOrderPaths(orderReference: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}/add-line`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}/print`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}/delivery-note`);
  revalidatePath("/portal/sales/orders/print");
  revalidatePath("/portal/sales/orders/delivery-notes");
  revalidatePath("/portal/sales/orders/pick-list");
}

function redirectToOrderPad(orderReference: string, q: string, activeOnly: boolean) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (activeOnly) {
    params.set("activeOnly", "1");
  }

  const query = params.toString();

  redirect(
    query
      ? `/portal/sales/orders/${encodeURIComponent(orderReference)}/add-line?${query}`
      : `/portal/sales/orders/${encodeURIComponent(orderReference)}/add-line`
  );
}

function readRequiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}