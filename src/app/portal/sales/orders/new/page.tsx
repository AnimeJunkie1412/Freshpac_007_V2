import type { ReactNode } from "react";
import { Save, Search, ShoppingBasket } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function NewOrderPage() {
  return (
    <PortalShell
      title="New manual order"
      subtitle="Starter form for Freshpac staff placing an order on behalf of a customer."
      activeHref="/portal/sales/orders"
    >
      <Card>
        <CardHeader>
          <CardTitle>Create manual order</CardTitle>
          <CardDescription>
            This placeholder will later search customers, apply pricing, check cut-off rules and generate an official FP reference.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <Field label="Customer search">
                <Input placeholder="Search account number, site name, postcode or contact..." />
              </Field>

              <div className="flex items-end">
                <Button type="button" variant="secondary">
                  <Search className="mr-2 size-4" />
                  Find customer
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Account number">
                <Input placeholder="A100245" />
              </Field>

              <Field label="Site name">
                <Input placeholder="Customer site" />
              </Field>

              <Field label="Delivery day">
                <Input placeholder="Tuesday" />
              </Field>

              <Field label="Delivery method">
                <Input placeholder="Freshpac route or Courier" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Product code">
                <Input placeholder="Search product code" />
              </Field>

              <Field label="Product description">
                <Input placeholder="Product selected" />
              </Field>

              <Field label="Quantity">
                <Input placeholder="1" />
              </Field>

              <div className="flex items-end">
                <Button type="button" variant="secondary">
                  <ShoppingBasket className="mr-2 size-4" />
                  Add line
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Order lines</p>
              <p className="mt-2 text-sm text-freshpac-grey">
                Added products will appear here. Customer pricing, VAT, carriage and product visibility checks will be applied later.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Customer notes">
                <Textarea placeholder="Notes that can appear on the order sheet" />
              </Field>

              <Field label="Internal notes">
                <Textarea placeholder="Freshpac-only handling notes" />
              </Field>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary">
                Save draft basket
              </Button>

              <Button type="button">
                <Save className="mr-2 size-4" />
                Submit order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">{label}</span>
      {children}
    </label>
  );
}