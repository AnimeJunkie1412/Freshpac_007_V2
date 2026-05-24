"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { markPrintedOrdersProcessedFromDb } from "@/lib/sales/order-print-db";

export async function confirmFilteredOrdersPrinted(formData: FormData) {
  const q = String(formData.get("q") || "");
  const status = String(formData.get("status") || "NEEDS_PRINT");
  const source = String(formData.get("source") || "ALL");

  await markPrintedOrdersProcessedFromDb({
    q,
    status,
    source
  });

  revalidatePath("/portal");
  revalidatePath("/portal/sales/orders");
  revalidatePath("/portal/sales/orders/print");

  const params = new URLSearchParams();

  if (q) params.set("q", q);
  params.set("status", "PROCESSED");
  if (source && source !== "ALL") params.set("source", source);

  redirect(`/portal/sales/orders?${params.toString()}`);
}