import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FilePlus2, Phone, UserRoundCheck, XCircle } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          <Button type="button" variant="secondary" size="sm">
            <Phone className="mr-2 size-4" />
            Mark contacted
          </Button>
          <Button type="button" variant="secondary" size="sm">
            <UserRoundCheck className="mr-2 size-4" />
            Assign rep
          </Button>
          <Button type="button" size="sm">
            <FilePlus2 className="mr-2 size-4" />
            Create customer
          </Button>
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

        <ModuleSection id="review" title="Sales review" description="Placeholder review actions. Write actions come next.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Button type="button" variant="secondary">
              <Phone className="mr-2 size-4" />
              Mark contacted
            </Button>
            <Button type="button" variant="secondary">
              <CheckCircle2 className="mr-2 size-4" />
              Accept
            </Button>
            <Button type="button" variant="secondary">
              <XCircle className="mr-2 size-4" />
              Reject
            </Button>
            <Button type="button">
              <FilePlus2 className="mr-2 size-4" />
              Create account
            </Button>
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
            <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
              No customer account linked yet.
            </p>
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