import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { TabStrip } from "@/components/ui/tab-strip";
import { Button } from "@/components/ui/button";
import { customerTabs } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <PortalShell title="Customer accounts" subtitle="Modernised replacement for the customer module: search, tabs, account controls and compact detail panels." activeHref="/portal/sales/customers">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <Input placeholder="Search account number, site name, address, contact, note, serial number..." />
        <Button variant="secondary" type="button">Active only</Button>
        <Button type="button">Create customer</Button>
      </div>
      <TabStrip tabs={customerTabs} />
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Harbour Inn - Moss and Co</CardTitle>
                <CardDescription>Account TJ51851 · Parent/Child and Sage references belong here.</CardDescription>
              </div>
              <Badge tone="danger">Inactive / on stop</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal">
              Customer name
              <Input defaultValue="HARBOUR INN - MOSS AND CO" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal">
              Account reference
              <Input defaultValue="TJ51851" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal md:col-span-2">
              Invoice address
              <Textarea defaultValue={"Moss & Co Trading Ltd - The Harbour Inn\nPlease email all invoices/statements to:\nnina@mossandcotrading.co.uk"} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal md:col-span-2">
              Delivery address
              <Textarea defaultValue={"The Harbour Inn - Moss and Co\nBridge House\nRoyal Plain\nLowestoft\nNR33 0AG"} />
            </label>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordering controls</CardTitle>
              <CardDescription>Cut-off, contact frequency, delivery day and special instructions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Input defaultValue="Contact frequency: 0" />
              <Input defaultValue="Contact day: Wed" />
              <Input defaultValue="Delivery day: Thu" />
              <Input defaultValue="Van: Andy" />
              <label className="grid gap-2 text-sm font-semibold text-freshpac-charcoal sm:col-span-2">
                Special instructions
                <Textarea defaultValue="Extraction advised. Key retrieval and alarm code notes. Chasing double group for install." />
              </label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account flags</CardTitle>
              <CardDescription>Price visibility, on stop, prepayment and call list flags.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge tone="danger">On stop</Badge>
              <Badge tone="warning">Price visible</Badge>
              <Badge tone="neutral">Export to Sage pending</Badge>
              <Badge tone="success">Checked</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}
