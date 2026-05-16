import { z } from "zod";

export const tradeRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  businessName: z.string().min(2, "Business name is required"),
  businessAddress: z.string().min(5, "Business address is required"),
  relationToCompany: z.string().min(2, "Please tell us your relation to the company"),
  notes: z.string().optional()
});

export type TradeRequestInput = z.infer<typeof tradeRequestSchema>;
