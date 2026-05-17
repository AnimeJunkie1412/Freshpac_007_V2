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

const statusFilters = ["All", "Active", "On Hold", "Prepayment", "Prices hidden", "Call list"];

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

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([getCustomerListFromDb(), getCustomerStatsFromDb()]);

  return (
    <PortalShell
      title="Customer accounts"
      subtitle="Live customer records from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/customers"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card>
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
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search account, site, address, contact, note, email, serial number..." />
              </label>

              <Button variant="secondary" type="button">
                <Filter className="mr-2 size-4" />
                More filters
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((filter, index) => (
                <Button key={filter} type="button" size="sm" variant={index === 0 ? "primary" : "secondary"}>
                  {filter}
                </Button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {customerSearchHints.map((hint) => (
                <Badge key={hint}>{hint}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
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
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Customer list</CardTitle>
                <CardDescription>
                  These records now come from Supabase/PostgreSQL through Prisma.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                  No customers found. Run <span className="font-bold">npm run prisma:seed</span> or create a customer.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
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
                        <div>
                          <p className="text-sm font-black text-freshpac-charcoal">{customer.siteName}</p>
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
                  No priority accounts found.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database status</CardTitle>
              <CardDescription>The customer module is now reading real records.</CardDescription>
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