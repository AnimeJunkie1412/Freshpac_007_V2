import Link from "next/link";
import { ArrowLeft, FileText, Search, ShoppingBasket, Truck, UserRoundCheck } from "lucide-react";
import { createManualOrder } from "@/app/portal/sales/orders/new/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatCustomerStatus,
  formatPriceVisibility,
  getManualOrderCustomerByIdFromDb,
  getManualOrderCustomerOptionsFromDb
} from "@/lib/sales/manual-order-db";

type CustomerOption = Awaited<ReturnType<typeof getManualOrderCustomerOptionsFromDb>>[number];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewManualOrderPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    customerId?: string;
  };
}) {
  const q = searchParams?.q || "";
  const selectedCustomerId = searchParams?.customerId || "";

  const [customers, selectedCustomer] = await Promise.all([
    getManualOrderCustomerOptionsFromDb({ q }),
    getManualOrderCustomerByIdFromDb(selectedCustomerId)
  ]);

  const fallbackCustomer = selectedCustomer || customers[0] || null;

  return (
    <PortalShell
      title="New manual order"
      subtitle="Create a Freshpac staff-entered order shell, then add lines from the order detail screen."
      activeHref="/portal/sales/orders"
    >
      <div className="mb-4">
        <Link
          href="/portal/sales/orders"
          className="inline-flex w-fit items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to orders
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Find customer</CardTitle>
              <CardDescription>
                Search by account number, site name, legal name, delivery day or driver.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action="/portal/sales/orders/new" className="grid gap-3">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                  <Input
                    className="pl-9"
                    name="q"
                    defaultValue={q}
                    placeholder="Search customer..."
                  />
                </label>

                <Button type="submit" variant="secondary">
                  <Search className="mr-2 size-4" />
                  Search customers
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Customer results</CardTitle>
              <CardDescription>
                Showing {customers.length} customer option{customers.length === 1 ? "" : "s"}.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {customers.map((customer: CustomerOption) => (
                <Link
                  key={customer.id}
                  href={buildNewOrderHref({ q, customerId: customer.id })}
                  className={`block rounded-2xl border p-4 transition ${
                    fallbackCustomer?.id === customer.id
                      ? "border-freshpac-orange bg-orange-50"
                      : "border-freshpac-panel bg-white hover:border-freshpac-orange hover:bg-orange-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                        {customer.accountNumber}
                      </p>
                      <p className="mt-1 truncate text-sm font-black text-freshpac-charcoal">
                        {customer.siteName}
                      </p>
                      <p className="truncate text-xs text-freshpac-grey">
                        {customer.legalName || "No legal name recorded"}
                      </p>
                    </div>

                    <Badge tone={customer.status === "ON_HOLD" ? "danger" : "success"}>
                      {formatCustomerStatus(customer.status)}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniDetail label="Delivery" value={customer.deliveryDay || "Not set"} />
                    <MiniDetail label="Driver" value={customer.driverOrCourier || "Not set"} />
                    <MiniDetail label="Method" value={String(customer.deliveryMethod || "Not set")} />
                    <MiniDetail label="Prices" value={formatPriceVisibility(customer.priceVisibility)} />
                  </div>
                </Link>
              ))}

              {!customers.length ? (
                <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No customers matched that search.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Create order shell</CardTitle>
                <CardDescription>
                  This creates the order header first. Product lines come next from the order detail page.
                </CardDescription>
              </div>

              <Badge tone="warning">No lines yet</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {fallbackCustomer ? (
              <form action={createManualOrder} className="grid gap-5">
                <input type="hidden" name="customerId" value={fallbackCustomer.id} />

                <section className="rounded-2xl border border-freshpac-panel bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                        Selected customer
                      </p>
                      <h2 className="mt-1 text-xl font-black text-freshpac-charcoal">
                        {fallbackCustomer.siteName}
                      </h2>
                      <p className="text-sm text-freshpac-grey">
                        {fallbackCustomer.accountNumber} · {fallbackCustomer.legalName || "No legal name recorded"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge tone={fallbackCustomer.status === "ON_HOLD" ? "danger" : "success"}>
                        {formatCustomerStatus(fallbackCustomer.status)}
                      </Badge>
                      <Badge tone={fallbackCustomer.priceVisibility ? "success" : "warning"}>
                        {formatPriceVisibility(fallbackCustomer.priceVisibility)}
                      </Badge>
                    </div>
                  </div>

                  {fallbackCustomer.status === "ON_HOLD" ? (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">
                      This customer is currently on hold. You can create a draft shell, but this should not be processed without approval.
                    </div>
                  ) : null}

                  {!fallbackCustomer.priceVisibility ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                      This account has hidden prices. Printed order sheets will clearly state that a delivery note is required.
                    </div>
                  ) : null}
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <FormField
                    label="Customer PO number"
                    name="customerPoNumber"
                    placeholder="Optional PO number"
                  />

                  <FormField
                    label="Delivery day"
                    name="deliveryDay"
                    placeholder="Delivery day"
                    defaultValue={fallbackCustomer.deliveryDay || ""}
                  />

                  <FormField
                    label="Driver / courier"
                    name="driverOrCourier"
                    placeholder="Driver or courier"
                    defaultValue={fallbackCustomer.driverOrCourier || ""}
                  />

                  <FormField
                    label="Delivery method"
                    name="deliveryMethod"
                    placeholder="Delivery method"
                    defaultValue={String(fallbackCustomer.deliveryMethod || "")}
                  />
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <TextAreaField
                    label="Customer notes"
                    name="customerNotes"
                    placeholder="Notes that can appear on paperwork..."
                  />

                  <TextAreaField
                    label="Freshpac internal notes"
                    name="internalNotes"
                    placeholder="Internal handling notes..."
                  />
                </section>

                <section className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <WorkflowCard
                      icon={<UserRoundCheck className="size-5" />}
                      title="1. Customer selected"
                      text="The order is linked to the chosen account."
                    />
                    <WorkflowCard
                      icon={<ShoppingBasket className="size-5" />}
                      title="2. Add lines next"
                      text="The next step will be adding products to the order."
                    />
                    <WorkflowCard
                      icon={<Truck className="size-5" />}
                      title="3. Print/process"
                      text="Print order sheets, delivery notes and pick lists once lines are added."
                    />
                  </div>
                </section>

                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="submit" name="intent" value="DRAFT_BASKET" variant="secondary">
                    <FileText className="mr-2 size-4" />
                    Create draft shell
                  </Button>

                  <Button type="submit" name="intent" value="SUBMITTED">
                    <ShoppingBasket className="mr-2 size-4" />
                    Create submitted shell
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-freshpac-panel bg-white p-6 text-sm text-freshpac-grey">
                Search for a customer first, then select one to create a manual order shell.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

function buildNewOrderHref({ q, customerId }: { q: string; customerId: string }) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  params.set("customerId", customerId);

  return `/portal/sales/orders/new?${params.toString()}`;
}

function FormField({
  label,
  name,
  placeholder,
  defaultValue = ""
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
        {label}
      </span>
      <Input
        className="mt-2"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  placeholder
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
        {label}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        className="mt-2 min-h-32 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function WorkflowCard({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
      <div className="flex items-center gap-2 text-freshpac-charcoal">
        {icon}
        <p className="font-black">{title}</p>
      </div>
      <p className="mt-2 text-sm text-freshpac-grey">{text}</p>
    </div>
  );
}