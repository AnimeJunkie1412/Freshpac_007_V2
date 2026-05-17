"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const idSchema = z.string().uuid();

const assignSchema = z.object({
  requestId: z.string().uuid(),
  assignedSalesRep: z.string().min(2)
});

async function auditTradeRequest(actionType: string, requestId: string, reason: string) {
  await prisma.auditLog.create({
    data: {
      actionType,
      entityType: "TRADE_ACCOUNT_REQUEST",
      entityId: requestId,
      reason
    }
  });
}

export async function markTradeRequestContacted(formData: FormData) {
  const requestId = idSchema.parse(formData.get("requestId"));

  await prisma.tradeAccountRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: "CONTACTED"
    }
  });

  await auditTradeRequest("CONTACT_TRADE_REQUEST", requestId, "Trade request marked as contacted.");

  revalidatePath("/portal/sales/trade-requests");
  revalidatePath(`/portal/sales/trade-requests/${requestId}`);
}

export async function assignTradeRequest(formData: FormData) {
  const parsed = assignSchema.parse({
    requestId: formData.get("requestId"),
    assignedSalesRep: formData.get("assignedSalesRep")
  });

  await prisma.tradeAccountRequest.update({
    where: {
      id: parsed.requestId
    },
    data: {
      status: "ASSIGNED",
      assignedSalesRep: parsed.assignedSalesRep
    }
  });

  await auditTradeRequest("ASSIGN_TRADE_REQUEST", parsed.requestId, `Assigned to ${parsed.assignedSalesRep}.`);

  revalidatePath("/portal/sales/trade-requests");
  revalidatePath(`/portal/sales/trade-requests/${parsed.requestId}`);
}

export async function acceptTradeRequest(formData: FormData) {
  const requestId = idSchema.parse(formData.get("requestId"));

  await prisma.tradeAccountRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: "ACCEPTED"
    }
  });

  await auditTradeRequest("ACCEPT_TRADE_REQUEST", requestId, "Trade request accepted for customer account creation.");

  revalidatePath("/portal/sales/trade-requests");
  revalidatePath(`/portal/sales/trade-requests/${requestId}`);
}

export async function rejectTradeRequest(formData: FormData) {
  const requestId = idSchema.parse(formData.get("requestId"));

  await prisma.tradeAccountRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: "REJECTED"
    }
  });

  await auditTradeRequest("REJECT_TRADE_REQUEST", requestId, "Trade request rejected.");

  revalidatePath("/portal/sales/trade-requests");
  revalidatePath(`/portal/sales/trade-requests/${requestId}`);
}

export async function archiveTradeRequest(formData: FormData) {
  const requestId = idSchema.parse(formData.get("requestId"));

  await prisma.tradeAccountRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: "ARCHIVED"
    }
  });

  await auditTradeRequest("ARCHIVE_TRADE_REQUEST", requestId, "Trade request archived.");

  revalidatePath("/portal/sales/trade-requests");
  revalidatePath(`/portal/sales/trade-requests/${requestId}`);
}