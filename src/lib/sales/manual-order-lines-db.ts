import { prisma } from "@/lib/prisma";

export type ManualOrderProductFilters = {
  q?: string;
  customerId?: string;
};

export type ManualOrderLinePricingInput = {
  priceExVatPence?: number | null;
  vatRateBasisPoints?: number | null;
};

export type ManualOrderPadRowInput = {
  productId: string;
  quantity: number;
  priceExVatPence?: number | null;
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

export function getProductDefaultPriceExVatPence(product: any) {
  return Number(product.priceExVatPence || 0);
}

export function getProductCustomerPriceExVatPence(product: any) {
  const customerPrices = Array.isArray(product.customerPrices) ? product.customerPrices : [];
  const customerPrice = customerPrices[0];

  if (!customerPrice) {
    return null;
  }

  const value = Number(customerPrice.priceExVatPence);

  return Number.isFinite(value) ? value : null;
}

export function getProductEffectivePriceExVatPence(product: any) {
  return getProductCustomerPriceExVatPence(product) ?? getProductDefaultPriceExVatPence(product);
}

export function getProductPricingSource(product: any) {
  return getProductCustomerPriceExVatPence(product) === null ? "Default" : "Customer";
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

export async function getCustomerOrderPadFromDb({
  orderReference,
  q
}: {
  orderReference: string;
  q?: string;
}) {
  const order = await getManualOrderForLineEditFromDb(orderReference);

  if (!order) {
    throw new Error("Order was not found.");
  }

  const search = q?.trim() || "";
  const currentProductIds = order.lines
    .map((line: any) => line.productId)
    .filter(Boolean);

  const pastProductIds = await getPastOrderedProductIds(order.customerId);
  const knownProductIds = Array.from(new Set([...currentProductIds, ...pastProductIds]));

  const where = buildOrderPadProductWhere({
    q: search,
    customerId: order.customerId,
    knownProductIds
  });

  const products = await prisma.product.findMany({
    where,
    orderBy: [
      {
        code: "asc"
      }
    ],
    include: {
      customerPrices: {
        where: {
          customerId: order.customerId
        },
        take: 1
      }
    },
    take: search ? 120 : 300
  } as any);

  return {
    order,
    products
  };
}

export async function getManualOrderProductOptionsFromDb(filters?: ManualOrderProductFilters) {
  const q = filters?.q?.trim();
  const customerId = filters?.customerId?.trim();

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

  const query: any = {
    where,
    orderBy: [
      {
        code: "asc"
      }
    ],
    take: 60
  };

  if (customerId) {
    query.include = {
      customerPrices: {
        where: {
          customerId
        },
        take: 1
      }
    };
  }

  return prisma.product.findMany(query);
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

  const defaultPriceExVatPence = getProductDefaultPriceExVatPence(product);
  const customerPriceExVatPence = await getCustomerSpecificPriceExVatPence(order.customerId, product.id);
  const defaultVatRateBasisPoints = getProductVatRateBasisPoints(product);

  const manualPriceExVatPence =
    typeof pricing?.priceExVatPence === "number" && pricing.priceExVatPence >= 0
      ? pricing.priceExVatPence
      : null;

  const manualVatRateBasisPoints =
    typeof pricing?.vatRateBasisPoints === "number" && pricing.vatRateBasisPoints >= 0
      ? pricing.vatRateBasisPoints
      : null;

  const priceExVatPence = manualPriceExVatPence ?? customerPriceExVatPence ?? defaultPriceExVatPence;
  const vatRateBasisPoints = manualVatRateBasisPoints ?? defaultVatRateBasisPoints;

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

  await ensureProductOnCustomerShoppingList(order.customerId, product.id);
  await recalculateOrderTotals(order.id);

  return order;
}

export async function syncManualOrderPadFromDb({
  orderReference,
  rows
}: {
  orderReference: string;
  rows: ManualOrderPadRowInput[];
}) {
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
      customer: true,
      lines: true
    }
  });

  if (!order) {
    throw new Error("Order was not found.");
  }

  const cleanRows = rows
    .map((row) => ({
      productId: row.productId.trim(),
      quantity: Math.max(0, Math.floor(Number.isFinite(row.quantity) ? row.quantity : 0)),
      priceExVatPence:
        typeof row.priceExVatPence === "number" && row.priceExVatPence >= 0
          ? Math.round(row.priceExVatPence)
          : null
    }))
    .filter((row) => row.productId);

  const productIds = Array.from(new Set(cleanRows.map((row) => row.productId)));

  if (!productIds.length) {
    return order;
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      }
    },
    include: {
      customerPrices: {
        where: {
          customerId: order.customerId
        },
        take: 1
      }
    }
  } as any);

  const productById = new Map(products.map((product: any) => [product.id, product]));
  const existingLineByProductId = new Map<string, any>();

  for (const line of order.lines as any[]) {
    if (line.productId && !existingLineByProductId.has(line.productId)) {
      existingLineByProductId.set(line.productId, line);
    }
  }

  for (const row of cleanRows) {
    const product = productById.get(row.productId);

    if (!product) {
      continue;
    }

    const existingLine = existingLineByProductId.get(row.productId);

    if (row.quantity <= 0) {
      if (existingLine) {
        await prisma.orderLine.delete({
          where: {
            id: existingLine.id
          }
        });
      }

      continue;
    }

    const priceExVatPence =
      row.priceExVatPence ??
      getProductCustomerPriceExVatPence(product) ??
      getProductDefaultPriceExVatPence(product);

    const vatRateBasisPoints = getProductVatRateBasisPoints(product);
    const vatPence = calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
    const priceIncVatPence = calculatePriceIncVatPence(priceExVatPence, vatRateBasisPoints);
    const lineTotalPence = priceIncVatPence * row.quantity;

    if (existingLine) {
      await prisma.orderLine.update({
        where: {
          id: existingLine.id
        },
        data: {
          quantity: row.quantity,
          productCodeSnapshot: (product as any).code || existingLine.productCodeSnapshot,
          descriptionSnapshot: getProductDescription(product),
          packSizeSnapshot: (product as any).packSize || null,
          priceExVatPence,
          vatPence,
          priceIncVatPence,
          lineTotalPence,
          source: existingLine.source || "FRESHPAC_ADDED",
          lockedFromCustomer: true
        } as any
      });
    } else {
      await prisma.orderLine.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: row.quantity,
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
    }

    await ensureProductOnCustomerShoppingList(order.customerId, product.id);
  }

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

