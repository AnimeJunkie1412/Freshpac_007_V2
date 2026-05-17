"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const jobActionSchema = z.object({
  jobId: z.string().uuid(),
  reference: z.string().min(1)
});

const assignEngineerSchema = z.object({
  jobId: z.string().uuid(),
  reference: z.string().min(1),
  engineerName: z.string().min(2)
});

const followUpSchema = z.object({
  jobId: z.string().uuid(),
  reference: z.string().min(1),
  followUpReason: z.string().min(2)
});

const chargeableReviewSchema = z.object({
  jobId: z.string().uuid(),
  reference: z.string().min(1),
  chargeable: z.enum(["YES", "NO", "TO_REVIEW"]),
  calloutChargePence: z.coerce.number().int().min(0).optional(),
  additionalChargesPence: z.coerce.number().int().min(0).optional(),
  sageInvoiceNumber: z.string().optional(),
  chargeableReviewNote: z.string().optional()
});

const partsRequestSchema = z.object({
  jobId: z.string().uuid(),
  reference: z.string().min(1),
  machineMakeModel: z.string().optional(),
  machineSerialNumber: z.string().optional(),
  partNumber: z.string().optional(),
  partDescription: z.string().min(2),
  quantity: z.coerce.number().int().min(1),
  notes: z.string().optional()
});

async function auditEngineerJob(actionType: string, reference: string, reason: string) {
  await prisma.auditLog.create({
    data: {
      actionType,
      entityType: "ENGINEER_JOB",
      entityId: reference,
      reason
    }
  });
}

async function revalidateEngineerJob(reference: string) {
  revalidatePath("/portal/engineers");
  revalidatePath("/portal/engineers/jobs");
  revalidatePath(`/portal/engineers/jobs/${reference}`);
  revalidatePath("/portal/sales/audit-log");
}

export async function assignEngineerToJob(formData: FormData) {
  const parsed = assignEngineerSchema.parse({
    jobId: formData.get("jobId"),
    reference: formData.get("reference"),
    engineerName: formData.get("engineerName")
  });

  const engineer = await prisma.userProfile.findFirst({
    where: {
      fullName: {
        equals: parsed.engineerName,
        mode: "insensitive"
      },
      role: {
        in: ["ENGINEER", "CHIEF_ENGINEER"]
      }
    }
  });

  const engineerToUse =
    engineer ??
    (await prisma.userProfile.create({
      data: {
        email: `${parsed.engineerName.toLowerCase().replaceAll(" ", ".")}@freshpac.local`,
        fullName: parsed.engineerName,
        role: "ENGINEER"
      }
    }));

  await prisma.engineerJob.update({
    where: {
      id: parsed.jobId
    },
    data: {
      status: "ASSIGNED",
      assignedEngineerId: engineerToUse.id
    }
  });

  await auditEngineerJob("ASSIGN_ENGINEER_JOB", parsed.reference, `Assigned engineer ${engineerToUse.fullName}.`);
  await revalidateEngineerJob(parsed.reference);
}

export async function markEngineerJobInProgress(formData: FormData) {
  const parsed = jobActionSchema.parse({
    jobId: formData.get("jobId"),
    reference: formData.get("reference")
  });

  await prisma.engineerJob.update({
    where: {
      id: parsed.jobId
    },
    data: {
      status: "IN_PROGRESS"
    }
  });

  await auditEngineerJob("START_ENGINEER_JOB", parsed.reference, "Engineer job marked as in progress.");
  await revalidateEngineerJob(parsed.reference);
}

export async function completeEngineerJob(formData: FormData) {
  const parsed = jobActionSchema.parse({
    jobId: formData.get("jobId"),
    reference: formData.get("reference")
  });

  await prisma.engineerJob.update({
    where: {
      id: parsed.jobId
    },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      customerSignatureStatus: "SIGNED"
    }
  });

  await auditEngineerJob("COMPLETE_ENGINEER_JOB", parsed.reference, "Engineer job marked as completed.");
  await revalidateEngineerJob(parsed.reference);
}

export async function markEngineerJobFollowUpRequired(formData: FormData) {
  const parsed = followUpSchema.parse({
    jobId: formData.get("jobId"),
    reference: formData.get("reference"),
    followUpReason: formData.get("followUpReason")
  });

  await prisma.engineerJob.update({
    where: {
      id: parsed.jobId
    },
    data: {
      status: "FOLLOW_UP_REQUIRED",
      followUpRequired: true,
      followUpReason: parsed.followUpReason
    }
  });

  await auditEngineerJob("MARK_ENGINEER_JOB_FOLLOW_UP", parsed.reference, parsed.followUpReason);
  await revalidateEngineerJob(parsed.reference);
}

export async function updateEngineerJobChargeableReview(formData: FormData) {
  const parsed = chargeableReviewSchema.parse({
    jobId: formData.get("jobId"),
    reference: formData.get("reference"),
    chargeable: formData.get("chargeable"),
    calloutChargePence: formData.get("calloutChargePence") || 0,
    additionalChargesPence: formData.get("additionalChargesPence") || 0,
    sageInvoiceNumber: formData.get("sageInvoiceNumber") || "",
    chargeableReviewNote: formData.get("chargeableReviewNote") || ""
  });

  await prisma.engineerJob.update({
    where: {
      id: parsed.jobId
    },
    data: {
      chargeable: parsed.chargeable,
      calloutChargePence: parsed.calloutChargePence ?? 0,
      additionalChargesPence: parsed.additionalChargesPence ?? 0,
      sageInvoiceNumber: parsed.sageInvoiceNumber || null,
      chargeableReviewNote: parsed.chargeableReviewNote || null
    }
  });

  await auditEngineerJob("UPDATE_ENGINEER_JOB_CHARGEABLE_REVIEW", parsed.reference, "Chargeable review updated.");
  await revalidateEngineerJob(parsed.reference);
}

export async function createEngineerJobPartsRequest(formData: FormData) {
  const parsed = partsRequestSchema.parse({
    jobId: formData.get("jobId"),
    reference: formData.get("reference"),
    machineMakeModel: formData.get("machineMakeModel") || "",
    machineSerialNumber: formData.get("machineSerialNumber") || "",
    partNumber: formData.get("partNumber") || "",
    partDescription: formData.get("partDescription"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || ""
  });

  const counter = await prisma.referenceCounter.upsert({
    where: {
      key: "PARTS_REQUEST_REFERENCE"
    },
    update: {
      value: {
        increment: 1
      }
    },
    create: {
      key: "PARTS_REQUEST_REFERENCE",
      value: 2202
    }
  });

  const partsReference = `PART-${counter.value}`;

  await prisma.partsRequest.create({
    data: {
      reference: partsReference,
      jobId: parsed.jobId,
      status: "SUBMITTED",
      machineMakeModel: parsed.machineMakeModel || null,
      machineSerialNumber: parsed.machineSerialNumber || null,
      partNumber: parsed.partNumber || null,
      partDescription: parsed.partDescription,
      quantity: parsed.quantity,
      notes: parsed.notes || null
    }
  });

  await auditEngineerJob("CREATE_PARTS_REQUEST", parsed.reference, `Parts request ${partsReference} created.`);
  await revalidateEngineerJob(parsed.reference);
}