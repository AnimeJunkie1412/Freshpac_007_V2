import { prisma } from "@/lib/prisma";

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

export function formatTradeRequestStatus(status?: string | null) {
  const labels: Record<string, string> = {
    NEW: "New",
    CONTACTED: "Contacted",
    ASSIGNED: "Assigned",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    ARCHIVED: "Archived"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatEngineerJobStatus(status?: string | null) {
  const labels: Record<string, string> = {
    NEW: "New",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    FOLLOW_UP_REQUIRED: "Follow-up Required",
    COMPLETED: "Completed",
    COMPLETED_INVOICED: "Completed / Invoiced",
    CANCELLED: "Cancelled"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getEngineerJobReference(job: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return job.reference || job.temporaryReference || "No reference";
}

export async function getPortalDashboardData() {
  const [
    ordersReadyToProcess,
    ordersAwaitingPayment,
    tradeRequestsWaiting,
    customersOnHold,
    hiddenPriceAccounts,
    callListToCall,
    engineerJobsNeedReview,
    partsRequests,
    syncWarnings,
    recentOrders,
    recentTradeRequests,
    recentEngineerJobs,
    latestAuditEvents
  ] = await Promise.all([
    prisma.order.count({
      where: {
        status: {
          in: ["SUBMITTED", "PAID_SUBMITTED"]
        }
      }
    }),

    prisma.order.count({
      where: {
        status: "AWAITING_PAYMENT"
      }
    }),

    prisma.tradeAccountRequest.count({
      where: {
        status: {
          in: ["NEW", "CONTACTED", "ASSIGNED"]
        }
      }
    }),

    prisma.customerAccount.count({
      where: {
        status: "ON_HOLD"
      }
    }),

    prisma.customerAccount.count({
      where: {
        priceVisibility: false
      }
    }),

    prisma.callListEntry.count({
      where: {
        status: "TO_CALL"
      }
    }),

    prisma.engineerJob.count({
      where: {
        OR: [
          {
            status: "FOLLOW_UP_REQUIRED"
          },
          {
            chargeable: "TO_REVIEW"
          },
          {
            followUpRequired: true
          }
        ]
      }
    }),

    prisma.partsRequest.count(),

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
            actionType: {
              contains: "CONFLICT",
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
    }),

    prisma.order.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: true,
        lines: true
      },
      take: 6
    }),

    prisma.tradeAccountRequest.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        customer: true
      },
      take: 5
    }),

    prisma.engineerJob.findMany({
      orderBy: [
        {
          scheduledAt: "asc"
        },
        {
          createdAt: "desc"
        }
      ],
      include: {
        customer: true,
        assignedEngineer: true,
        partsRequests: true,
        machineSheets: true
      },
      take: 6
    }),

    prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: true
      },
      take: 8
    })
  ]);

  return {
    counters: {
      ordersReadyToProcess,
      ordersAwaitingPayment,
      tradeRequestsWaiting,
      customersOnHold,
      hiddenPriceAccounts,
      callListToCall,
      engineerJobsNeedReview,
      partsRequests,
      syncWarnings
    },
    recentOrders,
    recentTradeRequests,
    recentEngineerJobs,
    latestAuditEvents
  };
}