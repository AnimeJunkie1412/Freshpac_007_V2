import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";

export type CustomerListFilters = {
  q?: string;
  status?: string;
};

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatDateTime(date?: Date | string | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatMoneyFromPence(value?: number | null) {
  const amount = (value || 0) / 100;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(amount);
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

export function formatDeliveryMethod(method?: string | null) {
  const labels: Record<string, string> = {
    FRESHPAC_ROUTE: "Freshpac route",
    COURIER: "Courier"
  };

  return method ? labels[method] ?? method : "Not set";
}

export function formatEquipmentStatus(status?: string | null) {
  const labels: Record<string, string> = {
    OWNED: "Owned",
    LOANED: "Loaned",
    RENTED: "Rented",
    REMOVED: "Removed",
    ARCHIVED: "Archived"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatOrderStatus(status?: string | null) {
  const labels: Record<string, string> = {
    DRAFT_BASKET: "Draft Basket",
    SUBMITTED: "Submitted",
    AWAITING_PAYMENT: "Awaiting Payment",
    PAID_SUBMITTED: "Paid Submitted",
    PROCESSED: "Processed",
    CANCELLED: "Cancelled"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatProductType(type?: string | null) {
  const labels: Record<string, string> = {
    NORMAL: "Normal",
    COFFEE: "Coffee",
    RETAIL: "Retail"
  };

  return type ? labels[type] ?? type : "Unknown";
}

export function getAddressLines(
  addresses: Array<{
    type: string;
    lines: string[];
  }>,
  type: string
) {
  const address = addresses.find((item) => item.type === type);

  if (!address || !address.lines.length) {
    return ["Not recorded"];
  }

  return address.lines;
}

export function buildCustomerFlags(customer: {
  status: string;
  priceVisibility: boolean;
  onCallList: boolean;
}) {
  const flags: Array<{
    label: string;
    description: string;
    tone: BadgeTone;
  }> = [];

  if (customer.status === "ON_HOLD") {
    flags.push({
      label: "On Hold",
      description: "Account should not process new orders until reviewed.",
      tone: "danger"
    });
  }

  if (customer.status === "ACTIVE_PREPAYMENT") {
    flags.push({
      label: "Prepayment",
      description: "Payment should be confirmed externally before processing.",
      tone: "warning"
    });
  }

  if (!customer.priceVisibility) {
    flags.push({
      label: "Prices Hidden",
      description: "Customer-facing documents should show Delivery Note Needed.",
      tone: "warning"
    });
  }

  if (customer.onCallList) {
    flags.push({
      label: "Call List",
      description: "Customer is included in weekly telesales contact.",
      tone: "info"
    });
  }

  if (!flags.length) {
    flags.push({
      label: "Good Standing",
      description: "No special handling flags currently apply.",
      tone: "success"
    });
  }

  return flags;
}

function buildCustomerWhere(filters?: CustomerListFilters) {
  const q = filters?.q?.trim();
  const status = filters?.status?.trim();

  const conditions: Prisma.CustomerAccountWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { accountNumber: { contains: q, mode: "insensitive" } },
        { siteName: { contains: q, mode: "insensitive" } },
        { legalName: { contains: q, mode: "insensitive" } },
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
          addresses: {
            some: {
              OR: [
                { label: { contains: q, mode: "insensitive" } },
                { postcode: { contains: q, mode: "insensitive" } },
                { lines: { has: q } }
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
          equipment: {
            some: {
              OR: [
                { description: { contains: q, mode: "insensitive" } },
                { makeModel: { contains: q, mode: "insensitive" } },
                { serialNumber: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        }
      ]
    });
  }

  if (status && status !== "ALL") {
    if (status === "HIDDEN_PRICES") {
      conditions.push({ priceVisibility: false });
    } else if (status === "CALL_LIST") {
      conditions.push({ onCallList: true });
    } else {
      conditions.push({ status: status as any });
    }
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getCustomerListFromDb(filters?: CustomerListFilters) {
  return prisma.customerAccount.findMany({
    where: buildCustomerWhere(filters),
    orderBy: {
      siteName: "asc"
    },
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
      },
      orders: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        include: {
          lines: true
        }
      }
    }
  });
}

export async function getCustomerStatsFromDb() {
  const [total, active, onHold, prepayment, pricesHidden, onCallList] = await Promise.all([
    prisma.customerAccount.count(),
    prisma.customerAccount.count({
      where: {
        status: "ACTIVE"
      }
    }),
    prisma.customerAccount.count({
      where: {
        status: "ON_HOLD"
      }
    }),
    prisma.customerAccount.count({
      where: {
        status: "ACTIVE_PREPAYMENT"
      }
    }),
    prisma.customerAccount.count({
      where: {
        priceVisibility: false
      }
    }),
    prisma.customerAccount.count({
      where: {
        onCallList: true
      }
    })
  ]);

  return {
    total,
    active,
    onHold,
    prepayment,
    pricesHidden,
    onCallList
  };
}

export async function getCustomerByAccountFromDb(accountNumber: string) {
  return prisma.customerAccount.findUnique({
    where: {
      accountNumber
    },
    include: {
      parentAccount: true,
      childAccounts: true,
      addresses: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }]
      },
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
      },
      notes: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          createdByUser: true
        }
      },
      prices: {
        include: {
          product: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      productAccess: {
        include: {
          product: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      equipment: {
        orderBy: {
          createdAt: "desc"
        }
      },
      orders: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          lines: true
        }
      },
      engineerJobs: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          partsRequests: true
        }
      }
    }
  });
}