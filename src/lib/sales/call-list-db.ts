import { prisma } from "@/lib/prisma";
import { formatDate, formatMoneyFromPence } from "@/lib/sales/customer-db";
import type { BadgeTone } from "@/lib/sales/customers";

export function formatCallListStatus(status?: string | null) {
  const labels: Record<string, string> = {
    TO_CALL: "To call",
    CALLED: "Called",
    NOTHING_NEEDED: "Nothing Needed",
    ORDER_PLACED: "Order placed",
    NEEDS_FRESHPAC_CONTACT: "Needs Freshpac contact"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getCallListStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    TO_CALL: "info",
    CALLED: "info",
    NOTHING_NEEDED: "neutral",
    ORDER_PLACED: "success",
    NEEDS_FRESHPAC_CONTACT: "warning"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function formatBasketStatus(status?: string | null) {
  const labels: Record<string, string> = {
    EMPTY: "Empty",
    HAS_BASKET: "Has basket",
    RETAIL_LOCKED: "Retail locked",
    STANDING_ORDER_DUE: "Standing order due"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getBasketStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    EMPTY: "neutral",
    HAS_BASKET: "warning",
    RETAIL_LOCKED: "warning",
    STANDING_ORDER_DUE: "info"
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

export async function getCallListEntriesFromDb() {
  return prisma.callListEntry.findMany({
    orderBy: [{ weekStart: "desc" }, { deliveryDay: "asc" }, { customer: { siteName: "asc" } }],
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
            take: 1
          }
        }
      }
    }
  });
}

export async function getCallListStatsFromDb() {
  const [total, toCall, orderPlaced, nothingNeeded, needsContact, called] = await Promise.all([
    prisma.callListEntry.count(),
    prisma.callListEntry.count({
      where: {
        status: "TO_CALL"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "ORDER_PLACED"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "NOTHING_NEEDED"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "NEEDS_FRESHPAC_CONTACT"
      }
    }),
    prisma.callListEntry.count({
      where: {
        status: "CALLED"
      }
    })
  ]);

  return {
    total,
    toCall,
    orderPlaced,
    nothingNeeded,
    needsContact,
    called
  };
}

export async function getCallListAttentionFromDb() {
  return prisma.callListEntry.findMany({
    where: {
      OR: [
        {
          status: "NEEDS_FRESHPAC_CONTACT"
        },
        {
          customer: {
            status: {
              in: ["ON_HOLD", "ACTIVE_PREPAYMENT"]
            }
          }
        },
        {
          basketStatus: {
            in: ["RETAIL_LOCKED", "STANDING_ORDER_DUE"]
          }
        }
      ]
    },
    orderBy: [{ weekStart: "desc" }, { customer: { siteName: "asc" } }],
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
            take: 1
          }
        }
      }
    },
    take: 10
  });
}

export function getLatestOrderText(
  orders: Array<{
    createdAt: Date;
  }>
) {
  const latestOrder = orders[0];

  if (!latestOrder) {
    return "No orders";
  }

  return formatDate(latestOrder.createdAt);
}

export function getBasketValueText(
  entry: {
    basketStatus: string;
    customer: {
      priceVisibility: boolean;
    };
  }
) {
  if (!entry.customer.priceVisibility) {
    return "Hidden";
  }

  if (entry.basketStatus === "EMPTY") {
    return formatMoneyFromPence(0);
  }

  return "Pending";
}

export { formatDate };