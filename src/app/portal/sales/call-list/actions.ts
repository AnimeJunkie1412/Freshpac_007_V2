"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const callListActionSchema = z.object({
  entryId: z.string().uuid(),
  accountNumber: z.string().min(1)
});

const callListNoteSchema = z.object({
  entryId: z.string().uuid(),
  accountNumber: z.string().min(1),
  notes: z.string().min(2)
});

async function auditCallList(actionType: string, accountNumber: string, reason: string) {
  await prisma.auditLog.create({
    data: {
      actionType,
      entityType: "CALL_LIST_ENTRY",
      entityId: accountNumber,
      reason
    }
  });
}

export async function markCallListCalled(formData: FormData) {
  const parsed = callListActionSchema.parse({
    entryId: formData.get("entryId"),
    accountNumber: formData.get("accountNumber")
  });

  await prisma.callListEntry.update({
    where: {
      id: parsed.entryId
    },
    data: {
      status: "CALLED",
      completedAt: new Date()
    }
  });

  await auditCallList("MARK_CALL_LIST_CALLED", parsed.accountNumber, "Call list entry marked as called.");

  revalidatePath("/portal/sales/call-list");
  revalidatePath("/portal/sales/audit-log");
}

export async function markCallListNothingNeeded(formData: FormData) {
  const parsed = callListActionSchema.parse({
    entryId: formData.get("entryId"),
    accountNumber: formData.get("accountNumber")
  });

  await prisma.callListEntry.update({
    where: {
      id: parsed.entryId
    },
    data: {
      status: "NOTHING_NEEDED",
      basketStatus: "EMPTY",
      completedAt: new Date()
    }
  });

  await auditCallList("MARK_CALL_LIST_NOTHING_NEEDED", parsed.accountNumber, "Customer confirmed nothing needed.");

  revalidatePath("/portal/sales/call-list");
  revalidatePath("/portal/sales/audit-log");
}

export async function markCallListNeedsContact(formData: FormData) {
  const parsed = callListActionSchema.parse({
    entryId: formData.get("entryId"),
    accountNumber: formData.get("accountNumber")
  });

  await prisma.callListEntry.update({
    where: {
      id: parsed.entryId
    },
    data: {
      status: "NEEDS_FRESHPAC_CONTACT"
    }
  });

  await auditCallList("MARK_CALL_LIST_NEEDS_CONTACT", parsed.accountNumber, "Call list entry marked as needing Freshpac contact.");

  revalidatePath("/portal/sales/call-list");
  revalidatePath("/portal/sales/audit-log");
}

export async function updateCallListNotes(formData: FormData) {
  const parsed = callListNoteSchema.parse({
    entryId: formData.get("entryId"),
    accountNumber: formData.get("accountNumber"),
    notes: formData.get("notes")
  });

  await prisma.callListEntry.update({
    where: {
      id: parsed.entryId
    },
    data: {
      notes: parsed.notes
    }
  });

  await auditCallList("UPDATE_CALL_LIST_NOTES", parsed.accountNumber, "Call list notes updated.");

  revalidatePath("/portal/sales/call-list");
  revalidatePath("/portal/sales/audit-log");
}