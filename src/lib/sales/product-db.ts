import { prisma } from "@/lib/prisma";
import { formatDate, formatMoneyFromPence, formatProductType } from "@/lib/sales/customer-db";
import type { BadgeTone } from "@/lib/sales/customers";

export function formatProductStatus(status?: string | null) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
    MARKED_FOR_DELETION: "Marked for Deletion"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getProductStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    ACTIVE: "success",
    INACTIVE: "warning",
    ARCHIVED: "neutral",
    MARKED_FOR_DELETION: "danger"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function getProductTypeTone(type?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    NORMAL: "neutral",
    COFFEE: "info",
    RETAIL: "warning"
  };

  return type ? tones[type] ?? "neutral" : "neutral";
}

export function formatPublicVisibility(product: {
  productType: string;
  status: string;
}) {
  if (product.status !== "ACTIVE") {
    return "Staff only";
  }

  if (product.productType === "COFFEE" || product.productType === "RETAIL") {
    return "Assigned customers only";
  }

  return "Visible to logged-in customers";
}

export function calculateVatAmountPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return Math.round((priceExVatPence * vatRateBasisPoints) / 10000);
}

export function calculatePriceIncVatPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return priceExVatPence + calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
}

export function formatVatRate(vatRateBasisPoints: number) {
  return `${vatRateBasisPoints / 100}%`;
}

export async function getProductListFromDb() {
  return prisma.product.findMany({
    orderBy: [{ productType: "asc" }, { name: "asc" }],
    include: {
      customerAccess: {
        include: {
          customer: true
        }
      },
      customerPrices: {
        include: {
          customer: true
        }
      },
      orderLines: {
        include: {
          order: true
        }
      }
    }
  });
}

export async function getProductStatsFromDb() {
  const [total, active, inactive, coffee, retail, normal] = await Promise.all([
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
        productType: "COFFEE"
      }
    }),
    prisma.product.count({
      where: {
        productType: "RETAIL"
      }
    }),
    prisma.product.count({
      where: {
        productType: "NORMAL"
      }
    })
  ]);

  return {
    total,
    active,
    inactive,
    coffee,
    retail,
    normal
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
          updatedAt: "desc"
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
        }
      },
      standingLines: {
        include: {
          standingOrder: {
            include: {
              customer: true
            }
          }
        }
      },
      retailLines: {
        include: {
          retailOrder: {
            include: {
              customer: true
            }
          }
        }
      }
    }
  });
}

export function getProductSalesStats(
  orderLines: Array<{
    quantity: number;
    lineTotalPence: number;
    createdAt: Date;
  }>
) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(now.getDate() - 28);

  const twelveWeeksAgo = new Date(now);
  twelveWeeksAgo.setDate(now.getDate() - 84);

  const buildPeriod = (label: string, from: Date) => {
    const lines = orderLines.filter((line) => line.createdAt >= from);

    return {
      period: label,
      quantity: lines.reduce((total, line) => total + line.quantity, 0),
      value: formatMoneyFromPence(lines.reduce((total, line) => total + line.lineTotalPence, 0))
    };
  };

  return [
    buildPeriod("Last 7 days", weekAgo),
    buildPeriod("Last 4 weeks", fourWeeksAgo),
    buildPeriod("Last 12 weeks", twelveWeeksAgo)
  ];
}

export function getProductWarnings(product: {
  code: string;
  productType: string;
  status: string;
  sageCodeRequired: boolean;
  customerAccess: Array<unknown>;
  customerPrices: Array<unknown>;
}) {
  const warnings: Array<{
    label: string;
    tone: BadgeTone;
    description: string;
  }> = [];

  if (!product.code && product.sageCodeRequired) {
    warnings.push({
      label: "Missing Sage code",
      tone: "danger",
      description: "Product cannot be made active without a Sage product code."
    });
  }

  if (product.status !== "ACTIVE") {
    warnings.push({
      label: formatProductStatus(product.status),
      tone: getProductStatusTone(product.status),
      description: "Inactive or archived products should not be visible to customers."
    });
  }

  if ((product.productType === "COFFEE" || product.productType === "RETAIL") && product.customerAccess.length === 0) {
    warnings.push({
      label: "No assignments",
      tone: "warning",
      description: "Restricted products need customer assignments before customers can order them."
    });
  }

  if (product.customerPrices.length > 0) {
    warnings.push({
      label: "Custom pricing",
      tone: "info",
      description: "One or more customer-specific price overrides exist."
    });
  }

  if (!warnings.length) {
    warnings.push({
      label: "No warnings",
      tone: "success",
      description: "No product warnings found."
    });
  }

  return warnings;
}

export function buildProductExportRows(
  products: Array<{
    code: string;
    name: string;
    productType: string;
    status: string;
    category: string | null;
    productGroup: string | null;
    packSize: string | null;
    priceExVatPence: number;
    vatCode: string;
    vatRateBasisPoints: number;
  }>
) {
  return products.map((product) => ({
    code: product.code,
    name: product.name,
    type: formatProductType(product.productType),
    status: formatProductStatus(product.status),
    category: product.category || "",
    group: product.productGroup || "",
    packSize: product.packSize || "",
    priceExVat: formatMoneyFromPence(product.priceExVatPence),
    vatCode: product.vatCode,
    vatRate: formatVatRate(product.vatRateBasisPoints),
    priceIncVat: formatMoneyFromPence(calculatePriceIncVatPence(product.priceExVatPence, product.vatRateBasisPoints)),
    visibility: formatPublicVisibility(product)
  }));
}

export { formatDate, formatMoneyFromPence, formatProductType };