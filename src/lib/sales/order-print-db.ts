import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PrintableOrderFilters = {
  q?: string | string[];
  status?: string;
  source?: string;
  references?: string[];
};

const selectedReferencePrefix = "ORDER_REF:";

export function buildSelectedOrderQueryValue(reference: string) {
  return `${selectedReferencePrefix}${reference}`;
}

export function buildPrintableOrderWhere(filters?: PrintableOrderFilters): Prisma.OrderWhereInput {
  const extracted = extractSearchAndSelectedReferences(filters);
  const q = extracted.q;
  const selectedReferences = extracted.references;

  if (selectedReferences.length) {
    return {
      OR: [
        {
          reference: {
            in: selectedReferences
          }
        },
        {
          temporaryReference: {
            in: selectedReferences
          }
        }
      ]
    };
  }

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

export function buildProcessablePrintedOrderWhere(filters?: PrintableOrderFilters): Prisma.OrderWhereInput {
  const printableWhere = buildPrintableOrderWhere(filters);

  return {
    AND: [
      printableWhere,
      {
        status: {
          in: ["SUBMITTED", "PAID_SUBMITTED"]
        }
      }
    ]
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

export async function getProcessablePrintedOrderCountFromDb(filters?: PrintableOrderFilters) {
  return prisma.order.count({
    where: buildProcessablePrintedOrderWhere(filters)
  });
}

export async function markPrintedOrdersProcessedFromDb(filters?: PrintableOrderFilters) {
  return prisma.order.updateMany({
    where: buildProcessablePrintedOrderWhere(filters),
    data: {
      status: "PROCESSED",
      processedAt: new Date()
    }
  });
}

function extractSearchAndSelectedReferences(filters?: PrintableOrderFilters) {
  const explicitReferences = normaliseReferences(filters?.references || []);

  if (explicitReferences.length) {
    return {
      q: readSingleSearchValue(filters?.q),
      references: explicitReferences
    };
  }

  const qInput = filters?.q;

  if (Array.isArray(qInput)) {
    const selectedReferences = normaliseReferences(
      qInput
        .map((value) => value.trim())
        .filter((value) => value.startsWith(selectedReferencePrefix))
        .map((value) => value.slice(selectedReferencePrefix.length))
    );

    if (selectedReferences.length) {
      return {
        q: "",
        references: selectedReferences
      };
    }

    return {
      q: qInput.find((value) => value.trim())?.trim() || "",
      references: []
    };
  }

  return {
    q: qInput?.trim() || "",
    references: []
  };
}

function readSingleSearchValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.find((item) => item.trim() && !item.startsWith(selectedReferencePrefix))?.trim() || "";
  }

  return value?.trim() || "";
}

function normaliseReferences(references: string[]) {
  return Array.from(
    new Set(
      references
        .map((reference) => reference.trim())
        .filter(Boolean)
    )
  );
}