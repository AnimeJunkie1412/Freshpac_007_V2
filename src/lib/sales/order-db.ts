import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime, formatMoneyFromPence } from "@/lib/sales/customer-db";
import type { BadgeTone } from "@/lib/sales/customers";

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
    CUSTOMER_PORTAL: "Customer portal",
    FRESHPAC_STAFF: "Freshpac staff",
    CALL_LIST: "Call list",
    STANDING_ORDER: "Standing Order",
    RETAIL_ORDER: "Retail Order",
    SYSTEM_AUTO_SUBMITTED: "System Auto-Submitted",
    OFFLINE_PENDING: "Offline pending"
  };

  return source ? labels[source] ?? source : "Unknown";
}

export function getOrderSourceTone(source?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    CUSTOMER_PORTAL: "info",
    FRESHPAC_STAFF: "neutral",
    CALL_LIST: "warning",
    STANDING_ORDER: "success",
    RETAIL_ORDER: "warning",
    SYSTEM_AUTO_SUBMITTED: "info",
    OFFLINE_PENDING: "danger"
  };

  return source ? tones[source] ?? "neutral" : "neutral";
}

export function formatOrderLineSource(source?: string | null) {
  const labels: Record<string, string> = {
    CUSTOMER_ADDED: "Customer Added",
    FRESHPAC_ADDED: "Freshpac Added",
    STANDING_ORDER: "Standing Order",
    RETAIL_ORDER: "Retail Order",
    REORDERED_FROM_PAST_ORDER: "Reordered From Past Order",
    SYSTEM_AUTO_SUBMITTED: "System Auto-Submitted"
  };

  return source ? labels[source] ?? source : "Unknown";
}

export function formatDeliveryMethod(method?: string | null) {
  const labels: Record<string, string> = {
    FRESHPAC_ROUTE: "Freshpac route",
    COURIER: "Courier"
  };

  return method ? labels[method] ?? method : "Not set";
}

export function formatOrderMoney(value: number, priceVisible: boolean) {
  return priceVisible ? formatMoneyFromPence(value) : "Hidden";
}

export function getOrderReference(order: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return order.reference || order.temporaryReference || "No reference";
}

export async function getOrderListFromDb() {
  return prisma.order.findMany({
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

export async function getOrderStatsFromDb() {
  const [total, submitted, awaitingPayment, processed, offlinePending, needsPrint] = await Promise.all([
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
        source: "OFFLINE_PENDING"
      }
    }),
    prisma.order.count({
      where: {
        status: {
          in: ["SUBMITTED", "AWAITING_PAYMENT", "PAID_SUBMITTED"]
        }
      }
    })
  ]);

  return {
    total,
    submitted,
    awaitingPayment,
    processed,
    offlinePending,
    needsPrint
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
          addresses: true,
          contacts: {
            orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
          }
        }
      },
      lines: {
        orderBy: {
          createdAt: "asc"
        },
        include: {
          product: true
        }
      },
      placedByUser: true,
      processedByUser: true
    }
  });
}

export async function getOrderAttentionListFromDb() {
  return prisma.order.findMany({
    where: {
      OR: [
        {
          status: "AWAITING_PAYMENT"
        },
        {
          source: "OFFLINE_PENDING"
        },
        {
          minimumOrderPassed: false
        },
        {
          priceVisibilityAtOrder: false
        }
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

export function buildOrderAuditPreview(order: {
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  processedAt: Date | null;
  cancelledAt: Date | null;
  placedByUser: { fullName: string } | null;
  processedByUser: { fullName: string } | null;
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

  if (order.updatedAt.getTime() !== order.createdAt.getTime()) {
    events.push({
      date: formatDateTime(order.updatedAt),
      action: "Order updated",
      user: "System",
      note: "Order was updated after creation."
    });
  }

  return events;
}

export { formatDate, formatDateTime, formatMoneyFromPence };