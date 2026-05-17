import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime, formatMoneyFromPence } from "@/lib/sales/customer-db";
import type { BadgeTone } from "@/lib/sales/customers";

export function formatEngineerJobStatus(status?: string | null) {
  const labels: Record<string, string> = {
    NEW: "New",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    FOLLOW_UP_REQUIRED: "Follow-up Required",
    COMPLETED: "Completed",
    COMPLETED_INVOICED: "Completed - Invoiced",
    CANCELLED: "Cancelled"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getEngineerJobStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    NEW: "info",
    ASSIGNED: "warning",
    IN_PROGRESS: "warning",
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
    URGENT: "Urgent"
  };

  return priority ? labels[priority] ?? priority : "Normal";
}

export function getEngineerPriorityTone(priority?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    LOW: "info",
    NORMAL: "neutral",
    URGENT: "danger"
  };

  return priority ? tones[priority] ?? "neutral" : "neutral";
}

export function formatEngineerJobType(type?: string | null) {
  const labels: Record<string, string> = {
    BREAKDOWN: "Breakdown",
    SERVICE: "Service",
    WATER_FILTER_CHANGE: "Water Filter Change"
  };

  return type ? labels[type] ?? type : "Unknown";
}

export function formatEngineerJobTypes(types: string[]) {
  return types.map(formatEngineerJobType).join(", ");
}

export function formatChargeableStatus(status?: string | null) {
  const labels: Record<string, string> = {
    YES: "Yes",
    NO: "No",
    TO_REVIEW: "To review"
  };

  return status ? labels[status] ?? status : "To review";
}

export function formatSignatureStatus(status?: string | null) {
  const labels: Record<string, string> = {
    NOT_SIGNED: "Not signed",
    SIGNED: "Signed",
    NOT_REQUIRED: "Not required"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatSyncStatus(status?: string | null) {
  const labels: Record<string, string> = {
    PENDING: "Pending sync",
    SYNCED: "Synced",
    FAILED: "Failed",
    CONFLICT: "Conflict",
    CANCELLED: "Cancelled"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function getSyncStatusTone(status?: string | null): BadgeTone {
  const tones: Record<string, BadgeTone> = {
    PENDING: "warning",
    SYNCED: "success",
    FAILED: "danger",
    CONFLICT: "danger",
    CANCELLED: "neutral"
  };

  return status ? tones[status] ?? "neutral" : "neutral";
}

export function getEngineerJobReference(job: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return job.reference || job.temporaryReference || "No reference";
}

export async function getEngineerJobListFromDb() {
  return prisma.engineerJob.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: true,
      createdByUser: true,
      assignedEngineer: true,
      completedByUser: true,
      machineSheets: true,
      partsUsed: true,
      partsRequests: true
    }
  });
}

export async function getEngineerJobStatsFromDb() {
  const [total, newJobs, assigned, followUp, completed, chargeableReview, pendingSync, partsRequests] = await Promise.all([
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
        status: "FOLLOW_UP_REQUIRED"
      }
    }),
    prisma.engineerJob.count({
      where: {
        status: {
          in: ["COMPLETED", "COMPLETED_INVOICED"]
        }
      }
    }),
    prisma.engineerJob.count({
      where: {
        chargeable: "TO_REVIEW"
      }
    }),
    prisma.engineerJob.count({
      where: {
        offlineStatus: {
          in: ["PENDING", "CONFLICT", "FAILED"]
        }
      }
    }),
    prisma.partsRequest.count()
  ]);

  return {
    total,
    newJobs,
    assigned,
    followUp,
    completed,
    chargeableReview,
    pendingSync,
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
          contacts: {
            orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
          },
          addresses: true,
          productAccess: {
            include: {
              product: true
            }
          }
        }
      },
      createdByUser: true,
      assignedEngineer: true,
      completedByUser: true,
      machineSheets: {
        include: {
          equipment: true
        }
      },
      partsUsed: true,
      partsRequests: true,
      followUpJobs: true,
      parentJob: true
    }
  });
}

export async function getPriorityEngineerJobsFromDb() {
  return prisma.engineerJob.findMany({
    where: {
      OR: [
        {
          priority: "URGENT"
        },
        {
          status: "FOLLOW_UP_REQUIRED"
        },
        {
          offlineStatus: {
            in: ["PENDING", "CONFLICT", "FAILED"]
          }
        },
        {
          chargeable: "TO_REVIEW"
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      customer: true,
      assignedEngineer: true,
      partsRequests: true
    },
    take: 10
  });
}

export function getCustomerAddressLines(
  addresses: Array<{
    type: string;
    lines: string[];
  }>
) {
  const deliveryAddress = addresses.find((address) => address.type === "DELIVERY");
  const invoiceAddress = addresses.find((address) => address.type === "INVOICE");
  const address = deliveryAddress || invoiceAddress;

  if (!address || !address.lines.length) {
    return ["Not recorded"];
  }

  return address.lines;
}

export function buildEngineerAuditPreview(job: {
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  createdByUser: { fullName: string } | null;
  assignedEngineer: { fullName: string } | null;
  completedByUser: { fullName: string } | null;
  status: string;
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
      date: formatDateTime(job.updatedAt),
      action: "Engineer assigned",
      user: job.assignedEngineer.fullName,
      note: `Job assigned to ${job.assignedEngineer.fullName}.`
    });
  }

  if (job.completedAt) {
    events.push({
      date: formatDateTime(job.completedAt),
      action: "Job completed",
      user: job.completedByUser?.fullName || job.assignedEngineer?.fullName || "System",
      note: "Engineer job completed."
    });
  }

  if (job.status === "FOLLOW_UP_REQUIRED") {
    events.push({
      date: formatDateTime(job.updatedAt),
      action: "Follow-up required",
      user: job.assignedEngineer?.fullName || "System",
      note: "Engineer marked this job as requiring follow-up."
    });
  }

  return events;
}

export { formatDate, formatDateTime, formatMoneyFromPence };