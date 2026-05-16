import Link from "next/link";
import type { ReactNode } from "react";
import { Banknote, ClipboardList, Filter, Plus, Printer, Search, Truck, WifiOff } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrderStats, orderSourceTone, orderStatusTone, salesOrders } from "@/lib/sales/orders";

const filters = ["All", "Submitted", "Awaiting Payment", "Paid Submitted", "Processed", "Courier", "Route", "Offline"];

export default function OrdersPage() {
  const stats = getOrderStats();

  return (
    <PortalShell
      title="Sales orders"
      subtitle="View, filter, print and process customer orders."
      activeHref="/portal/sales/orders"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Order search</CardTitle>
                <CardDescription>
                  Search by order reference, customer, account number, delivery day, courier, product or status.
                </CardDescription>
              </div>

              <LinkButton href="/portal/sales/orders/new" size="sm">
                <Plus className="mr-2 size-4" />
                New manual order
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search FP reference, account, customer, driver, courier..." />
              </label>

              <Button variant="secondary" type="button">
                <Filter className="mr-2 size-4" />
                More filters
              </Button>

              <Button type="button">
                <Printer className="mr-2 size-4" />
                Print selected
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
            <CardTitle>Order counters</CardTitle>
            <CardDescription>Operational order queues.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<ClipboardList className="size-4" />} />
            <MiniStat label="Submitted" value={stats.submitted} tone="info" icon={<Truck className="size-4" />} />
            <MiniStat label="Awaiting pay" value={stats.awaitingPayment} tone="warning" icon={<Banknote className="size-4" />} />
            <MiniStat label="Processed" value={stats.processed} tone="success" icon={<Printer className="size-4" />} />
            <MiniStat label="Need print" value={stats.needsPrint} tone="warning" icon={<Printer className="size-4" />} />
            <MiniStat label="Offline" value={stats.offlinePending} tone="danger" icon={<WifiOff className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Order list</CardTitle>
                <CardDescription>
                  The processing table keeps the useful density of the old invoice screen while making order state clearer.
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
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Delivery</th>
                    <th>Method</th>
                    <th>Total</th>
                    <th>Print</th>
                    <th>Payment</th>
                  </tr>
                </thead>

                <tbody>
                  {salesOrders.map((order) => (
                    <tr key={order.reference}>
                      <td>
                        <Link
                          href={`/portal/sales/orders/${order.reference}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td>
                        <div className="font-bold text-freshpac-charcoal">{order.siteName}</div>
                        <div className="text-xs text-freshpac-grey">{order.accountNumber}</div>
                      </td>
                      <td>
                        <StatusBadge status={order.status} tone={orderStatusTone[order.status]} />
                      </td>
                      <td>
                        <Badge tone={orderSourceTone[order.source]}>{order.source}</Badge>
                      </td>
                      <td>{order.orderDate}</td>
                      <td>
                        <div className="font-semibold">{order.requiredDeliveryDay}</div>
                        <div className="text-xs text-freshpac-grey">{order.driverOrCourier}</div>
                      </td>
                      <td>{order.deliveryMethod}</td>
                      <td className="font-bold">{order.totalIncVat}</td>
                      <td>
                        <Badge tone={order.printStatus === "Printed" ? "success" : "warning"}>{order.printStatus}</Badge>
                      </td>
                      <td>
                        <Badge tone={order.paymentStatus === "Awaiting payment" ? "warning" : "neutral"}>{order.paymentStatus}</Badge>
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
              <CardTitle>Processing actions</CardTitle>
              <CardDescription>Print and process workflow placeholders.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <Button type="button">Print selected order sheets</Button>
              <Button type="button" variant="secondary">
                Print coffee pick list
              </Button>
              <Button type="button" variant="secondary">
                Print retail pick list
              </Button>
              <Button type="button" variant="secondary">
                Confirm printed successfully
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs attention</CardTitle>
              <CardDescription>Orders that should not silently process.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {salesOrders
                .filter(
                  (order) =>
                    order.status === "Awaiting Payment" ||
                    order.source === "Offline pending" ||
                    order.minimumOrderCheck === "Below minimum" ||
                    order.priceVisibility === "Off"
                )
                .map((order) => (
                  <Link
                    key={order.reference}
                    href={`/portal/sales/orders/${order.reference}`}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-freshpac-charcoal">{order.reference}</p>
                        <p className="text-xs text-freshpac-grey">{order.siteName}</p>
                      </div>
                      <StatusBadge status={order.status} tone={orderStatusTone[order.status]} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {order.priceVisibility === "Off" ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                      {order.minimumOrderCheck === "Below minimum" ? <Badge tone="warning">Below minimum</Badge> : null}
                      {order.source === "Offline pending" ? <Badge tone="danger">Pending sync</Badge> : null}
                    </div>
                  </Link>
                ))}
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