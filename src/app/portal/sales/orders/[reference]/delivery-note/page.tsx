import { notFound } from "next/navigation";
import { PrintActions } from "@/components/print/print-actions";
import {
  formatDateTime,
  formatDeliveryMethod,
  formatOrderLineSource,
  formatOrderSource,
  formatOrderStatus,
  getAddressLines,
  getOrderByReferenceFromDb,
  getOrderReference
} from "@/lib/sales/order-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const printStyles = `
  @page {
    size: A4;
    margin: 8mm;
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
    }

    .no-print {
      display: none !important;
    }

    .delivery-page {
      width: 194mm !important;
      max-width: 194mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }

    .delivery-sheet {
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .delivery-header {
      padding-bottom: 3mm !important;
      margin-bottom: 3mm !important;
    }

    .delivery-title {
      font-size: 21px !important;
      line-height: 1.1 !important;
    }

    .delivery-meta {
      font-size: 8px !important;
      line-height: 1.3 !important;
    }

    .delivery-info-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr 1fr !important;
      gap: 2mm !important;
      margin-top: 3mm !important;
    }

    .delivery-info-card {
      padding: 2mm !important;
      border-radius: 4px !important;
    }

    .delivery-info-card h2 {
      font-size: 8px !important;
      line-height: 1.2 !important;
      margin-bottom: 1.2mm !important;
    }

    .delivery-info-row {
      display: grid !important;
      grid-template-columns: 22mm 1fr !important;
      gap: 1.5mm !important;
      font-size: 8px !important;
      line-height: 1.18 !important;
      margin-top: 0.7mm !important;
    }

    .delivery-address-text {
      font-size: 8px !important;
      line-height: 1.18 !important;
    }

    .delivery-table-section {
      margin-top: 3mm !important;
    }

    .delivery-table-title {
      font-size: 11px !important;
      line-height: 1.2 !important;
      margin-bottom: 1.5mm !important;
    }

    .delivery-table {
      table-layout: fixed !important;
      width: 100% !important;
      border-collapse: collapse !important;
    }

    .delivery-table th {
      padding: 1.5mm 1.2mm !important;
      font-size: 7.5px !important;
      line-height: 1.1 !important;
      vertical-align: middle !important;
    }

    .delivery-table td {
      padding: 1.25mm 1.2mm !important;
      font-size: 8px !important;
      line-height: 1.12 !important;
      vertical-align: middle !important;
    }

    .delivery-table tbody tr {
      height: 5.8mm !important;
      max-height: 5.8mm !important;
    }

    .delivery-description {
      display: block !important;
      max-height: 9px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      text-overflow: ellipsis !important;
    }

    .delivery-notes-grid {
      display: grid !important;
      grid-template-columns: 1fr 62mm !important;
      gap: 3mm !important;
      margin-top: 3mm !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .delivery-notes-box,
    .delivery-signature-box {
      padding: 2.5mm !important;
      border-radius: 4px !important;
    }

    .delivery-notes-box h2,
    .delivery-signature-box h2 {
      font-size: 8px !important;
      line-height: 1.2 !important;
    }

    .delivery-notes-text {
      min-height: 18mm !important;
      font-size: 8px !important;
      line-height: 1.3 !important;
      margin-top: 1.5mm !important;
    }

    .signature-line {
      margin-top: 11mm !important;
      padding-top: 2mm !important;
      font-size: 8px !important;
    }

    .delivery-footer {
      margin-top: 4mm !important;
      padding-top: 2mm !important;
      font-size: 6.8px !important;
      line-height: 1.2 !important;
    }
  }

  @media screen {
    .delivery-page {
      max-width: 1100px;
    }
  }
