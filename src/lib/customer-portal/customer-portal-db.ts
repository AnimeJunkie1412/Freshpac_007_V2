import { OrderSource, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CustomerPortalProfile = Awaited<ReturnType<typeof getCustomerPortalProfileFromDb>>;

type CustomerPortalOrderWithRelations = {
  id: string;
  customerId: string;
  reference: string | null;
  temporaryReference: string | null;
  status: OrderStatus;
  source: OrderSource;
  deliveryDay: string | null;
  deliveryMethod: any;
  driverOrCourier: string | null;
  priceVisibilityAtOrder: boolean;
  placedByUserId: string | null;
  orderedByFreshpac: boolean;
  editedByFreshpac: boolean;
  customerNotes: string | null;
  internalNotes: string | null;
  totalExVatPence: number;
  vatTotalPence: number;
  totalIncVatPence: number;
  carriageIncVatPence: number;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: any;
  lines: any[];
  placedByUser: any | null;
};

export async function getCustomerPortalProfileFromDb(authUserId: string, email?: string | null) {
  return prisma.userProfile.findFirst({
    where: {
      OR: [
        {
          authUserId
        },
        {
          email: email || ""
        }
      ]
    },
    include: {
      customerAccount: {
        include: {
          users: true,
          addresses: true,
          contacts: true,
          productAccess: {
            include: {
              product: true
            },
            take: 250,
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
            },
            take: 10
          }
        }
      }
    }
  });
}

export async function getCustomerPortalOrderFromDb({
  authUserId,
  email,
  reference
}: {
  authUserId: string;
  email?: string | null;
  reference: string;
}) {
  const profile = await getCustomerPortalProfileFromDb(authUserId, email);
  assertCustomerProfile(profile);

  const order = await prisma.order.findFirst({
    where: {
      customerId: profile.customerAccountId!,
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
      customer: {
        include: {
          productAccess: {
            include: {
              product: {
                include: {
                  customerPrices: {
                    where: {
                      customerId: profile.customerAccountId!
                    },
                    take: 1
                  }
                }
              }
            },
            orderBy: {
              product: {
                code: "asc"
              }
            },
            take: 500
          }
        }
      },
      lines: {
        orderBy: {
          createdAt: "asc"
        }
      },
      placedByUser: true
    }
  } as any);

  if (!order) {
    throw new Error("Order was not found.");
  }

  return {
    profile,
    order: order as unknown as CustomerPortalOrderWithRelations
  };
}

export async function getOrCreateCustomerDraftOrderFromDb({
  authUserId,
  email
}: {
  authUserId: string;
  email?: string | null;
}) {
  const profile = await getCustomerPortalProfileFromDb(authUserId, email);
  assertCustomerProfile(profile);

  const existingDraft = await prisma.order.findFirst({
    where: {
      customerId: profile.customerAccountId!,
      status: OrderStatus.DRAFT_BASKET,
      source: OrderSource.CUSTOMER_PORTAL,
      placedByUserId: profile.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (existingDraft) {
    return existingDraft;
  }

  return prisma.order.create({
    data: {
      temporaryReference: generateCustomerDraftReference(),
      customerId: profile.customerAccountId!,
      status: OrderStatus.DRAFT_BASKET,
      source: OrderSource.CUSTOMER_PORTAL,
      deliveryDay: profile.customerAccount!.deliveryDay,
      deliveryMethod: profile.customerAccount!.deliveryMethod,
      driverOrCourier: profile.customerAccount!.driverOrCourier,
      priceVisibilityAtOrder: profile.customerAccount!.priceVisibility,
      placedByUserId: profile.id,
      orderedByFreshpac: false,
      editedByFreshpac: false
    }
  });
}

export async function saveCustomerBasketFromDb({
  authUserId,
  email,
  reference,
  rows
}: {
  authUserId: string;
  email?: string | null;
  reference: string;
  rows: Array<{
    productId: string;
    quantity: number;
  }>;
}) {
  const { profile, order } = await getCustomerPortalOrderFromDb({
    authUserId,
    email,
    reference
  });

  if (order.status !== "DRAFT_BASKET") {
    throw new Error("Only draft baskets can be edited.");
  }

  const cleanRows = rows
    .map((row) => ({
      productId: row.productId.trim(),
      quantity: Math.max(0, Math.floor(Number.isFinite(row.quantity) ? row.quantity : 0))
    }))
    .filter((row) => row.productId);

  const productIds = Array.from(new Set(cleanRows.map((row) => row.productId)));

  const allowedProducts = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      },
      customerAccess: {
        some: {
          customerId: profile.customerAccountId!
        }
      }
    },
    include: {
      customerPrices: {
        where: {
          customerId: profile.customerAccountId!
        },
        take: 1
      }
    }
  } as any);

  const productById = new Map(allowedProducts.map((product: any) => [product.id, product]));
  const existingLineByProductId = new Map<string, any>();

  for (const line of order.lines) {
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

    const priceExVatPence = getCustomerPortalProductPriceExVatPence(product);
    const vatRateBasisPoints = Number(product.vatRateBasisPoints || 0);
    const vatPence = calculateCustomerVatAmountPence(priceExVatPence, vatRateBasisPoints);
    const priceIncVatPence = priceExVatPence + vatPence;
    const lineTotalPence = priceIncVatPence * row.quantity;

    if (existingLine) {
      await prisma.orderLine.update({
        where: {
          id: existingLine.id
        },
        data: {
          quantity: row.quantity,
          productCodeSnapshot: product.code || existingLine.productCodeSnapshot,
          descriptionSnapshot: getCustomerPortalProductDescription(product),
          packSizeSnapshot: product.packSize || null,
          priceExVatPence,
          vatPence,
          priceIncVatPence,
          lineTotalPence,
          source: "CUSTOMER_ADDED",
          lockedFromCustomer: false
        } as any
      });
    } else {
      await prisma.orderLine.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: row.quantity,
          productCodeSnapshot: product.code || "UNKNOWN",
          descriptionSnapshot: getCustomerPortalProductDescription(product),
          packSizeSnapshot: product.packSize || null,
          priceExVatPence,
          vatPence,
          priceIncVatPence,
          lineTotalPence,
          source: "CUSTOMER_ADDED",
          lockedFromCustomer: false
        } as any
      });
    }
  }

  await recalculateCustomerOrderTotals(order.id);

  return prisma.order.findUnique({
    where: {
      id: order.id
    }
  });
}

