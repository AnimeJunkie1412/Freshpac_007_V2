import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, ClipboardList, Filter, Phone, Search, ShoppingBasket, UserRoundCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { callListEntries, getCallListStats } from "@/lib/sales/orders";

const filters = ["All", "To call", "Called", "Nothing Needed", "Order placed", "Needs contact", "Tuesday", "Courier"];

export default function CallListPage() {
  const stats = getCallListStats();

  return (
    <PortalShell
      title="Sales call list"
      subtitle="Weekly telesales list for customer contact, basket checks and Nothing Needed logging."
      activeHref="/portal/sales/call-list"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Call list search</CardTitle>
            <CardDescription>
              Filter customers by delivery day, contact day, driver, courier, frequency, account status and sales rep.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search customer, account, contact, phone, driver..." />
              </label>

              <Button variant="secondary" type="button">
                <Filter className="mr-2 size-4" />
                More filters
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Button key={filter} type="button" size="sm" variant={index === 0 ? "primary" : "secondary"}>
                  {filter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call counters</CardTitle>
            <CardDescription>Weekly contact progress.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<ClipboardList className="size-4" />} />
            <MiniStat label="To call" value={stats.toCall} tone="info" icon={<Phone className="size-4" />} />
            <MiniStat label="Orders" value={stats.orderPlaced} tone="success" icon={<ShoppingBasket className="size-4" />} />
            <MiniStat label="Nothing" value={stats.nothingNeeded} icon={<CheckCircle2 className="size-4" />} />
            <MiniStat label="Contact" value={stats.needsContact} tone="warning" icon={<UserRoundCheck className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Weekly call list</CardTitle>
                <CardDescription>
                  Designed to replace the old call list screen while keeping fast access to past orders, shopping list and customer pricing.
                </CardDescription>
              </div>
              <Badge tone="info">Mock data</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Delivery</th>
                    <th>Frequency</th>
                    <th>Rep</th>
                    <th>Status</th>
                    <th>Basket</th>
                    <th>Last order</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {callListEntries.map((entry) => (
                    <tr key={entry.accountNumber}>
                      <td>
                        <Link
                          href={`/portal/sales/customers/${entry.accountNumber}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {entry.accountNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="font-bold text-freshpac-charcoal">{entry.siteName}</div>
                        <div className="text-xs text-freshpac-grey">{entry.notes}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{entry.contactName}</div>
                        <div className="text-xs text-freshpac-grey">{entry.phone}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{entry.deliveryDay}</div>
                        <div className="text-xs text-freshpac-grey">{entry.driverOrCourier}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{entry.contactDay}</div>
                        <div className="text-xs text-freshpac-grey">Every {entry.contactFrequency}</div>
                      </td>
                      <td>{entry.assignedSalesRep}</td>
                      <td>
                        <CallStatusBadge status={entry.status} />
                      </td>
                      <td>
                        <div className="font-bold">{entry.basketValue}</div>
                        <Badge tone={entry.basketStatus === "Empty" ? "neutral" : "warning"}>{entry.basketStatus}</Badge>
                      </td>
                      <td>{entry.lastOrderDate}</td>
                      <td>
                        <div className="flex min-w-56 flex-wrap gap-2">
                          <Link
                            href={`/portal/sales/customers/${entry.accountNumber}`}
                            className="rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-xs font-bold text-freshpac-charcoal hover:border-freshpac-orange"
                          >
                            Open account
                          </Link>
                          <Link
                            href="/portal/sales/orders/new"
                            className="rounded-xl bg-freshpac-orange px-3 py-2 text-xs font-bold text-freshpac-charcoal hover:bg-orange-400"
                          >
                            Place order
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Call actions</CardTitle>
              <CardDescription>These will write to the weekly call list once live.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <Button type="button">Mark called</Button>
              <Button type="button" variant="secondary">
                Mark Nothing Needed
              </Button>
              <Button type="button" variant="secondary">
                Create order from basket
              </Button>
              <Button type="button" variant="secondary">
                Add customer note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Freshpac contact</CardTitle>
              <CardDescription>Accounts that need extra care before ordering.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {callListEntries
                .filter((entry) => entry.status === "Needs Freshpac contact" || entry.accountStatus !== "Active")
                .map((entry) => (
                  <Link
                    href={`/portal/sales/customers/${entry.accountNumber}`}
                    key={entry.accountNumber}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-freshpac-charcoal">{entry.siteName}</p>
                        <p className="text-xs text-freshpac-grey">{entry.accountNumber}</p>
                      </div>
                      <StatusBadge
                        status={entry.accountStatus}
                        tone={entry.accountStatus === "On Hold" ? "danger" : "warning"}
                      />
                    </div>

                    <p className="mt-2 text-xs text-freshpac-grey">{entry.notes}</p>
                  </Link>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function CallStatusBadge({ status }: { status: string }) {
  if (status === "Order placed") {
    return <Badge tone="success">Order placed</Badge>;
  }

  if (status === "Nothing Needed") {
    return <Badge>Nothing Needed</Badge>;
  }

  if (status === "Needs Freshpac contact") {
    return <Badge tone="warning">Needs contact</Badge>;
  }

  if (status === "Called") {
    return <Badge tone="info">Called</Badge>;
  }

  return <Badge tone="info">To call</Badge>;
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