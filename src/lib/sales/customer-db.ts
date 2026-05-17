import { prisma } from "@/lib/prisma";
import type { BadgeTone, CustomerStatus } from "@/lib/sales/customers";

const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP"
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export function formatMoneyFromPence(value?: number | null) {
  if (typeof value !== "number") {
    return "£0.00";
  }

  return moneyFormatter.format(value / 100);
}

export function formatDate(value?: Date | string | null) {
  if (!value) {
    return "Not recorded";
  }

  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) {
    return "Not recorded";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatCustomerStatus(status: string): CustomerStatus {
  const labels: Record<string, CustomerStatus> = {
    ACTIVE: "Active",
    ON_HOLD: "On Hold",
    ACTIVE_PREPAYMENT: "Active with Prepayment",
    INACTIVE: "Inactive",
    ARCHIVED: "Inactive",
    MARKED_FOR_DELETION: "Inactive",
    DELETED: "Inactive"
  };

  return labels[status] ?? "Inactive";
}

export function getCustomerStatusTone(status: string): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    ACTIVE: "success",
    ON_HOLD: "danger",
    ACTIVE_PREPAYMENT: "warning",
    INACTIVE: "neutral",
    ARCHIVED: "neutral",
    MARKED_FOR_DELETION: "danger",
    DELETED: "danger"
  };

  return tones[status] ?? "neutral";
}

export function formatDeliveryMethod(method?: string | null) {
  const labels: Record<string, string> = {
    FRESHPAC_ROUTE: "Freshpac route",
    COURIER: "Courier"
  };

  return method ? labels[method] ?? method : "Not set";
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

  return status ? labels[status] ?? status : "Not recorded";
}

export function formatEquipmentStatus(status?: string | null) {
  const labels: Record<string, string> = {
    OWNED: "Owned",
    RENTED: "Rented",
    LOANED: "Loaned",
    TRIAL: "Trial",
    OBSOLETE: "Obsolete"
  };

  return status ? labels[status] ?? status : "Not recorded";
}

export function formatProductType(type?: string | null) {
  const labels: Record<string, string> = {
    NORMAL: "Normal Product",
    COFFEE: "Coffee Product",
    RETAIL: "Retail Product"
  };

  return type ? labels[type] ?? type : "Product";
}

export async function getCustomerListFromDb() {
  return prisma.customerAccount.findMany({
    orderBy: [{ siteName: "asc" }],
    include: {
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
      },
      addresses: true,
      orders: {
        orderBy: [{ createdAt: "desc" }],
        take: 1
      },
      productAccess: {
        include: {
          product: true
        }
      },
      equipment: true
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
      childAccounts: {
        orderBy: {
          siteName: "asc"
        }
      },
      addresses: {
        orderBy: [{ type: "asc" }, { isPrimary: "desc" }]
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
      equipment: {
        orderBy: {
          createdAt: "desc"
        }
      },
      prices: {
        include: {
          product: true
        },
        orderBy: {
          updatedAt: "desc"
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
      orders: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          lines: {
            orderBy: {
              createdAt: "asc"
            }
          }
        }
      },
      engineerJobs: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          machineSheets: true,
          partsRequests: true
        }
      },
      callListEntries: {
        orderBy: {
          weekStart: "desc"
        },
        take: 5
      }
    }
  });
}

export function getAddressLines(
  addresses: Array<{
    type: string;
    label: string | null;
    lines: string[];
    postcode: string | null;
  }>,
  type: string
) {
  const address = addresses.find((item) => item.type === type);

  if (!address) {
    return ["Not recorded"];
  }

  return address.lines.length ? address.lines : ["Not recorded"];
}

export function buildCustomerFlags(customer: {
  status: string;
  priceVisibility: boolean;
  onCallList: boolean;
  deliveryMethod: string;
  productAccess: Array<{
    product: {
      productType: string;
    };
  }>;
}) {
  const flags: Array<{
    label: string;
    tone: BadgeTone;
    description: string;
  }> = [];

  if (customer.status === "ON_HOLD") {
    flags.push({
      label: "On hold",
      tone: "danger",
      description: "Customer can build basket but cannot submit orders."
    });
  }

  if (customer.status === "ACTIVE_PREPAYMENT") {
    flags.push({
      label: "Prepayment",
      tone: "warning",
      description: "Orders become Awaiting Payment until Freshpac confirms external payment."
    });
  }

  if (!customer.priceVisibility) {
    flags.push({
      label: "Prices hidden",
      tone: "warning",
      description: "Customer-facing documents should show Delivery Note Needed."
    });
  }

  if (customer.onCallList) {
    flags.push({
      label: "Call list",
      tone: "info",
      description: "Customer appears on the weekly telesales list."
    });
  }

  if (customer.deliveryMethod === "COURIER") {
    flags.push({
      label: "Courier",
      tone: "info",
      description: "Courier minimum and carriage rules apply."
    });
  }

  if (customer.productAccess.some((access) => access.product.productType === "COFFEE")) {
    flags.push({
      label: "Coffee assigned",
      tone: "success",
      description: "Restricted coffee products are assigned to this account."
    });
  }

  if (!flags.length) {
    flags.push({
      label: "No warnings",
      tone: "success",
      description: "No account warnings found."
    });
  }

  return flags;
}