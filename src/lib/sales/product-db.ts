import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";

export type ProductListFilters = {
  q?: string;
  type?: string;
  status?: string;
  vat?: string;
};

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatMoneyFromPence(value?: number | null) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format((value || 0) / 100);
}

export function calculateVatAmountPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return Math.round(priceExVatPence * (vatRateBasisPoints / 10000));
}

export function calculatePriceIncVatPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return priceExVatPence + calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
}

export function formatVatRate(vatRateBasisPoints?: number | null) {
  return `${((vatRateBasisPoints || 0) / 100).toFixed(2)}%`;
}

export function formatProductType(type?: string | null) {
  const labels: Record<string, string> = {
    NORMAL: "Normal",
    COFFEE: "Coffee",
    RETAIL: "Retail"
  };

  return type ? labels[type] ?? type : "Unknown";
}

export function getProductTypeTone(type?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    NORMAL: "neutral",
    COFFEE: "info",
    RETAIL: "warning"
  };

  return type ? tones[type] ?? "neutral" : "neutral";
}

export function formatProductStatus(status?: string | null) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getProductStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    ACTIVE: "success",
    INACTIVE: "warning",
    ARCHIVED: "neutral"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function formatPublicVisibility(product: { productType: string }) {
  if (product.productType === "COFFEE" || product.productType === "RETAIL") {
    return "Assigned customers only";
  }

  return "Public catalogue";
}

export function getProductWarnings(product: {
  status: string;
  productType: string;
  customerAccess: unknown[];
  customerPrices: unknown[];
}) {
  const warnings: Array<{
    label: string;
    description: string;
    tone: BadgeTone;
  }> = [];

  if (product.status !== "ACTIVE") {
    warnings.push({
      label: "Inactive",
      description: "This product is not currently active.",
      tone: "warning"
    });
  }

  if ((product.productType === "COFFEE" || product.productType === "RETAIL") && product.customerAccess.length === 0) {
    warnings.push({
      label: "No assignments",
      description: "Restricted products need customer assignment before customers can order them.",
      tone: "warning"
    });
  }

  if (product.customerPrices.length > 0) {
    warnings.push({
      label: "Customer pricing",
      description: "This product has customer-specific price overrides.",
      tone: "info"
    });
  }

  if (!warnings.length) {
    warnings.push({
      label: "No warnings",
      description: "No special product warnings currently apply.",
      tone: "success"
    });
  }

  return warnings;
}

export function getProductSalesStats(
  orderLines: Array<{
    quantity: number;
    lineTotalPence: number;
    createdAt?: Date;
    order?: {
      createdAt: Date;
    };
  }>
) {
  const now = new Date();

  const inLastDays = (days: number) =>
    orderLines.filter((line) => {
      const date = line.order?.createdAt || line.createdAt;

      if (!date) {
        return false;
      }

      const diffMs = now.getTime() - new Date(date).getTime();

      return diffMs <= days * 24 * 60 * 60 * 1000;
    });

  const buildPeriod = (period: string, lines: typeof orderLines) => ({
    period,
    quantity: lines.reduce((total, line) => total + line.quantity, 0),
    value: formatMoneyFromPence(lines.reduce((total, line) => total + line.lineTotalPence, 0)),
    orders: lines.length
  });

  return [
    buildPeriod("Last 30 days", inLastDays(30)),
    buildPeriod("Last 90 days", inLastDays(90)),
    buildPeriod("All time", orderLines)
  ];
}

function buildProductWhere(filters?: ProductListFilters): Prisma.ProductWhereInput {
  const q = filters?.q?.trim();
  const type = filters?.type?.trim();
  const status = filters?.status?.trim();
  const vat = filters?.vat?.trim();

  const conditions: Prisma.ProductWhereInput[] = [];

  if (q) {
    const qUpper = q.toUpperCase();
    const searchOr: Prisma.ProductWhereInput[] = [
      { code: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { productGroup: { contains: q, mode: "insensitive" } },
      { packSize: { contains: q, mode: "insensitive" } },
      {
        customerAccess: {
          some: {
            customer: {
              OR: [
                { accountNumber: { contains: q, mode: "insensitive" } },
                { siteName: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        }
      },
      {
        customerPrices: {
          some: {
            customer: {
              OR: [
                { accountNumber: { contains: q, mode: "insensitive" } },
                { siteName: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        }
      }
    ];

    if (qUpper === "T0" || qUpper === "T1") {
      searchOr.push({
        vatCode: qUpper
      });
    }

    conditions.push({
      OR: searchOr
    });
  }

  if (type && type !== "ALL") {
    conditions.push({
      productType: type as any
    });
  }

  if (status && status !== "ALL") {
    conditions.push({
      status: status as any
    });
  }

  if (vat && vat !== "ALL") {
    conditions.push({
      vatCode: vat as any
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getProductListFromDb(filters?: ProductListFilters) {
  return prisma.product.findMany({
    where: buildProductWhere(filters),
    orderBy: {
      name: "asc"
    },
    include: {
      customerAccess: {
        include: {
          customer: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      customerPrices: {
        include: {
          customer: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
}

export async function getProductStatsFromDb() {
  const [total, active, inactive, normal, coffee, retail] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: {
        status: "ACTIVE"
      }
    }),
    prisma.product.count({
      where: {
        status: "INACTIVE"
      }
    }),
    prisma.product.count({
      where: {
        productType: "NORMAL"
      }
    }),
    prisma.product.count({
      where: {
        productType: "COFFEE"
      }
    }),
    prisma.product.count({
      where: {
        productType: "RETAIL"
      }
    })
  ]);

  return {
    total,
    active,
    inactive,
    normal,
    coffee,
    retail
  };
}

export async function getProductByCodeFromDb(code: string) {
  return prisma.product.findUnique({
    where: {
      code
    },
    include: {
      customerAccess: {
        include: {
          customer: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      customerPrices: {
        include: {
          customer: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      orderLines: {
        include: {
          order: {
            include: {
              customer: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      },
      standingLines: {
        include: {
          standingOrder: {
            include: {
              customer: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      },
      retailLines: {
        include: {
          retailOrder: {
            include: {
              customer: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      }
    }
  });
}