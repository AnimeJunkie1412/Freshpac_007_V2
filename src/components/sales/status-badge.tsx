import { Badge } from "@/components/ui/badge";
import type { BadgeTone, CustomerStatus } from "@/lib/sales/customers";

type Props = {
  status: CustomerStatus | string;
  tone?: BadgeTone;
};

const statusTone: Record<string, BadgeTone> = {
  Active: "success",
  "On Hold": "danger",
  "Active with Prepayment": "warning",
  Inactive: "neutral",
  Processed: "success",
  Submitted: "info",
  "Awaiting Payment": "warning",
  "Paid Submitted": "success",
  Cancelled: "danger",
  "Draft Basket": "neutral",
  Owned: "success",
  Rented: "info",
  Loaned: "warning",
  Trial: "neutral",
  Obsolete: "danger"
};

export function StatusBadge({ status, tone }: Props) {
  return <Badge tone={tone ?? statusTone[status] ?? "neutral"}>{status}</Badge>;
}