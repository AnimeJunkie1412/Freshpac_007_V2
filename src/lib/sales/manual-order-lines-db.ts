import { prisma } from "@/lib/prisma";

export type ManualOrderProductFilters = {
  q?: string;
};

export type ManualOrderLinePricingInput = {
  priceExVatPence?: number | null;
  vatRateBasisPoints?: number | null;
};

export function formatMoneyFromPence(value?: number | null) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format((value || 0) / 100);
}

export function calculateVatAmountPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return Math.round((priceExVatPence * vatRateBasisPoints) / 10000);
}

export function calculatePriceIncVatPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return priceExVatPence + calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
}

export function formatVatRate(vatRateBasisPoints?: number | null) {
  return `${((vatRateBasisPoints || 0) / 100).toFixed(2).replace(".00", "")}%`;
}

export function parseMoneyToPence(value?: string | null) {
  const cleaned = String(value || "")
    .replace(/[£,\s]/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function parseVatPercentToBasisPoints(value?: string | null) {
  const cleaned = String(value || "")
    .replace(/[%\s]/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function inferVatRateBasisPointsFromLine(line: {
  priceExVatPence: number;
  vatPence: number;
}) {
  if (!line.priceExVatPence) {
    return 0;
  }

  return Math.round((line.vatPence / line.priceExVatPence) * 10000);
}

export function getProductDescription(product: any) {
  return product.description || product.name || product.productName || product.code || "Unnamed product";
}

export function getProductDisplayName(product: any) {
  return product.name || product.productName || product.description || product.code || "Unnamed product";
}

export function getProductPriceExVatPence(product: any) {
  return Number(product.priceExVatPence || 0);
}

export function getProductVatRateBasisPoints(product: any) {
  return Number(product.vatRateBasisPoints || 0);
}

export function getOrderReferenceForManualLines(order: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return order.reference || order.temporaryReference || "";
}

export async function getManualOrderForLineEditFromDb(reference: string) {
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

export async function getManualOrderProductOptionsFromDb(filters?: ManualOrderProductFilters) {
  const q = filters?.q?.trim();

  const where: any = q
    ? {
        OR: [
          {
            code: {
              contains: q,
              mode: "insensitive"
            }
          },
          {
            description: {
              contains: q,
              mode: "insensitive"
            }
          },
          {
            productGroup: {
              contains: q,
              mode: "insensitive"
            }
          },
          {
            packSize: {
              contains: q,
              mode: "insensitive"
            }
          }
        ]
      }
    : {};

  return prisma.product.findMany({
    where,
    orderBy: [
      {
        code: "asc"
      }
    ],
    take: 60
  });
}

export async function addManualOrderLineFromDb({
  orderReference,
  productId,
  quantity,
  pricing
}: {
  orderReference: string;
  productId: string;
  quantity: number;
  pricing?: ManualOrderLinePricingInput;
}) {
  const safeQuantity = normaliseQuantity(quantity);

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
      customer: true
    }
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId
    } as any
  });

  if (!product) {
    throw new Error("Product was not found.");
  }

  const defaultPriceExVatPence = getProductPriceExVatPence(product);
  const defaultVatRateBasisPoints = getProductVatRateBasisPoints(product);

  const priceExVatPence =
    typeof pricing?.priceExVatPence === "number" && pricing.priceExVatPence >= 0
      ? pricing.priceExVatPence
      : defaultPriceExVatPence;

  const vatRateBasisPoints =
    typeof pricing?.vatRateBasisPoints === "number" && pricing.vatRateBasisPoints >= 0
      ? pricing.vatRateBasisPoints
      : defaultVatRateBasisPoints;

  const vatPence = calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
  const priceIncVatPence = calculatePriceIncVatPence(priceExVatPence, vatRateBasisPoints);
  const lineTotalPence = priceIncVatPence * safeQuantity;

  await prisma.orderLine.create({
    data: {
      orderId: order.id,
      productId: product.id,
      quantity: safeQuantity,
      productCodeSnapshot: (product as any).code || "UNKNOWN",
      descriptionSnapshot: getProductDescription(product),
      packSizeSnapshot: (product as any).packSize || null,
      priceExVatPence,
      vatPence,
      priceIncVatPence,
      lineTotalPence,
      source: "FRESHPAC_ADDED",
      lockedFromCustomer: true
    } as any
  });

  await recalculateOrderTotals(order.id);

  return order;
}

export async function updateManualOrderLineQuantityFromDb({
  orderReference,
  lineId,
  quantity
}: {
  orderReference: string;
  lineId: string;
  quantity: number;
}) {
  const safeQuantity = normaliseQuantity(quantity);
  const order = await getManualOrderWithLineOrThrow(orderReference, lineId);

  const line = order.lines.find((orderLine) => orderLine.id === lineId);

  if (!line) {
    throw new Error("Order line was not found.");
  }

  await prisma.orderLine.update({
    where: {
      id: lineId
    },
    data: {
      quantity: safeQuantity,
      lineTotalPence: line.priceIncVatPence * safeQuantity
    }
  });

  await recalculateOrderTotals(order.id);

  return order;
}

export async function updateManualOrderLinePricingFromDb({
  orderReference,
  lineId,
  quantity,
  priceExVatPence,
  vatRateBasisPoints
}: {
  orderReference: string;
  lineId: string;
  quantity: number;
  priceExVatPence: number;
  vatRateBasisPoints: number;
}) {
  const safeQuantity = normaliseQuantity(quantity);
  const safePriceExVatPence = Math.max(0, Math.round(priceExVatPence || 0));
  const safeVatRateBasisPoints = Math.max(0, Math.round(vatRateBasisPoints || 0));
  const order = await getManualOrderWithLineOrThrow(orderReference, lineId);

  const vatPence = calculateVatAmountPence(safePriceExVatPence, safeVatRateBasisPoints);
  const priceIncVatPence = calculatePriceIncVatPence(safePriceExVatPence, safeVatRateBasisPoints);
  const lineTotalPence = priceIncVatPence * safeQuantity;

  await prisma.orderLine.update({
    where: {
      id: lineId
    },
    data: {
      quantity: safeQuantity,
      priceExVatPence: safePriceExVatPence,
      vatPence,
      priceIncVatPence,
      lineTotalPence
    }
  });

  await recalculateOrderTotals(order.id);

  return order;
}

export async function removeManualOrderLineFromDb({
  orderReference,
  lineId
}: {
  orderReference: string;
  lineId: string;
}) {
  const order = await getManualOrderWithLineOrThrow(orderReference, lineId);

  await prisma.orderLine.delete({
    where: {
      id: lineId
    }
  });

  await recalculateOrderTotals(order.id);

  return order;
}

export async function recalculateOrderTotals(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    include: {
      lines: true
    }
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  const totalExVatPence = order.lines.reduce((total, line) => {
    return total + line.priceExVatPence * line.quantity;
  }, 0);

  const vatTotalPence = order.lines.reduce((total, line) => {
    return total + line.vatPence * line.quantity;
  }, 0);

  const lineTotalsIncVatPence = order.lines.reduce((total, line) => {
    return total + line.lineTotalPence;
  }, 0);

  const carriageIncVatPence = order.carriageIncVatPence || 0;
  const totalIncVatPence = lineTotalsIncVatPence + carriageIncVatPence;

  return prisma.order.update({
    where: {
      id: orderId
    },
    data: {
      totalExVatPence,
      vatTotalPence,
      totalIncVatPence
    }
  });
}

async function getManualOrderWithLineOrThrow(orderReference: string, lineId: string) {
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
      lines: true
    }
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  const lineBelongsToOrder = order.lines.some((line) => line.id === lineId);

  if (!lineBelongsToOrder) {
    throw new Error("Order line does not belong to this order.");
  }

  return order;
}

function normaliseQuantity(quantity: number) {
  return Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1));
}