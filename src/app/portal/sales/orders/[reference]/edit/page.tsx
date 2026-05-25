import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, PackagePlus, Save, ShoppingBasket, Truck } from "lucide-react";
import { updateManualOrderHeader } from "@/app/portal/sales/orders/[reference]/edit/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import {
  getEditableManualOrderReference,
  getManualOrderForHeaderEditFromDb
} from "@/lib/sales/manual-order-edit-db";
import {
  formatDateTime,
  formatDeliveryMethod,
  formatOrderMoney,
  formatOrderSource,
  formatOrderStatus,
  getOrderSourceTone,
  getOrderStatusTone
} from "@/lib/sales/order-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditManualOrderHeaderPage({
  params
}: {
  params: Promise<{
    reference: string;
  }>;
}) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);
  const order = await getManualOrderForHeaderEditFromDb(decodedReference);

  if (!order) {
    notFound();
  }

  const orderReference = getEditableManualOrderReference(order);
  const encodedOrderReference = encodeURIComponent(orderReference);
  const orderHref = `/portal/sales/orders/${encodedOrderReference}`;
  const addLineHref = `/portal/sales/orders/${encodedOrderReference}/add-line`;
  const deliveryNoteHref = `/portal/sales/orders/${encodedOrderReference}/delivery-note`;
  const printHref = `/portal/sales/orders/${encodedOrderReference}/print`;

  return (
    <PortalShell
      title={`Edit ${orderReference}`}
      subtitle={`${order.customer.siteName} · ${order.customer.accountNumber}`}
      activeHref="/portal/sales/orders"
    >
      <div className="mb-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href={orderHref}
          className="inline-flex w-fit items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to order
        </Link>

        <div className="flex flex-wrap gap-2">
          <LinkButton href={addLineHref} size="sm" variant="secondary">
            <PackagePlus className="mr-2 size-4" />
            Lines
          </LinkButton>

          <LinkButton href={printHref} size="sm" variant="secondary">
            <FileText className="mr-2 size-4" />
            Print
          </LinkButton>

          <LinkButton href={deliveryNoteHref} size="sm" variant="secondary">
            <Truck className="mr-2 size-4" />
            Delivery note
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>Current status and totals.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                  {orderReference}
                </p>
                <h2 className="mt-1 text-lg font-black text-freshpac-charcoal">
                  {order.customer.siteName}
                </h2>
                <p className="text-sm text-freshpac-grey">
                  {order.customer.accountNumber}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone={getOrderStatusTone(order.status)}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                  <Badge tone={getOrderSourceTone(order.source)}>
                    {formatOrderSource(order.source)}
                  </Badge>
                  <Badge tone={order.priceVisibilityAtOrder ? "success" : "warning"}>
                    {order.priceVisibilityAtOrder ? "Prices visible" : "Delivery Note Required"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <DetailField label="Lines" value={String(order.lines.length)} />
                <DetailField label="Total" value={formatOrderMoney(order.totalIncVatPence, true)} />
                <DetailField label="Created" value={formatDateTime(order.createdAt)} />
                <DetailField label="Method" value={formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)} />
              </div>

              {order.status === "PROCESSED" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                  This order is already processed. Changes may affect reprints but will not automatically update Sage.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>Header changes affect paperwork and order list details.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <LinkButton href={orderHref} variant="secondary">
                <ShoppingBasket className="mr-2 size-4" />
                View order detail
              </LinkButton>

              <LinkButton href={addLineHref} variant="secondary">
                <PackagePlus className="mr-2 size-4" />
                Add or edit lines
              </LinkButton>
            </CardContent>
          </Card>
        </div>

        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Edit order header</CardTitle>
                <CardDescription>
                  Update delivery, PO and notes without changing product lines.
                </CardDescription>
              </div>

              <Badge tone="warning">Header only</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <form action={updateManualOrderHeader} className="grid gap-5">
              <input type="hidden" name="orderReference" value={orderReference} />

              <section className="grid gap-4 lg:grid-cols-2">
                <FormField
                  label="Customer PO number"
                  name="customerPoNumber"
                  placeholder="Optional PO number"
                  defaultValue={order.customerPoNumber || ""}
                />

                <FormField
                  label="Delivery day"
                  name="deliveryDay"
                  placeholder="Delivery day"
                  defaultValue={order.deliveryDay || order.customer.deliveryDay || ""}
                />

                <FormField
                  label="Driver / courier"
                  name="driverOrCourier"
                  placeholder="Driver or courier"
                  defaultValue={order.driverOrCourier || order.customer.driverOrCourier || ""}
                />

                <FormField
                  label="Delivery method"
                  name="deliveryMethod"
                  placeholder="Delivery method"
                  defaultValue={String(order.deliveryMethod || order.customer.deliveryMethod || "")}
                />
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <TextAreaField
                  label="Customer notes"
                  name="customerNotes"
                  placeholder="Notes that can appear on paperwork..."
                  defaultValue={order.customerNotes || ""}
                />

                <TextAreaField
                  label="Freshpac internal notes"
                  name="internalNotes"
                  placeholder="Internal handling notes..."
                  defaultValue={order.internalNotes || ""}
                />
              </section>

              <section className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
                <p className="text-sm font-black text-freshpac-charcoal">
                  Save will refresh the order detail, print sheet, delivery note and batch paperwork caches.
                </p>
                <p className="mt-1 text-xs font-semibold text-freshpac-grey">
                  Product lines and totals are not changed on this screen.
                </p>
              </section>

              <div className="flex flex-wrap justify-end gap-3">
                <Link
                  href={orderHref}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
                >
                  Cancel
                </Link>

                <Button type="submit">
                  <Save className="mr-2 size-4" />
                  Save header
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

function FormField({
  label,
  name,
  placeholder,
  defaultValue = ""
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
        {label}
      </span>
      <Input
        className="mt-2"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  placeholder,
  defaultValue = ""
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">
        {label}
      </span>
      <Textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 min-h-32"
      />
    </label>
  );
}