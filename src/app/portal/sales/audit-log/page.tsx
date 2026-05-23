import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  ClipboardList,
  DatabaseZap,
  Filter,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBasket,
  UsersRound,
  Wrench
} from "lucide-react";
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

type AuditLogRow = Awaited<ReturnType<typeof getAuditLogEntriesFromDb>>[number];
type CriticalAuditLogRow = Awaited<ReturnType<typeof getRecentCriticalAuditEntriesFromDb>>[number];

const entityFilters = [
  { label: "All", value: "ALL" },
  { label: "Customers", value: "CUSTOMER" },
  { label: "Products", value: "PRODUCT" },
  { label: "Orders", value: "ORDER" },
  { label: "Engineers", value: "ENGINEER" },
  { label: "Sync", value: "SYNC" }
];

const retentionFilters = [
  { label: "All retention", value: "ALL" },
  { label: "Security 60 days", value: "SECURITY_60_DAYS" },
  { label: "Business permanent", value: "BUSINESS_PERMANENT" },
  { label: "Order permanent", value: "ORDER_PERMANENT" },
  { label: "Engineer permanent", value: "ENGINEER_PERMANENT" },
  { label: "Financial permanent", value: "FINANCIAL_PERMANENT" }
];

export default async function AuditLogPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    entity?: string;
    retention?: string;
  };
}) {
  const q = searchParams?.q || "";
  const entity = searchParams?.entity || "ALL";
  const retention = searchParams?.retention || "ALL";

  const [entries, criticalEntries, stats] = await Promise.all([
    getAuditLogEntriesFromDb({ q, entity, retention }),
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
        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Audit search</CardTitle>
            <CardDescription>
              Search system actions, customer changes, order processing, pricing changes, engineer jobs, sync events and deletion activity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action="/portal/sales/audit-log" className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="entity" value={entity} />
              <input type="hidden" name="retention" value={retention} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search action, entity, user, note..."
                />
              </label>

              <Button variant="secondary" type="submit">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/audit-log"
                className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {entityFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={buildAuditHref({ q, entity: filter.value, retention })}
                  active={entity === filter.value || (!searchParams?.entity && filter.value === "ALL")}
                  label={filter.label}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {retentionFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={buildAuditHref({ q, entity, retention: filter.value })}
                  active={retention === filter.value || (!searchParams?.retention && filter.value === "ALL")}
                  label={filter.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
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
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Audit entries</CardTitle>
                <CardDescription>
                  Showing {entries.length} matching audit entr{entries.length === 1 ? "y" : "ies"}. Latest 100 results shown.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="block p-3 md:hidden">
              <div className="grid gap-3">
                {entries.map((entry: AuditLogRow) => (
                  <div key={entry.id} className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                          {prettifyAuditLabel(entry.entityType)}
                        </p>
                        <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">
                          {prettifyAuditLabel(entry.actionType)}
                        </p>
                        <p className="truncate text-xs text-freshpac-grey">
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>

                      <Badge tone={getAuditActionTone(entry.actionType)}>
                        {prettifyAuditLabel(entry.actionType)}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <MobileDetail label="Entity ID" value={entry.entityId || "None"} />
                      <MobileDetail label="User" value={entry.user?.fullName || "System"} />
                      <MobileDetail label="Retention" value={formatRetentionClass(entry.retentionClass)} />
                      <MobileDetail label="Class" value={entry.retentionClass || "Not set"} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      <Badge tone={getRetentionTone(entry.retentionClass)}>
                        {formatRetentionClass(entry.retentionClass)}
                      </Badge>
                    </div>

                    <p className="mt-3 rounded-xl bg-freshpac-cream/70 p-3 text-xs font-semibold text-freshpac-charcoal">
                      {entry.reason || "No note recorded."}
                    </p>
                  </div>
                ))}

                {!entries.length ? (
                  <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                    No audit entries match that search.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="portal-scroll-panel">
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
                    {entries.map((entry: AuditLogRow) => (
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
                    No audit entries match that search.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Critical events</CardTitle>
              <CardDescription>High-attention audit activity.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {criticalEntries.map((entry: CriticalAuditLogRow) => (
                <div key={entry.id} className="rounded-2xl border border-freshpac-panel bg-white p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-freshpac-charcoal">{prettifyAuditLabel(entry.actionType)}</p>
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

          <Card className="portal-card-safe">
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

          <Card className="portal-card-safe">
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

function buildAuditHref({
  q,
  entity,
  retention
}: {
  q: string;
  entity: string;
  retention: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (entity && entity !== "ALL") params.set("entity", entity);
  if (retention && retention !== "ALL") params.set("retention", retention);

  const query = params.toString();

  return query ? `/portal/sales/audit-log?${query}` : "/portal/sales/audit-log";
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