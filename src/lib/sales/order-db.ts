import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";

export type OrderListFilters = {
  q?: string;
  status?: string;
  source?: string;
};

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

export function formatOrderMoney(value?: number | null, visible = true) {
  if (!visible) return "Delivery Note Needed";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format((value || 0) / 100);
}

export function getOrderReference(order: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return order.reference || order.temporaryReference || "No reference";
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

export function getOrderStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    DRAFT_BASKET: "neutral",
    SUBMITTED: "info",
    AWAITING_PAYMENT: "warning",
    PAID_SUBMITTED: "success",
    PROCESSED: "success",
    CANCELLED: "danger"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function formatOrderSource(source?: string | null) {
  const labels: Record<string, string> = {
    CUSTOMER_PORTAL: "Customer Portal",
    CALL_LIST: "Call List",
    FRESHPAC_ADDED: "Freshpac Added",
    RETAIL_ORDER: "Retail Order",
    STANDING_ORDER: "Standing Order",
    OFFLINE_PENDING: "Offline Pending"
  };

  return source ? labels[source] ?? source : "Unknown";
}

export function getOrderSourceTone(source?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    CUSTOMER_PORTAL: "info",
    CALL_LIST: "success",
    FRESHPAC_ADDED: "warning",
    RETAIL_ORDER: "warning",
    STANDING_ORDER: "info",
    OFFLINE_PENDING: "danger"
  };

  return source ? tones[source] ?? "neutral" : "neutral";
}

export function formatDeliveryMethod(method?: string | null) {
  const labels: Record<string, string> = {
    FRESHPAC_ROUTE: "Freshpac route",
    COURIER: "Courier"
  };

  return method ? labels[method] ?? method : "Not set";
}

export function formatOrderLineSource(source?: string | null) {
  const labels: Record<string, string> = {
    CUSTOMER_ADDED: "Customer Added",
    FRESHPAC_ADDED: "Freshpac Added",
    RETAIL_ORDER: "Retail Order",
    STANDING_ORDER: "Standing Order"
  };

  return source ? labels[source] ?? source : "Unknown";
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

function buildOrderWhere(filters?: OrderListFilters): Prisma.OrderWhereInput {
  const q = filters?.q?.trim();
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
      conditions.push({ status: status as any });
    }
  }

  if (source && source !== "ALL") {
    conditions.push({ source: source as any });
  }

  if (!conditions.length) return {};

  return {
    AND: conditions
  };
}

export async function getOrderListFromDb(filters?: OrderListFilters) {
  return prisma.order.findMany({
    where: buildOrderWhere(filters),
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: true,
      lines: true,
      placedByUser: true,
      processedByUser: true
    }
  });
}

export async function getOrderAttentionListFromDb() {
  return prisma.order.findMany({
    where: {
      OR: [
        { status: "AWAITING_PAYMENT" },
        { priceVisibilityAtOrder: false },
        { minimumOrderPassed: false },
        { source: "OFFLINE_PENDING" }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: true,
      lines: true
    },
    take: 10
  });
}

export async function getOrderStatsFromDb() {
  const [total, submitted, awaitingPayment, processed, needsPrint, offlinePending] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: "SUBMITTED"
      }
    }),
    prisma.order.count({
      where: {
        status: "AWAITING_PAYMENT"
      }
    }),
    prisma.order.count({
      where: {
        status: "PROCESSED"
      }
    }),
    prisma.order.count({
      where: {
        status: {
          in: ["SUBMITTED", "PAID_SUBMITTED"]
        }
      }
    }),
    prisma.order.count({
      where: {
        source: "OFFLINE_PENDING"
      }
    })
  ]);

  return {
    total,
    submitted,
    awaitingPayment,
    processed,
    needsPrint,
    offlinePending
  };
}

export async function getOrderByReferenceFromDb(reference: string) {
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
      customer: {
        include: {
          addresses: true
        }
      },
      lines: true,
      placedByUser: true,
      processedByUser: true
    }
  });
}

export function buildOrderAuditPreview(order: {
  createdAt: Date;
  submittedAt: Date | null;
  processedAt: Date | null;
  cancelledAt: Date | null;
  placedByUser: { fullName: string } | null;
  processedByUser: { fullName: string } | null;
  status: string;
}) {
  const events = [
    {
      date: formatDateTime(order.createdAt),
      action: "Order created",
      user: order.placedByUser?.fullName || "System",
      note: "Order record created."
    }
  ];

  if (order.submittedAt) {
    events.push({
      date: formatDateTime(order.submittedAt),
      action: "Order submitted",
      user: order.placedByUser?.fullName || "System",
      note: "Order submitted for processing."
    });
  }

  if (order.processedAt) {
    events.push({
      date: formatDateTime(order.processedAt),
      action: "Order processed",
      user: order.processedByUser?.fullName || "System",
      note: "Order marked as processed."
    });
  }

  if (order.cancelledAt) {
    events.push({
      date: formatDateTime(order.cancelledAt),
      action: "Order cancelled",
      user: "System",
      note: "Order was cancelled."
    });
  }

  if (order.status === "AWAITING_PAYMENT") {
    events.push({
      date: formatDateTime(order.createdAt),
      action: "Awaiting payment",
      user: order.placedByUser?.fullName || "System",
      note: "Order requires external payment confirmation."
    });
  }

  return events;
}