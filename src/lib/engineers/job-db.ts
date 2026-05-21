import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BadgeTone } from "@/lib/sales/customers";

export type EngineerJobListFilters = {
  q?: string;
  status?: string;
  priority?: string;
  sync?: string;
  chargeable?: string;
};

export function formatDate(date?: Date | string | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

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

export function formatMoneyFromPence(value?: number | null) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format((value || 0) / 100);
}

export function getEngineerJobReference(job: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return job.reference || job.temporaryReference || "No reference";
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

export function getEngineerJobStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    NEW: "info",
    ASSIGNED: "warning",
    IN_PROGRESS: "info",
    FOLLOW_UP_REQUIRED: "danger",
    COMPLETED: "success",
    COMPLETED_INVOICED: "success",
    CANCELLED: "neutral"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function formatEngineerPriority(priority?: string | null) {
  const labels: Record<string, string> = {
    LOW: "Low",
    NORMAL: "Normal",
    HIGH: "High",
    URGENT: "Urgent"
  };

  return priority ? labels[priority] ?? priority : "Unknown";
}

export function getEngineerPriorityTone(priority?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    LOW: "neutral",
    NORMAL: "info",
    HIGH: "warning",
    URGENT: "danger"
  };

  return priority ? tones[priority] ?? "neutral" : "neutral";
}

export function formatEngineerJobType(type?: string | null) {
  const labels: Record<string, string> = {
    BREAKDOWN: "Breakdown",
    SERVICE: "Service",
    WATER_FILTER_CHANGE: "Water Filter Change",
    INSTALLATION: "Installation",
    REMOVAL: "Removal",
    SITE_SURVEY: "Site Survey",
    OTHER: "Other"
  };

  return type ? labels[type] ?? type : "Unknown";
}

export function formatEngineerJobTypes(types?: string[] | null) {
  if (!types?.length) {
    return "Not set";
  }

  return types.map((type) => formatEngineerJobType(type)).join(", ");
}

