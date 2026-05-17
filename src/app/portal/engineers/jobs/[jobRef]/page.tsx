import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, PackageSearch, Pencil, Printer, RefreshCcw, UserRoundCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { engineerPriorityTone, engineerStatusTone, getEngineerJobByRef } from "@/lib/engineers/jobs";

const tabs = [
  { label: "Overview", href: "#overview" },
  { label: "Customer", href: "#customer" },
  { label: "Machines", href: "#machines" },
  { label: "Parts", href: "#parts" },
  { label: "Chargeable", href: "#chargeable" },
  { label: "Signature", href: "#signature" },
  { label: "Follow-up", href: "#follow-up" },
  { label: "Notes", href: "#notes" },
  { label: "Audit", href: "#audit" }
];

export default async function EngineerJobDetailPage({
  params
}: {
  params: Promise<{ jobRef: string }>;
}) {
  const { jobRef } = await params;
  const job = getEngineerJobByRef(decodeURIComponent(jobRef));

  if (!job) {
    notFound();
  }

  return (
    <PortalShell
      title={job.jobRef}
      subtitle={`${job.siteName} · ${job.jobTypes.join(", ")}`}
      activeHref="/portal/engineers/jobs"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/engineers/jobs"
          className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to jobs
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm">
            <Pencil className="mr-2 size-4" />
            Edit job
          </Button>
          <Button type="button" variant="secondary" size="sm">
            <PackageSearch className="mr-2 size-4" />
            Request parts
          </Button>
          <Button type="button" size="sm">
            <Printer className="mr-2 size-4" />
            Print report
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={engineerStatusTone[job.status]}>{job.status}</Badge>
                <Badge tone={engineerPriorityTone[job.priority]}>{job.priority}</Badge>
                {job.jobTypes.map((type) => (
                  <Badge key={type} tone={type === "Breakdown" ? "danger" : type === "Water Filter Change" ? "info" : "neutral"}>
                    {type}
                  </Badge>
                ))}
                <Badge tone={job.offlineStatus === "Pending sync" ? "danger" : job.offlineStatus === "Saved offline" ? "warning" : "neutral"}>
                  {job.offlineStatus}
                </Badge>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{job.jobRef}</h2>
              <p className="mt-1 max-w-3xl text-sm text-freshpac-grey">{job.reportedFault}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Created" value={job.createdAt} />
                <DetailField label="Reported by" value={job.reportedBy} />
                <DetailField label="Assigned engineer" value={job.assignedEngineer} />
                <DetailField label="Scheduled" value={job.scheduledDate || "Not scheduled"} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Job controls</p>

              <div className="mt-3 grid gap-2">
                <RuleCard label="Chargeable" value={job.chargeable} />
                <RuleCard label="Signature" value={job.customerSignatureStatus} />
                <RuleCard label="Follow-up" value={job.followUpRequired} />
                <RuleCard label="Photos" value={String(job.photosCount)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-[86px] z-20 mb-4 overflow-x-auto rounded-2xl border border-freshpac-panel bg-white p-1 shadow-panel">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="rounded-xl px-3 py-2 text-xs font-bold text-freshpac-grey transition hover:bg-orange-50 hover:text-freshpac-charcoal"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <ModuleSection
          id="overview"
          title="Overview"
          description="Job state, attendance and engineer assignment."
          action={
            <Button type="button" variant="secondary" size="sm">
              <UserRoundCheck className="mr-2 size-4" />
              Assign engineer
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <DetailField label="Status" value={job.status} />
            <DetailField label="Priority" value={job.priority} />
            <DetailField label="Job type" value={job.jobTypes.join(", ")} />
            <DetailField label="Engineer" value={job.assignedEngineer} />
            <DetailField label="Offline status" value={job.offlineStatus} />
            <DetailField label="Date attended" value={job.dateAttended || "Not attended"} />
            <DetailField label="Arrival" value={job.arrivalTime || "Not recorded"} />
            <DetailField label="Departure" value={job.departureTime || "Not recorded"} />
            <DetailField label="Time on site" value={job.timeOnSite || "Not calculated"} />
            <DetailField label="Photos" value={String(job.photosCount)} />
          </div>
        </ModuleSection>

        <ModuleSection id="customer" title="Customer details" description="Engineering users only see information needed for jobs.">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Customer</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{job.siteName}</p>
              <p className="text-sm text-freshpac-grey">{job.accountNumber}</p>
              <Link
                href={`/portal/sales/customers/${job.accountNumber}`}
                className="mt-3 inline-flex rounded-xl bg-freshpac-orange px-3 py-2 text-xs font-black text-freshpac-charcoal hover:bg-orange-400"
              >
                Open customer account
              </Link>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Contact</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{job.contactName}</p>
              <p className="text-sm text-freshpac-grey">{job.contactPhone}</p>
            </div>

            <AddressCard title="Site address" lines={job.siteAddress} />
          </div>

          <div className="mt-4 rounded-2xl border border-freshpac-panel bg-white p-4">
            <p className="font-black text-freshpac-charcoal">Assigned coffee products</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.assignedCoffeeProducts.map((product) => (
                <Badge key={product} tone="info">
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        </ModuleSection>

        <ModuleSection
          id="machines"
          title="Machine job sheets"
          description="Each machine on a job should have its own job sheet. One customer signature can cover all sheets."
          action={
            <Button type="button" variant="secondary" size="sm">
              <FileText className="mr-2 size-4" />
              Add machine sheet
            </Button>
          }
        >
          {job.machineSheets.length ? (
            <div className="grid gap-3">
              {job.machineSheets.map((sheet) => (
                <div key={`${sheet.serialNumber}-${sheet.machineDescription}`} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <DetailField label="Machine" value={sheet.machineDescription} />
                    <DetailField label="Make / model" value={sheet.makeModel} />
                    <DetailField label="Serial" value={sheet.serialNumber} />
                    <DetailField label="Repaired onsite" value={sheet.repairedOnSite} />
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl bg-freshpac-cream/70 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Reported fault</p>
                      <p className="mt-1 text-sm text-freshpac-charcoal">{sheet.reportedFault}</p>
                    </div>
                    <div className="rounded-xl bg-freshpac-cream/70 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Work carried out</p>
                      <p className="mt-1 text-sm text-freshpac-charcoal">{sheet.workCarriedOut || "Not completed yet."}</p>
                    </div>
                  </div>

                  {sheet.settings ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <DetailField label="Steam pressure" value={sheet.settings.steamPressureBar || "Not recorded"} />
                      <DetailField label="Pump pressure" value={sheet.settings.pumpPressureBar || "Not recorded"} />
                      <DetailField label="Espresso time" value={sheet.settings.espressoTimeSeconds || "Not recorded"} />
                      <DetailField label="Espresso volume" value={sheet.settings.espressoVolumeFlOz || "Not recorded"} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
              No machine sheets added yet.
            </p>
          )}
        </ModuleSection>

        <ModuleSection
          id="parts"
          title="Parts used and parts requests"
          description="Parts requests should create Sales Portal notifications for review and printing."
          action={
            <Button type="button" variant="secondary" size="sm">
              <PackageSearch className="mr-2 size-4" />
              New parts request
            </Button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Parts used</p>
              {job.partsUsed.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="fp-compact-table min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th>Part</th>
                        <th>Description</th>
                        <th>Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.partsUsed.map((part) => (
                        <tr key={part.partNumber}>
                          <td className="font-bold">{part.partNumber}</td>
                          <td>{part.description}</td>
                          <td>{part.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-sm text-freshpac-grey">No parts used yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Parts requests</p>
              {job.partsRequests.length ? (
                <div className="mt-3 space-y-3">
                  {job.partsRequests.map((request) => (
                    <div key={request.requestRef} className="rounded-xl bg-freshpac-cream/70 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-black text-freshpac-charcoal">{request.requestRef}</p>
                        <Badge tone="info">{request.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-freshpac-charcoal">
                        {request.quantity} x {request.partDescription}
                      </p>
                      <p className="text-xs text-freshpac-grey">
                        {request.machineMakeModel} · {request.machineSerialNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-freshpac-grey">No parts requested.</p>
              )}
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="chargeable" title="Chargeable review" description="Freshpac confirms chargeable status before Sage invoicing.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <DetailField label="Chargeable" value={job.chargeable} />
            <DetailField label="Callout charge" value={job.calloutCharge} />
            <DetailField label="Additional charges" value={job.additionalCharges} />
            <DetailField label="Sage invoice" value={job.sageInvoiceNumber || "Not entered"} />
            <DetailField label="Review note" value={job.chargeableReviewNote || "No review note."} />
          </div>
        </ModuleSection>

        <ModuleSection id="signature" title="Customer signature" description="Signature confirms work was completed and charges may apply if Freshpac confirms chargeable status.">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailField label="Signature status" value={job.customerSignatureStatus} />
            <DetailField label="Printed name" value={job.customerPrintedName || "Not recorded"} />
            <DetailField label="Signed date" value={job.signatureDate || "Not recorded"} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="follow-up"
          title="Follow-up"
          description="Follow-up jobs are created when an engineer marks extra work as required."
          action={
            <Button type="button" variant="secondary" size="sm">
              <RefreshCcw className="mr-2 size-4" />
              Create follow-up
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            <DetailField label="Follow-up required" value={job.followUpRequired} />
            <DetailField label="Reason" value={job.followUpReason || "No follow-up required."} />
          </div>
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Engineer and office notes for this job.">
          <div className="grid gap-2">
            {job.notes.map((note) => (
              <div key={note} className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                {note}
              </div>
            ))}
          </div>
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Engineer job creation, assignment, completion and sync events.">
          <div className="space-y-3">
            {job.audit.map((event) => (
              <div key={`${event.date}-${event.action}`} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-freshpac-charcoal">{event.action}</p>
                  <Badge>{event.date}</Badge>
                </div>
                <p className="mt-1 text-sm text-freshpac-grey">By {event.user}</p>
                <p className="mt-2 text-sm text-freshpac-charcoal">{event.note}</p>
              </div>
            ))}
          </div>
        </ModuleSection>

        <div className="flex justify-end">
          <LinkButton href="/portal/engineers/jobs" variant="secondary">
            Back to engineer jobs
          </LinkButton>
        </div>
      </div>
    </PortalShell>
  );
}

function AddressCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
      <p className="font-black text-freshpac-charcoal">{title}</p>
      <div className="mt-3 text-sm leading-6 text-freshpac-charcoal">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function RuleCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-freshpac-panel bg-white p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-freshpac-grey">{label}</p>
      <p className="mt-1 text-sm font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}