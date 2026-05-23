import { notFound } from "next/navigation";
import { PrintActions } from "@/components/print/print-actions";
import {
  formatDateTime,
  formatDeliveryMethod,
  formatOrderLineSource,
  formatOrderMoney,
  formatOrderSource,
  formatOrderStatus,
  getAddressLines,
  getOrderByReferenceFromDb,
  getOrderReference
} from "@/lib/sales/order-db";

export default async function OrderPrintPage({
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
  const backHref = `/portal/sales/orders/${encodeURIComponent(orderReference)}`;

  return (
    <main className="min-h-screen bg-freshpac-cream px-4 py-5 text-freshpac-charcoal print:bg-white print:px-0 print:py-0">
      <style>
        {`
          @page {
            size: A4;
            margin: 10mm;
          }

          @media print {
            html,
            body {
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .print-sheet {
              box-shadow: none !important;
              border: none !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
            }

            .print-avoid-break {
              break-inside: avoid;
            }

            .print-table th,
            .print-table td {
              padding: 5px 6px !important;
              font-size: 10px !important;
            }

            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
            }
          }
        `}
      </style>

      <div className="mx-auto max-w-5xl">
        <PrintActions backHref={backHref} />

        <section className="print-sheet rounded-3xl border border-freshpac-panel bg-white p-6 shadow-panel">
          <header className="border-b-2 border-freshpac-charcoal pb-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
                  Freshpac Teas & Coffees Ltd
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-freshpac-charcoal">
                  Customer Sales Order
                </h1>
                {!priceVisible ? (
                  <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-black text-amber-900">
                    Delivery Note Needed - customer prices are hidden.
                  </div>
                ) : null}
              </div>

              <div className="text-right text-xs leading-5 text-freshpac-charcoal">
                <p className="font-black">Unit B, Broadway Drive</p>
                <p>Halesworth, Suffolk, IP19 8QR</p>
                <p>Tel: 01986 873410</p>
                <p>sales@freshpac.co.uk</p>
                <p>www.freshpac.co.uk</p>
              </div>
            </div>
          </header>

          <section className="print-avoid-break mt-5 grid gap-4 sm:grid-cols-2">
            <InfoCard
              title="Order details"
              rows={[
                ["Order reference", orderReference],
                ["Order status", formatOrderStatus(order.status)],
                ["Order source", formatOrderSource(order.source)],
                ["Order date", formatDateTime(order.createdAt)],
                ["Submitted by", order.placedByUser?.fullName || "System"],
                ["Customer PO", order.customerPoNumber || "None"]
              ]}
            />

            <InfoCard
              title="Delivery details"
              rows={[
                ["Account", order.customer.accountNumber],
                ["Customer", order.customer.siteName],
                ["Delivery day", order.deliveryDay || order.customer.deliveryDay || "Not set"],
                ["Driver / courier", order.driverOrCourier || order.customer.driverOrCourier || "Not set"],
                ["Delivery method", formatDeliveryMethod(order.deliveryMethod || order.customer.deliveryMethod)],
                ["Processed at", order.processedAt ? formatDateTime(order.processedAt) : "Not processed"]
              ]}
            />
          </section>

          <section className="print-avoid-break mt-5 grid gap-4 sm:grid-cols-2">
            <AddressBlock title="Invoice address" lines={invoiceAddress} />
            <AddressBlock title="Delivery address" lines={deliveryAddress} />
          </section>

          <section className="mt-6">
            <div className="mb-2 flex items-end justify-between gap-3">
              <h2 className="text-lg font-black text-freshpac-charcoal">Order lines</h2>
              <p className="text-xs font-semibold text-freshpac-grey">
                Product codes are staff-facing.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-freshpac-panel">
              <table className="print-table w-full border-collapse text-left text-xs">
                <thead className="bg-freshpac-charcoal text-white">
                  <tr>
                    <th className="p-2">Code</th>
                    <th className="p-2">Product description</th>
                    <th className="p-2">Pack</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2">Source</th>
                    {priceVisible ? (
                      <>
                        <th className="p-2 text-right">Price ex VAT</th>
                        <th className="p-2 text-right">VAT</th>
                        <th className="p-2 text-right">Price inc VAT</th>
                        <th className="p-2 text-right">Line total</th>
                      </>
                    ) : null}
                  </tr>
                </thead>

                <tbody>
                  {order.lines.map((line) => (
                    <tr key={line.id} className="border-t border-freshpac-panel">
                      <td className="p-2 font-black">{line.productCodeSnapshot}</td>
                      <td className="p-2">{line.descriptionSnapshot}</td>
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

          <section className="print-avoid-break mt-5 grid gap-4 sm:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-freshpac-panel p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
                Order notes
              </h2>
              <p className="mt-3 min-h-20 text-sm leading-6 text-freshpac-charcoal">
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

            <div className="rounded-2xl border border-freshpac-panel p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
                Totals
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
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-black text-amber-900">
                  Delivery Note Needed
                </div>
              )}
            </div>
          </section>

          <footer className="print-footer mt-8 border-t border-freshpac-panel pt-3 text-center text-[10px] leading-4 text-freshpac-grey">
            Freshpac Teas & Coffees Ltd | Company Registration No. 05958995 | Registered Office: The Octagon Suite E2, 2nd Floor, Middleborough, Colchester, Essex, England, CO1 1TG
          </footer>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-2xl border border-freshpac-panel p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[120px_1fr] gap-3 text-sm">
            <p className="font-bold text-freshpac-grey">{label}</p>
            <p className="font-semibold text-freshpac-charcoal">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-freshpac-panel p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-freshpac-charcoal">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-black" : "font-semibold"}`}>
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}