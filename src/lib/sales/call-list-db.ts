import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";
import { formatMoneyFromPence } from "@/lib/sales/customer-db";

export type CallListFilters = {
  q?: string;
  status?: string;
  basket?: string;
  driver?: string;
};

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatCallListStatus(status?: string | null) {
  const labels: Record<string, string> = {
    TO_CALL: "To Call",
    CALLED: "Called",
    NOTHING_NEEDED: "Nothing Needed",
    ORDER_PLACED: "Order Placed",
    NEEDS_FRESHPAC_CONTACT: "Needs Freshpac Contact",
    SKIPPED: "Skipped"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getCallListStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    TO_CALL: "info",
    CALLED: "success",
    NOTHING_NEEDED: "neutral",
    ORDER_PLACED: "success",
    NEEDS_FRESHPAC_CONTACT: "warning",
    SKIPPED: "neutral"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function formatBasketStatus(status?: string | null) {
  const labels: Record<string, string> = {
    EMPTY: "Empty",
    HAS_BASKET: "Has Basket",
    RETAIL_LOCKED: "Retail Locked",
    STANDING_ORDER_READY: "Standing Order Ready"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getBasketStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    EMPTY: "neutral",
    HAS_BASKET: "success",
    RETAIL_LOCKED: "warning",
    STANDING_ORDER_READY: "info"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function formatCustomerStatus(status?: string | null) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    ON_HOLD: "On Hold",
    ACTIVE_PREPAYMENT: "Active with Prepayment",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
    MARKED_FOR_DELETION: "Marked for Deletion",
    DELETED: "Deleted"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getCustomerStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    ACTIVE: "success",
    ON_HOLD: "danger",
    ACTIVE_PREPAYMENT: "warning",
    INACTIVE: "neutral",
    ARCHIVED: "neutral",
    MARKED_FOR_DELETION: "danger",
    DELETED: "danger"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function getLatestOrderText(
  orders: Array<{
    createdAt: Date;
    reference: string | null;
    temporaryReference: string | null;
  }>
) {
  const latest = orders[0];

  if (!latest) {
    return "No orders";
  }

  return `${latest.reference || latest.temporaryReference || "No ref"} · ${formatDate(latest.createdAt)}`;
}

export function getBasketValueText(entry: {
  customer: {
    orders: Array<{
      totalIncVatPence: number;
      status: string;
    }>;
  };
}) {
  const basketOrder = entry.customer.orders.find((order) => order.status === "DRAFT_BASKET");

  if (!basketOrder) {
    return "No basket";
  }

  return formatMoneyFromPence(basketOrder.totalIncVatPence);
}

function buildCallListWhere(filters?: CallListFilters): Prisma.CallListEntryWhereInput {
  const q = filters?.q?.trim();
  const status = filters?.status?.trim();
  const basket = filters?.basket?.trim();
  const driver = filters?.driver?.trim();

  const conditions: Prisma.CallListEntryWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { notes: { contains: q, mode: "insensitive" } },
        { assignedSalesRep: { contains: q, mode: "insensitive" } },
        { contactDay: { contains: q, mode: "insensitive" } },
        { deliveryDay: { contains: q, mode: "insensitive" } },
        { driverOrCourier: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { accountNumber: { contains: q, mode: "insensitive" } },
              { siteName: { contains: q, mode: "insensitive" } },
              { legalName: { contains: q, mode: "insensitive" } },
              { deliveryDay: { contains: q, mode: "insensitive" } },
              { driverOrCourier: { contains: q, mode: "insensitive" } },
              { assignedSalesRep: { contains: q, mode: "insensitive" } },
              {
                contacts: {
                  some: {
                    OR: [
                      { name: { contains: q, mode: "insensitive" } },
                      { role: { contains: q, mode: "insensitive" } },
                      { phone: { contains: q, mode: "insensitive" } },
                      { email: { contains: q, mode: "insensitive" } }
                    ]
                  }
                }
              },
              {
                notes: {
                  some: {
                    note: { contains: q, mode: "insensitive" }
                  }
                }
              },
              {
                addresses: {
                  some: {
                    OR: [
                      { label: { contains: q, mode: "insensitive" } },
                      { postcode: { contains: q, mode: "insensitive" } }
                    ]
                  }
                }
              }
            ]
          }
        }
      ]
    });
  }

  if (status && status !== "ALL") {
    conditions.push({
      status: status as any
    });
  }

  if (basket && basket !== "ALL") {
    conditions.push({
      basketStatus: basket as any
    });
  }

  if (driver) {
    conditions.push({
      OR: [
        { driverOrCourier: { contains: driver, mode: "insensitive" } },
        {
          customer: {
            driverOrCourier: { contains: driver, mode: "insensitive" }
          }
        }
      ]
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getCallListEntriesFromDb(filters?: CallListFilters) {
  return prisma.callListEntry.findMany({
    where: buildCallListWhere(filters),
    orderBy: [
      {
        deliveryDay: "asc"
      },
      {
        customer: {
          siteName: "asc"
        }
      }
    ],
    include: {
      customer: {
        include: {
          contacts: {
            orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
          },
          orders: {
            orderBy: {
              createdAt: "desc"
            },
            take: 5,
            include: {
              lines: true
            }
          }
        }
      }
    }
  });
}

export async function getCallListAttentionFromDb() {
  return prisma.callListEntry.findMany({
    where: {
      OR: [
        {
          status: "NEEDS_FRESHPAC_CONTACT"
        },
        {
          basketStatus: "RETAIL_LOCKED"
        },
        {
          customer: {
            OR: [
              {
                status: "ON_HOLD"
              },
              {
                status: "ACTIVE_PREPAYMENT"
              },
              {
                priceVisibility: false
              }
            ]
          }
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: {
        include: {
          contacts: {
            orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
          },
          orders: {
            orderBy: {
              createdAt: "desc"
            },
            take: 3,
            include: {
              lines: true
            }
          }
        }
      }
    },
    take: 10
  });
}

export async function getCallListStatsFromDb() {
  const [total, toCall, called, nothingNeeded, orderPlaced, needsContact] = await Promise.all([
    prisma.callListEntry.count(),
    prisma.callListEntry.count({
      where: {
        status: "TO_CALL"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "CALLED"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "NOTHING_NEEDED"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "ORDER_PLACED"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "NEEDS_FRESHPAC_CONTACT"
      }
    })
  ]);

  return {
    total,
    toCall,
    called,
    nothingNeeded,
    orderPlaced,
    needsContact
  };
}