import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, Filter, Plus, Search, ShieldAlert, Truck, UsersRound } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildCustomerFlags,
  formatCustomerStatus,
  formatDate,
  formatDeliveryMethod,
  getCustomerListFromDb,
  getCustomerStatsFromDb,
  getCustomerStatusTone
} from "@/lib/sales/customer-db";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Prepayment", value: "ACTIVE_PREPAYMENT" },
  { label: "Prices hidden", value: "HIDDEN_PRICES" },
  { label: "Call list", value: "CALL_LIST" }
];

const customerSearchHints = [
  "Account number",
  "Site name",
  "Invoice address",
  "Delivery address",
  "Contact name",
  "Phone",
  "Email",
  "Notes",
  "Equipment serial"
];

export default async function CustomersPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    status?: string;
  };
}) {
  const q = searchParams?.q || "";
  const status = searchParams?.status || "ALL";

  const [customers, stats] = await Promise.all([
    getCustomerListFromDb({ q, status }),
    getCustomerStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Customer accounts"
      subtitle="Live customer records from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/customers"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Find a customer</CardTitle>
                <CardDescription>
                  Search across account number, site, address, contacts, notes, emails and equipment serial numbers.
                </CardDescription>
              </div>
              <LinkButton href="/portal/sales/customers/new" size="sm">
                <Plus className="mr-2 size-4" />
                Create customer
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent>
            <form action="/portal/sales/customers" className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="status" value={status} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search account, site, address, contact, note, email, serial number..."
                />
              </label>

              <Button variant="secondary" type="submit">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/customers"
                className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((filter) => {
                const href =
                  filter.value === "ALL"
                    ? q
                      ? `/portal/sales/customers?q=${encodeURIComponent(q)}`
                      : "/portal/sales/customers"
                    : `/portal/sales/customers?status=${filter.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

                return (
                  <Link
                    key={filter.value}
                    href={href}
                    className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-black transition ${
                      status === filter.value || (!searchParams?.status && filter.value === "ALL")
                        ? "bg-freshpac-orange text-freshpac-charcoal"
                        : "border border-freshpac-panel bg-white text-freshpac-grey hover:border-freshpac-orange hover:text-freshpac-charcoal"
                    }`}
                  >
                    <Filter className="mr-2 size-3" />
                    {filter.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {customerSearchHints.map((hint) => (
                <Badge key={hint}>{hint}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Customer counters</CardTitle>
            <CardDescription>Live values from the database.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<UsersRound className="size-4" />} />
            <MiniStat label="Active" value={stats.active} tone="success" icon={<Building2 className="size-4" />} />
            <MiniStat label="On hold" value={stats.onHold} tone="danger" icon={<ShieldAlert className="size-4" />} />
            <MiniStat label="Prepay" value={stats.prepayment} tone="warning" icon={<ShieldAlert className="size-4" />} />
            <MiniStat label="Hidden prices" value={stats.pricesHidden} tone="warning" icon={<ShieldAlert className="size-4" />} />
            <MiniStat label="Call list" value={stats.onCallList} tone="info" icon={<Truck className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Customer list</CardTitle>
                <CardDescription>
                  Showing {customers.length} matching customer{customers.length === 1 ? "" : "s"}.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="block p-3 md:hidden">
              <div className="grid gap-3">
                {customers.map((customer) => {
                  const primaryContact = customer.contacts[0];
                  const latestOrder = customer.orders[0];
                  const flags = buildCustomerFlags(customer);

                  return (
                    <Link
                      key={customer.id}
                      href={`/portal/sales/customers/${customer.accountNumber}`}
                      className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm transition hover:border-freshpac-orange hover:bg-orange-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                            {customer.accountNumber}
                          </p>
                          <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">
                            {customer.siteName}
                          </p>
                          <p className="truncate text-xs text-freshpac-grey">
                            {customer.legalName || "No legal name recorded"}
                          </p>
                        </div>

                        <StatusBadge
                          status={formatCustomerStatus(customer.status)}
                          tone={getCustomerStatusTone(customer.status)}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <MobileDetail label="Delivery" value={customer.deliveryDay || "Not set"} />
                        <MobileDetail label="Driver" value={customer.driverOrCourier || formatDeliveryMethod(customer.deliveryMethod)} />
                        <MobileDetail label="Contact" value={primaryContact?.name || "No contact"} />
                        <MobileDetail label="Phone" value={primaryContact?.phone || "No phone"} />
                        <MobileDetail label="Rep" value={customer.assignedSalesRep || "Unassigned"} />
                        <MobileDetail label="Last order" value={latestOrder ? formatDate(latestOrder.createdAt) : "No orders"} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {flags.slice(0, 4).map((flag) => (
                          <Badge key={flag.label} tone={flag.tone}>
                            {flag.label}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  );
                })}

                {!customers.length ? (
                  <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                    No customers match that search.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="portal-scroll-panel">
                <table className="fp-compact-table min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Site</th>
                      <th>Status</th>
                      <th>Delivery</th>
                      <th>Contact</th>
                      <th>Rep</th>
                      <th>Last order</th>
                      <th>Flags</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => {
                      const primaryContact = customer.contacts[0];
                      const latestOrder = customer.orders[0];
                      const flags = buildCustomerFlags(customer);

                      return (
                        <tr key={customer.id}>
                          <td>
                            <Link
                              className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                              href={`/portal/sales/customers/${customer.accountNumber}`}
                            >
                              {customer.accountNumber}
                            </Link>
                          </td>
                          <td>
                            <div className="font-bold text-freshpac-charcoal">{customer.siteName}</div>
                            <div className="text-xs text-freshpac-grey">{customer.legalName || "No legal name recorded"}</div>
                          </td>
                          <td>
                            <StatusBadge
                              status={formatCustomerStatus(customer.status)}
                              tone={getCustomerStatusTone(customer.status)}
                            />
                          </td>
                          <td>
                            <div className="font-semibold">{customer.deliveryDay || "Not set"}</div>
                            <div className="text-xs text-freshpac-grey">
                              {customer.driverOrCourier || formatDeliveryMethod(customer.deliveryMethod)}
                            </div>
                          </td>
                          <td>
                            <div className="font-semibold">{primaryContact?.name || "No contact"}</div>
                            <div className="text-xs text-freshpac-grey">{primaryContact?.phone || customer.contactDay || "No phone"}</div>
                          </td>
                          <td>{customer.assignedSalesRep || "Unassigned"}</td>
                          <td>{latestOrder ? formatDate(latestOrder.createdAt) : "No orders"}</td>
                          <td>
                            <div className="flex min-w-48 flex-wrap gap-1">
                              {flags.slice(0, 3).map((flag) => (
                                <Badge key={flag.label} tone={flag.tone}>
                                  {flag.label}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!customers.length ? (
                  <div className="p-6 text-sm text-freshpac-grey">
                    No customers match that search.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Priority accounts</CardTitle>
              <CardDescription>Accounts needing attention before processing or rollover.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {customers
                .filter((customer) => customer.status !== "ACTIVE" || !customer.priceVisibility)
                .map((customer) => {
                  const flags = buildCustomerFlags(customer);

                  return (
                    <Link
                      href={`/portal/sales/customers/${customer.accountNumber}`}
                      key={customer.id}
                      className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-freshpac-charcoal">{customer.siteName}</p>
                          <p className="text-xs text-freshpac-grey">
                            {customer.accountNumber} · {customer.deliveryDay || "No delivery day"}
                          </p>
                        </div>
                        <StatusBadge
                          status={formatCustomerStatus(customer.status)}
                          tone={getCustomerStatusTone(customer.status)}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {flags.map((flag) => (
                          <Badge key={flag.label} tone={flag.tone}>
                            {flag.label}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  );
                })}

              {!customers.some((customer) => customer.status !== "ACTIVE" || !customer.priceVisibility) ? (
                <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No priority accounts found in this result set.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Database status</CardTitle>
              <CardDescription>The customer module is now reading filtered live records.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <Button type="button" variant="secondary">
                Import Sage customer list
              </Button>
              <Button type="button" variant="secondary">
                Export customer report PDF
              </Button>
              <Button type="button" variant="secondary">
                Review marked for deletion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function MiniStat({
  label,
  value,
  icon,
  tone = "neutral"
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-white text-freshpac-charcoal",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700"
  };

  return (
    <div className={`rounded-2xl border border-freshpac-panel p-3 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}