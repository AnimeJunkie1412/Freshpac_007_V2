import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, FileText, Pencil, Printer, RotateCcw, Truck, XCircle } from "lucide-react";
import {
  cancelOrder,
  markOrderPaid,
  markOrderProcessed,
  updateOrderInternalNotes
} from "@/app/portal/sales/orders/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildOrderAuditPreview,
  formatDateTime,
  formatDeliveryMethod,
  formatOrderLineSource,
  formatOrderMoney,
  formatOrderSource,
  formatOrderStatus,
  getAddressLines,
  getOrderByReferenceFromDb,
  getOrderReference,
  getOrderSourceTone,
  getOrderStatusTone
} from "@/lib/sales/order-db";

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
  const order = await getOrderByReferenceFromDb(decodeURIComponent(reference));

  if (!order) {
    notFound();
  }

  const orderReference = getOrderReference(order);
  const priceVisible = order.priceVisibilityAtOrder;
  const invoiceAddress = getAddressLines(order.customer.addresses, "INVOICE");
  const deliveryAddress = getAddressLines(order.customer.addresses, "DELIVERY");
  const auditEvents = buildOrderAuditPreview(order);

  return (
    <PortalShell
      title={orderReference}
      subtitle={`${order.customer.siteName} · ${order.customer.accountNumber}`}
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
          {order.status === "AWAITING_PAYMENT" ? (
            <form action={markOrderPaid}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" variant="secondary" size="sm">
                <Banknote className="mr-2 size-4" />
                Mark paid
              </Button>
            </form>
          ) : null}

          {order.status !== "PROCESSED" && order.status !== "CANCELLED" ? (
            <form action={markOrderProcessed}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" size="sm">
                <Printer className="mr-2 size-4" />
                Mark processed
              </Button>
            </form>
          ) : null}

          {order.status !== "CANCELLED" ? (
            <form action={cancelOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" variant="secondary" size="sm">
                <XCircle className="mr-2 size-4" />
                Cancel
              </Button>
            </form>
          ) : null}

          <Button type="button" variant="secondary" size="sm">
            <RotateCcw className="mr-2 size-4" />
            Reprint
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                <Badge tone={getOrderSourceTone(order.source)}>{formatOrderSource(order.source)}</Badge>
                <Badge tone={order.priceVisibilityAtOrder ? "success" : "warning"}>
                  Prices {order.priceVisibilityAtOrder ? "On" : "Off"}
                </Badge>
                {!order.priceVisibilityAtOrder ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                {order.editedByFreshpac ? <Badge tone="warning">Edited by Freshpac</Badge> : null}
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{orderReference}</h2>
              <p className="text-sm text-freshpac-grey">{order.customer.siteName}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Order date" value={formatDateTime(order.createdAt)} />
                <DetailField
                  label="Delivery"
                  value={`${order.deliveryDay || order.customer.deliveryDay || "Not set"} · ${order.driverOrCourier || order.customer.driverOrCourier || "No driver"}`}
                />
                <DetailField label="Submitted by" value={order.placedByUser?.fullName || "System"} />
                <DetailField label="Customer PO" value={order.customerPoNumber || "None"} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Order controls</p>

              <div className="mt-3 grid gap-2">
                <RuleCard label="Minimum order" value={order.minimumOrderPassed === false ? "Below minimum" : "Passed / not required"} />
                <RuleCard label="Carriage" value={formatOrderMoney(order.carriageIncVatPence, priceVisible)} />
                <RuleCard label="Print status" value={order.status === "PROCESSED" ? "Printed / processed" : "Not printed"} />
                <RuleCard label="Payment" value={order.status === "AWAITING_PAYMENT" ? "Awaiting payment" : "Not required"} />
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
            <DetailField label="Status" value={formatOrderStatus(order.status)} />
            <DetailField label="Source" value={formatOrderSource(order.source)} />
            <DetailField label="Delivery method" value={formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)} />
            <DetailField label="Price visibility" value={order.priceVisibilityAtOrder ? "On" : "Off"} />
            <DetailField label="Payment status" value={order.status === "AWAITING_PAYMENT" ? "Awaiting payment" : "Not required"} />
            <DetailField label="Total ex VAT" value={formatOrderMoney(order.totalExVatPence, priceVisible)} />
            <DetailField label="VAT total" value={formatOrderMoney(order.vatTotalPence, priceVisible)} />
            <DetailField label="Total inc VAT" value={formatOrderMoney(order.totalIncVatPence, priceVisible)} />
            <DetailField label="Carriage" value={formatOrderMoney(order.carriageIncVatPence, priceVisible)} />
            <DetailField label="Processed at" value={order.processedAt ? formatDateTime(order.processedAt) : "Not processed"} />
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
                  <tr key={line.id}>
                    <td className="font-bold">{line.productCodeSnapshot}</td>
                    <td>{line.descriptionSnapshot}</td>
                    <td>{line.packSizeSnapshot || "None"}</td>
                    <td>{line.quantity}</td>
                    <td>
                      <Badge tone={line.source === "RETAIL_ORDER" || line.source === "STANDING_ORDER" ? "warning" : "neutral"}>
                        {formatOrderLineSource(line.source)}
                      </Badge>
                    </td>
                    <td>{formatOrderMoney(line.priceExVatPence, priceVisible)}</td>
                    <td>{formatOrderMoney(line.vatPence, priceVisible)}</td>
                    <td>{formatOrderMoney(line.priceIncVatPence, priceVisible)}</td>
                    <td className="font-bold">{formatOrderMoney(line.lineTotalPence, priceVisible)}</td>
                    <td>{line.lockedFromCustomer ? <Badge tone="warning">Locked</Badge> : <Badge>Editable</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!order.lines.length ? <div className="p-6 text-sm text-freshpac-grey">No order lines recorded.</div> : null}
          </div>
        </ModuleSection>

        <ModuleSection id="addresses" title="Addresses" description="Invoice and delivery address for order sheet generation.">
          <div className="grid gap-4 lg:grid-cols-2">
            <AddressCard title="Invoice address" lines={invoiceAddress} />
            <AddressCard title="Delivery address" lines={deliveryAddress} />
          </div>
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Customer notes and Freshpac internal handling notes.">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Customer notes</p>
              <p className="mt-2 text-sm text-freshpac-charcoal">{order.customerNotes || "No customer notes."}</p>
            </div>

            <form action={updateOrderInternalNotes} className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />

              <p className="font-black text-freshpac-charcoal">Internal notes</p>
              <p className="mt-1 text-sm text-freshpac-grey">Update Freshpac-only handling notes.</p>

              <textarea
                name="internalNotes"
                defaultValue={order.internalNotes || ""}
                placeholder="Freshpac-only handling notes..."
                className="mt-3 min-h-32 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                required
              />

              <div className="mt-3 flex justify-end">
                <Button type="submit">Save notes</Button>
              </div>
            </form>
          </div>
        </ModuleSection>

        <ModuleSection
          id="print"
          title="Print and process"
          description="Order processing should only mark as processed after Freshpac confirms the PDFs printed successfully."
          action={
            <form action={markOrderProcessed}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" size="sm">
                <Printer className="mr-2 size-4" />
                Confirm processed
              </Button>
            </form>
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

          {order.status === "AWAITING_PAYMENT" ? (
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

        <ModuleSection id="audit" title="Audit history" description="Preview audit timeline from order timestamps.">
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
          <LinkButton href="/portal/sales/orders" variant="secondary">
            Back to order list
          </LinkButton>
        </div>
      </div>
    </PortalShell>
  );
}

function AddressCard({ title, lines }: { title: string[] | string; lines: string[] }) {
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