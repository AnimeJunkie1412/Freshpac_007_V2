import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { callListRows } from "@/lib/mock-data";

export default function CallListPage() {
  return (
    <PortalShell title="Call list" subtitle="Tele-sales work queue with delivery day, contact day, van, status and quick order actions." activeHref="/portal/sales/call-list">
      <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_160px_160px_160px_auto]">
        <Input placeholder="Search customer, contact, phone, account..." />
        <Input placeholder="Contact day" />
        <Input placeholder="Delivery day" />
        <Input placeholder="Van" />
        <Button type="button">Prepare week</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly call list</CardTitle>
          <CardDescription>Rows should open the customer basket for placing an order or marking Nothing Needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={callListRows as any}
            columns={[
              { header: "SO No", accessor: "account" },
              { header: "Customer", accessor: "customer" },
              { header: "Name", accessor: "contact" },
              { header: "Phone", accessor: "phone" },
              { header: "Last Ordered", accessor: "lastOrdered" },
              { header: "Contact", accessor: "contactDay" },
              { header: "Delivery", accessor: "deliveryDay" },
              { header: "Van", accessor: "van" },
              { header: "Status", accessor: (row: any) => <Badge tone={row.status === "On stop" ? "danger" : "neutral"}>{row.status}</Badge> }
            ]}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
