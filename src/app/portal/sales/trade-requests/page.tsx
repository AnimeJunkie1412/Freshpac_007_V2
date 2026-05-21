import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, Filter, Handshake, Inbox, Plus, Search, UserRoundCheck, XCircle } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatDateTime,
  formatTradeRequestStatus,
  getTradeRequestsFromDb,
  getTradeRequestStatsFromDb,
  getTradeRequestStatusTone
} from "@/lib/sales/trade-requests-db";

type TradeRequestRow = Awaited<ReturnType<typeof getTradeRequestsFromDb>>[number];

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Archived", value: "ARCHIVED" }
];

export default async function TradeRequestsPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    status?: string;
  };
}) {
  const q = searchParams?.q || "";
  const status = searchParams?.status || "ALL";

  const [requests, stats] = await Promise.all([
    getTradeRequestsFromDb({ q, status }),
    getTradeRequestStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Trade account requests"
      subtitle="Public website trade enquiries for Freshpac sales/admin review."
      activeHref="/portal/sales/trade-requests"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Request search</CardTitle>
            <CardDescription>
              Search public trade enquiries by business, contact, phone, email, assigned rep, notes or linked customer.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action="/portal/sales/trade-requests" className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="status" value={status} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search business, name, phone, email, notes, rep..."
                />
              </label>

              <Button variant="secondary" type="submit">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/trade-requests"
                className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={buildTradeRequestsHref({ q, status: filter.value })}
                  active={status === filter.value || (!searchParams?.status && filter.value === "ALL")}
                  label={filter.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Request counters</CardTitle>
            <CardDescription>Live trade enquiry snapshot.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<Handshake className="size-4" />} />
            <MiniStat label="New" value={stats.fresh} tone="info" icon={<Inbox className="size-4" />} />
            <MiniStat label="Contacted" value={stats.contacted} tone="warning" icon={<UserRoundCheck className="size-4" />} />
            <MiniStat label="Assigned" value={stats.assigned} tone="warning" icon={<Plus className="size-4" />} />
            <MiniStat label="Accepted" value={stats.accepted} tone="success" icon={<CheckCircle2 className="size-4" />} />
            <MiniStat label="Rejected" value={stats.rejected} tone="danger" icon={<XCircle className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <Card className="portal-card-safe">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Request list</CardTitle>
              <CardDescription>
                Showing {requests.length} matching trade request{requests.length === 1 ? "" : "s"}.
              </CardDescription>
            </div>
            <Badge tone="success">Live database</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="block p-3 md:hidden">
            <div className="grid gap-3">
              {requests.map((request: TradeRequestRow) => (
                <Link
                  key={request.id}
                  href={`/portal/sales/trade-requests/${request.id}`}
                  className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm transition hover:border-freshpac-orange hover:bg-orange-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                        {request.relationToCompany}
                      </p>
                      <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">
                        {request.businessName}
                      </p>
                      <p className="truncate text-xs text-freshpac-grey">
                        {request.name} · {request.phone}
                      </p>
                    </div>

                    <Badge tone={getTradeRequestStatusTone(request.status)}>
                      {formatTradeRequestStatus(request.status)}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MobileDetail label="Email" value={request.email} />
                    <MobileDetail label="Rep" value={request.assignedSalesRep || "Unassigned"} />
                    <MobileDetail label="Created" value={formatDateTime(request.createdAt)} />
                    <MobileDetail label="Customer" value={request.customer ? request.customer.accountNumber : "None"} />
                  </div>

                  {request.notes ? (
                    <p className="mt-3 rounded-xl bg-freshpac-cream/70 p-3 text-xs font-semibold text-freshpac-charcoal">
                      {request.notes}
                    </p>
                  ) : null}
                </Link>
              ))}

              {!requests.length ? (
                <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No trade requests match that search.
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="portal-scroll-panel">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Assigned rep</th>
                    <th>Created</th>
                    <th>Linked customer</th>
                    <th>Notes</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request: TradeRequestRow) => (
                    <tr key={request.id}>
                      <td>
                        <Link
                          href={`/portal/sales/trade-requests/${request.id}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {request.businessName}
                        </Link>
                        <div className="text-xs text-freshpac-grey">{request.relationToCompany}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{request.name}</div>
                        <div className="text-xs text-freshpac-grey">{request.phone}</div>
                        <div className="text-xs text-freshpac-grey">{request.email}</div>
                      </td>
                      <td>
                        <Badge tone={getTradeRequestStatusTone(request.status)}>
                          {formatTradeRequestStatus(request.status)}
                        </Badge>
                      </td>
                      <td>{request.assignedSalesRep || "Unassigned"}</td>
                      <td>{formatDateTime(request.createdAt)}</td>
                      <td>{request.customer ? request.customer.accountNumber : "None"}</td>
                      <td>
                        <div className="max-w-md truncate">{request.notes || "No notes recorded."}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!requests.length ? (
                <div className="p-6 text-sm text-freshpac-grey">
                  No trade requests match that search.
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalShell>
  );
}

function buildTradeRequestsHref({ q, status }: { q: string; status: string }) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);

  const query = params.toString();

  return query ? `/portal/sales/trade-requests?${query}` : "/portal/sales/trade-requests";
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