function buildOrderPadProductWhere({
  q,
  customerId,
  knownProductIds
}: {
  q: string;
  customerId: string;
  knownProductIds: string[];
}) {
  const searchWhere = q
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
    : null;

  if (q) {
    return searchWhere as any;
  }

  const baseOr: any[] = [
    {
      customerAccess: {
        some: {
          customerId
        }
      }
    }
  ];

  if (knownProductIds.length) {
    baseOr.push({
      id: {
        in: knownProductIds
      }
    });
  }

  return {
    OR: baseOr
  } as any;
}

async function getPastOrderedProductIds(customerId: string) {
  const lines = await (prisma as any).orderLine.findMany({
    where: {
      productId: {
        not: null
      },
      order: {
        customerId
      }
    },
    select: {
      productId: true
    },
    distinct: ["productId"],
    take: 500
  });

  return Array.from(
    new Set(
      lines
        .map((line: any) => line.productId)
        .filter(Boolean)
    )
  ) as string[];
}

async function getCustomerSpecificPriceExVatPence(customerId: string, productId: string) {
  const customerPriceDelegate = (prisma as any).customerPrice;

  if (!customerPriceDelegate?.findFirst) {
    return null;
  }

  const customerPrice = await customerPriceDelegate.findFirst({
    where: {
      customerId,
      productId
    },
    select: {
      priceExVatPence: true
    }
  });

  if (!customerPrice) {
    return null;
  }

  const value = Number(customerPrice.priceExVatPence);

  return Number.isFinite(value) ? value : null;
}

async function ensureProductOnCustomerShoppingList(customerId: string, productId: string) {
  try {
    const existing = await (prisma as any).product.findFirst({
      where: {
        id: productId,
        customerAccess: {
          some: {
            customerId
          }
        }
      },
      select: {
        id: true
      }
    });

    if (existing) {
      return;
    }

    await (prisma as any).product.update({
      where: {
        id: productId
      },
      data: {
        customerAccess: {
          create: {
            customerId
          }
        }
      }
    });
  } catch {
    return;
  }
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