import Link from "next/link";
import { PrintActions } from "@/components/print/print-actions";
import { formatDateTime, getOrderReference } from "@/lib/sales/order-db";
import { getPrintableOrderListFromDb } from "@/lib/sales/order-print-db";

export type PickListKind = "GENERAL" | "COFFEE" | "RETAIL";

export type PickListSearchParams = {
  q?: string;
  status?: string;
  source?: string;
};

type PrintableOrder = Awaited<ReturnType<typeof getPrintableOrderListFromDb>>[number];

type PickCustomerLine = {
  orderReference: string;
  accountNumber: string;
  siteName: string;
  deliveryDay: string;
  driverOrCourier: string;
  quantity: number;
};

type PickLine = {
  key: string;
  productCode: string;
  description: string;
  packSize: string;
  totalQuantity: number;
  customers: PickCustomerLine[];
};

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

    .pick-shell {
      width: 194mm !important;
      max-width: 194mm !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }

    .pick-sheet {
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .pick-header {
      padding-bottom: 3mm !important;
      margin-bottom: 3mm !important;
    }

    .pick-title {
      font-size: 20px !important;
      line-height: 1.1 !important;
    }

    .pick-meta {
      font-size: 8px !important;
      line-height: 1.3 !important;
    }

    .pick-summary {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 2mm !important;
      margin: 3mm 0 !important;
    }

    .pick-summary-card {
      padding: 2mm !important;
      border-radius: 4px !important;
    }

    .pick-summary-card p:first-child {
      font-size: 7px !important;
      line-height: 1.1 !important;
    }

    .pick-summary-card p:last-child {
      font-size: 13px !important;
      line-height: 1.1 !important;
      margin-top: 1mm !important;
    }

    .pick-table {
      table-layout: fixed !important;
      width: 100% !important;
      border-collapse: collapse !important;
    }

    .pick-table th {
      padding: 1.5mm 1.2mm !important;
      font-size: 7.5px !important;
      line-height: 1.1 !important;
      vertical-align: middle !important;
    }

    .pick-table td {
      padding: 1.2mm 1.2mm !important;
      font-size: 8px !important;
      line-height: 1.12 !important;
      vertical-align: top !important;
    }

    .pick-product-row {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .pick-description {
      display: block !important;
      max-height: 18px !important;
      overflow: hidden !important;
    }

    .pick-customer-list {
      font-size: 7.4px !important;
      line-height: 1.25 !important;
    }

    .pick-footer {
      margin-top: 4mm !important;
      padding-top: 2mm !important;
      font-size: 6.8px !important;
      line-height: 1.2 !important;
    }
  }

  @media screen {
    .pick-shell {
      max-width: 1100px;
    }
  }
`;

export async function OrderPickListPrintView({
  searchParams,
  kind,
  title,
  description
}: {
  searchParams?: PickListSearchParams;
  kind: PickListKind;
  title: string;
  description: string;
}) {
  const q = searchParams?.q || "";
  const status = searchParams?.status || "NEEDS_PRINT";
  const source = searchParams?.source || "ALL";

  const orders = await getPrintableOrderListFromDb({
    q,
    status,
    source
  });

  const pickLines = buildPickLines(orders, kind);
  const backHref = buildOrdersBackHref({ q, status, source });
  const totalUnits = pickLines.reduce((total, line) => total + line.totalQuantity, 0);

  return (
    <main className="min-h-screen bg-freshpac-cream px-4 py-5 text-freshpac-charcoal print:bg-white print:px-0 print:py-0">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="pick-shell mx-auto">
        <PrintActions backHref={backHref} />

        <section className="pick-sheet rounded-3xl border border-freshpac-panel bg-white p-6 shadow-panel">
          <header className="pick-header border-b-2 border-freshpac-charcoal pb-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
                  Freshpac Teas & Coffees Ltd
                </p>
                <h1 className="pick-title mt-2 text-3xl font-black tracking-tight text-freshpac-charcoal">
                  {title}
                </h1>
                <p className="pick-meta mt-2 text-sm font-semibold text-freshpac-grey">
                  {description}
                </p>
                <p className="pick-meta mt-1 text-sm font-semibold text-freshpac-grey">
                  Generated {formatDateTime(new Date())} from {orders.length} order
                  {orders.length === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="pick-meta text-right text-xs leading-5 text-freshpac-charcoal">
                <p className="font-black">Unit B, Broadway Drive</p>
                <p>Halesworth, Suffolk, IP19 8QR</p>
                <p>Tel: 01986 873410</p>
                <p>sales@freshpac.co.uk</p>
                <p>www.freshpac.co.uk</p>
              </div>
            </div>
          </header>

          <section className="pick-summary grid gap-3 sm:grid-cols-4">
            <SummaryCard label="Orders" value={String(orders.length)} />
            <SummaryCard label="Product lines" value={String(pickLines.length)} />
            <SummaryCard label="Total units" value={String(totalUnits)} />
            <SummaryCard label="Filter" value={status === "ALL" ? "All" : status.replace(/_/g, " ")} />
          </section>

          <section className="overflow-hidden rounded-2xl border border-freshpac-panel">
            <table className="pick-table w-full border-collapse text-left text-xs">
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "34%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "32%" }} />
              </colgroup>

              <thead className="bg-freshpac-charcoal text-white">
                <tr>
                  <th className="p-2">Product Code</th>
                  <th className="p-2">Product Description</th>
                  <th className="p-2">Pack Size</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2">Customers / Orders</th>
                </tr>
              </thead>

              <tbody>
                {pickLines.map((line) => (
                  <tr key={line.key} className="pick-product-row border-t border-freshpac-panel">
                    <td className="p-2 font-black">{line.productCode}</td>
                    <td className="p-2">
                      <span className="pick-description">{line.description}</span>
                    </td>
                    <td className="p-2">{line.packSize}</td>
                    <td className="p-2 text-right text-lg font-black">{line.totalQuantity}</td>
                    <td className="p-2">
                      <div className="pick-customer-list space-y-1">
                        {line.customers.map((customer) => (
                          <p key={`${line.key}-${customer.orderReference}-${customer.accountNumber}`}>
                            <span className="font-black">{customer.quantity}</span>
                            {" × "}
                            {customer.siteName}
                            {" · "}
                            {customer.orderReference}
                            {" · "}
                            {customer.deliveryDay}
                            {" · "}
                            {customer.driverOrCourier}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}

                {!pickLines.length ? (
                  <tr>
                    <td className="p-4 text-sm text-freshpac-grey" colSpan={5}>
                      No product lines found for this pick list.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>

          <footer className="pick-footer mt-8 border-t border-freshpac-panel pt-3 text-center text-[10px] leading-4 text-freshpac-grey">
            Freshpac Teas & Coffees Ltd | Company Registration No. 05958995 | Registered Office: The Octagon Suite E2, 2nd Floor, Middleborough, Colchester, Essex, England, CO1 1TG
          </footer>
        </section>

        {!orders.length ? (
          <div className="no-print mt-4 rounded-2xl border border-freshpac-panel bg-white p-6 text-sm text-freshpac-grey shadow-panel">
            No matching orders found for this pick list.
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

function buildPickLines(orders: PrintableOrder[], kind: PickListKind): PickLine[] {
  const pickMap = new Map<string, PickLine>();

  for (const order of orders) {
    const orderReference = getOrderReference(order);

    for (const line of order.lines) {
      if (!lineMatchesKind(line, kind)) {
        continue;
      }

      const packSize = line.packSizeSnapshot || "None";
      const key = `${line.productCodeSnapshot}||${line.descriptionSnapshot}||${packSize}`;

      const customerLine: PickCustomerLine = {
        orderReference,
        accountNumber: order.customer.accountNumber,
        siteName: order.customer.siteName,
        deliveryDay: order.deliveryDay || order.customer.deliveryDay || "Not set",
        driverOrCourier: order.driverOrCourier || order.customer.driverOrCourier || "No driver",
        quantity: line.quantity
      };

      const existing = pickMap.get(key);

      if (existing) {
        existing.totalQuantity += line.quantity;
        existing.customers.push(customerLine);
      } else {
        pickMap.set(key, {
          key,
          productCode: line.productCodeSnapshot,
          description: line.descriptionSnapshot,
          packSize,
          totalQuantity: line.quantity,
          customers: [customerLine]
        });
      }
    }
  }

  return Array.from(pickMap.values()).sort((first, second) => {
    const codeCompare = first.productCode.localeCompare(second.productCode);

    if (codeCompare !== 0) {
      return codeCompare;
    }

    return first.description.localeCompare(second.description);
  });
}

function lineMatchesKind(line: PrintableOrder["lines"][number], kind: PickListKind) {
  if (kind === "GENERAL") {
    return true;
  }

  const code = line.productCodeSnapshot.toLowerCase();
  const description = line.descriptionSnapshot.toLowerCase();
  const packSize = (line.packSizeSnapshot || "").toLowerCase();
  const haystack = `${code} ${description} ${packSize}`;

  if (kind === "COFFEE") {
    const coffeeKeywords = [
      "coffee",
      "espresso",
      "arabica",
      "robusta",
      "decaf",
      "decaffeinated",
      "beans",
      "bean",
      "ground coffee",
      "filter coffee",
      "cafetiere",
      "americano",
      "latte",
      "cappuccino",
      "mocha"
    ];

    return coffeeKeywords.some((keyword) => haystack.includes(keyword));
  }

  if (kind === "RETAIL") {
    const retailKeywords = [
      "retail",
      "retail order",
      "display",
      "counter top",
      "countertop",
      "impulse",
      "wrapped",
      "individual",
      "single serve",
      "takeaway",
      "grab",
      "shelf ready"
    ];

    return line.source === "RETAIL_ORDER" || retailKeywords.some((keyword) => haystack.includes(keyword));
  }

  return true;
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="pick-summary-card rounded-2xl border border-freshpac-panel bg-freshpac-cream/70 p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">{label}</p>
      <p className="mt-2 text-2xl font-black text-freshpac-charcoal">{value}</p>
    </div>
  );
}