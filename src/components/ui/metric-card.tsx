import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  helper,
  tone = "neutral"
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-freshpac-grey">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-freshpac-charcoal">{value}</p>
        </div>
        <Badge tone={tone}>Live</Badge>
      </div>
      <p className="mt-3 text-sm text-freshpac-grey">{helper}</p>
    </Card>
  );
}
