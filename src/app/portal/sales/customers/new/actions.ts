"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCustomerAccountFromDb,
  getCustomerCreateRedirectAccountNumber
} from "@/lib/sales/customer-create-db";

export async function createCustomerAccount(formData: FormData) {
  const intent = String(formData.get("intent") || "active");
  const mode = intent === "draft" ? "draft" : "active";

  const customer = await createCustomerAccountFromDb({
    mode,
    accountNumber: String(formData.get("accountNumber") || ""),
    siteName: String(formData.get("siteName") || ""),
    legalName: String(formData.get("legalName") || ""),
    status: String(formData.get("status") || "ACTIVE"),
    parentAccountId: String(formData.get("parentAccountId") || ""),
    deliveryMethod: String(formData.get("deliveryMethod") || "FRESHPAC_ROUTE"),
    deliveryDay: String(formData.get("deliveryDay") || ""),
    contactDay: String(formData.get("contactDay") || ""),
    contactFrequencyWeeks: Number(formData.get("contactFrequencyWeeks") || 1),
    driverOrCourier: String(formData.get("driverOrCourier") || ""),
    assignedSalesRep: String(formData.get("assignedSalesRep") || ""),
    accountOpenedAt: String(formData.get("accountOpenedAt") || ""),
    priceVisibility: String(formData.get("priceVisibility") || "") === "on",
    onCallList: String(formData.get("onCallList") || "") === "on",
    sageAccountRequired: String(formData.get("sageAccountRequired") || "") === "on",
    invoiceAddressLines: [
      String(formData.get("invoiceAddressLine1") || ""),
      String(formData.get("invoiceAddressLine2") || ""),
      String(formData.get("invoiceAddressLine3") || ""),
      String(formData.get("invoiceAddressLine4") || ""),
      String(formData.get("invoiceAddressLine5") || "")
    ],
    invoicePostcode: String(formData.get("invoicePostcode") || ""),
    deliveryAddressLines: [
      String(formData.get("deliveryAddressLine1") || ""),
      String(formData.get("deliveryAddressLine2") || ""),
      String(formData.get("deliveryAddressLine3") || ""),
      String(formData.get("deliveryAddressLine4") || ""),
      String(formData.get("deliveryAddressLine5") || "")
    ],
    deliveryPostcode: String(formData.get("deliveryPostcode") || ""),
    contactName: String(formData.get("contactName") || ""),
    contactRole: String(formData.get("contactRole") || ""),
    contactPhone: String(formData.get("contactPhone") || ""),
    contactEmail: String(formData.get("contactEmail") || ""),
    note: String(formData.get("note") || "")
  });

  const accountNumber = getCustomerCreateRedirectAccountNumber(customer);

  revalidatePath("/portal");
  revalidatePath("/portal/sales/customers");
  revalidatePath(`/portal/sales/customers/${encodeURIComponent(accountNumber)}`);
  revalidatePath("/portal/sales/call-list");

  redirect(`/portal/sales/customers/${encodeURIComponent(accountNumber)}`);
}