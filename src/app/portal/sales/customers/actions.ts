"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const addCustomerNoteSchema = z.object({
  accountNumber: z.string().min(1),
  customerId: z.string().uuid(),
  note: z.string().min(2),
  visibility: z.string().default("internal")
});

export async function addCustomerNote(formData: FormData) {
  const parsed = addCustomerNoteSchema.parse({
    accountNumber: formData.get("accountNumber"),
    customerId: formData.get("customerId"),
    note: formData.get("note"),
    visibility: formData.get("visibility") || "internal"
  });

  await prisma.customerNote.create({
    data: {
      customerId: parsed.customerId,
      note: parsed.note,
      visibility: parsed.visibility
    }
  });

  await prisma.auditLog.create({
    data: {
      actionType: "ADD_CUSTOMER_NOTE",
      entityType: "CUSTOMER_ACCOUNT",
      entityId: parsed.accountNumber,
      reason: parsed.note
    }
  });

  revalidatePath("/portal/sales/customers");
  revalidatePath(`/portal/sales/customers/${parsed.accountNumber}`);
  revalidatePath("/portal/sales/audit-log");
}