import Link from "next/link";
import type { ReactNode } from "react";
import { Banknote, ClipboardList, Coffee, Filter, ListChecks, Plus, Printer, Search, ShoppingBag, Truck, WifiOff } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatDateTime,
  formatDeliveryMethod,
  formatOrderMoney,
  formatOrderSource,
  formatOrderStatus,
  getOrderAttentionListFromDb,
  getOrderListFromDb,
  getOrderReference,
  getOrderSourceTone,
  getOrderStatsFromDb,
  getOrderStatusTone
} from "@/lib/sales/order-db";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Awaiting Payment", value: "AWAITING_PAYMENT" },
  { label: "Paid", value: "PAID_SUBMITTED" },
  { label: "Processed", value: "PROCESSED" },
  { label: "Needs Print", value: "NEEDS_PRINT" },
  { label: "Attention", value: "AWAITING_ATTENTION" }
];

const sourceFilters = [
  { label: "All sources", value: "ALL" },
  { label: "Customer Portal", value: "CUSTOMER_PORTAL" },
  { label: "Call List", value: "CALL_LIST" },
  { label: "Retail", value: "RETAIL_ORDER" },
  { label: "Offline", value: "OFFLINE_PENDING" }
];

export default async function OrdersPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    status?: string;
    source?: string;
  };
}) {
  const q = searchParams?.q || "";
  const status = searchParams?.status || "ALL";
  const source = searchParams?.source || "ALL";
  const batchPrintHref = buildBatchPrintHref({ q, status, source });
  const pickListHref = buildPickListHref({ q, status, source });
  const coffeePickListHref = buildCoffeePickListHref({ q, status, source });
  const retailPickListHref = buildRetailPickListHref({ q, status, source });

  const [orders, attentionOrders, stats] = await Promise.all([
    getOrderListFromDb({ q, status, source }),
    getOrderAttentionListFromDb(),
    getOrderStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Sales orders"
      subtitle="Live order records from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/orders"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Order search</CardTitle>
                <CardDescription>
                  Search by order reference, customer, account number, delivery day, courier, product or status.
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <LinkButton href={pickListHref} size="sm" variant="secondary">
                  <ListChecks className="mr-2 size-4" />
                  Pick list
                </LinkButton>

                <LinkButton href={batchPrintHref} size="sm" variant="secondary">
                  <Printer className="mr-2 size-4" />
                  Print filtered
                </LinkButton>

                <LinkButton href="/portal/sales/orders/new" size="sm">
                  <Plus className="mr-2 size-4" />
                  New manual order
                </LinkButton>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form action="/portal/sales/orders" className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="source" value={source} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search FP reference, account, customer, driver, courier, product..."
                />
              </label>

              <Button variant="secondary" type="submit">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/orders"
                className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((filter) => {
                const href = buildOrdersHref({ q, status: filter.value, source });

                return (
                  <FilterLink
                    key={filter.value}
                    href={href}
                    active={status === filter.value || (!searchParams?.status && filter.value === "ALL")}
                    label={filter.label}
                  />
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {sourceFilters.map((filter) => {
                const href = buildOrdersHref({ q, status, source: filter.value });

                return (
                  <FilterLink
                    key={filter.value}
                    href={href}
                    active={source === filter.value || (!searchParams?.source && filter.value === "ALL")}
                    label={filter.label}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Order counters</CardTitle>
            <CardDescription>Live operational order queues.</CardDescription>
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
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Order list</CardTitle>
                <CardDescription>
                  Showing {orders.length} matching order{orders.length === 1 ? "" : "s"}.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="block p-3 md:hidden">
              <div className="grid gap-3">
                {orders.map((order) => {
                  const reference = getOrderReference(order);
                  const encodedReference = encodeURIComponent(reference);
                  const priceVisible = order.priceVisibilityAtOrder;

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm"
                    >
                      <Link href={`/portal/sales/orders/${encodedReference}`} className="block transition hover:bg-orange-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">{reference}</p>
                            <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">{order.customer.siteName}</p>
                            <p className="text-xs text-freshpac-grey">{order.customer.accountNumber}</p>
                          </div>

                          <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          <Badge tone={getOrderSourceTone(order.source)}>{formatOrderSource(order.source)}</Badge>
                          {!order.priceVisibilityAtOrder ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                          {order.status === "AWAITING_PAYMENT" ? <Badge tone="warning">Awaiting payment</Badge> : null}
                          {order.source === "OFFLINE_PENDING" ? <Badge tone="danger">Pending sync</Badge> : null}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MobileDetail label="Date" value={formatDateTime(order.createdAt)} />
                          <MobileDetail label="Delivery" value={order.deliveryDay || order.customer.deliveryDay || "Not set"} />
                          <MobileDetail label="Driver" value={order.driverOrCourier || order.customer.driverOrCourier || "No driver"} />
                          <MobileDetail label="Method" value={formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)} />
                          <MobileDetail label="Total" value={formatOrderMoney(order.totalIncVatPence, priceVisible)} />
                          <MobileDetail label="Lines" value={String(order.lines.length)} />
                        </div>
                      </Link>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Link
                          href={`/portal/sales/orders/${encodedReference}`}
                          className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-xs font-black text-freshpac-charcoal transition hover:border-freshpac-orange hover:bg-orange-50"
                        >
                          Open
                        </Link>

                        <Link
                          href={`/portal/sales/orders/${encodedReference}/print`}
                          className="inline-flex items-center justify-center rounded-xl bg-freshpac-orange px-3 py-2 text-xs font-black text-freshpac-charcoal transition hover:bg-orange-400"
                        >
                          <Printer className="mr-1 size-3" />
                          Print
                        </Link>

                        <Link
                          href={`/portal/sales/orders/${encodedReference}/delivery-note`}
                          className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-xs font-black text-freshpac-charcoal transition hover:border-freshpac-orange hover:bg-orange-50"
                        >
                          <Truck className="mr-1 size-3" />
                          Note
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {!orders.length ? (
                  <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                    No orders match that search.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="portal-scroll-panel">
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
                      <th>Lines</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const reference = getOrderReference(order);
                      const encodedReference = encodeURIComponent(reference);
                      const priceVisible = order.priceVisibilityAtOrder;

                      return (
                        <tr key={order.id}>
                          <td>
                            <Link
                              href={`/portal/sales/orders/${encodedReference}`}
                              className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                            >
                              {reference}
                            </Link>
                          </td>
                          <td>
                            <div className="font-bold text-freshpac-charcoal">{order.customer.siteName}</div>
                            <div className="text-xs text-freshpac-grey">{order.customer.accountNumber}</div>
                          </td>
                          <td>
                            <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                          </td>
                          <td>
                            <Badge tone={getOrderSourceTone(order.source)}>{formatOrderSource(order.source)}</Badge>
                          </td>
                          <td>{formatDateTime(order.createdAt)}</td>
                          <td>
                            <div className="font-semibold">{order.deliveryDay || order.customer.deliveryDay || "Not set"}</div>
                            <div className="text-xs text-freshpac-grey">
                              {order.driverOrCourier || order.customer.driverOrCourier || "No driver"}
                            </div>
                          </td>
                          <td>{formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)}</td>
                          <td className="font-bold">{formatOrderMoney(order.totalIncVatPence, priceVisible)}</td>
                          <td>{order.lines.length}</td>
                          <td>
                            {order.status === "AWAITING_PAYMENT" ? (
                              <Badge tone="warning">Awaiting payment</Badge>
                            ) : (
                              <Badge>Not required</Badge>
                            )}
                          </td>
                          <td>
                            <div className="flex min-w-64 flex-wrap gap-2">
                              <Link
                                href={`/portal/sales/orders/${encodedReference}`}
                                className="rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-xs font-bold text-freshpac-charcoal hover:border-freshpac-orange"
                              >
                                Open
                              </Link>

                              <Link
                                href={`/portal/sales/orders/${encodedReference}/print`}
                                className="inline-flex items-center rounded-xl bg-freshpac-orange px-3 py-2 text-xs font-black text-freshpac-charcoal hover:bg-orange-400"
                              >
                                <Printer className="mr-2 size-3" />
                                Print
                              </Link>

                              <Link
                                href={`/portal/sales/orders/${encodedReference}/delivery-note`}
                                className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-xs font-bold text-freshpac-charcoal hover:border-freshpac-orange"
                              >
                                <Truck className="mr-2 size-3" />
                                Delivery note
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!orders.length ? (
                  <div className="p-6 text-sm text-freshpac-grey">
                    No orders match that search.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Processing actions</CardTitle>
              <CardDescription>Print order sheets and pick lists from the current filtered result set.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <LinkButton href={batchPrintHref}>
                <Printer className="mr-2 size-4" />
                Print current filtered order sheets
              </LinkButton>

              <LinkButton href={pickListHref} variant="secondary">
                <ListChecks className="mr-2 size-4" />
                Print general pick list
              </LinkButton>

              <LinkButton href={coffeePickListHref} variant="secondary">
                <Coffee className="mr-2 size-4" />
                Print coffee pick list
              </LinkButton>

              <LinkButton href={retailPickListHref} variant="secondary">
                <ShoppingBag className="mr-2 size-4" />
                Print retail pick list
              </LinkButton>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Needs attention</CardTitle>
              <CardDescription>Orders that should not silently process.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {attentionOrders.map((order) => {
                const reference = getOrderReference(order);
                const encodedReference = encodeURIComponent(reference);

                return (
                  <Link
                    key={order.id}
                    href={`/portal/sales/orders/${encodedReference}`}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-freshpac-charcoal">{reference}</p>
                        <p className="truncate text-xs text-freshpac-grey">{order.customer.siteName}</p>
                      </div>
                      <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {!order.priceVisibilityAtOrder ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                      {order.minimumOrderPassed === false ? <Badge tone="warning">Below minimum</Badge> : null}
                      {order.source === "OFFLINE_PENDING" ? <Badge tone="danger">Pending sync</Badge> : null}
                      {order.status === "AWAITING_PAYMENT" ? <Badge tone="warning">Awaiting payment</Badge> : null}
                    </div>
                  </Link>
                );
              })}

              {!attentionOrders.length ? (
                <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No orders currently need attention.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function buildOrdersHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (source && source !== "ALL") params.set("source", source);

  const query = params.toString();

  return query ? `/portal/sales/orders?${query}` : "/portal/sales/orders";
}

function buildBatchPrintHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (source && source !== "ALL") params.set("source", source);

  const query = params.toString();

  return query ? `/portal/sales/orders/print?${query}` : "/portal/sales/orders/print?status=NEEDS_PRINT";
}

function buildPickListHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (source && source !== "ALL") params.set("source", source);

  const query = params.toString();

  return query ? `/portal/sales/orders/pick-list?${query}` : "/portal/sales/orders/pick-list?status=NEEDS_PRINT";
}

function buildCoffeePickListHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (source && source !== "ALL") params.set("source", source);

  const query = params.toString();

  return query ? `/portal/sales/orders/pick-list/coffee?${query}` : "/portal/sales/orders/pick-list/coffee?status=NEEDS_PRINT";
}

function buildRetailPickListHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (source && source !== "ALL") params.set("source", source);

  const query = params.toString();

  return query ? `/portal/sales/orders/pick-list/retail?${query}` : "/portal/sales/orders/pick-list/retail?status=NEEDS_PRINT";
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "border border-freshpac-panel bg-white text-freshpac-grey hover:border-freshpac-orange hover:text-freshpac-charcoal"
      }`}
    >
      <Filter className="mr-2 size-3" />
      {label}
    </Link>
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