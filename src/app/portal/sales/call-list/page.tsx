import Link from "next/link";
import { CalendarDays, ClipboardList, MapPin, PhoneCall, Search, ShoppingBasket, Truck, UserRound } from "lucide-react";
import { Prisma } from "@prisma/client";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CallListSearchParams = {
  q?: string;
  day?: string;
  driver?: string;
};

const deliveryDays = [
  "ALL",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default async function SalesCallListPage({
  searchParams
}: {
  searchParams?: CallListSearchParams;
}) {
  const q = searchParams?.q || "";
  const day = searchParams?.day || "ALL";
  const driver = searchParams?.driver || "";

  const [customers, drivers, stats] = await Promise.all([
    getCallListCustomersFromDb({ q, day, driver }),
    getCallListDriversFromDb(),
    getCallListStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Sales call list"
      subtitle="Compact route/customer call list for sales ordering and repeat customer contact."
      activeHref="/portal/sales/call-list"
    >
      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Call list search</CardTitle>
                <CardDescription>
                  Search by account, customer, legal name, delivery day or driver.
                </CardDescription>
              </div>

              <LinkButton href="/portal/sales/orders/new" size="sm">
                <ShoppingBasket className="mr-2 size-4" />
                New order
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent>
            <form action="/portal/sales/call-list" className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="day" value={day} />
              <input type="hidden" name="driver" value={driver} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search account, customer, driver..."
                />
              </label>

              <Button type="submit" variant="secondary">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/call-list"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {deliveryDays.map((deliveryDay) => (
                <FilterLink
                  key={deliveryDay}
                  href={buildCallListHref({
                    q,
                    day: deliveryDay,
                    driver
                  })}
                  active={day === deliveryDay || (!searchParams?.day && deliveryDay === "ALL")}
                  label={deliveryDay === "ALL" ? "All days" : deliveryDay}
                />
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <FilterLink
                href={buildCallListHref({ q, day, driver: "" })}
                active={!driver}
                label="All drivers"
              />

              {drivers.map((driverName) => (
                <FilterLink
                  key={driverName}
                  href={buildCallListHref({ q, day, driver: driverName })}
                  active={driver === driverName}
                  label={driverName}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Call counters</CardTitle>
            <CardDescription>Customer accounts for sales contact.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-2">
            <MiniStat label="Total" value={stats.total} />
            <MiniStat label="Active" value={stats.active} tone="success" />
            <MiniStat label="On hold" value={stats.onHold} tone="warning" />
            <MiniStat label="Hidden prices" value={stats.deliveryNoteRequired} tone="warning" />
          </CardContent>
        </Card>
      </div>

      <Card className="portal-card-safe">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Customer call list</CardTitle>
              <CardDescription>
                Showing {customers.length} customer{customers.length === 1 ? "" : "s"}.
              </CardDescription>
            </div>

            <Badge tone="success">Correct call-list route</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid gap-2 p-3 md:hidden">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}

            {!customers.length ? <EmptyState /> : null}
          </div>

          <div className="hidden md:block">
            <div className="portal-scroll-panel">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Delivery</th>
                    <th>Driver</th>
                    <th>Method</th>
                    <th>Pricing</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => {
                    const customerHref = `/portal/sales/customers/${encodeURIComponent(customer.accountNumber)}`;
                    const newOrderHref = `/portal/sales/orders/new?customerId=${encodeURIComponent(customer.id)}`;

                    return (
                      <tr key={customer.id}>
                        <td className="font-black">{customer.accountNumber}</td>
                        <td>
                          <Link
                            href={customerHref}
                            className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                          >
                            {customer.siteName}
                          </Link>
                          <div className="text-xs text-freshpac-grey">
                            {customer.legalName || "No legal name recorded"}
                          </div>
                        </td>
                        <td>
                          <Badge tone={getCustomerStatusTone(String(customer.status))}>
                            {formatCustomerStatus(String(customer.status))}
                          </Badge>
                        </td>
                        <td>{customer.deliveryDay || "Not set"}</td>
                        <td>{customer.driverOrCourier || "Not set"}</td>
                        <td>{formatDeliveryMethod(String(customer.deliveryMethod || "Not set"))}</td>
                        <td>
                          <Badge tone={customer.priceVisibility ? "success" : "warning"}>
                            {customer.priceVisibility ? "Prices visible" : "Delivery note"}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex min-w-44 flex-wrap gap-1.5">
                            <CompactActionLink href={customerHref} label="Open" />
                            <CompactActionLink href={newOrderHref} label="New order" tone="primary" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!customers.length ? <EmptyState /> : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

async function getCallListCustomersFromDb({
  q,
  day,
  driver
}: {
  q: string;
  day: string;
  driver: string;
}) {
  const where = buildCallListWhere({ q, day, driver });

  return prisma.customerAccount.findMany({
    where,
    orderBy: [
      {
        deliveryDay: "asc"
      },
      {
        driverOrCourier: "asc"
      },
      {
        siteName: "asc"
      }
    ],
    take: 250,
    select: {
      id: true,
      accountNumber: true,
      siteName: true,
      legalName: true,
      status: true,
      deliveryDay: true,
      deliveryMethod: true,
      driverOrCourier: true,
      priceVisibility: true
    }
  });
}

async function getCallListDriversFromDb() {
  const customers = await prisma.customerAccount.findMany({
    where: {
      driverOrCourier: {
        not: null
      }
    },
    select: {
      driverOrCourier: true
    },
    distinct: ["driverOrCourier"],
    orderBy: {
      driverOrCourier: "asc"
    }
  });

  return customers
    .map((customer) => customer.driverOrCourier || "")
    .filter(Boolean);
}

async function getCallListStatsFromDb() {
  const [total, active, onHold, deliveryNoteRequired] = await Promise.all([
    prisma.customerAccount.count(),
    prisma.customerAccount.count({
      where: {
        status: "ACTIVE"
      }
    }),
    prisma.customerAccount.count({
      where: {
        status: "ON_HOLD"
      }
    }),
    prisma.customerAccount.count({
      where: {
        priceVisibility: false
      }
    })
  ]);

  return {
    total,
    active,
    onHold,
    deliveryNoteRequired
  };
}

function buildCallListWhere({
  q,
  day,
  driver
}: {
  q: string;
  day: string;
  driver: string;
}): Prisma.CustomerAccountWhereInput {
  const conditions: Prisma.CustomerAccountWhereInput[] = [];

  if (q.trim()) {
    conditions.push({
      OR: [
        {
          accountNumber: {
            contains: q.trim(),
            mode: "insensitive"
          }
        },
        {
          siteName: {
            contains: q.trim(),
            mode: "insensitive"
          }
        },
        {
          legalName: {
            contains: q.trim(),
            mode: "insensitive"
          }
        },
        {
          deliveryDay: {
            contains: q.trim(),
            mode: "insensitive"
          }
        },
        {
          driverOrCourier: {
            contains: q.trim(),
            mode: "insensitive"
          }
        }
      ]
    });
  }

  if (day && day !== "ALL") {
    conditions.push({
      deliveryDay: {
        equals: day,
        mode: "insensitive"
      }
    });
  }

  if (driver.trim()) {
    conditions.push({
      driverOrCourier: {
        equals: driver.trim(),
        mode: "insensitive"
      }
    });
  }

  if (!conditions.length) {
    return {};
  }

  return {
    AND: conditions
  };
}

function CustomerCard({
  customer
}: {
  customer: Awaited<ReturnType<typeof getCallListCustomersFromDb>>[number];
}) {
  const customerHref = `/portal/sales/customers/${encodeURIComponent(customer.accountNumber)}`;
  const newOrderHref = `/portal/sales/orders/new?customerId=${encodeURIComponent(customer.id)}`;

  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-freshpac-orange">
            {customer.accountNumber}
          </p>
          <p className="mt-0.5 truncate text-sm font-black text-freshpac-charcoal">
            {customer.siteName}
          </p>
          <p className="truncate text-xs text-freshpac-grey">
            {customer.legalName || "No legal name recorded"}
          </p>
        </div>

        <Badge tone={getCustomerStatusTone(String(customer.status))}>
          {formatCustomerStatus(String(customer.status))}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniDetail icon={<CalendarDays className="size-3" />} label="Delivery" value={customer.deliveryDay || "Not set"} />
        <MiniDetail icon={<Truck className="size-3" />} label="Driver" value={customer.driverOrCourier || "Not set"} />
        <MiniDetail icon={<MapPin className="size-3" />} label="Method" value={formatDeliveryMethod(String(customer.deliveryMethod || "Not set"))} />
        <MiniDetail icon={<UserRound className="size-3" />} label="Pricing" value={customer.priceVisibility ? "Prices visible" : "Delivery note"} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <CompactActionLink href={customerHref} label="Open customer" />
        <CompactActionLink href={newOrderHref} label="New order" tone="primary" />
      </div>
    </div>
  );
}

function buildCallListHref({
  q,
  day,
  driver
}: {
  q: string;
  day: string;
  driver: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (day && day !== "ALL") params.set("day", day);
  if (driver) params.set("driver", driver);

  const query = params.toString();

  return query ? `/portal/sales/call-list?${query}` : "/portal/sales/call-list";
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "border border-freshpac-panel bg-white text-freshpac-grey hover:border-freshpac-orange hover:text-freshpac-charcoal"
      }`}
    >
      {label}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning";
}) {
  const tones = {
    neutral: "bg-white text-freshpac-charcoal",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800"
  };

  return (
    <div className={`rounded-xl border border-freshpac-panel p-2 ${tones[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-70">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function MiniDetail({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <div className="flex items-center gap-1 text-freshpac-grey">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</p>
      </div>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function CompactActionLink({
  href,
  label,
  tone = "secondary"
}: {
  href: string;
  label: string;
  tone?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-[11px] font-black transition ${
        tone === "primary"
          ? "bg-freshpac-orange text-freshpac-charcoal hover:bg-orange-400"
          : "border border-freshpac-panel bg-white text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="p-6 text-sm text-freshpac-grey">
      No customers match that call-list search.
    </div>
  );
}

function formatCustomerStatus(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    ACTIVE_PREPAYMENT: "Active Prepayment",
    ON_HOLD: "On Hold",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
    MARKED_FOR_DELETION: "Marked For Deletion"
  };

  return labels[status] || status.replace(/_/g, " ");
}

function getCustomerStatusTone(status: string) {
  if (status === "ACTIVE" || status === "ACTIVE_PREPAYMENT") {
    return "success";
  }

  if (status === "ON_HOLD") {
    return "warning";
  }

  return "neutral";
}

function formatDeliveryMethod(method: string) {
  return method.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}