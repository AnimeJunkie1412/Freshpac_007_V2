import { Database, HardDriveDownload, RefreshCcw, WifiOff } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DesktopPlanPage() {
  return (
    <PortalShell
      title="Desktop offline plan"
      subtitle="Framework for Tauri/Electron shell, SQLite local cache, offline queue and Supabase sync."
      activeHref="/portal/desktop"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Offline sync architecture</CardTitle>
                <CardDescription>
                  Planned desktop sync structure for engineers and telesales staff.
                </CardDescription>
              </div>

              <Badge tone="warning">Pending Sync</Badge>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3">
            <FeatureRow
              icon={<Database className="size-4" />}
              title="SQLite local cache"
              description="Customer accounts, jobs, orders and pricing cached locally."
            />

            <FeatureRow
              icon={<WifiOff className="size-4" />}
              title="Offline engineer mode"
              description="Engineer jobs continue working without signal."
            />

            <FeatureRow
              icon={<RefreshCcw className="size-4" />}
              title="Background sync queue"
              description="Changes sync back to Supabase automatically."
            />

            <FeatureRow
              icon={<HardDriveDownload className="size-4" />}
              title="Delta downloads"
              description="Only changed records downloaded to devices."
            />
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Planned sync protections</CardTitle>
            <CardDescription>
              Preventing data corruption between offline devices and live portal updates.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {[
                "Version tracking on all synced entities",
                "Conflict review queue for admin users",
                "Per-device sync logs",
                "Soft-delete recovery support",
                "Partial retry queue support",
                "Offline image upload queue",
                "Sync throttling for weak connections"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

function FeatureRow({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-freshpac-panel bg-white p-3">
      <div className="mt-0.5 rounded-xl bg-orange-100 p-2 text-freshpac-charcoal">
        {icon}
      </div>

      <div>
        <p className="font-black text-freshpac-charcoal">{title}</p>
        <p className="mt-1 text-sm text-freshpac-grey">{description}</p>
      </div>
    </div>
  );
}