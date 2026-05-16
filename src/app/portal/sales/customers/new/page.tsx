import { Save } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function NewCustomerPage() {
  return (
    <PortalShell
      title="Create customer"
      subtitle="Starter form for building the customer account creation flow."
      activeHref="/portal/sales/customers"
    >
      <Card>
        <CardHeader>
          <CardTitle>New customer account</CardTitle>
          <CardDescription>
            This is a front-end placeholder. Next we will connect this to validation, permissions and Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Sage account number">
                <Input placeholder="Example: A100245" />
              </Field>
              <Field label="Site name">
                <Input placeholder="Customer trading/site name" />
              </Field>
              <Field label="Legal name">
                <Input placeholder="Limited company or sole trader name" />
              </Field>
              <Field label="Delivery day">
                <Input placeholder="Monday, Tuesday, Courier..." />
              </Field>
              <Field label="Driver / courier">
                <Input placeholder="Driver name or courier" />
              </Field>
              <Field label="Assigned sales rep">
                <Input placeholder="Sales rep" />
              </Field>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Invoice address">
                <Textarea placeholder="Invoice address lines" />
              </Field>
              <Field label="Delivery address">
                <Textarea placeholder="Delivery address lines" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Primary contact name">
                <Input placeholder="Contact name" />
              </Field>
              <Field label="Primary contact phone">
                <Input placeholder="Phone number" />
              </Field>
              <Field label="Primary contact email">
                <Input placeholder="Email address" />
              </Field>
              <Field label="Contact role">
                <Input placeholder="Owner, manager, accounts..." />
              </Field>
            </div>

            <Field label="Special instructions">
              <Textarea placeholder="Delivery, access, contact and account handling notes" />
            </Field>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary">
                Save as draft
              </Button>
              <Button type="button">
                <Save className="mr-2 size-4" />
                Create customer
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