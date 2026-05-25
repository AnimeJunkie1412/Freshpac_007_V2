import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Save, Search, ShoppingBasket } from "lucide-react";
import { saveManualOrderPad } from "@/app/portal/sales/orders/[reference]/add-line/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  calculatePriceIncVatPence,
  calculateVatAmountPence,
  formatMoneyFromPence,
  formatVatRate,
  getCustomerOrderPadFromDb,
  getOrderReferenceForManualLines,
  getProductDefaultPriceExVatPence,
  getProductDescription,
  getProductDisplayName,
  getProductEffectivePriceExVatPence,
  getProductPricingSource,
  getProductVatRateBasisPoints
} from "@/lib/sales/manual-order-lines-db";
import {
  formatOrderMoney,
  formatOrderStatus
} from "@/lib/sales/order-db";

type OrderPadProduct = Awaited<ReturnType<typeof getCustomerOrderPadFromDb>>["products"][number];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AddManualOrderLinePage({
  params,
  searchParams
}: {
  params: Promise<{
    reference: string;
  }>;
  searchParams?: {
    q?: string;
    activeOnly?: string;
  };
}) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);
  const q = searchParams?.q || "";
  const activeOnly = searchParams?.activeOnly === "1";

  let orderPad: Awaited<ReturnType<typeof getCustomerOrderPadFromDb>> | null = null;

  try {
    orderPad = await getCustomerOrderPadFromDb({
      orderReference: decodedReference,
      q
    });
  } catch {
    notFound();
  }

  const { order, products } = orderPad;

  const orderReference = getOrderReferenceForManualLines(order);
  const encodedOrderReference = encodeURIComponent(orderReference);
  const orderHref = `/portal/sales/orders/${encodedOrderReference}`;
  const addLineHref = `/portal/sales/orders/${encodedOrderReference}/add-line`;

  const existingLineByProductId = new Map<string, any>();

  for (const line of order.lines as any[]) {
    if (line.productId && !existingLineByProductId.has(line.productId)) {
      existingLineByProductId.set(line.productId, line);
    }
  }

  const activeLines = (order.lines as any[]).filter((line) => line.quantity > 0);

  const sortedProducts = [...products].sort((a: any, b: any) => {
    const aLine = existingLineByProductId.get(a.id);
    const bLine = existingLineByProductId.get(b.id);
    const aQty = aLine?.quantity || 0;
    const bQty = bLine?.quantity || 0;

    if (aQty > 0 && bQty === 0) return -1;
    if (bQty > 0 && aQty === 0) return 1;

    return String(a.code || "").localeCompare(String(b.code || ""));
  });

  const displayedProducts = activeOnly
    ? sortedProducts.filter((product: any) => {
        const existingLine = existingLineByProductId.get(product.id);
        return Number(existingLine?.quantity || 0) > 0;
      })
    : sortedProducts;

  return (
    <PortalShell
      title={`Order pad ${orderReference}`}
      subtitle={`${order.customer.siteName} · ${order.customer.accountNumber}`}
      activeHref="/portal/sales/orders"
    >
      <div className="mb-2 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href={orderHref}
          className="inline-flex h-8 w-fit items-center rounded-lg border border-freshpac-panel bg-white px-2.5 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back
        </Link>

        <LinkButton href={orderHref} size="sm" variant="secondary">
          <ShoppingBasket className="mr-2 size-4" />
          View order
        </LinkButton>
      </div>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[245px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="grid min-w-0 content-start gap-2">
          <Card className="portal-card-safe min-w-0">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm">Summary</CardTitle>
              <CardDescription className="text-[11px] leading-4">
                Shopping-list order pad.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 p-3 pt-1">
              <div className="rounded-xl border border-freshpac-panel bg-white p-2">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-orange">
                  {orderReference}
                </p>
                <h2 className="mt-0.5 truncate text-sm font-black text-freshpac-charcoal">
                  {order.customer.siteName}
                </h2>
                <p className="truncate text-[11px] text-freshpac-grey">
                  {order.customer.accountNumber}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge>{formatOrderStatus(order.status)}</Badge>
                  <Badge tone={order.priceVisibilityAtOrder ? "success" : "warning"}>
                    {order.priceVisibilityAtOrder ? "Prices" : "DN"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <TinyMetric label="Lines" value={String(activeLines.length)} />
                <TinyMetric label="Ex" value={formatOrderMoney(order.totalExVatPence, true)} />
                <TinyMetric label="VAT" value={formatOrderMoney(order.vatTotalPence, true)} />
                <TinyMetric label="Total" value={formatOrderMoney(order.totalIncVatPence, true)} />
              </div>
            </CardContent>
          </Card>

          <Card className="portal-card-safe min-w-0">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm">Active lines</CardTitle>
              <CardDescription className="text-[11px] leading-4">
                These rows are highlighted in the pad.
              </CardDescription>
            </CardHeader>

            <CardContent className="max-h-[54vh] space-y-1.5 overflow-auto p-3 pt-1">
              {activeLines.map((line) => (
                <div key={line.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-freshpac-orange">
                        {line.productCodeSnapshot}
                      </p>
                      <p className="truncate text-xs font-black text-freshpac-charcoal">
                        {line.descriptionSnapshot}
                      </p>
                      <p className="truncate text-[10px] text-freshpac-grey">
                        {line.packSizeSnapshot || "No pack"}
                      </p>
                    </div>

                    <span className="rounded-lg bg-white px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                      {line.quantity}
                    </span>
                  </div>

                  <div className="mt-1.5 grid grid-cols-2 gap-1">
                    <TinyMetric label="Ex" value={formatOrderMoney(line.priceExVatPence, true)} />
                    <TinyMetric label="Total" value={formatOrderMoney(line.lineTotalPence, true)} />
                  </div>
                </div>
              ))}

              {!activeLines.length ? (
                <div className="rounded-xl border border-freshpac-panel bg-white p-3 text-xs text-freshpac-grey">
                  No quantities set yet.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <section className="grid min-w-0 content-start gap-2">
          <Card className="portal-card-safe min-w-0">
            <CardHeader className="p-3 pb-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm">Product quick search</CardTitle>
                  <CardDescription className="text-[11px] leading-4">
                    Blank search shows shopping list and past ordered items. Search finds catalogue items to add.
                  </CardDescription>
                </div>

                <Badge tone="warning">Customer pricing checked</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-3 pt-1">
              <form action={addLineHref} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                {activeOnly ? <input type="hidden" name="activeOnly" value="1" /> : null}

                <label className="relative block min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-freshpac-grey" />
                  <Input
                    className="h-8 pl-8 text-xs"
                    name="q"
                    defaultValue={q}
                    placeholder="Quick search product code, description, pack..."
                  />
                </label>

                <Button type="submit" variant="secondary" size="sm">
                  <Search className="mr-1.5 size-3.5" />
                  Search
                </Button>

                <Link
                  href={addLineHref}
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
                >
                  Clear
                </Link>
              </form>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <PadFilterLink
                  href={buildOrderPadHref({ addLineHref, q, activeOnly: false })}
                  active={!activeOnly}
                  label="All products"
                />
                <PadFilterLink
                  href={buildOrderPadHref({ addLineHref, q, activeOnly: true })}
                  active={activeOnly}
                  label={`Active only (${activeLines.length})`}
                />
              </div>
            </CardContent>
          </Card>

          <form action={saveManualOrderPad}>
            <input type="hidden" name="orderReference" value={orderReference} />
            <input type="hidden" name="q" value={q} />
            {activeOnly ? <input type="hidden" name="activeOnly" value="1" /> : null}

            <Card className="portal-card-safe min-w-0">
              <CardHeader className="p-3 pb-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">Order pad</CardTitle>
                    <CardDescription className="text-[11px] leading-4">
                      Showing {displayedProducts.length} of {products.length} product option{products.length === 1 ? "" : "s"}.
                    </CardDescription>
                  </div>

                  <Button type="submit" size="sm">
                    <Save className="mr-1.5 size-3.5" />
                    Save quantities
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-[70vh] overflow-auto">
                  <table className="w-full min-w-[660px] border-collapse text-[10.5px]">
                    <thead className="sticky top-0 z-10 bg-freshpac-charcoal text-left text-white">
                      <tr>
                        <CompactTh>Code</CompactTh>
                        <CompactTh>Product</CompactTh>
                        <CompactTh>Pack</CompactTh>
                        <CompactTh>Using ex</CompactTh>
                        <CompactTh>VAT</CompactTh>
                        <CompactTh>Inc</CompactTh>
                        <CompactTh>Qty</CompactTh>
                        <CompactTh>Price</CompactTh>
                      </tr>
                    </thead>

                    <tbody>
                      {displayedProducts.map((product: OrderPadProduct) => {
                        const existingLine = existingLineByProductId.get((product as any).id);

                        return (
                          <OrderPadProductRow
                            key={(product as any).id}
                            product={product}
                            existingLine={existingLine}
                          />
                        );
                      })}
                    </tbody>
                  </table>

                  {!displayedProducts.length ? (
                    <div className="p-6 text-sm text-freshpac-grey">
                      No products match this view.
                    </div>
                  ) : null}
                </div>

                {displayedProducts.length ? (
                  <div className="sticky bottom-0 flex justify-end border-t border-freshpac-panel bg-white p-3">
                    <Button type="submit" size="sm">
                      <Save className="mr-1.5 size-3.5" />
                      Save quantities
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </form>
        </section>
      </div>
    </PortalShell>
  );
}

function OrderPadProductRow({
  product,
  existingLine
}: {
  product: OrderPadProduct;
  existingLine?: any;
}) {
  const defaultPriceExVatPence = getProductDefaultPriceExVatPence(product);
  const effectivePriceExVatPence = existingLine?.priceExVatPence ?? getProductEffectivePriceExVatPence(product);
  const pricingSource = existingLine ? "Order" : getProductPricingSource(product);
  const vatRateBasisPoints = getProductVatRateBasisPoints(product);
  const vatPence = calculateVatAmountPence(effectivePriceExVatPence, vatRateBasisPoints);
  const priceIncVatPence = calculatePriceIncVatPence(effectivePriceExVatPence, vatRateBasisPoints);
  const productId = String((product as any).id);
  const quantity = existingLine?.quantity ?? 0;
  const isActive = quantity > 0;

  return (
    <tr className={`border-b border-freshpac-panel align-middle hover:bg-orange-50 ${isActive ? "bg-emerald-50" : ""}`}>
      <CompactTd>
        <input type="hidden" name="productId" value={productId} />
        <p className="font-black text-freshpac-charcoal">{(product as any).code}</p>
      </CompactTd>

      <CompactTd>
        <p className="max-w-52 truncate font-black leading-4 text-freshpac-charcoal">
          {getProductDisplayName(product)}
        </p>
        <p className="mt-0.5 max-w-52 truncate text-[10px] leading-3 text-freshpac-grey">
          {getProductDescription(product)}
        </p>
      </CompactTd>

      <CompactTd>
        <p className="max-w-16 truncate leading-4">{(product as any).packSize || "None"}</p>
      </CompactTd>

      <CompactTd>
        <p className="font-black text-freshpac-charcoal">
          {formatMoneyFromPence(effectivePriceExVatPence)}
        </p>
        <div className="flex gap-1">
          <Badge tone={pricingSource === "Customer" || pricingSource === "Order" ? "success" : "neutral"}>
            {pricingSource === "Customer" ? "Cust" : pricingSource === "Order" ? "Order" : "Def"}
          </Badge>
          {defaultPriceExVatPence !== effectivePriceExVatPence ? (
            <span className="text-[10px] text-freshpac-grey">
              Def {formatMoneyFromPence(defaultPriceExVatPence)}
            </span>
          ) : null}
        </div>
      </CompactTd>

      <CompactTd>
        <p>{formatMoneyFromPence(vatPence)}</p>
        <p className="text-[10px] text-freshpac-grey">{formatVatRate(vatRateBasisPoints)}</p>
      </CompactTd>

      <CompactTd>
        <p className="font-black text-freshpac-charcoal">{formatMoneyFromPence(priceIncVatPence)}</p>
      </CompactTd>

      <CompactTd>
        <Input
          name={`quantity_${productId}`}
          type="number"
          min={0}
          defaultValue={quantity}
          aria-label="Quantity"
          className={`h-7 w-14 rounded-lg px-1.5 text-[11px] ${isActive ? "border-emerald-300 bg-white" : ""}`}
        />
      </CompactTd>

      <CompactTd>
        <Input
          name={`priceExVat_${productId}`}
          defaultValue={(effectivePriceExVatPence / 100).toFixed(2)}
          aria-label="Ex VAT price"
          className="h-7 w-16 rounded-lg px-1.5 text-[11px]"
        />
      </CompactTd>
    </tr>
  );
}

function PadFilterLink({
  href,
  active,
  label
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-7 items-center rounded-lg px-2.5 text-[11px] font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "border border-freshpac-panel bg-white text-freshpac-grey hover:border-freshpac-orange hover:text-freshpac-charcoal"
      }`}
    >
      {label}
    </Link>
  );
}

function buildOrderPadHref({
  addLineHref,
  q,
  activeOnly
}: {
  addLineHref: string;
  q: string;
  activeOnly: boolean;
}) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (activeOnly) {
    params.set("activeOnly", "1");
  }

  const query = params.toString();

  return query ? `${addLineHref}?${query}` : addLineHref;
}

function TinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-freshpac-cream/70 p-1.5">
      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-black text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function CompactTh({ children }: { children: ReactNode }) {
  return (
    <th className="whitespace-nowrap px-1.5 py-1.5 text-[9.5px] font-black uppercase tracking-[0.1em]">
      {children}
    </th>
  );
}

function CompactTd({ children }: { children: ReactNode }) {
  return (
    <td className="px-1.5 py-1.5 text-[10.5px] font-semibold leading-4 text-freshpac-charcoal">
      {children}
    </td>
  );
}