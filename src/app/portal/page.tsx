import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Coffee,
  DatabaseZap,
  HardHat,
  Inbox,
  Phone,
  ShieldAlert,
  ShoppingBasket,
  UsersRound,
  Wrench
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDateTime,
  formatEngineerJobStatus,
  formatMoneyFromPence,
  formatOrderStatus,
  formatTradeRequestStatus,
  getEngineerJobReference,
  getOrderReference,
  getPortalDashboardData
} from "@/lib/portal/dashboard-db";

type DashboardData = Awaited<ReturnType<typeof getPortalDashboardData>>;
type RecentOrder = DashboardData["recentOrders"][number];
type RecentTradeRequest = DashboardData["recentTradeRequests"][number];
type RecentEngineerJob = DashboardData["recentEngineerJobs"][number];
type AuditEvent = DashboardData["latestAuditEvents"][number];

export default async function PortalDashboardPage() {
  const data = await getPortalDashboardData();

  return (
    <PortalShell
      title="Freshpac dashboard"
      subtitle="Live operational snapshot from Supabase/PostgreSQL via Prisma."
      activeHref="/portal"
    >
      <div className="grid gap-4">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCounter
            label="Orders ready"
            value={data.counters.ordersReadyToProcess}
            href="/portal/sales/orders?status=NEEDS_PRINT"
            icon={<ShoppingBasket className="size-5" />}
            tone="success"
            description="Submitted or paid orders ready to print/process."
          />

          <DashboardCounter
            label="Awaiting payment"
            value={data.counters.ordersAwaitingPayment}
            href="/portal/sales/orders?status=AWAITING_PAYMENT"
            icon={<AlertTriangle className="size-5" />}
            tone="warning"
            description="Prepayment orders waiting for external payment."
          />

          <DashboardCounter
            label="Trade requests"
            value={data.counters.tradeRequestsWaiting}
            href="/portal/sales/trade-requests?status=NEW"
            icon={<Inbox className="size-5" />}
            tone="info"
            description="New, contacted or assigned trade enquiries."
          />

          <DashboardCounter
            label="Call list"
            value={data.counters.callListToCall}
            href="/portal/sales/call-list?status=TO_CALL"
            icon={<Phone className="size-5" />}
            tone="info"
            description="Customers still marked as to call."
          />

          <DashboardCounter
            label="On hold"
            value={data.counters.customersOnHold}
            href="/portal/sales/customers?status=ON_HOLD"
            icon={<ShieldAlert className="size-5" />}
            tone="danger"
            description="Accounts blocked from normal order submission."
          />

          <DashboardCounter
            label="Hidden prices"
            value={data.counters.hiddenPriceAccounts}
            href="/portal/sales/customers?status=HIDDEN_PRICES"
            icon={<UsersRound className="size-5" />}
            tone="warning"
            description="Accounts where customer-facing prices are hidden."
          />

          <DashboardCounter
            label="Engineer review"
            value={data.counters.engineerJobsNeedReview}
            href="/portal/engineers/jobs?chargeable=TO_REVIEW"
            icon={<Wrench className="size-5" />}
            tone="warning"
            description="Follow-up or chargeable-review jobs."
          />

          <DashboardCounter
            label="Parts requests"
            value={data.counters.partsRequests}
            href="/portal/engineers/jobs?q=parts"
            icon={<HardHat className="size-5" />}
            tone="info"
            description="Parts requests recorded in the system."
          />
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Recent orders</CardTitle>
                  <CardDescription>Latest order activity from the live database.</CardDescription>
                </div>
                <LinkButton href="/portal/sales/orders" size="sm" variant="secondary">
                  View orders
                </LinkButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {data.recentOrders.map((order: RecentOrder) => (
                <Link
                  key={order.id}
                  href={`/portal/sales/orders/${getOrderReference(order)}`}
                  className="block rounded-2xl border border-freshpac-panel bg-white p-4 transition hover:border-freshpac-orange hover:bg-orange-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                        {getOrderReference(order)}
                      </p>
                      <p className="mt-1 truncate text-sm font-black text-freshpac-charcoal">
                        {order.customer.siteName}
                      </p>
                      <p className="text-xs text-freshpac-grey">
                        {order.customer.accountNumber} · {formatDateTime(order.createdAt)}
                      </p>
                    </div>

                    <Badge tone={order.status === "AWAITING_PAYMENT" ? "warning" : order.status === "PROCESSED" ? "success" : "info"}>
                      {formatOrderStatus(order.status)}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MiniDetail label="Lines" value={String(order.lines.length)} />
                    <MiniDetail label="Total" value={order.priceVisibilityAtOrder ? formatMoneyFromPence(order.totalIncVatPence) : "Delivery Note Needed"} />
                    <MiniDetail label="Delivery" value={order.deliveryDay || order.customer.deliveryDay || "Not set"} />
                    <MiniDetail label="Driver" value={order.driverOrCourier || order.customer.driverOrCourier || "No driver"} />
                  </div>
                </Link>
              ))}

              {!data.recentOrders.length ? <EmptyState message="No orders found yet." /> : null}
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Trade requests</CardTitle>
                  <CardDescription>Newest public account enquiries.</CardDescription>
                </div>
                <LinkButton href="/portal/sales/trade-requests" size="sm" variant="secondary">
                  View requests
                </LinkButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {data.recentTradeRequests.map((request: RecentTradeRequest) => (
                <Link
                  key={request.id}
                  href={`/portal/sales/trade-requests/${request.id}`}
                  className="block rounded-2xl border border-freshpac-panel bg-white p-4 transition hover:border-freshpac-orange hover:bg-orange-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-freshpac-charcoal">{request.businessName}</p>
                      <p className="text-xs text-freshpac-grey">
                        {request.name} · {request.phone}
                      </p>
                    </div>

                    <Badge tone={request.status === "NEW" ? "info" : request.status === "ACCEPTED" ? "success" : "warning"}>
                      {formatTradeRequestStatus(request.status)}
                    </Badge>
                  </div>

                  <p className="mt-2 truncate text-xs text-freshpac-grey">
                    {request.email} · {formatDateTime(request.createdAt)}
                  </p>
                </Link>
              ))}

              {!data.recentTradeRequests.length ? <EmptyState message="No trade requests found yet." /> : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Engineer jobs</CardTitle>
                  <CardDescription>Upcoming and recent engineer work.</CardDescription>
                </div>
                <LinkButton href="/portal/engineers/jobs" size="sm" variant="secondary">
                  View jobs
                </LinkButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {data.recentEngineerJobs.map((job: RecentEngineerJob) => (
                <Link
                  key={job.id}
                  href={`/portal/engineers/jobs/${getEngineerJobReference(job)}`}
                  className="block rounded-2xl border border-freshpac-panel bg-white p-4 transition hover:border-freshpac-orange hover:bg-orange-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                        {getEngineerJobReference(job)}
                      </p>
                      <p className="mt-1 truncate text-sm font-black text-freshpac-charcoal">
                        {job.customer.siteName}
                      </p>
                      <p className="text-xs text-freshpac-grey">
                        {job.assignedEngineer?.fullName || "Unassigned"} · {formatDateTime(job.scheduledAt)}
                      </p>
                    </div>

                    <Badge tone={job.status === "FOLLOW_UP_REQUIRED" ? "danger" : job.status === "COMPLETED" ? "success" : "warning"}>
                      {formatEngineerJobStatus(job.status)}
                    </Badge>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-freshpac-grey">
                    {job.reportedFault || "No fault recorded."}
                  </p>
                </Link>
              ))}

              {!data.recentEngineerJobs.length ? <EmptyState message="No engineer jobs found yet." /> : null}
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Latest audit activity</CardTitle>
                  <CardDescription>Recent system activity and safety trail.</CardDescription>
                </div>
                <LinkButton href="/portal/sales/audit-log" size="sm" variant="secondary">
                  View audit
                </LinkButton>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {data.latestAuditEvents.map((event: AuditEvent) => (
                <div key={event.id} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-freshpac-charcoal">
                        {event.actionType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-freshpac-grey">
                        {event.user?.fullName || "System"} · {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                    <Badge>{event.entityType.replace(/_/g, " ")}</Badge>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-freshpac-grey">
                    {event.reason || "No note recorded."}
                  </p>
                </div>
              ))}

              {!data.latestAuditEvents.length ? <EmptyState message="No audit events found yet." /> : null}
            </CardContent>
          </Card>
        </div>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Fast links into the most common staff workflows.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QuickAction href="/portal/sales/customers" icon={<UsersRound className="size-4" />} label="Find customer" />
            <QuickAction href="/portal/sales/orders" icon={<ShoppingBasket className="size-4" />} label="Process orders" />
            <QuickAction href="/portal/sales/call-list" icon={<Phone className="size-4" />} label="Open call list" />
            <QuickAction href="/portal/sales/products" icon={<Coffee className="size-4" />} label="Manage products" />
            <QuickAction href="/portal/engineers/jobs" icon={<Wrench className="size-4" />} label="Engineer jobs" />
            <QuickAction href="/portal/sales/trade-requests" icon={<Inbox className="size-4" />} label="Trade requests" />
            <QuickAction href="/portal/sales/audit-log" icon={<ClipboardList className="size-4" />} label="Audit log" />
            <QuickAction href="/portal/sales/sync-conflicts" icon={<DatabaseZap className="size-4" />} label="Sync conflicts" />
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

function DashboardCounter({
  label,
  value,
  href,
  icon,
  tone,
  description
}: {
  label: string;
  value: number;
  href: string;
  icon: ReactNode;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
  description: string;
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
    neutral: "bg-white text-freshpac-charcoal"
  };

  return (
    <Link
      href={href}
      className={`block rounded-2xl border border-freshpac-panel p-4 shadow-sm transition hover:border-freshpac-orange hover:bg-orange-50 ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-2 text-xs font-semibold opacity-75">{description}</p>
    </Link>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-2xl border border-freshpac-panel bg-white px-4 py-3 text-sm font-black text-freshpac-charcoal transition hover:border-freshpac-orange hover:bg-orange-50"
    >
      {icon}
      {label}
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
      {message}
    </p>
  );
}