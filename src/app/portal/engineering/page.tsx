import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { engineerJobs } from "@/lib/mock-data";

export default function EngineeringPortalPage() {
  return (
    <PortalShell title="Engineers portal" subtitle="Breakdowns, services, filter changes, machine search, parts and job completion reports." activeHref="/portal/engineering">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Engineer jobs</CardTitle>
              <CardDescription>Chief Engineer can assign; engineers can complete assigned jobs and create follow-ups.</CardDescription>
            </div>
            <Button type="button">Create job</Button>
          </CardHeader>
          <CardContent>
            <DataTable
              rows={engineerJobs as any}
              columns={[
                { header: "Ref", accessor: "ref" },
                { header: "Site", accessor: "site" },
                { header: "Type", accessor: "type" },
                { header: "Priority", accessor: (row: any) => <Badge tone={row.priority === "Urgent" ? "danger" : "neutral"}>{row.priority}</Badge> },
                { header: "Engineer", accessor: "engineer" }
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offline engineer mode</CardTitle>
            <CardDescription>Assigned active jobs should be cached for offline completion.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              "View synced active jobs",
              "Complete job sheet offline",
              "Capture customer signature",
              "Add parts used",
              "Sync completed report when online"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-freshpac-panel bg-[#fbf8f2] p-3 text-sm font-semibold text-freshpac-charcoal">{item}</div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
