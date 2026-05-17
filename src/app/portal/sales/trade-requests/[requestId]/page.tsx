import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, CheckCircle2, FilePlus2, Phone, UserRoundCheck, XCircle } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  acceptTradeRequest,
  archiveTradeRequest,
  assignTradeRequest,
  markTradeRequestContacted,
  rejectTradeRequest
} from "@/app/portal/sales/trade-requests/actions";
import {
  formatDateTime,
  formatTradeRequestStatus,
  getTradeRequestByIdFromDb,
  getTradeRequestStatusTone
} from "@/lib/sales/trade-requests-db";

export default async function TradeRequestDetailPage({
  params
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getTradeRequestByIdFromDb(decodeURIComponent(requestId));

  if (!request) {
    notFound();
  }

  return (
    <PortalShell
      title={request.businessName}
      subtitle={`${request.name} · ${request.email}`}
      activeHref="/portal/sales/trade-requests"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/sales/trade-requests"
          className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to requests
        </Link>

        <div className="flex flex-wrap gap-2">
          <form action={markTradeRequestContacted}>
            <input type="hidden" name="requestId" value={request.id} />
            <Button type="submit" variant="secondary" size="sm">
              <Phone className="mr-2 size-4" />
              Mark contacted
            </Button>
          </form>

          <form action={acceptTradeRequest}>
            <input type="hidden" name="requestId" value={request.id} />
            <Button type="submit" size="sm">
              <CheckCircle2 className="mr-2 size-4" />
              Accept
            </Button>
          </form>

          <form action={rejectTradeRequest}>
            <input type="hidden" name="requestId" value={request.id} />
            <Button type="submit" variant="secondary" size="sm">
              <XCircle className="mr-2 size-4" />
              Reject
            </Button>
          </form>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getTradeRequestStatusTone(request.status)}>
              {formatTradeRequestStatus(request.status)}
            </Badge>
            <Badge>{request.assignedSalesRep || "Unassigned"}</Badge>
            {request.customer ? <Badge tone="success">Customer created</Badge> : <Badge tone="warning">No customer yet</Badge>}
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{request.businessName}</h2>
          <p className="text-sm text-freshpac-grey">Submitted {formatDateTime(request.createdAt)}</p>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Contact name" value={request.name} />
            <DetailField label="Phone" value={request.phone} />
            <DetailField label="Email" value={request.email} />
            <DetailField label="Relation" value={request.relationToCompany} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <ModuleSection id="business" title="Business details" description="Information submitted from the public trade account request form.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Business address</p>
              <p className="mt-2 whitespace-pre-line text-sm text-freshpac-charcoal">{request.businessAddress}</p>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Notes</p>
              <p className="mt-2 whitespace-pre-line text-sm text-freshpac-charcoal">
                {request.notes || "No notes submitted."}
              </p>
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="review" title="Sales review" description="Live trade request review actions.">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Assign sales rep</p>
              <form action={assignTradeRequest} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input type="hidden" name="requestId" value={request.id} />
                <Input name="assignedSalesRep" placeholder="Sarah, Andrew..." defaultValue={request.assignedSalesRep || ""} required />
                <Button type="submit" variant="secondary">
                  <UserRoundCheck className="mr-2 size-4" />
                  Assign
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Decision actions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={markTradeRequestContacted}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" variant="secondary">
                    <Phone className="mr-2 size-4" />
                    Contacted
                  </Button>
                </form>

                <form action={acceptTradeRequest}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit">
                    <CheckCircle2 className="mr-2 size-4" />
                    Accept
                  </Button>
                </form>

                <form action={rejectTradeRequest}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" variant="secondary">
                    <XCircle className="mr-2 size-4" />
                    Reject
                  </Button>
                </form>

                <form action={archiveTradeRequest}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" variant="secondary">
                    <Archive className="mr-2 size-4" />
                    Archive
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="customer" title="Linked customer" description="If accepted, Freshpac manually creates and links a customer account.">
          {request.customer ? (
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">{request.customer.siteName}</p>
              <p className="mt-1 text-sm text-freshpac-grey">{request.customer.accountNumber}</p>
              <LinkButton href={`/portal/sales/customers/${request.customer.accountNumber}`} className="mt-3">
                Open customer
              </LinkButton>
            </div>
          ) : (
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="text-sm text-freshpac-grey">No customer account linked yet.</p>
              <LinkButton href="/portal/sales/customers/new" className="mt-3">
                <FilePlus2 className="mr-2 size-4" />
                Create customer
              </LinkButton>
            </div>
          )}
        </ModuleSection>

        <div className="flex justify-end">
          <LinkButton href="/portal/sales/trade-requests" variant="secondary">
            Back to trade requests
          </LinkButton>
        </div>
      </div>
    </PortalShell>
  );
}