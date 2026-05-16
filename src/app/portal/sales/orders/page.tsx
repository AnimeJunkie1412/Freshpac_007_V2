import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

const rows = [
  { ref: "FP0000421", customer: "Bishops Cafe & Tea Room", delivery: "Wed", status: "Submitted", value: "£163.70" },
  { ref: "FP0000422", customer: "Angel Inn Coffee House", delivery: "Fri", status: "Awaiting Payment", value: "£78.20" },
  { ref: "FP0000423", customer: "7 Surrey Street Cafe", delivery: "Thu", status: "Paid Submitted", value: "£221.40" }
];

export default function OrdersPage() {
  return (
    <PortalShell title="Orders" subtitle="Print, process, edit and audit B2B orders with separate PDF outputs for delivery notes and pick lists." activeHref="/portal/sales/orders">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Order queue</CardTitle>
            <CardDescription>Print confirmation should control when orders move to Processed.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" type="button">Print PDFs</Button>
            <Button type="button">Confirm processed</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={rows as any}
            columns={[
              { header: "Reference", accessor: "ref" },
              { header: "Customer", accessor: "customer" },
              { header: "Delivery", accessor: "delivery" },
              { header: "Status", accessor: (row: any) => <Badge tone={row.status === "Awaiting Payment" ? "warning" : "success"}>{row.status}</Badge> },
              { header: "Value", accessor: "value" }
            ]}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
