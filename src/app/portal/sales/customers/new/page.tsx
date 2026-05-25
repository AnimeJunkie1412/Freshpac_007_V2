import Link from "next/link";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { createCustomerAccount } from "@/app/portal/sales/customers/new/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { getCustomerCreateParentOptionsFromDb } from "@/lib/sales/customer-create-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Active Prepayment", value: "ACTIVE_PREPAYMENT" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
  { label: "Marked For Deletion", value: "MARKED_FOR_DELETION" }
];

const deliveryMethodOptions = [
  { label: "Freshpac Route", value: "FRESHPAC_ROUTE" },
  { label: "Courier", value: "COURIER" }
];

export default async function NewCustomerPage() {
  const parentOptions = await getCustomerCreateParentOptionsFromDb();

  return (
    <PortalShell
      title="Create customer"
      subtitle="Add a new customer account, save as active, or save as an inactive draft."
      activeHref="/portal/sales/customers"
    >
      <div className="mb-3">
        <Link
          href="/portal/sales/customers"
          className="inline-flex h-8 w-fit items-center rounded-lg border border-freshpac-panel bg-white px-2.5 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to customers
        </Link>
      </div>

      <form action={createCustomerAccount} className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-3">
          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Account details</CardTitle>
                  <CardDescription>
                    Account number and site name are required for a live customer. Drafts can be saved with less detail.
                  </CardDescription>
                </div>

                <Badge tone="warning">Draft saves as inactive</Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-2">
              <FormField
                label="Account number"
                name="accountNumber"
                placeholder="Example: ABC001"
              />

              <FormField
                label="Site name"
                name="siteName"
                placeholder="Example: The Coffee Shop"
              />

              <FormField
                label="Legal name"
                name="legalName"
                placeholder="Optional company/legal name"
              />

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                  Parent account
                </span>
                <select
                  name="parentAccountId"
                  defaultValue=""
                  className="mt-1 h-9 w-full rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-semibold text-freshpac-charcoal outline-none transition focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">No parent account</option>
                  {parentOptions.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.accountNumber} · {customer.siteName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                  Account status
                </span>
                <select
                  name="status"
                  defaultValue="ACTIVE"
                  className="mt-1 h-9 w-full rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-semibold text-freshpac-charcoal outline-none transition focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              <FormField
                label="Account opened"
                name="accountOpenedAt"
                type="date"
                placeholder=""
              />
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Delivery and call list</CardTitle>
              <CardDescription>
                These values drive the call list, order processing and delivery paperwork.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                  Delivery method
                </span>
                <select
                  name="deliveryMethod"
                  defaultValue="FRESHPAC_ROUTE"
                  className="mt-1 h-9 w-full rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-semibold text-freshpac-charcoal outline-none transition focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                >
                  {deliveryMethodOptions.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>

              <FormField
                label="Delivery day"
                name="deliveryDay"
                placeholder="Example: Monday"
              />

              <FormField
                label="Contact day"
                name="contactDay"
                placeholder="Example: Thursday"
              />

              <FormField
                label="Contact frequency weeks"
                name="contactFrequencyWeeks"
                type="number"
                placeholder="1"
                defaultValue="1"
              />

              <FormField
                label="Driver / courier"
                name="driverOrCourier"
                placeholder="Driver or courier name"
              />

              <FormField
                label="Assigned sales rep"
                name="assignedSalesRep"
                placeholder="Optional"
              />
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>
                Add invoice and delivery addresses. You can fill these later if saving as draft.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-2">
              <AddressFields
                title="Invoice address"
                prefix="invoice"
              />

              <AddressFields
                title="Delivery address"
                prefix="delivery"
              />
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Primary contact and notes</CardTitle>
              <CardDescription>
                Optional contact details and first internal note.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3">
                <FormField
                  label="Contact name"
                  name="contactName"
                  placeholder="Primary contact"
                />

                <FormField
                  label="Contact role"
                  name="contactRole"
                  placeholder="Owner, manager, accounts..."
                />

                <FormField
                  label="Contact phone"
                  name="contactPhone"
                  placeholder="Phone number"
                />

                <FormField
                  label="Contact email"
                  name="contactEmail"
                  type="email"
                  placeholder="Email address"
                />
              </div>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                  Internal note
                </span>
                <Textarea
                  name="note"
                  placeholder="Any setup notes, special instructions, account context..."
                  className="mt-1 min-h-48"
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <aside className="grid content-start gap-3">
          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 text-freshpac-orange" />
                <div>
                  <CardTitle>Save customer</CardTitle>
                  <CardDescription>
                    Save live or as an inactive draft.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-freshpac-panel bg-freshpac-cream/60 p-3">
                <input
                  type="checkbox"
                  name="priceVisibility"
                  defaultChecked
                  className="size-4 accent-freshpac-orange"
                />
                <span className="text-sm font-bold text-freshpac-charcoal">
                  Prices visible to customer
                </span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-freshpac-panel bg-freshpac-cream/60 p-3">
                <input
                  type="checkbox"
                  name="onCallList"
                  defaultChecked
                  className="size-4 accent-freshpac-orange"
                />
                <span className="text-sm font-bold text-freshpac-charcoal">
                  Include on call list
                </span>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-freshpac-panel bg-freshpac-cream/60 p-3">
                <input
                  type="checkbox"
                  name="sageAccountRequired"
                  defaultChecked
                  className="size-4 accent-freshpac-orange"
                />
                <span className="text-sm font-bold text-freshpac-charcoal">
                  Sage account required
                </span>
              </label>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
                <strong>Save as draft</strong> creates an inactive customer. If account number is blank, one is generated automatically.
              </div>

              <Button type="submit" name="intent" value="active">
                <Save className="mr-2 size-4" />
                Save customer
              </Button>

              <Button type="submit" name="intent" value="draft" variant="secondary">
                Save as draft
              </Button>

              <Link
                href="/portal/sales/customers"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
              >
                Cancel
              </Link>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
              <CardDescription>
                After saving, you’ll be taken to the new customer account page.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-sm font-semibold leading-6 text-freshpac-grey">
              Live customers can be used for orders, call list and login creation. Draft customers are saved as inactive until you edit and activate them.
            </CardContent>
          </Card>
        </aside>
      </form>
    </PortalShell>
  );
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  defaultValue = ""
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
        {label}
      </span>
      <Input
        className="mt-1"
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function AddressFields({
  title,
  prefix
}: {
  title: string;
  prefix: "invoice" | "delivery";
}) {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-3">
      <p className="font-black text-freshpac-charcoal">{title}</p>

      <div className="mt-3 grid gap-2">
        {[1, 2, 3, 4, 5].map((lineNumber) => (
          <Input
            key={lineNumber}
            name={`${prefix}AddressLine${lineNumber}`}
            placeholder={`Address line ${lineNumber}`}
          />
        ))}

        <Input
          name={`${prefix}Postcode`}
          placeholder="Postcode"
        />
      </div>
    </div>
  );
}