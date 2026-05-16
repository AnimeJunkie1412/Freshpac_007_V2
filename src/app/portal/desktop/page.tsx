import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { offlineAllowedActions, offlineBlockedActions } from "@/lib/offline/offline-rules";

export default function DesktopPlanPage() {
  return (
    <PortalShell title="Desktop offline plan" subtitle="Framework for Tauri/Electron shell, SQLite local cache, offline queue and Supabase sync." activeHref="/portal/desktop" status="Pending Sync">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allowed while offline</CardTitle>
            <CardDescription>Actions become pending drafts or queued sync actions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {offlineAllowedActions.map((action) => (
              <div key={action} className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                {action}
                <Badge tone="success">Allowed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blocked while offline</CardTitle>
            <CardDescription>Protected actions need live cloud checks before becoming final.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {offlineBlockedActions.map((action) => (
              <div key={action} className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                {action}
                <Badge tone="danger">Blocked</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
