import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { productRows } from "@/lib/mock-data";

export default function ProductsPage() {
  return (
    <PortalShell title="Products" subtitle="Product codes stay internal. Coffee and retail products are separately assignable to customer accounts." activeHref="/portal/sales/products">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <Input placeholder="Search stock code, description, group, notes..." />
        <Button variant="secondary" type="button">Export stocktaking PDF</Button>
        <Button type="button">Create product</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock list framework</CardTitle>
          <CardDescription>Based on the current Stock module, with cleaner row density and stronger filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={productRows as any}
            columns={[
              { header: "Code", accessor: "code" },
              { header: "Description", accessor: "name" },
              { header: "Group", accessor: "group" },
              { header: "Pack", accessor: "pack" },
              { header: "VAT", accessor: (row: any) => <Badge tone={row.vat === "T1" ? "warning" : "neutral"}>{row.vat}</Badge> },
              { header: "List", accessor: "list" }
            ]}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
