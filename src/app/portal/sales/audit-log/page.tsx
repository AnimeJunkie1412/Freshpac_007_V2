import type { ReactNode } from "react";
import { Activity, AlertTriangle, Archive, ClipboardList, DatabaseZap, Filter, PackageCheck, Search, ShieldCheck, ShoppingBasket, UsersRound, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatDateTime,
  formatRetentionClass,
  getAuditActionTone,
  getAuditLogEntriesFromDb,
  getAuditStatsFromDb,
  getRecentCriticalAuditEntriesFromDb,
  getRetentionTone,
  prettifyAuditLabel
} from "@/lib/sales/audit-db";

const filters = ["All", "Customers", "Products", "Orders", "Engineers", "Prices", "Rollover", "Sync", "Deletion"];

export default async function AuditLogPage() {
  const [entries, criticalEntries, stats] = await Promise.all([
    getAuditLogEntriesFromDb(),
    getRecentCriticalAuditEntriesFromDb(),
    getAuditStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Audit log"
      subtitle="Live system audit events from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/audit-log"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Audit search</CardTitle>
            <CardDescription>
              Review important system actions, customer changes, order processing, pricing changes, engineer jobs, sync events and deletion activity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search action, entity, user, note..." />
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
            <CardTitle>Audit counters</CardTitle>
            <CardDescription>Live audit log snapshot.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<Activity className="size-4" />} />
            <MiniStat label="Security" value={stats.security} tone="warning" icon={<ShieldCheck className="size-4" />} />
            <MiniStat label="Business" value={stats.business} tone="success" icon={<Archive className="size-4" />} />
            <MiniStat label="Customers" value={stats.customer} icon={<UsersRound className="size-4" />} />
            <MiniStat label="Products" value={stats.product} tone="success" icon={<PackageCheck className="size-4" />} />
            <MiniStat label="Orders" value={stats.order} tone="info" icon={<ShoppingBasket className="size-4" />} />
            <MiniStat label="Engineers" value={stats.engineer} tone="warning" icon={<Wrench className="size-4" />} />
            <MiniStat label="Sync" value={stats.sync} tone="danger" icon={<DatabaseZap className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Audit entries</CardTitle>
                <CardDescription>
                  The latest 100 audit events. Business-critical records should stay separate from short-term security logs.
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
                    <th>Date</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Entity ID</th>
                    <th>User</th>
                    <th>Retention</th>
                    <th>Reason / note</th>
                  </tr>
                </thead>

                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDateTime(entry.createdAt)}</td>
                      <td>
                        <Badge tone={getAuditActionTone(entry.actionType)}>
                          {prettifyAuditLabel(entry.actionType)}
                        </Badge>
                      </td>
                      <td className="font-bold">{prettifyAuditLabel(entry.entityType)}</td>
                      <td>{entry.entityId || "None"}</td>
                      <td>{entry.user?.fullName || "System"}</td>
                      <td>
                        <Badge tone={getRetentionTone(entry.retentionClass)}>
                          {formatRetentionClass(entry.retentionClass)}
                        </Badge>
                      </td>
                      <td>
                        <div className="max-w-md truncate">{entry.reason || "No note recorded."}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!entries.length ? (
                <div className="p-6 text-sm text-freshpac-grey">
                  No audit entries found. Seed data should create one starter audit event.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical events</CardTitle>
              <CardDescription>High-attention audit activity.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {criticalEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-freshpac-panel bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-freshpac-charcoal">{prettifyAuditLabel(entry.actionType)}</p>
                      <p className="text-xs text-freshpac-grey">{formatDateTime(entry.createdAt)}</p>
                    </div>
                    <Badge tone={getAuditActionTone(entry.actionType)}>{prettifyAuditLabel(entry.entityType)}</Badge>
                  </div>

                  <p className="mt-2 text-xs text-freshpac-grey">{entry.reason || "No reason recorded."}</p>
                </div>
              ))}

              {!criticalEntries.length ? (
                <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No critical audit events currently found.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit actions</CardTitle>
              <CardDescription>Export and review tools.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <Button type="button">Export audit report</Button>
              <Button type="button" variant="secondary">
                Filter security logs
              </Button>
              <Button type="button" variant="secondary">
                Filter business logs
              </Button>
              <Button type="button" variant="secondary">
                Review deletion events
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retention note</CardTitle>
              <CardDescription>Important data safety rule.</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-6 text-freshpac-grey">
                Security audit logs can be retained for 60 days, but order history, engineer reports,
                invoice references and commercial history should remain business-permanent unless a formal
                archive or anonymisation policy is introduced.
              </p>
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