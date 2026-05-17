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

const filters = ["All", "New", "Contacted", "Assigned", "Accepted", "Rejected", "Archived"];

export default async function TradeRequestsPage() {
  const [requests, stats] = await Promise.all([getTradeRequestsFromDb(), getTradeRequestStatsFromDb()]);

  return (
    <PortalShell
      title="Trade account requests"
      subtitle="Public website trade enquiries for Freshpac sales/admin review."
      activeHref="/portal/sales/trade-requests"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Request search</CardTitle>
            <CardDescription>
              Review public trade enquiries, assign to sales reps and manually create customer accounts when accepted.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search business, name, phone, email, notes..." />
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

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Request list</CardTitle>
              <CardDescription>
                Requests do not automatically create customer accounts. Freshpac reviews and creates accounts manually.
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
                {requests.map((request) => (
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
                No trade requests found yet. The public form will create records here once wired.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
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