import { prisma } from "@/lib/prisma";

export type ManualOrderHeaderUpdateInput = {
  orderReference: string;
  customerPoNumber?: string;
  deliveryDay?: string;
  driverOrCourier?: string;
  deliveryMethod?: string;
  customerNotes?: string;
  internalNotes?: string;
};

export function getEditableManualOrderReference(order: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return order.reference || order.temporaryReference || "";
}

export async function getManualOrderForHeaderEditFromDb(reference: string) {
  return prisma.order.findFirst({
    where: {
      OR: [
        {
          reference
        },
        {
          temporaryReference: reference
        }
      ]
    },
    include: {
      customer: true,
      lines: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });
}

export async function updateManualOrderHeaderFromDb(input: ManualOrderHeaderUpdateInput) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        {
          reference: input.orderReference
        },
        {
          temporaryReference: input.orderReference
        }
      ]
    },
    select: {
      id: true,
      reference: true,
      temporaryReference: true
    }
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  return prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      customerPoNumber: cleanOptionalText(input.customerPoNumber),
      deliveryDay: cleanOptionalText(input.deliveryDay),
      driverOrCourier: cleanOptionalText(input.driverOrCourier),
      deliveryMethod: cleanOptionalText(input.deliveryMethod) as any,
      customerNotes: cleanOptionalText(input.customerNotes),
      internalNotes: cleanOptionalText(input.internalNotes),
      editedByFreshpac: true,
      updatedAt: new Date()
    },
    include: {
      customer: true,
      lines: true
    }
  });
}

function cleanOptionalText(value?: string | null) {
  const text = value?.trim();

  return text ? text : null;
}