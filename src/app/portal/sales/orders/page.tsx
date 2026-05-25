import Link from "next/link";
import type { ReactNode } from "react";
import {
  Banknote,
  ClipboardList,
  Coffee,
  FileText,
  Filter,
  ListChecks,
  Plus,
  Printer,
  Search,
  ShoppingBag,
  Truck,
  WifiOff
} from "lucide-react";
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
import { buildSelectedOrderQueryValue } from "@/lib/sales/order-print-db";

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
  const batchDeliveryNotesHref = buildBatchDeliveryNotesHref({ q, status, source });
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
      subtitle="Compact order processing, multi-select printing and live Prisma data."
      activeHref="/portal/sales/orders"
    >
      <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_330px]">
        <Card className="portal-card-safe">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  Search, filter, select multiple orders and print grouped paperwork.
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
                  New order
                </LinkButton>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <form action="/portal/sales/orders" className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="source" value={source} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="h-10 pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search ref, account, customer, driver, product..."
                />
              </label>

              <Button variant="secondary" type="submit" className="h-10">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/orders"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-1.5">
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

            <div className="mt-2 flex flex-wrap gap-1.5">
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
          <CardHeader className="pb-3">
            <CardTitle>Queues</CardTitle>
            <CardDescription>Live counters.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-3 gap-2 xl:grid-cols-2">
            <MiniStat label="Total" value={stats.total} icon={<ClipboardList className="size-4" />} />
            <MiniStat label="Submitted" value={stats.submitted} tone="info" icon={<Truck className="size-4" />} />
            <MiniStat label="Pay" value={stats.awaitingPayment} tone="warning" icon={<Banknote className="size-4" />} />
            <MiniStat label="Done" value={stats.processed} tone="success" icon={<Printer className="size-4" />} />
            <MiniStat label="Print" value={stats.needsPrint} tone="warning" icon={<Printer className="size-4" />} />
            <MiniStat label="Offline" value={stats.offlinePending} tone="danger" icon={<WifiOff className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <form method="get" action="/portal/sales/orders/print" className="grid gap-4 xl:grid-cols-[1fr_330px]">
        {q ? <input type="hidden" name="q" value={q} /> : null}
        {status && status !== "ALL" ? <input type="hidden" name="status" value={status} /> : null}
        {source && source !== "ALL" ? <input type="hidden" name="source" value={source} /> : null}

        <Card className="portal-card-safe">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Order list</CardTitle>
                <CardDescription>
                  {orders.length} matching order{orders.length === 1 ? "" : "s"}. Tick rows for selected paperwork.
                </CardDescription>
              </div>

              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="block p-2 md:hidden">
              <div className="grid gap-2">
                {orders.map((order) => {
                  const reference = getOrderReference(order);
                  const encodedReference = encodeURIComponent(reference);
                  const priceVisible = order.priceVisibilityAtOrder;

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-freshpac-panel bg-white p-3 shadow-sm"
                    >
                      <div className="grid grid-cols-[auto_1fr] gap-3">
                        <label className="mt-1 flex size-8 items-center justify-center rounded-xl border border-freshpac-panel bg-freshpac-cream">
                          <input
                            type="checkbox"
                            name="q"
                            value={buildSelectedOrderQueryValue(reference)}
                            aria-label={`Select ${reference}`}
                            className="size-4 accent-freshpac-orange"
                          />
                        </label>

                        <Link href={`/portal/sales/orders/${encodedReference}`} className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-freshpac-orange">
                                {reference}
                              </p>
                              <p className="mt-0.5 truncate text-sm font-black text-freshpac-charcoal">
                                {order.customer.siteName}
                              </p>
                              <p className="truncate text-[11px] text-freshpac-grey">
                                {order.customer.accountNumber}
                              </p>
                            </div>

                            <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge tone={getOrderSourceTone(order.source)}>{formatOrderSource(order.source)}</Badge>
                            {!order.priceVisibilityAtOrder ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                            {order.status === "AWAITING_PAYMENT" ? <Badge tone="warning">Awaiting payment</Badge> : null}
                            {order.source === "OFFLINE_PENDING" ? <Badge tone="danger">Pending sync</Badge> : null}
                          </div>

                          <div className="mt-2 grid grid-cols-3 gap-1.5">
                            <MobileDetail label="Date" value={formatDateTime(order.createdAt)} />
                            <MobileDetail label="Delivery" value={order.deliveryDay || order.customer.deliveryDay || "Not set"} />
                            <MobileDetail label="Total" value={formatOrderMoney(order.totalIncVatPence, priceVisible)} />
                          </div>
                        </Link>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <CompactActionLink href={`/portal/sales/orders/${encodedReference}`} label="Open" />
                        <CompactActionLink href={`/portal/sales/orders/${encodedReference}/print`} label="Print" tone="primary" />
                        <CompactActionLink href={`/portal/sales/orders/${encodedReference}/delivery-note`} label="Note" />
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
                <table className="min-w-full border-collapse text-[11px]">
                  <thead className="bg-freshpac-charcoal text-left text-white">
                    <tr>
                      <CompactTh>Select</CompactTh>
                      <CompactTh>Order</CompactTh>
                      <CompactTh>Status</CompactTh>
                      <CompactTh>Delivery</CompactTh>
                      <CompactTh>Total</CompactTh>
                      <CompactTh>Lines</CompactTh>
                      <CompactTh>Actions</CompactTh>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const reference = getOrderReference(order);
                      const encodedReference = encodeURIComponent(reference);
                      const priceVisible = order.priceVisibilityAtOrder;

                      return (
                        <tr key={order.id} className="border-b border-freshpac-panel align-top hover:bg-orange-50/60">
                          <CompactTd>
                            <label className="flex size-8 items-center justify-center rounded-xl border border-freshpac-panel bg-white">
                              <input
                                type="checkbox"
                                name="q"
                                value={buildSelectedOrderQueryValue(reference)}
                                aria-label={`Select ${reference}`}
                                className="size-4 accent-freshpac-orange"
                              />
                            </label>
                          </CompactTd>

                          <CompactTd>
                            <Link
                              href={`/portal/sales/orders/${encodedReference}`}
                              className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                            >
                              {reference}
                            </Link>
                            <div className="max-w-56 truncate font-bold text-freshpac-charcoal">
                              {order.customer.siteName}
                            </div>
                            <div className="text-[10px] text-freshpac-grey">{order.customer.accountNumber}</div>
                          </CompactTd>

                          <CompactTd>
                            <div className="flex flex-wrap gap-1">
                              <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                              <Badge tone={getOrderSourceTone(order.source)}>{formatOrderSource(order.source)}</Badge>
                              {!order.priceVisibilityAtOrder ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                            </div>
                          </CompactTd>

                          <CompactTd>
                            <div className="font-bold text-freshpac-charcoal">
                              {order.deliveryDay || order.customer.deliveryDay || "Not set"}
                            </div>
                            <div className="text-[10px] text-freshpac-grey">
                              {order.driverOrCourier || order.customer.driverOrCourier || "No driver"}
                            </div>
                            <div className="text-[10px] text-freshpac-grey">
                              {formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)}
                            </div>
                          </CompactTd>

                          <CompactTd>
                            <div className="font-black text-freshpac-charcoal">
                              {formatOrderMoney(order.totalIncVatPence, priceVisible)}
                            </div>
                            <div className="text-[10px] text-freshpac-grey">{formatDateTime(order.createdAt)}</div>
                          </CompactTd>

                          <CompactTd>
                            <span className="rounded-lg bg-freshpac-cream px-2 py-1 font-black text-freshpac-charcoal">
                              {order.lines.length}
                            </span>
                          </CompactTd>

                          <CompactTd>
                            <div className="flex min-w-48 flex-wrap gap-1.5">
                              <CompactActionLink href={`/portal/sales/orders/${encodedReference}`} label="Open" />
                              <CompactActionLink href={`/portal/sales/orders/${encodedReference}/print`} label="Print" tone="primary" />
                              <CompactActionLink href={`/portal/sales/orders/${encodedReference}/delivery-note`} label="Delivery note" />
                            </div>
                          </CompactTd>
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
            <CardHeader className="pb-3">
              <CardTitle>Selected actions</CardTitle>
              <CardDescription>
                Tick orders on the left. If none are ticked, the current filter is used.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <CompactSubmitButton formAction="/portal/sales/orders/print" icon={<Printer className="size-4" />}>
                Print order sheets
              </CompactSubmitButton>

              <CompactSubmitButton formAction="/portal/sales/orders/delivery-notes" icon={<FileText className="size-4" />} variant="secondary">
                Print delivery notes
              </CompactSubmitButton>

              <CompactSubmitButton formAction="/portal/sales/orders/pick-list" icon={<ListChecks className="size-4" />} variant="secondary">
                Print general pick list
              </CompactSubmitButton>

              <CompactSubmitButton formAction="/portal/sales/orders/pick-list/coffee" icon={<Coffee className="size-4" />} variant="secondary">
                Print coffee pick list
              </CompactSubmitButton>

              <CompactSubmitButton formAction="/portal/sales/orders/pick-list/retail" icon={<ShoppingBag className="size-4" />} variant="secondary">
                Print retail pick list
              </CompactSubmitButton>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader className="pb-3">
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Current filtered set.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <LinkButton href={batchPrintHref}>
                <Printer className="mr-2 size-4" />
                Filtered order sheets
              </LinkButton>

              <LinkButton href={batchDeliveryNotesHref} variant="secondary">
                <FileText className="mr-2 size-4" />
                Filtered delivery notes
              </LinkButton>

              <LinkButton href={pickListHref} variant="secondary">
                <ListChecks className="mr-2 size-4" />
                Filtered pick list
              </LinkButton>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader className="pb-3">
              <CardTitle>Needs attention</CardTitle>
              <CardDescription>Orders that should not silently process.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              {attentionOrders.map((order) => {
                const reference = getOrderReference(order);
                const encodedReference = encodeURIComponent(reference);

                return (
                  <Link
                    key={order.id}
                    href={`/portal/sales/orders/${encodedReference}`}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-freshpac-charcoal">{reference}</p>
                        <p className="truncate text-[11px] text-freshpac-grey">{order.customer.siteName}</p>
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
      </form>
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
  const params = buildFilterParams({ q, status, source });
  const query = params.toString();

  return query ? `/portal/sales/orders/print?${query}` : "/portal/sales/orders/print?status=NEEDS_PRINT";
}

function buildBatchDeliveryNotesHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = buildFilterParams({ q, status, source });
  const query = params.toString();

  return query ? `/portal/sales/orders/delivery-notes?${query}` : "/portal/sales/orders/delivery-notes?status=NEEDS_PRINT";
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
  const params = buildFilterParams({ q, status, source });
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
  const params = buildFilterParams({ q, status, source });
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
  const params = buildFilterParams({ q, status, source });
  const query = params.toString();

  return query ? `/portal/sales/orders/pick-list/retail?${query}` : "/portal/sales/orders/pick-list/retail?status=NEEDS_PRINT";
}

function buildFilterParams({
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

  return params;
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
      <Filter className="mr-1.5 size-3" />
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
    <div className={`rounded-xl border border-freshpac-panel p-2 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-freshpac-cream/70 p-1.5">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-freshpac-grey">{label}</p>
      <p className="mt-0.5 truncate text-[11px] font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}

function CompactTh({ children }: { children: ReactNode }) {
  return <th className="px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em]">{children}</th>;
}

function CompactTd({ children }: { children: ReactNode }) {
  return <td className="px-2 py-2">{children}</td>;
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
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
        tone === "primary"
          ? "bg-freshpac-orange text-freshpac-charcoal hover:bg-orange-400"
          : "border border-freshpac-panel bg-white text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
      }`}
    >
      {label}
    </Link>
  );
}

function CompactSubmitButton({
  children,
  formAction,
  icon,
  variant = "primary"
}: {
  children: ReactNode;
  formAction: string;
  icon: ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      formMethod="get"
      className={`inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-black transition ${
        variant === "primary"
          ? "bg-freshpac-orange text-freshpac-charcoal hover:bg-orange-400"
          : "border border-freshpac-panel bg-white text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </button>
  );
}