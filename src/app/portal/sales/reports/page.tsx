import { PortalShell } from "@/components/layout/portal-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const reports = [
  "Order sheets",
  "Coffee pick list",
  "Retail pick list",
  "General pick list",
  "Customer inactivity",
  "Chargeable engineer jobs",
  "Machine timeline",
  "Stocktaking product list",
  "Weekly rollover preview"
];

export default function ReportsPage() {
  return (
    <PortalShell title="Reports" subtitle="Printable PDF outputs for sales, orders, products, customers and engineer records." activeHref="/portal/sales/reports">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report}>
            <CardHeader>
              <CardTitle>{report}</CardTitle>
              <CardDescription>PDF generator placeholder.</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge tone="info">PDF required</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