export function formatChargeableStatus(status?: string | null) {
  const labels: Record<string, string> = {
    YES: "Yes",
    NO: "No",
    TO_REVIEW: "To Review"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatSignatureStatus(status?: string | null) {
  const labels: Record<string, string> = {
    NOT_REQUIRED: "Not Required",
    REQUIRED: "Required",
    SIGNED: "Signed",
    DECLINED: "Declined"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatSyncStatus(status?: string | null) {
  const labels: Record<string, string> = {
    ONLINE: "Online",
    OFFLINE_PENDING: "Offline Pending",
    PENDING_SYNC: "Pending Sync",
    SYNCED: "Synced",
    CONFLICT: "Conflict"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getSyncStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    ONLINE: "success",
    OFFLINE_PENDING: "warning",
    PENDING_SYNC: "warning",
    SYNCED: "success",
    CONFLICT: "danger"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function getCustomerAddressLines(
  addresses: Array<{
    type: string;
    lines: string[];
  }>
) {
  const deliveryAddress =
    addresses.find((address) => address.type === "DELIVERY") ||
    addresses.find((address) => address.type === "INVOICE") ||
    addresses[0];

  if (!deliveryAddress?.lines.length) {
    return ["Not recorded"];
  }

  return deliveryAddress.lines;
}

function buildEngineerJobWhere(filters?: EngineerJobListFilters): Prisma.EngineerJobWhereInput {
  const q = filters?.q?.trim();
  const status = filters?.status?.trim();
  const priority = filters?.priority?.trim();
  const sync = filters?.sync?.trim();
  const chargeable = filters?.chargeable?.trim();

  const conditions: Prisma.EngineerJobWhereInput[] = [];

  if (q) {
    conditions.push({
      OR: [
        { reference: { contains: q, mode: "insensitive" } },
        { temporaryReference: { contains: q, mode: "insensitive" } },
        { reportedFault: { contains: q, mode: "insensitive" } },
        { followUpReason: { contains: q, mode: "insensitive" } },
        { chargeableReviewNote: { contains: q, mode: "insensitive" } },
        { sageInvoiceNumber: { contains: q, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { accountNumber: { contains: q, mode: "insensitive" } },
              { siteName: { contains: q, mode: "insensitive" } },
              { legalName: { contains: q, mode: "insensitive" } },
              {
                contacts: {
                  some: {
                    OR: [
                      { name: { contains: q, mode: "insensitive" } },
                      { role: { contains: q, mode: "insensitive" } },
                      { phone: { contains: q, mode: "insensitive" } },
                      { email: { contains: q, mode: "insensitive" } }
                    ]
                  }
                }
              },
              {
                addresses: {
                  some: {
                    OR: [
                      { label: { contains: q, mode: "insensitive" } },
                      { postcode: { contains: q, mode: "insensitive" } }
                    ]
                  }
                }
              }
            ]
          }
        },
        {
          assignedEngineer: {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          }
        },
        {
          createdByUser: {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          }
        },
        {
          machineSheets: {
            some: {
              OR: [
                { machineDescription: { contains: q, mode: "insensitive" } },
                { makeModel: { contains: q, mode: "insensitive" } },
                { serialNumber: { contains: q, mode: "insensitive" } },
                { reportedFault: { contains: q, mode: "insensitive" } },
                { workCarriedOut: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        },
        {
          partsUsed: {
            some: {
              OR: [
                { partNumber: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        },
        {
          partsRequests: {
            some: {
              OR: [
                { reference: { contains: q, mode: "insensitive" } },
                { machineMakeModel: { contains: q, mode: "insensitive" } },
                { machineSerialNumber: { contains: q, mode: "insensitive" } },
                { partNumber: { contains: q, mode: "insensitive" } },
                { partDescription: { contains: q, mode: "insensitive" } },
                { notes: { contains: q, mode: "insensitive" } }
              ]
            }
          }
        }
      ]
    });
  }

  if (status && status !== "ALL") {
    if (status === "OPEN") {
      conditions.push({
        status: {
          in: ["NEW", "ASSIGNED", "IN_PROGRESS", "FOLLOW_UP_REQUIRED"]
        }
      });
    } else {
      conditions.push({
        status: status as any
      });
    }
  }

  if (priority && priority !== "ALL") {
    conditions.push({
      priority: priority as any
    });
  }

  if (sync && sync !== "ALL") {
    conditions.push({
      offlineStatus: sync as any
    });
  }

  if (chargeable && chargeable !== "ALL") {
    conditions.push({
      chargeable: chargeable as any
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

export async function getEngineerJobListFromDb(filters?: EngineerJobListFilters) {
  return prisma.engineerJob.findMany({
    where: buildEngineerJobWhere(filters),
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
      createdByUser: true,
      machineSheets: true,
      partsRequests: true,
      partsUsed: true
    }
  });
}

export async function getEngineerJobStatsFromDb() {
  const [total, newJobs, assigned, followUp, chargeableReview, partsRequests] = await Promise.all([
    prisma.engineerJob.count(),
    prisma.engineerJob.count({
      where: {
        status: "NEW"
      }
    }),
    prisma.engineerJob.count({
      where: {
        status: "ASSIGNED"
      }
    }),
    prisma.engineerJob.count({
      where: {
        OR: [
          {
            status: "FOLLOW_UP_REQUIRED"
          },
          {
            followUpRequired: true
          }
        ]
      }
    }),
    prisma.engineerJob.count({
      where: {
        chargeable: "TO_REVIEW"
      }
    }),
    prisma.partsRequest.count()
  ]);

  return {
    total,
    newJobs,
    assigned,
    followUp,
    chargeableReview,
    partsRequests
  };
}

export async function getEngineerJobByReferenceFromDb(reference: string) {
  return prisma.engineerJob.findFirst({
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
          },
          productAccess: {
            include: {
              product: true
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      },
      assignedEngineer: true,
      createdByUser: true,
      machineSheets: {
        orderBy: {
          createdAt: "asc"
        }
      },
      partsUsed: {
        orderBy: {
          createdAt: "desc"
        }
      },
      partsRequests: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
}

export function buildEngineerAuditPreview(job: {
  createdAt: Date;
  completedAt: Date | null;
  status: string;
  createdByUser: { fullName: string } | null;
  assignedEngineer: { fullName: string } | null;
  followUpRequired: boolean;
  followUpReason: string | null;
  chargeable: string;
  chargeableReviewNote: string | null;
}) {
  const events = [
    {
      date: formatDateTime(job.createdAt),
      action: "Job created",
      user: job.createdByUser?.fullName || "System",
      note: "Engineer job record created."
    }
  ];

  if (job.assignedEngineer) {
    events.push({
      date: formatDateTime(job.createdAt),
      action: "Engineer assigned",
      user: job.assignedEngineer.fullName,
      note: "Engineer assignment present on job."
    });
  }

  if (job.followUpRequired) {
    events.push({
      date: formatDateTime(job.createdAt),
      action: "Follow-up required",
      user: job.assignedEngineer?.fullName || "System",
      note: job.followUpReason || "Follow-up required."
    });
  }

  if (job.chargeable === "TO_REVIEW") {
    events.push({
      date: formatDateTime(job.createdAt),
      action: "Chargeable review",
      user: "Freshpac",
      note: job.chargeableReviewNote || "Chargeable status requires review."
    });
  }

  if (job.completedAt) {
    events.push({
      date: formatDateTime(job.completedAt),
      action: "Job completed",
      user: job.assignedEngineer?.fullName || "Engineer",
      note: "Engineer job marked as completed."
    });
  }

  return events;
}