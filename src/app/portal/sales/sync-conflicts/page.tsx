import { AlertTriangle, CheckCircle2, DatabaseZap, GitMerge, RefreshCcw, ShieldAlert } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const conflicts = [
  {
    entity: "Customer Account",
    reference: "A100245",
    status: "Needs Review",
    offlineChange: "Delivery note changed while offline.",
    cloudChange: "Sales rep changed in cloud.",
    action: "Review merge"
  },
  {
    entity: "Engineer Job",
    reference: "JOB-1062",
    status: "Needs Review",
    offlineChange: "Engineer marked follow-up required.",
    cloudChange: "Office added chargeable review note.",
    action: "Review merge"
  },
  {
    entity: "Order",
    reference: "OFFLINE-ORDER-2026-0001",
    status: "Pending Sync",
    offlineChange: "Order created offline.",
    cloudChange: "No cloud version exists.",
    action: "Create cloud order"
  }
];

export default function SyncConflictsPage() {
  return (
    <PortalShell
      title="Sync conflicts"
      subtitle="Offline-safe mode queues actions and never silently overwrites cloud data."
      activeHref="/portal/sales/sync-conflicts"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Conflict queue</CardTitle>
                <CardDescription>
                  Review offline actions that need human confirmation before they are merged into the cloud database.
                </CardDescription>
              </div>

              <Badge tone="warning">Pending Sync</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="portal-scroll-panel">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Offline change</th>
                    <th>Cloud change</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {conflicts.map((conflict) => (
                    <tr key={`${conflict.entity}-${conflict.reference}`}>
                      <td className="font-bold">{conflict.entity}</td>
                      <td>{conflict.reference}</td>
                      <td>
                        <Badge tone={conflict.status === "Pending Sync" ? "info" : "warning"}>
                          {conflict.status}
                        </Badge>
                      </td>
                      <td>{conflict.offlineChange}</td>
                      <td>{conflict.cloudChange}</td>
                      <td>
                        <Button type="button" size="sm" variant="secondary">
                          {conflict.action}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Sync status</CardTitle>
              <CardDescription>Offline safety counters.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3">
              <StatusRow icon={<DatabaseZap className="size-4" />} label="Pending actions" value="3" tone="warning" />
              <StatusRow icon={<GitMerge className="size-4" />} label="Needs review" value="2" tone="danger" />
              <StatusRow icon={<RefreshCcw className="size-4" />} label="Last sync" value="Not wired" tone="info" />
              <StatusRow icon={<CheckCircle2 className="size-4" />} label="Safe merges" value="0" tone="success" />
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Safety rules</CardTitle>
              <CardDescription>Rules for avoiding accidental overwrite.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Rule
                icon={<ShieldAlert className="size-4" />}
                text="Never silently overwrite live customer, order or engineer records."
              />
              <Rule
                icon={<AlertTriangle className="size-4" />}
                text="Offline updates that touch the same record as a cloud update require review."
              />
              <Rule
                icon={<GitMerge className="size-4" />}
                text="Accepted changes should create a permanent audit log entry."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function StatusRow({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700"
  };

  return (
    <div className={`flex items-center justify-between rounded-2xl border border-freshpac-panel p-3 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-bold">{label}</p>
      </div>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

function Rule({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
      <div className="mt-0.5 text-freshpac-orange">{icon}</div>
      <p>{text}</p>
    </div>
  );
}