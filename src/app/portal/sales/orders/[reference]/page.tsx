import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  FileText,
  PackagePlus,
  Printer,
  RotateCcw,
  Send,
  Truck,
  XCircle
} from "lucide-react";
import {
  cancelOrder,
  markOrderPaid,
  markOrderProcessed,
  updateOrderInternalNotes
} from "@/app/portal/sales/orders/actions";
import { submitManualOrder } from "@/app/portal/sales/orders/[reference]/submit/actions";
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
  const encodedOrderReference = encodeURIComponent(orderReference);
  const printHref = `/portal/sales/orders/${encodedOrderReference}/print`;
  const deliveryNoteHref = `/portal/sales/orders/${encodedOrderReference}/delivery-note`;
  const addLineHref = `/portal/sales/orders/${encodedOrderReference}/add-line`;
  const priceVisible = order.priceVisibilityAtOrder;
  const invoiceAddress = getAddressLines(order.customer.addresses, "INVOICE");
  const deliveryAddress = getAddressLines(order.customer.addresses, "DELIVERY");
  const auditEvents = buildOrderAuditPreview(order);
  const isDraft = order.status === "DRAFT_BASKET";
  const canSubmitDraft = isDraft && order.lines.length > 0;

  return (
    <PortalShell
      title={orderReference}
      subtitle={`${order.customer.siteName} · ${order.customer.accountNumber}`}
      activeHref="/portal/sales/orders"
    >
      <div className="mb-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href="/portal/sales/orders"
          className="inline-flex w-fit items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to orders
        </Link>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <LinkButton href={addLineHref} variant="secondary" size="sm">
            <PackagePlus className="mr-2 size-4" />
            Add line
          </LinkButton>

          {isDraft ? (
            <form action={submitManualOrder}>
              <input type="hidden" name="orderReference" value={orderReference} />
              <Button type="submit" size="sm" className="w-full" disabled={!canSubmitDraft}>
                <Send className="mr-2 size-4" />
                Submit order
              </Button>
            </form>
          ) : null}

          <LinkButton href={printHref} variant="secondary" size="sm">
            <Printer className="mr-2 size-4" />
            Print
          </LinkButton>

          <LinkButton href={deliveryNoteHref} variant="secondary" size="sm">
            <Truck className="mr-2 size-4" />
            Delivery note
          </LinkButton>

          {order.status === "AWAITING_PAYMENT" ? (
            <form action={markOrderPaid}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" variant="secondary" size="sm" className="w-full">
                <Banknote className="mr-2 size-4" />
                Paid
              </Button>
            </form>
          ) : null}

          {!isDraft && order.status !== "PROCESSED" && order.status !== "CANCELLED" ? (
            <form action={markOrderProcessed}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" size="sm" className="w-full">
                <Printer className="mr-2 size-4" />
                Process
              </Button>
            </form>
          ) : null}

          {order.status !== "CANCELLED" ? (
            <form action={cancelOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="reference" value={orderReference} />
              <Button type="submit" variant="secondary" size="sm" className="w-full">
                <XCircle className="mr-2 size-4" />
                Cancel
              </Button>
            </form>
          ) : null}

          <LinkButton href={printHref} variant="secondary" size="sm">
            <RotateCcw className="mr-2 size-4" />
            Reprint
          </LinkButton>
        </div>
      </div>

      {isDraft ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-black">Draft manual order</p>
              <p className="mt-1">
                Add product lines, check pricing, then submit the order. It will then appear in the normal processing queue.
              </p>
            </div>

            <form action={submitManualOrder}>
              <input type="hidden" name="orderReference" value={orderReference} />
              <Button type="submit" disabled={!canSubmitDraft}>
                <Send className="mr-2 size-4" />
                Submit order
              </Button>
            </form>
          </div>

          {!order.lines.length ? (
            <p className="mt-3 font-bold">
              Add at least one product line before submitting this order.
            </p>
          ) : null}
        </div>
      ) : null}

      <Card className="portal-card-safe mb-4">
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={getOrderStatusTone(order.status)}>{formatOrderStatus(order.status)}</Badge>
                <Badge tone={getOrderSourceTone(order.source)}>{formatOrderSource(order.source)}</Badge>
                <Badge tone={order.priceVisibilityAtOrder ? "success" : "warning"}>
                  Prices {order.priceVisibilityAtOrder ? "On" : "Off"}
                </Badge>
                {!order.priceVisibilityAtOrder ? <Badge tone="warning">Delivery Note Needed</Badge> : null}
                {order.editedByFreshpac ? <Badge tone="warning">Edited by Freshpac</Badge> : null}
              </div>

              <h2 className="mt-3 break-words text-2xl font-black tracking-tight text-freshpac-charcoal">{orderReference}</h2>
              <p className="break-words text-sm text-freshpac-grey">{order.customer.siteName}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Order date" value={formatDateTime(order.createdAt)} />
                <DetailField
                  label="Delivery"
                  value={`${order.deliveryDay || order.customer.deliveryDay || "Not set"} · ${order.driverOrCourier || order.customer.driverOrCourier || "No driver"}`}
                />
                <DetailField label="Submitted by" value={order.placedByUser?.fullName || "System"} />
                <DetailField label="Customer PO" value={order.customerPoNumber || "None"} />
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
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

      <div className="portal-scroll-panel sticky top-[86px] z-20 mb-4 rounded-2xl border border-freshpac-panel bg-white p-1 shadow-panel">
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
            <LinkButton href={deliveryNoteHref} variant="secondary" size="sm">
              <Truck className="mr-2 size-4" />
              Delivery note
            </LinkButton>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
            <LinkButton href={addLineHref} variant="secondary" size="sm">
              <PackagePlus className="mr-2 size-4" />
              Add line
            </LinkButton>
          }
        >
          <div className="grid gap-3 md:hidden">
            {order.lines.map((line) => (
              <div key={line.id} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                      {line.productCodeSnapshot}
                    </p>
                    <p className="mt-1 break-words font-black text-freshpac-charcoal">{line.descriptionSnapshot}</p>
                    <p className="text-xs text-freshpac-grey">{line.packSizeSnapshot || "No pack size"}</p>
                  </div>

                  {line.lockedFromCustomer ? <Badge tone="warning">Locked</Badge> : <Badge>Editable</Badge>}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge tone={line.source === "RETAIL_ORDER" || line.source === "STANDING_ORDER" ? "warning" : "neutral"}>
                    {formatOrderLineSource(line.source)}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MobileDetail label="Qty" value={String(line.quantity)} />
                  <MobileDetail label="Ex VAT" value={formatOrderMoney(line.priceExVatPence, priceVisible)} />
                  <MobileDetail label="VAT" value={formatOrderMoney(line.vatPence, priceVisible)} />
                  <MobileDetail label="Inc VAT" value={formatOrderMoney(line.priceIncVatPence, priceVisible)} />
                  <MobileDetail label="Total" value={formatOrderMoney(line.lineTotalPence, priceVisible)} />
                  <MobileDetail label="Source" value={formatOrderLineSource(line.source)} />
                </div>
              </div>
            ))}

            {!order.lines.length ? (
              <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                No order lines recorded.
              </div>
            ) : null}
          </div>

          <div className="hidden md:block">
            <div className="portal-scroll-panel">
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
          description="Open the printable order sheet or price-free delivery note, then mark as processed only after print success is confirmed."
          action={
            <LinkButton href={printHref} size="sm">
              <Printer className="mr-2 size-4" />
              Open print sheet
            </LinkButton>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <LinkButton href={printHref} variant="secondary">
              Order sheet PDF
            </LinkButton>

            <LinkButton href={deliveryNoteHref} variant="secondary">
              Delivery note PDF
            </LinkButton>

            <LinkButton href={addLineHref} variant="secondary">
              Add product line
            </LinkButton>

            {isDraft ? (
              <form action={submitManualOrder}>
                <input type="hidden" name="orderReference" value={orderReference} />
                <Button type="submit" className="w-full" disabled={!canSubmitDraft}>
                  Submit order
                </Button>
              </form>
            ) : (
              <form action={markOrderProcessed}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="reference" value={orderReference} />
                <Button type="submit" className="w-full">
                  Confirm print success
                </Button>
              </form>
            )}
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

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">{label}</p>
      <p className="mt-1 break-words text-xs font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}