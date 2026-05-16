import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { LinkButton } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { callListRows, salesMetrics } from "@/lib/mock-data";

export default function SalesDashboardPage() {
  return (
    <PortalShell title="Sales dashboard" subtitle="Compact operational counters, call list pressure, order work and account warnings." activeHref="/portal/sales">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {salesMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} tone={metric.tone as any} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Today’s call list sample</CardTitle>
              <CardDescription>Searchable, filterable table area based on the current system workflow.</CardDescription>
            </div>
            <LinkButton href="/portal/sales/call-list" variant="secondary" size="sm">Open full list</LinkButton>
          </CardHeader>
          <CardContent>
            <DataTable
              rows={callListRows as any}
              columns={[
                { header: "Account", accessor: "account" },
                { header: "Customer", accessor: "customer" },
                { header: "Contact", accessor: "contact" },
                { header: "Delivery", accessor: "deliveryDay" },
                { header: "Van", accessor: "van" },
                { header: "Status", accessor: (row: any) => <Badge tone={row.status === "On stop" ? "danger" : row.status.startsWith("£") ? "success" : "neutral"}>{row.status}</Badge> }
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priority work</CardTitle>
            <CardDescription>Cards replace toolbar hunting and make urgent items louder.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {["Print selected order PDFs", "Review awaiting payment orders", "Resolve sync conflicts", "Process chargeable engineer jobs", "Review trade requests"].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-freshpac-panel bg-[#fbf8f2] p-3">
                <span className="text-sm font-semibold text-freshpac-charcoal">{item}</span>
                <Badge tone={index === 2 ? "danger" : index === 1 || index === 3 ? "warning" : "neutral"}>Action</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
