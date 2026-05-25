import { prisma } from "@/lib/prisma";

export function getSubmittedManualOrderReference(order: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return order.reference || order.temporaryReference || "";
}

export async function submitManualOrderFromDb(orderReference: string) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        {
          reference: orderReference
        },
        {
          temporaryReference: orderReference
        }
      ]
    },
    include: {
      customer: true,
      lines: true
    }
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  if (!order.lines.length) {
    throw new Error("Add at least one product line before submitting this order.");
  }

  if (order.status !== "DRAFT_BASKET") {
    return order;
  }

  const nextStatus = order.customer.status === "ACTIVE_PREPAYMENT" ? "AWAITING_PAYMENT" : "SUBMITTED";

  return prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      status: nextStatus,
      submittedAt: new Date(),
      orderedByFreshpac: true,
      editedByFreshpac: true
    },
    include: {
      customer: true,
      lines: true
    }
  });
}