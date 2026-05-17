import type { ReactNode } from "react";
import { Save, Search, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function NewEngineerJobPage() {
  return (
    <PortalShell
      title="Create engineer job"
      subtitle="Starter form for breakdowns, services and water filter changes."
      activeHref="/portal/engineers/jobs"
    >
      <Card>
        <CardHeader>
          <CardTitle>New engineer job</CardTitle>
          <CardDescription>
            This placeholder will later create jobs from customer accounts, equipment records, Sales Portal breakdowns and Engineers Portal requests.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <Field label="Customer search">
                <Input placeholder="Search account number, site, postcode, contact or equipment serial..." />
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

              <Field label="Contact name">
                <Input placeholder="Site contact" />
              </Field>

              <Field label="Contact phone">
                <Input placeholder="Phone number" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Job type">
                <Input placeholder="Breakdown, Service, Water Filter Change" />
              </Field>

              <Field label="Priority">
                <Input placeholder="Normal or Urgent" />
              </Field>

              <Field label="Chargeable">
                <Input placeholder="Yes, No or To review" />
              </Field>

              <Field label="Assign engineer">
                <Input placeholder="Engineer name or Unassigned" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Machine description">
                <Input placeholder="Traditional espresso machine" />
              </Field>

              <Field label="Make / model">
                <Input placeholder="Sanremo Zoe 2 Group" />
              </Field>

              <Field label="Serial number">
                <Input placeholder="Machine serial number" />
              </Field>

              <Field label="Scheduled date">
                <Input placeholder="Date" />
              </Field>
            </div>

            <Field label="Reported fault / work required">
              <Textarea placeholder="Describe the fault, service requirement or filter change details" />
            </Field>

            <Field label="Engineer / office notes">
              <Textarea placeholder="Access instructions, customer notes, chargeable comments, parts hints..." />
            </Field>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Job sheet preview</p>
              <p className="mt-2 text-sm text-freshpac-grey">
                Machine sheets, parts used, photos, signature and completion report sections will appear here once the job sheet builder is wired.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary">
                Save draft
              </Button>

              <Button type="button">
                <Save className="mr-2 size-4" />
                Create job
              </Button>

              <Button type="button" variant="secondary">
                <Wrench className="mr-2 size-4" />
                Create and assign
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