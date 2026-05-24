import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { confirmFilteredOrdersPrinted } from "@/app/portal/sales/orders/print/actions";
import { PrintActions } from "@/components/print/print-actions";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatDeliveryMethod,
  formatOrderLineSource,
  formatOrderMoney,
  formatOrderSource,
  formatOrderStatus,
  getAddressLines,
  getOrderReference
} from "@/lib/sales/order-db";
import {
  getPrintableOrderListFromDb,
  getProcessablePrintedOrderCountFromDb
} from "@/lib/sales/order-print-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PrintableOrder = Awaited<ReturnType<typeof getPrintableOrderListFromDb>>[number];

const printStyles = `
  @page {
    size: A4;
    margin: 7mm;
  }

  @media print {
    html,
    body {
      width: 210mm;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      overflow: visible !important;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    main {
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      overflow: visible !important;
    }

    .no-print {
      display: none !important;
    }

    .batch-print-shell {
      width: 196mm !important;
      max-width: 196mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }

    .batch-print-page {
      width: 196mm !important;
      max-width: 196mm !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 auto !important;
      padding: 0 !important;
      break-after: page;
      page-break-after: always;
    }

    .batch-print-page:last-child {
      break-after: auto !important;
      page-break-after: auto !important;
    }

    .print-sheet {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    .print-avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-compact-header {
      padding-bottom: 2.5mm !important;
      margin-bottom: 2.5mm !important;
    }

    .print-title {
      font-size: 18px !important;
      line-height: 1.1 !important;
      margin-top: 2mm !important;
    }

    .print-company-text {
      font-size: 8px !important;
      line-height: 1.25 !important;
    }

    .delivery-required-banner {
      padding: 2mm !important;
      margin-top: 2mm !important;
      border-width: 1.5px !important;
      font-size: 9px !important;
      line-height: 1.18 !important;
    }

    .delivery-required-banner-title {
      font-size: 12px !important;
      line-height: 1.05 !important;
      letter-spacing: 0.08em !important;
    }

    .print-info-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr 1fr !important;
      gap: 2mm !important;
      margin-top: 2.5mm !important;
    }

    .print-info-card {
      padding: 2mm !important;
      border-radius: 4px !important;
    }

    .print-info-card h2 {
      font-size: 8px !important;
      line-height: 1.2 !important;
      margin-bottom: 1.2mm !important;
    }

    .print-info-row {
      display: grid !important;
      grid-template-columns: 22mm 1fr !important;
      gap: 1.5mm !important;
      font-size: 8px !important;
      line-height: 1.18 !important;
      margin-top: 0.7mm !important;
    }

    .print-address-text {
      font-size: 8px !important;
      line-height: 1.18 !important;
    }

    .print-lines-section {
      margin-top: 2.5mm !important;
    }

    .print-lines-title {
      font-size: 11px !important;
      line-height: 1.2 !important;
      margin-bottom: 1.2mm !important;
    }

    .print-table {
      table-layout: fixed !important;
      width: 100% !important;
      border-collapse: collapse !important;
    }

    .print-table th {
      padding: 1.2mm 1mm !important;
      font-size: 7.3px !important;
      line-height: 1.05 !important;
      vertical-align: middle !important;
    }

    .print-table td {
      padding: 1mm 1mm !important;
      font-size: 7.8px !important;
      line-height: 1.08 !important;
      vertical-align: middle !important;
    }

    .print-table tbody tr {
      height: 5.4mm !important;
      max-height: 5.4mm !important;
    }

    .print-line-description {
      display: block !important;
      max-height: 8.5px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      text-overflow: ellipsis !important;
    }

    .print-after-lines {
      margin-top: 2.5mm !important;
      display: grid !important;
      grid-template-columns: 1fr 52mm !important;
      gap: 2.5mm !important;
    }

    .print-notes-box,
    .print-totals-box {
      padding: 2mm !important;
      border-radius: 4px !important;
    }

    .print-notes-box h2,
    .print-totals-box h2 {
      font-size: 8px !important;
      line-height: 1.2 !important;
    }

    .print-notes-text {
      min-height: 12mm !important;
      font-size: 8px !important;
      line-height: 1.25 !important;
      margin-top: 1.5mm !important;
    }

    .print-total-row {
      font-size: 8.3px !important;
      line-height: 1.18 !important;
      margin-top: 0.8mm !important;
    }

    .print-total-row-strong {
      font-size: 10.5px !important;
      line-height: 1.15 !important;
    }

    .print-footer {
      display: block !important;
      position: static !important;
      margin-top: 2.5mm !important;
      margin-bottom: 0 !important;
      padding-top: 1.5mm !important;
      padding-bottom: 0 !important;
      font-size: 6.6px !important;
      line-height: 1.15 !important;
      break-after: auto !important;
      page-break-after: auto !important;
    }

    .screen-only {
      display: none !important;
    }
  }

  @media screen {
    .batch-print-shell {
      max-width: 1100px;
    }

    .batch-print-page + .batch-print-page {
      margin-top: 24px;
    }
  }
`;