export async function submitCustomerBasketFromDb({
  authUserId,
  email,
  reference
}: {
  authUserId: string;
  email?: string | null;
  reference: string;
}) {
  const { profile, order } = await getCustomerPortalOrderFromDb({
    authUserId,
    email,
    reference
  });

  if (order.status !== "DRAFT_BASKET") {
    throw new Error("Only draft baskets can be submitted.");
  }

  if (!order.lines.length) {
    throw new Error("Add at least one item before submitting.");
  }

  const nextStatus =
    profile.customerAccount?.status === "ACTIVE_PREPAYMENT"
      ? OrderStatus.AWAITING_PAYMENT
      : OrderStatus.SUBMITTED;

  return prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      status: nextStatus,
      submittedAt: new Date(),
      customerNotes: order.customerNotes || null
    }
  });
}

export async function recalculateCustomerOrderTotals(orderId: string) {
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

export function formatCustomerPortalMoney(value?: number | null, visible = true) {
  if (!visible) {
    return "Hidden";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format((value || 0) / 100);
}

export function formatCustomerPortalDate(value?: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

export function formatCustomerOrderStatus(status: string) {
  const labels: Record<string, string> = {
    DRAFT_BASKET: "Draft Basket",
    SUBMITTED: "Submitted",
    AWAITING_PAYMENT: "Awaiting Payment",
    PAID_SUBMITTED: "Paid Submitted",
    PROCESSED: "Processed",
    CANCELLED: "Cancelled"
  };

  return labels[status] || status.replace(/_/g, " ");
}

export function getCustomerOrderStatusTone(status: string) {
  if (status === "PROCESSED" || status === "SUBMITTED" || status === "PAID_SUBMITTED") {
    return "success";
  }

  if (status === "DRAFT_BASKET" || status === "AWAITING_PAYMENT") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "neutral";
}

export function getCustomerPortalProductDescription(product: any) {
  return product.description || product.name || product.productName || product.code || "Unnamed product";
}

export function getCustomerPortalProductDisplayName(product: any) {
  return product.name || product.productName || product.description || product.code || "Unnamed product";
}

export function getCustomerPortalProductPriceExVatPence(product: any) {
  const customerPrices = Array.isArray(product.customerPrices) ? product.customerPrices : [];
  const customerPrice = customerPrices[0];

  if (customerPrice) {
    const value = Number(customerPrice.priceExVatPence);

    if (Number.isFinite(value)) {
      return value;
    }
  }

  return Number(product.priceExVatPence || 0);
}

export function calculateCustomerVatAmountPence(priceExVatPence: number, vatRateBasisPoints: number) {
  return Math.round((priceExVatPence * vatRateBasisPoints) / 10000);
}

function assertCustomerProfile(profile: CustomerPortalProfile | null): asserts profile is NonNullable<CustomerPortalProfile> {
  if (!profile) {
    throw new Error("No user profile exists for this login.");
  }

  if (!profile.active) {
    throw new Error("This login is disabled.");
  }

  if (profile.role !== "PARENT_USER" && profile.role !== "CHILD_USER") {
    throw new Error("This login is not a customer user.");
  }

  if (!profile.customerAccountId || !profile.customerAccount) {
    throw new Error("This customer login is not linked to a customer account.");
  }
}

function generateCustomerDraftReference() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
    String(now.getMilliseconds()).padStart(3, "0")
  ].join("");

  return `CUST-${stamp}`;
}