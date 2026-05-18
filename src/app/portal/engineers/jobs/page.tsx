import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ClipboardList, Filter, HardHat, PackageSearch, Plus, Search, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatChargeableStatus,
  formatDate,
  formatEngineerJobStatus,
  formatEngineerJobTypes,
  formatEngineerPriority,
  formatSignatureStatus,
  formatSyncStatus,
  getEngineerJobListFromDb,
  getEngineerJobReference,
  getEngineerJobStatsFromDb,
  getEngineerJobStatusTone,
  getEngineerPriorityTone,
  getSyncStatusTone
} from "@/lib/engineers/job-db";

const filters = ["All", "New", "Assigned", "In Progress", "Follow-up", "Completed", "Chargeable", "Pending sync"];

export default async function EngineerJobsPage() {
  const [jobs, stats] = await Promise.all([getEngineerJobListFromDb(), getEngineerJobStatsFromDb()]);

  return (
    <PortalShell
      title="Engineer jobs"
      subtitle="Live breakdowns, services, water filter changes, follow-ups and completed reports."
      activeHref="/portal/engineers/jobs"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Job search</CardTitle>
                <CardDescription>
                  Search by job reference, customer, account, machine serial, engineer, fault, type or status.
                </CardDescription>
              </div>

              <LinkButton href="/portal/engineers/jobs/new" size="sm">
                <Plus className="mr-2 size-4" />
                Create job
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search job, customer, engineer, machine serial, fault..." />
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

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Job counters</CardTitle>
            <CardDescription>Live engineer workload snapshot.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Jobs" value={stats.total} icon={<ClipboardList className="size-4" />} />
            <MiniStat label="New" value={stats.newJobs} tone="info" icon={<Plus className="size-4" />} />
            <MiniStat label="Assigned" value={stats.assigned} tone="warning" icon={<HardHat className="size-4" />} />
            <MiniStat label="Follow-up" value={stats.followUp} tone="danger" icon={<Wrench className="size-4" />} />
            <MiniStat label="Review" value={stats.chargeableReview} tone="warning" icon={<AlertTriangle className="size-4" />} />
            <MiniStat label="Parts" value={stats.partsRequests} tone="info" icon={<PackageSearch className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <Card className="portal-card-safe">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Job list</CardTitle>
              <CardDescription>
                These records now come from Supabase/PostgreSQL through Prisma.
              </CardDescription>
            </div>
            <Badge tone="success">Live database</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="block p-3 md:hidden">
            <div className="grid gap-3">
              {jobs.map((job) => {
                const reference = getEngineerJobReference(job);

                return (
                  <Link
                    key={job.id}
                    href={`/portal/engineers/jobs/${reference}`}
                    className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">{reference}</p>
                        <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">{job.customer.siteName}</p>
                        <p className="truncate text-xs text-freshpac-grey">{job.customer.accountNumber}</p>
                      </div>

                      <Badge tone={getEngineerJobStatusTone(job.status)}>
                        {formatEngineerJobStatus(job.status)}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      <Badge tone={getEngineerPriorityTone(job.priority)}>{formatEngineerPriority(job.priority)}</Badge>
                      <Badge>{formatEngineerJobTypes(job.jobTypes)}</Badge>
                      <Badge tone={getSyncStatusTone(job.offlineStatus)}>{formatSyncStatus(job.offlineStatus)}</Badge>
                      {job.status === "FOLLOW_UP_REQUIRED" ? <Badge tone="danger">Follow-up</Badge> : null}
                      {job.chargeable === "TO_REVIEW" ? <Badge tone="warning">Charge review</Badge> : null}
                    </div>

                    {job.reportedFault ? (
                      <p className="mt-3 rounded-xl bg-freshpac-cream/70 p-3 text-xs font-semibold text-freshpac-charcoal">
                        {job.reportedFault}
                      </p>
                    ) : null}

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <MobileDetail label="Engineer" value={job.assignedEngineer?.fullName || "Unassigned"} />
                      <MobileDetail label="Scheduled" value={formatDate(job.scheduledAt)} />
                      <MobileDetail label="Chargeable" value={formatChargeableStatus(job.chargeable)} />
                      <MobileDetail label="Parts" value={String(job.partsRequests.length)} />
                      <MobileDetail label="Signature" value={formatSignatureStatus(job.customerSignatureStatus)} />
                      <MobileDetail label="Machines" value={String(job.machineSheets.length)} />
                    </div>
                  </Link>
                );
              })}

              {!jobs.length ? (
                <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No engineer jobs found. Run <span className="font-bold">npm run prisma:seed</span> or create a job.
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="portal-scroll-panel">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Types</th>
                    <th>Engineer</th>
                    <th>Scheduled</th>
                    <th>Fault</th>
                    <th>Chargeable</th>
                    <th>Parts</th>
                    <th>Signature</th>
                    <th>Sync</th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => {
                    const reference = getEngineerJobReference(job);

                    return (
                      <tr key={job.id}>
                        <td>
                          <Link
                            href={`/portal/engineers/jobs/${reference}`}
                            className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                          >
                            {reference}
                          </Link>
                        </td>
                        <td>
                          <div className="font-bold text-freshpac-charcoal">{job.customer.siteName}</div>
                          <div className="text-xs text-freshpac-grey">{job.customer.accountNumber}</div>
                        </td>
                        <td>
                          <Badge tone={getEngineerJobStatusTone(job.status)}>{formatEngineerJobStatus(job.status)}</Badge>
                        </td>
                        <td>
                          <Badge tone={getEngineerPriorityTone(job.priority)}>{formatEngineerPriority(job.priority)}</Badge>
                        </td>
                        <td>{formatEngineerJobTypes(job.jobTypes)}</td>
                        <td>{job.assignedEngineer?.fullName || "Unassigned"}</td>
                        <td>{formatDate(job.scheduledAt)}</td>
                        <td>
                          <div className="max-w-xs truncate">{job.reportedFault || "No fault recorded."}</div>
                        </td>
                        <td>{formatChargeableStatus(job.chargeable)}</td>
                        <td>{job.partsRequests.length}</td>
                        <td>{formatSignatureStatus(job.customerSignatureStatus)}</td>
                        <td>
                          <Badge tone={getSyncStatusTone(job.offlineStatus)}>{formatSyncStatus(job.offlineStatus)}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!jobs.length ? (
                <div className="p-6 text-sm text-freshpac-grey">
                  No engineer jobs found. Run <span className="font-bold">npm run prisma:seed</span> or create a job.
                </div>
              ) : null}
            </div>
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

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}