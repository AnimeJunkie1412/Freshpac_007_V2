"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addManualOrderLineFromDb,
  parseMoneyToPence,
  parseVatPercentToBasisPoints,
  removeManualOrderLineFromDb,
  updateManualOrderLinePricingFromDb,
  updateManualOrderLineQuantityFromDb
} from "@/lib/sales/manual-order-lines-db";

export async function addManualOrderLine(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");
  const productId = readRequiredFormValue(formData, "productId");
  const q = String(formData.get("q") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const priceExVatPence = parseMoneyToPence(String(formData.get("priceExVat") || ""));
  const vatRateBasisPoints = parseVatPercentToBasisPoints(String(formData.get("vatRate") || ""));

  await addManualOrderLineFromDb({
    orderReference,
    productId,
    quantity,
    pricing: {
      priceExVatPence,
      vatRateBasisPoints
    }
  });

  revalidateManualOrderPaths(orderReference);

  redirectToAddLine(orderReference, q);
}

export async function updateManualOrderLineQuantity(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");
  const lineId = readRequiredFormValue(formData, "lineId");
  const q = String(formData.get("q") || "");
  const quantity = Number(formData.get("quantity") || 1);

  await updateManualOrderLineQuantityFromDb({
    orderReference,
    lineId,
    quantity
  });

  revalidateManualOrderPaths(orderReference);

  redirectToAddLine(orderReference, q);
}

export async function updateManualOrderLinePricing(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");
  const lineId = readRequiredFormValue(formData, "lineId");
  const q = String(formData.get("q") || "");
  const quantity = Number(formData.get("quantity") || 1);
  const priceExVatPence = parseMoneyToPence(String(formData.get("priceExVat") || ""));
  const vatRateBasisPoints = parseVatPercentToBasisPoints(String(formData.get("vatRate") || ""));

  await updateManualOrderLinePricingFromDb({
    orderReference,
    lineId,
    quantity,
    priceExVatPence: priceExVatPence ?? 0,
    vatRateBasisPoints: vatRateBasisPoints ?? 0
  });

  revalidateManualOrderPaths(orderReference);

  redirectToAddLine(orderReference, q);
}

export async function removeManualOrderLine(formData: FormData) {
  const orderReference = readRequiredFormValue(formData, "orderReference");
  const lineId = readRequiredFormValue(formData, "lineId");
  const q = String(formData.get("q") || "");

  await removeManualOrderLineFromDb({
    orderReference,
    lineId
  });

  revalidateManualOrderPaths(orderReference);

  redirectToAddLine(orderReference, q);
}

function revalidateManualOrderPaths(orderReference: string) {
  revalidatePath("/portal");
  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}/add-line`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}/print`);
  revalidatePath(`/portal/sales/orders/${encodeURIComponent(orderReference)}/delivery-note`);
}

function redirectToAddLine(orderReference: string, q: string) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
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