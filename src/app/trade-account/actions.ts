"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const tradeRequestSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  businessName: z.string().min(2),
  businessAddress: z.string().min(5),
  relationToCompany: z.string().min(2),
  notes: z.string().optional()
});

export async function createTradeAccountRequest(formData: FormData) {
  const parsed = tradeRequestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    businessName: formData.get("businessName"),
    businessAddress: formData.get("businessAddress"),
    relationToCompany: formData.get("relationToCompany"),
    notes: formData.get("notes") || ""
  });

  if (!parsed.success) {
    redirect("/trade-account?status=invalid");
  }

  await prisma.tradeAccountRequest.create({
    data: {
      ...parsed.data,
      status: "NEW"
    }
  });

  redirect("/trade-account?status=success");
}