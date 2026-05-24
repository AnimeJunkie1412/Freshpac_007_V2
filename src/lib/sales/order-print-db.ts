import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PrintableOrderFilters = {
  q?: string;
  status?: string;
  source?: string;
};

function buildPrintableOrderWhere(filters?: PrintableOrderFilters): Prisma.OrderWhereInput {
  const q = filters?.q?.trim();
  const status = filters?.status?.trim();
  const source = filters?.source?.trim();

  const conditions: Prisma.OrderWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { reference: { contains: q, mode: "insensitive" } },
        { temporaryReference: { contains: q, mode: "insensitive" } },
        { deliveryDay: { contains: q, mode: "insensitive" } },
        { driverOrCourier: { contains: q, mode: "insensitive" } },
        { customerPoNumber: { contains: q, mode: "insensitive" } },
        { customerNotes: { contains: q, mode: "insensitive" } },
        { internalNotes: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { accountNumber: { contains: q, mode: "insensitive" } },
              { siteName: { contains: q, mode: "insensitive" } },
              { legalName: { contains: q, mode: "insensitive" } }
            ]
          }
        },
        {
          lines: {
            some: {
              OR: [
                { productCodeSnapshot: { contains: q, mode: "insensitive" } },
                { descriptionSnapshot: { contains: q, mode: "insensitive" } },
                { packSizeSnapshot: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        }
      ]
    });
  }

  if (status && status !== "ALL") {
    if (status === "NEEDS_PRINT") {
      conditions.push({
        status: {
          in: ["SUBMITTED", "PAID_SUBMITTED"]
        }
      });
    } else if (status === "AWAITING_ATTENTION") {
      conditions.push({
        OR: [
          { status: "AWAITING_PAYMENT" },
          { priceVisibilityAtOrder: false },
          { minimumOrderPassed: false },
          { source: "OFFLINE_PENDING" }
        ]
      });
    } else {
      conditions.push({
        status: status as any
      });
    }
  }

  if (source && source !== "ALL") {
    conditions.push({
      source: source as any
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getPrintableOrderListFromDb(filters?: PrintableOrderFilters) {
  return prisma.order.findMany({
    where: buildPrintableOrderWhere(filters),
    orderBy: [
      {
        deliveryDay: "asc"
      },
      {
        createdAt: "asc"
      }
    ],
    include: {
      customer: {
        include: {
          addresses: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
          }
        }
      },
      lines: {
        orderBy: {
          createdAt: "asc"
        }
      },
      placedByUser: true,
      processedByUser: true
    }
  });
}