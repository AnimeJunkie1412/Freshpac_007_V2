import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  PackageSearch,
  Pencil,
  PlayCircle,
  Printer,
  RefreshCcw,
  Save,
  UserRoundCheck
} from "lucide-react";
import {
  assignEngineerToJob,
  completeEngineerJob,
  createEngineerJobPartsRequest,
  markEngineerJobFollowUpRequired,
  markEngineerJobInProgress,
  updateEngineerJobChargeableReview
} from "@/app/portal/engineers/jobs/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildEngineerAuditPreview,
  formatChargeableStatus,
  formatDate,
  formatDateTime,
  formatEngineerJobStatus,
  formatEngineerJobType,
  formatEngineerJobTypes,
  formatEngineerPriority,
  formatMoneyFromPence,
  formatSignatureStatus,
  formatSyncStatus,
  getCustomerAddressLines,
  getEngineerJobByReferenceFromDb,
  getEngineerJobReference,
  getEngineerJobStatusTone,
  getEngineerPriorityTone,
  getSyncStatusTone
} from "@/lib/engineers/job-db";

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
  const job = await getEngineerJobByReferenceFromDb(decodeURIComponent(jobRef));

  if (!job) {
    notFound();
  }

  const reference = getEngineerJobReference(job);
  const primaryContact = job.customer.contacts[0];
  const addressLines = getCustomerAddressLines(job.customer.addresses);
  const coffeeProducts = job.customer.productAccess.filter((access) => access.product.productType === "COFFEE");
  const auditEvents = buildEngineerAuditPreview(job);
  const firstMachineSheet = job.machineSheets[0];

  return (
    <PortalShell
      title={reference}
      subtitle={`${job.customer.siteName} · ${formatEngineerJobTypes(job.jobTypes)}`}
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
          {job.status !== "IN_PROGRESS" && job.status !== "COMPLETED" && job.status !== "COMPLETED_INVOICED" ? (
            <form action={markEngineerJobInProgress}>
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="reference" value={reference} />
              <Button type="submit" variant="secondary" size="sm">
                <PlayCircle className="mr-2 size-4" />
                Start job
              </Button>
            </form>
          ) : null}

          {job.status !== "COMPLETED" && job.status !== "COMPLETED_INVOICED" ? (
            <form action={completeEngineerJob}>
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="reference" value={reference} />
              <Button type="submit" size="sm">
                <CheckCircle2 className="mr-2 size-4" />
                Complete
              </Button>
            </form>
          ) : null}

          <Button type="button" variant="secondary" size="sm">
            <Pencil className="mr-2 size-4" />
            Edit job
          </Button>

          <Button type="button" variant="secondary" size="sm">
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
                <Badge tone={getEngineerJobStatusTone(job.status)}>{formatEngineerJobStatus(job.status)}</Badge>
                <Badge tone={getEngineerPriorityTone(job.priority)}>{formatEngineerPriority(job.priority)}</Badge>
                {job.jobTypes.map((type) => (
                  <Badge key={type} tone={type === "BREAKDOWN" ? "danger" : type === "WATER_FILTER_CHANGE" ? "info" : "neutral"}>
                    {formatEngineerJobType(type)}
                  </Badge>
                ))}
                <Badge tone={getSyncStatusTone(job.offlineStatus)}>{formatSyncStatus(job.offlineStatus)}</Badge>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{reference}</h2>
              <p className="mt-1 max-w-3xl text-sm text-freshpac-grey">
                {job.reportedFault || "No reported fault recorded."}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Created" value={formatDateTime(job.createdAt)} />
                <DetailField label="Reported by" value={job.createdByUser?.fullName || "System"} />
                <DetailField label="Assigned engineer" value={job.assignedEngineer?.fullName || "Unassigned"} />
                <DetailField label="Scheduled" value={formatDate(job.scheduledAt)} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Job controls</p>

              <div className="mt-3 grid gap-2">
                <RuleCard label="Chargeable" value={formatChargeableStatus(job.chargeable)} />
                <RuleCard label="Signature" value={formatSignatureStatus(job.customerSignatureStatus)} />
                <RuleCard label="Follow-up" value={job.followUpRequired ? "Yes" : "No"} />
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
              Assignment
            </Button>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
            <form action={assignEngineerToJob} className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="reference" value={reference} />

              <p className="font-black text-freshpac-charcoal">Assign engineer</p>
              <p className="mt-1 text-sm text-freshpac-grey">Enter an engineer name. If missing, a local engineer profile is created.</p>

              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input name="engineerName" defaultValue={job.assignedEngineer?.fullName || ""} placeholder="Engineer name" required />
                <Button type="submit" variant="secondary">
                  Assign
                </Button>
              </div>
            </form>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <DetailField label="Status" value={formatEngineerJobStatus(job.status)} />
              <DetailField label="Priority" value={formatEngineerPriority(job.priority)} />
              <DetailField label="Job type" value={formatEngineerJobTypes(job.jobTypes)} />
              <DetailField label="Engineer" value={job.assignedEngineer?.fullName || "Unassigned"} />
              <DetailField label="Offline status" value={formatSyncStatus(job.offlineStatus)} />
              <DetailField label="Date attended" value={formatDate(job.dateAttended)} />
              <DetailField label="Arrival" value={job.arrivalTime || "Not recorded"} />
              <DetailField label="Departure" value={job.departureTime || "Not recorded"} />
              <DetailField label="Time on site" value={job.timeOnSiteMinutes ? `${job.timeOnSiteMinutes} minutes` : "Not calculated"} />
              <DetailField label="Photos" value={String(job.photosCount)} />
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="customer" title="Customer details" description="Engineering users only see information needed for jobs.">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Customer</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{job.customer.siteName}</p>
              <p className="text-sm text-freshpac-grey">{job.customer.accountNumber}</p>
              <Link
                href={`/portal/sales/customers/${job.customer.accountNumber}`}
                className="mt-3 inline-flex rounded-xl bg-freshpac-orange px-3 py-2 text-xs font-black text-freshpac-charcoal hover:bg-orange-400"
              >
                Open customer account
              </Link>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Contact</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{primaryContact?.name || "No contact recorded"}</p>
              <p className="text-sm text-freshpac-grey">{primaryContact?.phone || "No phone recorded"}</p>
            </div>

            <AddressCard title="Site address" lines={addressLines} />
          </div>

          <div className="mt-4 rounded-2xl border border-freshpac-panel bg-white p-4">
            <p className="font-black text-freshpac-charcoal">Assigned coffee products</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {coffeeProducts.length ? (
                coffeeProducts.map((access) => (
                  <Badge key={access.id} tone="info">
                    {access.product.name}
                  </Badge>
                ))
              ) : (
                <Badge>No assigned coffee products</Badge>
              )}
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
                <div key={sheet.id} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <DetailField label="Machine" value={sheet.machineDescription} />
                    <DetailField label="Make / model" value={sheet.makeModel || "Not recorded"} />
                    <DetailField label="Serial" value={sheet.serialNumber || "Not recorded"} />
                    <DetailField label="Repaired onsite" value={sheet.repairedOnSite || "Not recorded"} />
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl bg-freshpac-cream/70 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Reported fault</p>
                      <p className="mt-1 text-sm text-freshpac-charcoal">{sheet.reportedFault || "No fault recorded."}</p>
                    </div>
                    <div className="rounded-xl bg-freshpac-cream/70 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Work carried out</p>
                      <p className="mt-1 text-sm text-freshpac-charcoal">{sheet.workCarriedOut || "Not completed yet."}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <DetailField label="Steam pressure" value={sheet.steamPressureBar || "Not recorded"} />
                    <DetailField label="Pump pressure" value={sheet.pumpPressureBar || "Not recorded"} />
                    <DetailField label="Espresso time" value={sheet.espressoTimeSeconds || "Not recorded"} />
                    <DetailField label="Espresso volume" value={sheet.espressoVolumeFluidOz || "Not recorded"} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No machine sheets added yet." />
          )}
        </ModuleSection>

        <ModuleSection
          id="parts"
          title="Parts used and parts requests"
          description="Parts requests create Sales Portal notifications for review and printing."
          action={
            <Button type="button" variant="secondary" size="sm">
              <PackageSearch className="mr-2 size-4" />
              Parts
            </Button>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <form action={createEngineerJobPartsRequest} className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="reference" value={reference} />

              <p className="font-black text-freshpac-charcoal">Create parts request</p>
              <p className="mt-1 text-sm text-freshpac-grey">Submit a parts request linked to this job.</p>

              <div className="mt-3 grid gap-3">
                <Input
                  name="machineMakeModel"
                  defaultValue={firstMachineSheet?.makeModel || ""}
                  placeholder="Machine make / model"
                />
                <Input
                  name="machineSerialNumber"
                  defaultValue={firstMachineSheet?.serialNumber || ""}
                  placeholder="Machine serial number"
                />
                <Input name="partNumber" placeholder="Part number, if known" />
                <Input name="partDescription" placeholder="Part description" required />
                <Input name="quantity" type="number" min="1" defaultValue="1" required />
                <textarea
                  name="notes"
                  placeholder="Request notes..."
                  className="min-h-24 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                />
                <Button type="submit">
                  <PackageSearch className="mr-2 size-4" />
                  Submit request
                </Button>
              </div>
            </form>

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
                          <tr key={part.id}>
                            <td className="font-bold">{part.partNumber || "No part number"}</td>
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
                      <div key={request.id} className="rounded-xl bg-freshpac-cream/70 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-black text-freshpac-charcoal">{request.reference || "No reference"}</p>
                          <Badge tone="info">{request.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-freshpac-charcoal">
                          {request.quantity} x {request.partDescription}
                        </p>
                        <p className="text-xs text-freshpac-grey">
                          {request.machineMakeModel || "No machine"} · {request.machineSerialNumber || "No serial"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-freshpac-grey">No parts requested.</p>
                )}
              </div>
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="chargeable" title="Chargeable review" description="Freshpac confirms chargeable status before Sage invoicing.">
          <form action={updateEngineerJobChargeableReview} className="rounded-2xl border border-freshpac-panel bg-white p-4">
            <input type="hidden" name="jobId" value={job.id} />
            <input type="hidden" name="reference" value={reference} />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Chargeable</span>
                <select
                  name="chargeable"
                  defaultValue={job.chargeable}
                  className="h-10 rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-semibold text-freshpac-charcoal outline-none focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                >
                  <option value="TO_REVIEW">To review</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Callout pence</span>
                <Input name="calloutChargePence" type="number" min="0" defaultValue={job.calloutChargePence || 0} />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Additional pence</span>
                <Input name="additionalChargesPence" type="number" min="0" defaultValue={job.additionalChargesPence || 0} />
              </label>

              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Sage invoice</span>
                <Input name="sageInvoiceNumber" defaultValue={job.sageInvoiceNumber || ""} placeholder="Sage invoice number" />
              </label>

              <div className="grid content-end">
                <Button type="submit">
                  <Save className="mr-2 size-4" />
                  Save review
                </Button>
              </div>
            </div>

            <label className="mt-3 grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">Review note</span>
              <textarea
                name="chargeableReviewNote"
                defaultValue={job.chargeableReviewNote || ""}
                placeholder="Chargeable review notes..."
                className="min-h-24 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
              />
            </label>
          </form>

          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <DetailField label="Chargeable" value={formatChargeableStatus(job.chargeable)} />
            <DetailField label="Callout charge" value={formatMoneyFromPence(job.calloutChargePence)} />
            <DetailField label="Additional charges" value={formatMoneyFromPence(job.additionalChargesPence)} />
            <DetailField label="Sage invoice" value={job.sageInvoiceNumber || "Not entered"} />
            <DetailField label="Review note" value={job.chargeableReviewNote || "No review note."} />
          </div>
        </ModuleSection>

        <ModuleSection id="signature" title="Customer signature" description="Signature confirms work was completed and charges may apply if Freshpac confirms chargeable status.">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailField label="Signature status" value={formatSignatureStatus(job.customerSignatureStatus)} />
            <DetailField label="Printed name" value={job.customerPrintedName || "Not recorded"} />
            <DetailField label="Signed date" value={formatDate(job.signatureDate)} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="follow-up"
          title="Follow-up"
          description="Follow-up jobs are created when an engineer marks extra work as required."
          action={
            <Button type="button" variant="secondary" size="sm">
              <RefreshCcw className="mr-2 size-4" />
              Follow-up
            </Button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            <form action={markEngineerJobFollowUpRequired} className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <input type="hidden" name="jobId" value={job.id} />
              <input type="hidden" name="reference" value={reference} />

              <p className="font-black text-freshpac-charcoal">Mark follow-up required</p>
              <p className="mt-1 text-sm text-freshpac-grey">Add the reason before flagging this job.</p>

              <textarea
                name="followUpReason"
                defaultValue={job.followUpReason || ""}
                placeholder="Follow-up reason..."
                className="mt-3 min-h-28 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                required
              />

              <div className="mt-3 flex justify-end">
                <Button type="submit" variant="secondary">
                  <RefreshCcw className="mr-2 size-4" />
                  Mark follow-up
                </Button>
              </div>
            </form>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailField label="Follow-up required" value={job.followUpRequired ? "Yes" : "No"} />
              <DetailField label="Reason" value={job.followUpReason || "No follow-up required."} />
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Engineer and office notes for this job.">
          <div className="grid gap-2">
            <div className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
              {job.reportedFault || "No job notes recorded yet."}
            </div>
            {job.chargeableReviewNote ? (
              <div className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                {job.chargeableReviewNote}
              </div>
            ) : null}
          </div>
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Preview audit timeline from job timestamps.">
          <div className="space-y-3">
            {auditEvents.map((event) => (
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

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
      {message}
    </p>
  );
}