import { Save } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function NewProductPage() {
  return (
    <PortalShell
      title="Create product"
      subtitle="Starter product creation form for Sage-linked products, pricing, VAT and visibility."
      activeHref="/portal/sales/products"
    >
      <Card>
        <CardHeader>
          <CardTitle>New product</CardTitle>
          <CardDescription>
            This is a front-end placeholder. Next we will connect this to validation, permissions, audit logs and Supabase.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Sage product code">
                <Input placeholder="Example: ARHSETO6X1G" />
              </Field>

              <Field label="Product name">
                <Input placeholder="Product name" />
              </Field>

              <Field label="Product type">
                <Input placeholder="Normal Product, Coffee Product or Retail Product" />
              </Field>

              <Field label="Category">
                <Input placeholder="Coffee, Tea, Takeaway..." />
              </Field>

              <Field label="Group">
                <Input placeholder="Beans, Cups and Lids..." />
              </Field>

              <Field label="Pack size">
                <Input placeholder="6 x 1kg, 1kg, pack..." />
              </Field>
            </div>

            <Field label="Description">
              <Textarea placeholder="Product description for staff and customer-facing product detail where allowed" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Price ex VAT">
                <Input placeholder="0.00" />
              </Field>

              <Field label="VAT code">
                <Input placeholder="T0 or T1" />
              </Field>

              <Field label="VAT rate">
                <Input placeholder="0% or 20%" />
              </Field>

              <Field label="VAT amount">
                <Input placeholder="0.00" />
              </Field>

              <Field label="Price inc VAT">
                <Input placeholder="0.00" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Status">
                <Input placeholder="Active or Inactive" />
              </Field>

              <Field label="Visibility">
                <Input placeholder="Visible, assigned customers only, staff only" />
              </Field>

              <Field label="Customer can see code">
                <Input placeholder="No" />
              </Field>
            </div>

            <Field label="Internal product notes">
              <Textarea placeholder="Notes, handling rules, coffee restrictions, retail rollover behaviour..." />
            </Field>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary">
                Save as draft
              </Button>

              <Button type="button">
                <Save className="mr-2 size-4" />
                Create product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">{label}</span>
      {children}
    </label>
  );
}