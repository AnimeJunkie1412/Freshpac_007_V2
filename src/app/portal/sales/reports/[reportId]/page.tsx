import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getReportById } from "@/lib/sales/reports";

export default async function ReportDetailPage({
  params
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = getReportById(decodeURIComponent(reportId));

  if (!report) {
    notFound();
  }

  return (
    <PortalShell title={report.title} subtitle={`${report.category} · ${report.output}`} activeHref="/portal/sales/reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/sales/reports"
          className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to reports
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm">
            <Printer className="mr-2 size-4" />
            Print preview
          </Button>
          <Button type="button" size="sm">
            <Download className="mr-2 size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={report.tone}>{report.category}</Badge>
            <Badge>{report.status}</Badge>
            <Badge tone={report.output.includes("PDF") ? "info" : "neutral"}>{report.output}</Badge>
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{report.title}</h2>
          <p className="mt-1 max-w-3xl text-sm text-freshpac-grey">{report.description}</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Report ID" value={report.id} />
            <DetailField label="Category" value={report.category} />
            <DetailField label="Output" value={report.output} />
            <DetailField label="Useful for" value={report.usefulFor} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <ModuleSection id="filters" title="Report filters" description="These will become live controls once connected to Supabase.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Date range" value="Placeholder" />
            <DetailField label="Customer" value="All customers" />
            <DetailField label="Delivery day" value="All days" />
            <DetailField label="Status" value="All statuses" />
          </div>
        </ModuleSection>

        <ModuleSection id="preview" title="Report preview" description="Preview table before printing or exporting PDF.">
          <div className="overflow-x-auto">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PREVIEW-001</td>
                  <td>{report.title}</td>
                  <td>{report.status}</td>
                  <td>Today</td>
                  <td>This is placeholder report data.</td>
                </tr>
                <tr>
                  <td>PREVIEW-002</td>
                  <td>{report.category} sample line</td>
                  <td>Ready</td>
                  <td>Today</td>
                  <td>Live records will appear here later.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ModuleSection>

        <ModuleSection id="pdf" title="PDF generation notes" description="How this report should behave when PDF export is wired.">
          <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
            <div className="flex items-center gap-2 font-black text-freshpac-charcoal">
              <FileText className="size-4" />
              PDF behaviour
            </div>

            <ul className="mt-3 grid gap-2 text-sm text-freshpac-charcoal">
              <li>Use Freshpac logo, address, phone, email and company footer.</li>
              <li>Include generated date/time and staff user where relevant.</li>
              <li>Respect customer price visibility rules on customer-facing documents.</li>
              <li>Keep staff reports semi-compact and printable.</li>
              <li>Store audit event when critical PDFs are generated or processed.</li>
            </ul>
          </div>
        </ModuleSection>

        <div className="flex justify-end">
          <LinkButton href="/portal/sales/reports" variant="secondary">
            Back to reports
          </LinkButton>
        </div>
      </div>
    </PortalShell>
  );
}