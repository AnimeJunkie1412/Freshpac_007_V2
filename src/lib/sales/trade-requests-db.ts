import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/sales/customer-db";
import type { BadgeTone } from "@/lib/sales/customers";

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

export async function getTradeRequestsFromDb() {
  return prisma.tradeAccountRequest.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: true
    }
  });
}

export async function getTradeRequestStatsFromDb() {
  const [total, fresh, contacted, assigned, accepted, rejected] = await Promise.all([
    prisma.tradeAccountRequest.count(),
    prisma.tradeAccountRequest.count({ where: { status: "NEW" } }),
    prisma.tradeAccountRequest.count({ where: { status: "CONTACTED" } }),
    prisma.tradeAccountRequest.count({ where: { status: "ASSIGNED" } }),
    prisma.tradeAccountRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.tradeAccountRequest.count({ where: { status: "REJECTED" } })
  ]);

  return {
    total,
    fresh,
    contacted,
    assigned,
    accepted,
    rejected
  };
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

export { formatDateTime };