import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";

export type AuditLogFilters = {
  q?: string;
  entity?: string;
  retention?: string;
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

export function prettifyAuditLabel(value?: string | null) {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatRetentionClass(retentionClass?: string | null) {
  const labels: Record<string, string> = {
    SECURITY_60_DAYS: "Security - 60 Days",
    BUSINESS_PERMANENT: "Business Permanent",
    ORDER_PERMANENT: "Order Permanent",
    ENGINEER_PERMANENT: "Engineer Permanent",
    FINANCIAL_PERMANENT: "Financial Permanent"
  };

  return retentionClass ? labels[retentionClass] ?? prettifyAuditLabel(retentionClass) : "Not set";
}

export function getRetentionTone(retentionClass?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    SECURITY_60_DAYS: "warning",
    BUSINESS_PERMANENT: "success",
    ORDER_PERMANENT: "success",
    ENGINEER_PERMANENT: "info",
    FINANCIAL_PERMANENT: "success"
  };

  return retentionClass ? tones[retentionClass] ?? "neutral" : "neutral";
}

export function getAuditActionTone(actionType?: string | null): BadgeTone {
  const value = actionType || "";

  if (
    value.includes("DELETE") ||
    value.includes("CANCEL") ||
    value.includes("CONFLICT") ||
    value.includes("FAILED")
  ) {
    return "danger";
  }

  if (
    value.includes("PRICE") ||
    value.includes("PAYMENT") ||
    value.includes("ROLLOVER") ||
    value.includes("SYNC") ||
    value.includes("REVIEW")
  ) {
    return "warning";
  }

  if (
    value.includes("CREATE") ||
    value.includes("SUBMIT") ||
    value.includes("PROCESS") ||
    value.includes("COMPLETE") ||
    value.includes("LOGIN")
  ) {
    return "success";
  }

  if (
    value.includes("UPDATE") ||
    value.includes("ASSIGN") ||
    value.includes("NOTE") ||
    value.includes("EDIT")
  ) {
    return "info";
  }

  return "neutral";
}

function buildAuditLogWhere(filters?: AuditLogFilters): Prisma.AuditLogWhereInput {
  const q = filters?.q?.trim();
  const entity = filters?.entity?.trim();
  const retention = filters?.retention?.trim();

  const conditions: Prisma.AuditLogWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { actionType: { contains: q, mode: "insensitive" } },
        { entityType: { contains: q, mode: "insensitive" } },
        { entityId: { contains: q, mode: "insensitive" } },
        { reason: { contains: q, mode: "insensitive" } },
        {
          user: {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          }
        }
      ]
    });
  }

  if (entity && entity !== "ALL") {
    if (entity === "CUSTOMER") {
      conditions.push({
        entityType: {
          in: ["CUSTOMER", "CUSTOMER_ACCOUNT", "CUSTOMER_NOTE", "CUSTOMER_PRICE"]
        }
      });
    } else if (entity === "PRODUCT") {
      conditions.push({
        entityType: {
          in: ["PRODUCT", "CUSTOMER_PRODUCT_ACCESS", "CUSTOMER_PRICE"]
        }
      });
    } else if (entity === "ORDER") {
      conditions.push({
        entityType: {
          in: ["ORDER", "ORDER_LINE", "STANDING_ORDER", "RETAIL_ORDER"]
        }
      });
    } else if (entity === "ENGINEER") {
      conditions.push({
        entityType: {
          in: ["ENGINEER_JOB", "PARTS_REQUEST", "PART_USED", "MACHINE_SHEET", "EQUIPMENT"]
        }
      });
    } else if (entity === "SYNC") {
      conditions.push({
        entityType: {
          in: ["SYNC", "SYNC_ACTION", "SYNC_CONFLICT", "OFFLINE_ACTION"]
        }
      });
    } else {
      conditions.push({
        entityType: entity
      });
    }
  }

  if (retention && retention !== "ALL") {
    conditions.push({
      retentionClass: retention as any
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getAuditLogEntriesFromDb(filters?: AuditLogFilters) {
  return prisma.auditLog.findMany({
    where: buildAuditLogWhere(filters),
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: true
    },
    take: 100
  });
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
            contains: "CANCEL",
            mode: "insensitive"
          }
        },
        {
          actionType: {
            contains: "CONFLICT",
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
          retentionClass: "SECURITY_60_DAYS" as any
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

export async function getAuditStatsFromDb() {
  const [total, security, business, customer, product, order, engineer, sync] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: {
        retentionClass: "SECURITY_60_DAYS" as any
      }
    }),
    prisma.auditLog.count({
      where: {
        retentionClass: {
          not: "SECURITY_60_DAYS" as any
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          in: ["CUSTOMER", "CUSTOMER_ACCOUNT", "CUSTOMER_NOTE", "CUSTOMER_PRICE"]
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          in: ["PRODUCT", "CUSTOMER_PRODUCT_ACCESS", "CUSTOMER_PRICE"]
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          in: ["ORDER", "ORDER_LINE", "STANDING_ORDER", "RETAIL_ORDER"]
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          in: ["ENGINEER_JOB", "PARTS_REQUEST", "PART_USED", "MACHINE_SHEET", "EQUIPMENT"]
        }
      }
    }),
    prisma.auditLog.count({
      where: {
        entityType: {
          in: ["SYNC", "SYNC_ACTION", "SYNC_CONFLICT", "OFFLINE_ACTION"]
        }
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