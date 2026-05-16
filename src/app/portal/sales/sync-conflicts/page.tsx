import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

const conflicts = [
  { record: "Customer TJ51851", issue: "Cloud account status changed after offline pending order", action: "Needs review" },
  { record: "Product ARK100067", issue: "Product made inactive while offline order used it", action: "Needs review" },
  { record: "JOB-1029", issue: "Engineer report completed while job was reassigned online", action: "Needs review" }
];

export default function SyncConflictsPage() {
  return (
    <PortalShell title="Sync conflicts" subtitle="Offline-safe mode queues actions and never silently overwrites cloud data." activeHref="/portal/sales/sync-conflicts" status="Pending Sync">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Conflicts requiring review</CardTitle>
            <CardDescription>Decisions should be audited: accept offline, keep cloud, merge manually, archive duplicate or cancel pending change.</CardDescription>
          </div>
          <Button type="button">Open resolver</Button>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={conflicts as any}
            columns={[
              { header: "Record", accessor: "record" },
              { header: "Issue", accessor: "issue" },
              { header: "Status", accessor: (row: any) => <Badge tone="danger">{row.action}</Badge> }
            ]}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