export default async function BatchOrderPrintPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    status?: string;
    source?: string;
  };
}) {
  const q = searchParams?.q || "";
  const status = searchParams?.status || "NEEDS_PRINT";
  const source = searchParams?.source || "ALL";

  const [orders, processableCount] = await Promise.all([
    getPrintableOrderListFromDb({
      q,
      status,
      source
    }),
    getProcessablePrintedOrderCountFromDb({
      q,
      status,
      source
    })
  ]);

  const backHref = buildOrdersBackHref({ q, status, source });

  return (
    <main className="min-h-screen bg-freshpac-cream px-4 py-5 text-freshpac-charcoal print:bg-white print:px-0 print:py-0">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="batch-print-shell mx-auto">
        <PrintActions backHref={backHref} />

        <div className="no-print mb-4 rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black text-freshpac-charcoal">Batch order print</p>
              <p className="mt-1 text-sm text-freshpac-grey">
                Printing {orders.length} order sheet{orders.length === 1 ? "" : "s"} from the current filtered order list.
                {processableCount > 0
                  ? ` ${processableCount} can be marked as processed after successful printing.`
                  : " No orders in this batch can currently be marked as processed."}
              </p>
            </div>

            <form action={confirmFilteredOrdersPrinted}>
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="source" value={source} />

              <Button type="submit" disabled={processableCount === 0}>
                <CheckCircle2 className="mr-2 size-4" />
                Confirm printed successfully
              </Button>
            </form>
          </div>
        </div>

        {orders.map((order) => (
          <OrderSheet key={order.id} order={order} />
        ))}

        {!orders.length ? (
          <div className="rounded-2xl border border-freshpac-panel bg-white p-6 text-sm text-freshpac-grey shadow-panel">
            No matching orders found for this batch print.
            <div className="mt-4">
              <Link
                href="/portal/sales/orders"
                className="inline-flex rounded-xl bg-freshpac-orange px-4 py-2 text-sm font-black text-freshpac-charcoal hover:bg-orange-400"
              >
                Back to orders
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function OrderSheet({ order }: { order: PrintableOrder }) {
  const orderReference = getOrderReference(order);
  const priceVisible = order.priceVisibilityAtOrder;
  const invoiceAddress = getAddressLines(order.customer.addresses, "INVOICE");
  const deliveryAddress = getAddressLines(order.customer.addresses, "DELIVERY");

  return (
    <section className="batch-print-page">
      <div className="print-sheet rounded-3xl border border-freshpac-panel bg-white p-6 shadow-panel">
        <header className="print-compact-header border-b-2 border-freshpac-charcoal pb-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
                Freshpac Teas & Coffees Ltd
              </p>
              <h1 className="print-title mt-2 text-3xl font-black tracking-tight text-freshpac-charcoal">
                Customer Sales Order
              </h1>

              {!priceVisible ? (
                <div className="delivery-required-banner mt-3 rounded-xl border-2 border-red-700 bg-red-50 p-3 text-sm font-black text-red-900">
                  <p className="delivery-required-banner-title uppercase">
                    Delivery Note Required
                  </p>
                  <p className="mt-1">
                    Do not send this priced order sheet to the customer. Print the price-free Delivery Note for delivery/customer paperwork.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="print-company-text text-right text-xs leading-5 text-freshpac-charcoal">
              <p className="font-black">Unit B, Broadway Drive</p>
              <p>Halesworth, Suffolk, IP19 8QR</p>
              <p>Tel: 01986 873410</p>
              <p>sales@freshpac.co.uk</p>
              <p>www.freshpac.co.uk</p>
            </div>
          </div>
        </header>

        <section className="print-info-grid mt-5 grid gap-4 lg:grid-cols-3">
          <InfoCard
            title="Order details"
            rows={[
              ["Order ref", orderReference],
              ["Status", formatOrderStatus(order.status)],
              ["Source", formatOrderSource(order.source)],
              ["Date", formatDateTime(order.createdAt)],
              ["By", order.placedByUser?.fullName || "System"],
              ["PO", order.customerPoNumber || "None"]
            ]}
          />

          <InfoCard
            title="Delivery details"
            rows={[
              ["Account", order.customer.accountNumber],
              ["Customer", order.customer.siteName],
              ["Day", order.deliveryDay || order.customer.deliveryDay || "Not set"],
              ["Driver", order.driverOrCourier || order.customer.driverOrCourier || "Not set"],
              ["Method", formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)],
              ["Processed", order.processedAt ? formatDateTime(order.processedAt) : "Not processed"]
            ]}
          />

          <div className="print-info-card rounded-2xl border border-freshpac-panel p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
              Addresses
            </h2>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <AddressMiniBlock title="Invoice" lines={invoiceAddress} />
              <AddressMiniBlock title="Delivery" lines={deliveryAddress} />
            </div>
          </div>
        </section>

        <section className="print-lines-section mt-6">
          <div className="mb-2 flex items-end justify-between gap-3">
            <h2 className="print-lines-title text-lg font-black text-freshpac-charcoal">Order lines</h2>
            <p className="screen-only text-xs font-semibold text-freshpac-grey">
              Compact print layout designed to fit at least 20 lines on page one.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-freshpac-panel">
            <table className="print-table w-full border-collapse text-left text-xs">
              <colgroup>
                {priceVisible ? (
                  <>
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "29%" }} />
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "7%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "9%" }} />
                  </>
                ) : (
                  <>
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "47%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "14%" }} />
                  </>
                )}
              </colgroup>

              <thead className="bg-freshpac-charcoal text-white">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Product description</th>
                  <th className="p-2">Pack</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2">Source</th>
                  {priceVisible ? (
                    <>
                      <th className="p-2 text-right">Ex VAT</th>
                      <th className="p-2 text-right">VAT</th>
                      <th className="p-2 text-right">Inc VAT</th>
                      <th className="p-2 text-right">Total</th>
                    </>
                  ) : null}
                </tr>
              </thead>

              <tbody>
                {order.lines.map((line) => (
                  <tr key={line.id} className="border-t border-freshpac-panel">
                    <td className="p-2 font-black">{line.productCodeSnapshot}</td>
                    <td className="p-2">
                      <span className="print-line-description">{line.descriptionSnapshot}</span>
                    </td>
                    <td className="p-2">{line.packSizeSnapshot || "None"}</td>
                    <td className="p-2 text-right font-black">{line.quantity}</td>
                    <td className="p-2">{formatOrderLineSource(line.source)}</td>
                    {priceVisible ? (
                      <>
                        <td className="p-2 text-right">{formatOrderMoney(line.priceExVatPence, true)}</td>
                        <td className="p-2 text-right">{formatOrderMoney(line.vatPence, true)}</td>
                        <td className="p-2 text-right">{formatOrderMoney(line.priceIncVatPence, true)}</td>
                        <td className="p-2 text-right font-black">{formatOrderMoney(line.lineTotalPence, true)}</td>
                      </>
                    ) : null}
                  </tr>
                ))}

                {!order.lines.length ? (
                  <tr>
                    <td className="p-4 text-sm text-freshpac-grey" colSpan={priceVisible ? 9 : 5}>
                      No order lines recorded.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="print-after-lines print-avoid-break mt-5 grid gap-4 sm:grid-cols-[1fr_320px]">
          <div className="print-notes-box rounded-2xl border border-freshpac-panel p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
              Order notes
            </h2>
            <p className="print-notes-text mt-3 min-h-20 text-sm leading-6 text-freshpac-charcoal">
              {order.customerNotes || "No customer notes recorded."}
            </p>

            {order.internalNotes ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-900">
                  Freshpac internal note
                </p>
                <p className="mt-2 text-sm text-amber-900">{order.internalNotes}</p>
              </div>
            ) : null}
          </div>

          <div className="print-totals-box rounded-2xl border border-freshpac-panel p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
              Totals / paperwork
            </h2>

            {priceVisible ? (
              <div className="mt-3 space-y-2 text-sm">
                <TotalRow label="Total ex VAT" value={formatOrderMoney(order.totalExVatPence, true)} />
                <TotalRow label="VAT total" value={formatOrderMoney(order.vatTotalPence, true)} />
                <TotalRow label="Carriage" value={formatOrderMoney(order.carriageIncVatPence, true)} />
                <div className="border-t border-freshpac-panel pt-2">
                  <TotalRow label="Total inc VAT" value={formatOrderMoney(order.totalIncVatPence, true)} strong />
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border-2 border-red-700 bg-red-50 p-3 text-sm font-black text-red-900">
                DELIVERY NOTE REQUIRED
                <p className="mt-1 text-xs font-bold">
                  Print the delivery note before this order leaves Freshpac.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="print-footer mt-8 border-t border-freshpac-panel pt-3 text-center text-[10px] leading-4 text-freshpac-grey">
          Freshpac Teas & Coffees Ltd | Company Registration No. 05958995 | Registered Office: The Octagon Suite E2, 2nd Floor, Middleborough, Colchester, Essex, England, CO1 1TG
        </footer>
      </div>
    </section>
  );
}

function buildOrdersBackHref({
  q,
  status,
  source
}: {
  q: string;
  status: string;
  source: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status && status !== "ALL") params.set("status", status);
  if (source && source !== "ALL") params.set("source", source);

  const query = params.toString();

  return query ? `/portal/sales/orders?${query}` : "/portal/sales/orders";
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="print-info-card rounded-2xl border border-freshpac-panel p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="print-info-row grid grid-cols-[120px_1fr] gap-3 text-sm">
            <p className="font-bold text-freshpac-grey">{label}</p>
            <p className="font-semibold text-freshpac-charcoal">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressMiniBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-freshpac-grey">{title}</p>
      <div className="print-address-text mt-1 text-sm leading-5 text-freshpac-charcoal">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`print-total-row flex items-center justify-between gap-4 ${
        strong ? "print-total-row-strong text-lg font-black" : "font-semibold"
      }`}
    >
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}