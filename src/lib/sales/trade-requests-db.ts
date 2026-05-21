import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";

export type TradeRequestFilters = {
  q?: string;
  status?: string;
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

export function getTradeRequestStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    NEW: "info",
    CONTACTED: "warning",
    ASSIGNED: "warning",
    ACCEPTED: "success",
    REJECTED: "danger",
    ARCHIVED: "neutral"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

function buildTradeRequestWhere(filters?: TradeRequestFilters): Prisma.TradeAccountRequestWhereInput {
  const q = filters?.q?.trim();
  const status = filters?.status?.trim();

  const conditions: Prisma.TradeAccountRequestWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { businessName: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { relationToCompany: { contains: q, mode: "insensitive" } },
        { assignedSalesRep: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { accountNumber: { contains: q, mode: "insensitive" } },
              { siteName: { contains: q, mode: "insensitive" } },
              { legalName: { contains: q, mode: "insensitive" } }
            ]
          }
        }
      ]
    });
  }

  if (status && status !== "ALL") {
    conditions.push({
      status: status as any
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getTradeRequestsFromDb(filters?: TradeRequestFilters) {
  return prisma.tradeAccountRequest.findMany({
    where: buildTradeRequestWhere(filters),
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: true
    }
  });
}

export async function getTradeRequestByIdFromDb(id: string) {
  return prisma.tradeAccountRequest.findUnique({
    where: {
      id
    },
    include: {
      customer: true
    }
  });
}

export async function getTradeRequestStatsFromDb() {
  const [total, fresh, contacted, assigned, accepted, rejected, archived] = await Promise.all([
    prisma.tradeAccountRequest.count(),
    prisma.tradeAccountRequest.count({
      where: {
        status: "NEW"
      }
    }),
    prisma.tradeAccountRequest.count({
      where: {
        status: "CONTACTED"
      }
    }),
    prisma.tradeAccountRequest.count({
      where: {
        status: "ASSIGNED"
      }
    }),
    prisma.tradeAccountRequest.count({
      where: {
        status: "ACCEPTED"
      }
    }),
    prisma.tradeAccountRequest.count({
      where: {
        status: "REJECTED"
      }
    }),
    prisma.tradeAccountRequest.count({
      where: {
        status: "ARCHIVED"
      }
    })
  ]);

  return {
    total,
    fresh,
    contacted,
    assigned,
    accepted,
    rejected,
    archived
  };
}

export function buildTradeRequestAuditPreview(request: {
  createdAt: Date;
  updatedAt: Date;
  status: string;
  assignedSalesRep: string | null;
}) {
  const events = [
    {
      date: formatDateTime(request.createdAt),
      action: "Trade request created",
      user: "Public website",
      note: "Trade account request submitted."
    }
  ];

  if (request.assignedSalesRep) {
    events.push({
      date: formatDateTime(request.updatedAt),
      action: "Sales rep assigned",
      user: request.assignedSalesRep,
      note: "Request has a sales rep assigned."
    });
  }

  if (request.status !== "NEW") {
    events.push({
      date: formatDateTime(request.updatedAt),
      action: formatTradeRequestStatus(request.status),
      user: "Freshpac",
      note: `Request status is ${formatTradeRequestStatus(request.status)}.`
    });
  }

  return events;
}

export const getTradeRequestAuditPreview = buildTradeRequestAuditPreview;