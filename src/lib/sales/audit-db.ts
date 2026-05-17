import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/sales/customer-db";
import type { BadgeTone } from "@/lib/sales/customers";

export function formatRetentionClass(value?: string | null) {
  const labels: Record<string, string> = {
    SECURITY_60_DAYS: "Security - 60 days",
    BUSINESS_PERMANENT: "Business - permanent"
  };

  return value ? labels[value] ?? value : "Unknown";
}

export function getRetentionTone(value?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    SECURITY_60_DAYS: "warning",
    BUSINESS_PERMANENT: "success"
  };

  return value ? tones[value] ?? "neutral" : "neutral";
}

export function getAuditActionTone(actionType?: string | null): BadgeTone {
  if (!actionType) return "neutral";

  if (actionType.includes("DELETE") || actionType.includes("CANCEL")) {
    return "danger";
  }

  if (actionType.includes("PRICE") || actionType.includes("PAYMENT") || actionType.includes("ROLLOVER")) {
    return "warning";
  }

  if (actionType.includes("CREATE") || actionType.includes("SUBMIT") || actionType.includes("COMPLETE")) {
    return "success";
  }

  if (actionType.includes("SYNC") || actionType.includes("LOGIN")) {
    return "info";
  }

  return "neutral";
}

export function prettifyAuditLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getAuditLogEntriesFromDb() {
  return prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: true
    },
    take: 100
  });
}

export async function getAuditStatsFromDb() {
  const [total, security, business, customer, product, order, engineer, sync] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: {
        retentionClass: "SECURITY_60_DAYS"
      }
    }),
    prisma.auditLog.count({
      where: {
        retentionClass: "BUSINESS_PERMANENT"
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          contains: "CUSTOMER",
          mode: "insensitive"
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          contains: "PRODUCT",
          mode: "insensitive"
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          contains: "ORDER",
          mode: "insensitive"
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          contains: "ENGINEER",
          mode: "insensitive"
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        OR: [
          {
            actionType: {
              contains: "SYNC",
              mode: "insensitive"
            }
          },
          {
            entityType: {
              contains: "SYNC",
              mode: "insensitive"
            }
          }
        ]
      }
    })
  ]);

  return {
    total,
    security,
    business,
    customer,
    product,
    order,
    engineer,
    sync
  };
}

export async function getRecentCriticalAuditEntriesFromDb() {
  return prisma.auditLog.findMany({
    where: {
      OR: [
        {
          actionType: {
            contains: "DELETE",
            mode: "insensitive"
          }
        },
        {
          actionType: {
            contains: "PRICE",
            mode: "insensitive"
          }
        },
        {
          actionType: {
            contains: "ROLLOVER",
            mode: "insensitive"
          }
        },
        {
          actionType: {
            contains: "SYNC",
            mode: "insensitive"
          }
        },
        {
          actionType: {
            contains: "PAYMENT",
            mode: "insensitive"
          }
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: true
    },
    take: 10
  });
}

export { formatDateTime };