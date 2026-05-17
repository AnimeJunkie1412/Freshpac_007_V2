import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ClipboardList, HardHat, PackageSearch, Plus, RefreshCcw, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { engineerJobs, engineerPriorityTone, engineerStatusTone, getEngineerJobStats } from "@/lib/engineers/jobs";

export default function EngineersDashboardPage() {
  const stats = getEngineerJobStats();

  return (
    <PortalShell
      title="Engineers Portal"
      subtitle="Breakdowns, services, filter changes, assigned jobs, parts requests and completed engineer reports."
      activeHref="/portal/engineers"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Engineer control board</CardTitle>
                <CardDescription>
                  A practical field-service hub for new jobs, assigned work, follow-ups, chargeable reviews and sync status.
                </CardDescription>
              </div>

              <LinkButton href="/portal/engineers/jobs/new" size="sm">
                <Plus className="mr-2 size-4" />
                Create job
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DashboardLink href="/portal/engineers/jobs" title="All jobs" description="View active, follow-up and completed jobs." icon={<ClipboardList className="size-5" />} />
            <DashboardLink href="/portal/engineers/jobs/new" title="Report breakdown" description="Create breakdown, service or filter change." icon={<Wrench className="size-5" />} />
            <DashboardLink href="/portal/engineers/machines" title="Machine search" description="Find equipment by serial number or customer." icon={<PackageSearch className="size-5" />} />
            <DashboardLink href="/portal/engineers/schedule" title="Schedule" description="Engineer planning and reminders." icon={<HardHat className="size-5" />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engineer counters</CardTitle>
            <CardDescription>Live queue placeholders.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Jobs" value={stats.total} icon={<ClipboardList className="size-4" />} />
            <MiniStat label="New" value={stats.newJobs} tone="info" icon={<Plus className="size-4" />} />
            <MiniStat label="Assigned" value={stats.assigned} tone="warning" icon={<HardHat className="size-4" />} />
            <MiniStat label="Follow-up" value={stats.followUp} tone="danger" icon={<RefreshCcw className="size-4" />} />
            <MiniStat label="Chargeable" value={stats.chargeableReview} tone="warning" icon={<AlertTriangle className="size-4" />} />
            <MiniStat label="Parts" value={stats.partsRequests} tone="info" icon={<PackageSearch className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Active engineer jobs</CardTitle>
            <CardDescription>Jobs needing assignment, attendance, follow-up or processing.</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Type</th>
                    <th>Engineer</th>
                    <th>Scheduled</th>
                    <th>Chargeable</th>
                    <th>Sync</th>
                  </tr>
                </thead>

                <tbody>
                  {engineerJobs.map((job) => (
                    <tr key={job.jobRef}>
                      <td>
                        <Link
                          href={`/portal/engineers/jobs/${job.jobRef}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {job.jobRef}
                        </Link>
                      </td>
                      <td>
                        <div className="font-bold text-freshpac-charcoal">{job.siteName}</div>
                        <div className="text-xs text-freshpac-grey">{job.accountNumber}</div>
                      </td>
                      <td>
                        <Badge tone={engineerStatusTone[job.status]}>{job.status}</Badge>
                      </td>
                      <td>
                        <Badge tone={engineerPriorityTone[job.priority]}>{job.priority}</Badge>
                      </td>
                      <td>{job.jobTypes.join(", ")}</td>
                      <td>{job.assignedEngineer}</td>
                      <td>{job.scheduledDate || "Not scheduled"}</td>
                      <td>{job.chargeable}</td>
                      <td>
                        <Badge tone={job.offlineStatus === "Pending sync" ? "danger" : job.offlineStatus === "Saved offline" ? "warning" : "neutral"}>
                          {job.offlineStatus}
                        </Badge>
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
              <CardTitle>Urgent and follow-up</CardTitle>
              <CardDescription>Jobs that need attention first.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {engineerJobs
                .filter((job) => job.priority === "Urgent" || job.status === "Follow-up Required" || job.offlineStatus === "Pending sync")
                .map((job) => (
                  <Link
                    key={job.jobRef}
                    href={`/portal/engineers/jobs/${job.jobRef}`}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-freshpac-charcoal">{job.jobRef}</p>
                        <p className="text-xs text-freshpac-grey">{job.siteName}</p>
                      </div>
                      <Badge tone={engineerStatusTone[job.status]}>{job.status}</Badge>
                    </div>

                    <p className="mt-2 text-xs text-freshpac-grey">{job.reportedFault}</p>
                  </Link>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engineer actions</CardTitle>
              <CardDescription>Placeholder actions for later database wiring.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <Button type="button">Assign selected job</Button>
              <Button type="button" variant="secondary">
                Print parts request
              </Button>
              <Button type="button" variant="secondary">
                Export completed report
              </Button>
              <Button type="button" variant="secondary">
                Review chargeable jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function DashboardLink({
  href,
  title,
  description,
  icon
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-freshpac-panel bg-white p-4 transition hover:border-freshpac-orange hover:bg-orange-50"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-freshpac-orange/15 p-2 text-freshpac-charcoal">{icon}</div>
        <div>
          <p className="font-black text-freshpac-charcoal">{title}</p>
          <p className="mt-1 text-xs text-freshpac-grey">{description}</p>
        </div>
      </div>
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