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
      padding-bottom: 2.5mm !important;
      margin-bottom: 2.5mm !important;
    }

    .delivery-title {
      font-size: 20px !important;
      line-height: 1.05 !important;
    }

    .delivery-meta {
      font-size: 7.8px !important;
      line-height: 1.22 !important;
    }

    .delivery-banner-stack {
      display: grid !important;
      gap: 1.5mm !important;
      margin-top: 2mm !important;
    }

    .delivery-portal-banner,
    .delivery-no-price-banner {
      padding: 1.7mm 2mm !important;
      border-radius: 4px !important;
      border-width: 1.4px !important;
      font-size: 8px !important;
      line-height: 1.15 !important;
    }

    .delivery-portal-banner-title,
    .delivery-no-price-banner-title {
      font-size: 10px !important;
      line-height: 1.05 !important;
      letter-spacing: 0.07em !important;
    }

    .delivery-portal-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr 1fr !important;
      gap: 1.5mm !important;
      margin-top: 1.2mm !important;
    }

    .delivery-portal-box {
      padding: 1mm !important;
      border-radius: 3px !important;
      font-size: 7.4px !important;
      line-height: 1.12 !important;
    }

    .delivery-info-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr 1fr !important;
      gap: 2mm !important;
      margin-top: 2.5mm !important;
    }

    .delivery-info-card {
      padding: 1.8mm !important;
      border-radius: 4px !important;
    }

    .delivery-info-card h2 {
      font-size: 7.8px !important;
      line-height: 1.15 !important;
      margin-bottom: 1mm !important;
    }

    .delivery-info-row {
      display: grid !important;
      grid-template-columns: 21mm 1fr !important;
      gap: 1.3mm !important;
      font-size: 7.6px !important;
      line-height: 1.13 !important;
      margin-top: 0.6mm !important;
    }

    .delivery-address-text {
      font-size: 7.6px !important;
      line-height: 1.13 !important;
    }

    .delivery-table-section {
      margin-top: 2.5mm !important;
    }

    .delivery-table-title {
      font-size: 10.5px !important;
      line-height: 1.15 !important;
      margin-bottom: 1.2mm !important;
    }

    .delivery-table {
      table-layout: fixed !important;
      width: 100% !important;
      border-collapse: collapse !important;
    }

    .delivery-table th {
      padding: 1.2mm 1mm !important;
      font-size: 7.2px !important;
      line-height: 1.05 !important;
      vertical-align: middle !important;
    }

    .delivery-table td {
      padding: 1mm 1mm !important;
      font-size: 7.7px !important;
      line-height: 1.08 !important;
      vertical-align: middle !important;
    }

    .delivery-table tbody tr {
      height: 5.4mm !important;
      max-height: 5.4mm !important;
    }

    .delivery-description {
      display: block !important;
      max-height: 8.5px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
      text-overflow: ellipsis !important;
    }

    .delivery-notes-grid {
      display: grid !important;
      grid-template-columns: 1fr 62mm !important;
      gap: 2.5mm !important;
      margin-top: 2.5mm !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .delivery-notes-box,
    .delivery-signature-box {
      padding: 2mm !important;
      border-radius: 4px !important;
    }

    .delivery-notes-box h2,
    .delivery-signature-box h2 {
      font-size: 7.8px !important;
      line-height: 1.15 !important;
    }

    .delivery-notes-text {
      min-height: 15mm !important;
      font-size: 7.8px !important;
      line-height: 1.22 !important;
      margin-top: 1.2mm !important;
    }

    .signature-line {
      margin-top: 10mm !important;
      padding-top: 1.8mm !important;
      font-size: 7.8px !important;
    }

    .delivery-footer {
      margin-top: 3mm !important;
      padding-top: 1.5mm !important;
      font-size: 6.5px !important;
      line-height: 1.15 !important;
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
  const isCustomerPortalOrder = order.source === "CUSTOMER_PORTAL";

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

                <div className="delivery-banner-stack">
                  <div className="delivery-no-price-banner rounded-xl border-2 border-freshpac-charcoal bg-freshpac-cream p-3 text-sm font-black text-freshpac-charcoal">
                    <p className="delivery-no-price-banner-title uppercase">
                      No Prices Shown
                    </p>
                    <p className="mt-1">
                      This document is safe for delivery/customer paperwork and does not show customer pricing.
                    </p>
                  </div>

                  {isCustomerPortalOrder ? (
                    <div className="delivery-portal-banner rounded-xl border-2 border-blue-700 bg-blue-50 p-3 text-sm font-black text-blue-950">
                      <p className="delivery-portal-banner-title uppercase">
                        Customer Portal Order
                      </p>
                      <p className="mt-1">
                        This order was submitted online by the customer. Check PO reference and delivery notes before dispatch.
                      </p>

                      <div className="delivery-portal-grid mt-2 grid gap-2 sm:grid-cols-3">
                        <PortalDeliveryBox
                          label="PO reference"
                          value={order.customerPoNumber || "Not supplied"}
                        />
                        <PortalDeliveryBox
                          label="Submitted by"
                          value={order.placedByUser?.fullName || "Customer portal user"}
                        />
                        <PortalDeliveryBox
                          label="Pricing"
                          value="No prices shown"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
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
            <div
              className={`delivery-notes-box rounded-2xl border p-4 ${
                isCustomerPortalOrder
                  ? "border-blue-200 bg-blue-50"
                  : "border-freshpac-panel bg-white"
              }`}
            >
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-freshpac-grey">
                Delivery notes
              </h2>

              {isCustomerPortalOrder ? (
                <p className="mt-2 rounded-xl border border-blue-200 bg-white p-2 text-xs font-black text-blue-950">
                  Customer portal note area. Check this before dispatch.
                </p>
              ) : null}

              <p className="delivery-notes-text mt-3 min-h-20 whitespace-pre-wrap text-sm leading-6 text-freshpac-charcoal">
                {order.customerNotes || "No customer delivery notes recorded."}
              </p>

              {order.customerPoNumber ? (
                <p className="mt-3 rounded-xl border border-blue-200 bg-white p-2 text-xs font-black text-blue-950">
                  PO reference: {order.customerPoNumber}
                </p>
              ) : null}
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

function PortalDeliveryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="delivery-portal-box rounded-lg border border-blue-200 bg-white p-2">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-900">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}