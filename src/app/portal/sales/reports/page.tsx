import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, ClipboardList, FileText, Filter, PackageCheck, Search, UsersRound, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getReportStats, reports } from "@/lib/sales/reports";

const filters = ["All", "Orders", "Customers", "Products", "Engineers", "Rollover", "PDF", "Ready"];

export default function ReportsPage() {
  const stats = getReportStats();

  return (
    <PortalShell
      title="Reports"
      subtitle="Printable PDFs and practical report screens for orders, customers, products, engineers and rollover."
      activeHref="/portal/sales/reports"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Report search</CardTitle>
            <CardDescription>
              Find order sheets, pick lists, stocktaking reports, customer reports and engineer reports.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search reports..." />
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
            <CardTitle>Report counters</CardTitle>
            <CardDescription>Starter report library.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<BarChart3 className="size-4" />} />
            <MiniStat label="Orders" value={stats.orders} tone="info" icon={<ClipboardList className="size-4" />} />
            <MiniStat label="Customers" value={stats.customers} icon={<UsersRound className="size-4" />} />
            <MiniStat label="Products" value={stats.products} tone="success" icon={<PackageCheck className="size-4" />} />
            <MiniStat label="Engineers" value={stats.engineers} tone="warning" icon={<Wrench className="size-4" />} />
            <MiniStat label="PDFs" value={stats.pdfPlanned} tone="info" icon={<FileText className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Report library</CardTitle>
              <CardDescription>
                Each report starts as a screen placeholder. PDF generation will be wired once the data model is stable.
              </CardDescription>
            </div>
            <Badge tone="info">Mock data</Badge>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/portal/sales/reports/${report.id}`}
              className="rounded-2xl border border-freshpac-panel bg-white p-4 transition hover:border-freshpac-orange hover:bg-orange-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-freshpac-charcoal">{report.title}</p>
                  <p className="mt-1 text-sm text-freshpac-grey">{report.description}</p>
                </div>
                <Badge tone={report.tone}>{report.category}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{report.status}</Badge>
                <Badge tone={report.output.includes("PDF") ? "info" : "neutral"}>{report.output}</Badge>
              </div>

              <p className="mt-3 text-xs font-semibold text-freshpac-grey">Useful for: {report.usefulFor}</p>
            </Link>
          ))}
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