`;

export default async function DeliveryNotePrintPage({
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
  const deliveryAddress = getAddressLines(order.customer.addresses, "DELIVERY");
  const invoiceAddress = getAddressLines(order.customer.addresses, "INVOICE");
  const backHref = `/portal/sales/orders/${encodeURIComponent(orderReference)}`;

  return (
    <main className="min-h-screen bg-freshpac-cream px-4 py-5 text-freshpac-charcoal print:bg-white print:px-0 print:py-0">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="delivery-page mx-auto">
        <PrintActions backHref={backHref} />

        <section className="delivery-sheet rounded-3xl border border-freshpac-panel bg-white p-6 shadow-panel">
          <header className="delivery-header border-b-2 border-freshpac-charcoal pb-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
                  Freshpac Teas & Coffees Ltd
                </p>
                <h1 className="delivery-title mt-2 text-3xl font-black tracking-tight text-freshpac-charcoal">
                  Delivery Note
                </h1>
                <p className="delivery-meta mt-2 text-sm font-semibold text-freshpac-grey">
                  No customer prices shown on this document.
                </p>
              </div>

              <div className="delivery-meta text-right text-xs leading-5 text-freshpac-charcoal">
                <p className="font-black">Unit B, Broadway Drive</p>
                <p>Halesworth, Suffolk, IP19 8QR</p>
                <p>Tel: 01986 873410</p>
                <p>sales@freshpac.co.uk</p>
                <p>www.freshpac.co.uk</p>
              </div>
            </div>
          </header>

          <section className="delivery-info-grid mt-5 grid gap-4 lg:grid-cols-3">
            <InfoCard
              title="Order details"
              rows={[
                ["Order ref", orderReference],
                ["Status", formatOrderStatus(order.status)],
                ["Source", formatOrderSource(order.source)],
                ["Date", formatDateTime(order.createdAt)],
                ["PO", order.customerPoNumber || "None"],
                ["Lines", String(order.lines.length)]
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
                ["Contact", "See customer account"]
              ]}
            />

            <div className="delivery-info-card rounded-2xl border border-freshpac-panel p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
                Addresses
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <AddressMiniBlock title="Delivery" lines={deliveryAddress} />
                <AddressMiniBlock title="Invoice" lines={invoiceAddress} />
              </div>
            </div>
          </section>

          <section className="delivery-table-section mt-6">
            <h2 className="delivery-table-title text-lg font-black text-freshpac-charcoal">
              Delivered items
            </h2>

            <div className="overflow-hidden rounded-2xl border border-freshpac-panel">
              <table className="delivery-table w-full border-collapse text-left text-xs">
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "48%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>

                <thead className="bg-freshpac-charcoal text-white">
                  <tr>
                    <th className="p-2">Product Code</th>
                    <th className="p-2">Product Description</th>
                    <th className="p-2">Pack Size</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2">Source</th>
                  </tr>
                </thead>

                <tbody>
                  {order.lines.map((line) => (
                    <tr key={line.id} className="border-t border-freshpac-panel">
                      <td className="p-2 font-black">{line.productCodeSnapshot}</td>
                      <td className="p-2">
                        <span className="delivery-description">{line.descriptionSnapshot}</span>
                      </td>
                      <td className="p-2">{line.packSizeSnapshot || "None"}</td>
                      <td className="p-2 text-right font-black">{line.quantity}</td>
                      <td className="p-2">{formatOrderLineSource(line.source)}</td>
                    </tr>
                  ))}

                  {!order.lines.length ? (
                    <tr>
                      <td className="p-4 text-sm text-freshpac-grey" colSpan={5}>
                        No order lines recorded.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="delivery-notes-grid mt-5 grid gap-4 sm:grid-cols-[1fr_320px]">
            <div className="delivery-notes-box rounded-2xl border border-freshpac-panel p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
                Delivery notes
              </h2>
              <p className="delivery-notes-text mt-3 min-h-20 text-sm leading-6 text-freshpac-charcoal">
                {order.customerNotes || "No customer delivery notes recorded."}
              </p>
            </div>

            <div className="delivery-signature-box rounded-2xl border border-freshpac-panel p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
                Customer receipt
              </h2>

              <div className="signature-line border-t border-freshpac-charcoal pt-3 text-sm font-semibold text-freshpac-grey">
                Name / signature
              </div>

              <div className="signature-line border-t border-freshpac-charcoal pt-3 text-sm font-semibold text-freshpac-grey">
                Date
              </div>
            </div>
          </section>

          <footer className="delivery-footer mt-8 border-t border-freshpac-panel pt-3 text-center text-[10px] leading-4 text-freshpac-grey">
            Freshpac Teas & Coffees Ltd | Company Registration No. 05958995 | Registered Office: The Octagon Suite E2, 2nd Floor, Middleborough, Colchester, Essex, England, CO1 1TG
          </footer>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="delivery-info-card rounded-2xl border border-freshpac-panel p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="delivery-info-row grid grid-cols-[120px_1fr] gap-3 text-sm">
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
      <div className="delivery-address-text mt-1 text-sm leading-5 text-freshpac-charcoal">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}