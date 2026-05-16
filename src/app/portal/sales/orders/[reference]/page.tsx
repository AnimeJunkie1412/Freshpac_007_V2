import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, FileText, Pencil, Printer, RotateCcw, Truck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderByReference, orderSourceTone, orderStatusTone } from "@/lib/sales/orders";

const tabs = [
  { label: "Overview", href: "#overview" },
  { label: "Lines", href: "#lines" },
  { label: "Addresses", href: "#addresses" },
  { label: "Notes", href: "#notes" },
  { label: "Print", href: "#print" },
  { label: "Audit", href: "#audit" }
];

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = getOrderByReference(decodeURIComponent(reference));

  if (!order) {
    notFound();
  }

  return (
    <PortalShell
      title={order.reference}
      subtitle={`${order.siteName} · ${order.accountNumber}`}
      activeHref="/portal/sales/orders"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/sales/orders"
          className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to orders
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm">
            <Pencil className="mr-2 size-4" />
            Edit order
          </Button>
          <Button type="button" variant="secondary" size="sm">
            <RotateCcw className="mr-2 size-4" />
            Reprint
          </Button>
          <Button type="button" size="sm">
            <Printer className="mr-2 size-4" />
            Print order
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={order.status} tone={orderStatusTone[order.status]} />
                <Badge tone={orderSourceTone[order.source]}>{order.source}</Badge>
                <Badge tone={order.priceVisibility === "On" ? "success" : "warning"}>
                  Prices {order.priceVisibility}
                </Badge>
                {order.priceVisibility === "Off" ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                {order.editedByFreshpac ? <Badge tone="warning">Edited by Freshpac</Badge> : null}
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">
                {order.reference}
              </h2>
              <p className="text-sm text-freshpac-grey">{order.siteName}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Order date" value={order.orderDate} />
                <DetailField label="Delivery" value={`${order.requiredDeliveryDay} · ${order.driverOrCourier}`} />
                <DetailField label="Submitted by" value={order.submittedBy} />
                <DetailField label="Customer PO" value={order.customerOrderNumber || "None"} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">
                Order controls
              </p>

              <div className="mt-3 grid gap-2">
                <RuleCard label="Minimum order" value={order.minimumOrderCheck} />
                <RuleCard label="Carriage" value={order.carriageCharge} />
                <RuleCard label="Print status" value={order.printStatus} />
                <RuleCard label="Payment" value={order.paymentStatus} />
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
          description="Order status, totals and processing state."
          action={
            <Button type="button" variant="secondary" size="sm">
              <Truck className="mr-2 size-4" />
              Change delivery
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <DetailField label="Status" value={order.status} />
            <DetailField label="Source" value={order.source} />
            <DetailField label="Delivery method" value={order.deliveryMethod} />
            <DetailField label="Price visibility" value={order.priceVisibility} />
            <DetailField label="Payment status" value={order.paymentStatus} />
            <DetailField label="Total ex VAT" value={order.totalExVat} />
            <DetailField label="VAT total" value={order.vatTotal} />
            <DetailField label="Total inc VAT" value={order.totalIncVat} />
            <DetailField label="Carriage" value={order.carriageCharge} />
            <DetailField label="Print status" value={order.printStatus} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="lines"
          title="Order lines"
          description="Staff view includes product codes. Customer-facing PDFs must respect price visibility."
          action={
            <Button type="button" variant="secondary" size="sm">
              <FileText className="mr-2 size-4" />
              Add line
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Pack</th>
                  <th>Qty</th>
                  <th>Source</th>
                  <th>Ex VAT</th>
                  <th>VAT</th>
                  <th>Inc VAT</th>
                  <th>Total</th>
                  <th>Lock</th>
                </tr>
              </thead>

              <tbody>
                {order.lines.map((line) => (
                  <tr key={`${line.productCode}-${line.source}`}>
                    <td className="font-bold">{line.productCode}</td>
                    <td>{line.description}</td>
                    <td>{line.packSize}</td>
                    <td>{line.quantity}</td>
                    <td>
                      <Badge tone={line.source === "Retail Order" || line.source === "Standing Order" ? "warning" : "neutral"}>
                        {line.source}
                      </Badge>
                    </td>
                    <td>{line.priceExVat}</td>
                    <td>{line.vatAmount}</td>
                    <td>{line.priceIncVat}</td>
                    <td className="font-bold">{line.lineTotal}</td>
                    <td>{line.locked ? <Badge tone="warning">Locked</Badge> : <Badge>Editable</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleSection>

        <ModuleSection id="addresses" title="Addresses" description="Invoice and delivery address for order sheet generation.">
          <div className="grid gap-4 lg:grid-cols-2">
            <AddressCard title="Invoice address" lines={order.invoiceAddress} />
            <AddressCard title="Delivery address" lines={order.deliveryAddress} />
          </div>
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Customer notes and Freshpac internal handling notes.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Customer notes</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{order.customerNotes || "No customer notes."}</p>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Internal notes</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{order.internalNotes || "No internal notes."}</p>
            </div>
          </div>
        </ModuleSection>

        <ModuleSection
          id="print"
          title="Print and process"
          description="Order processing should only mark as processed after Freshpac confirms the PDFs printed successfully."
          action={
            <Button type="button" size="sm">
              <Printer className="mr-2 size-4" />
              Print now
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Button type="button" variant="secondary">
              Order sheet PDF
            </Button>
            <Button type="button" variant="secondary">
              Delivery note PDF
            </Button>
            <Button type="button" variant="secondary">
              Coffee pick list
            </Button>
            <Button type="button" variant="secondary">
              Confirm print success
            </Button>
          </div>

          {order.status === "Awaiting Payment" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-black">
                <Banknote className="size-4" />
                Awaiting external payment
              </div>
              <p className="mt-2">
                No payment is taken in this app. Freshpac should confirm payment externally, then mark the order as Paid Submitted.
              </p>
            </div>
          ) : null}
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Important order actions and processing events.">
          <div className="space-y-3">
            {order.audit.map((event) => (
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
          <LinkButton href="/portal/sales/orders" variant="secondary">
            Back to order list
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