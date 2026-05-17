"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderActionSchema = z.object({
  orderId: z.string().uuid(),
  reference: z.string().min(1)
});

const orderNoteSchema = z.object({
  orderId: z.string().uuid(),
  reference: z.string().min(1),
  internalNotes: z.string().min(2)
});

async function auditOrder(actionType: string, reference: string, reason: string) {
  await prisma.auditLog.create({
    data: {
      actionType,
      entityType: "ORDER",
      entityId: reference,
      reason
    }
  });
}

export async function markOrderPaid(formData: FormData) {
  const parsed = orderActionSchema.parse({
    orderId: formData.get("orderId"),
    reference: formData.get("reference")
  });

  await prisma.order.update({
    where: {
      id: parsed.orderId
    },
    data: {
      status: "PAID_SUBMITTED"
    }
  });

  await auditOrder("MARK_ORDER_PAID", parsed.reference, "Order marked as paid after external payment confirmation.");

  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${parsed.reference}`);
  revalidatePath("/portal/sales/audit-log");
}

export async function markOrderProcessed(formData: FormData) {
  const parsed = orderActionSchema.parse({
    orderId: formData.get("orderId"),
    reference: formData.get("reference")
  });

  await prisma.order.update({
    where: {
      id: parsed.orderId
    },
    data: {
      status: "PROCESSED",
      processedAt: new Date()
    }
  });

  await auditOrder("PROCESS_ORDER", parsed.reference, "Order marked as processed after print/processing confirmation.");

  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${parsed.reference}`);
  revalidatePath("/portal/sales/audit-log");
}

export async function cancelOrder(formData: FormData) {
  const parsed = orderActionSchema.parse({
    orderId: formData.get("orderId"),
    reference: formData.get("reference")
  });

  await prisma.order.update({
    where: {
      id: parsed.orderId
    },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date()
    }
  });

  await auditOrder("CANCEL_ORDER", parsed.reference, "Order cancelled from Sales Portal.");

  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${parsed.reference}`);
  revalidatePath("/portal/sales/audit-log");
}

export async function updateOrderInternalNotes(formData: FormData) {
  const parsed = orderNoteSchema.parse({
    orderId: formData.get("orderId"),
    reference: formData.get("reference"),
    internalNotes: formData.get("internalNotes")
  });

  await prisma.order.update({
    where: {
      id: parsed.orderId
    },
    data: {
      internalNotes: parsed.internalNotes
    }
  });

  await auditOrder("UPDATE_ORDER_INTERNAL_NOTES", parsed.reference, "Order internal notes updated.");

  revalidatePath("/portal/sales/orders");
  revalidatePath(`/portal/sales/orders/${parsed.reference}`);
  revalidatePath("/portal/sales/audit-log");
}