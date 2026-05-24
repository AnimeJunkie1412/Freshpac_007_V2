import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackagePlus, Search, ShoppingBasket } from "lucide-react";
import { addManualOrderLine } from "@/app/portal/sales/orders/[reference]/add-line/actions";
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
  getManualOrderForLineEditFromDb,
  getManualOrderProductOptionsFromDb,
  getOrderReferenceForManualLines,
  getProductDescription,
  getProductDisplayName,
  getProductPriceExVatPence,
  getProductVatRateBasisPoints
} from "@/lib/sales/manual-order-lines-db";
import {
  formatOrderLineSource,
  formatOrderMoney,
  formatOrderStatus
} from "@/lib/sales/order-db";

type ProductOption = Awaited<ReturnType<typeof getManualOrderProductOptionsFromDb>>[number];

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
  };
}) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);
  const q = searchParams?.q || "";

  const [order, products] = await Promise.all([
    getManualOrderForLineEditFromDb(decodedReference),
    getManualOrderProductOptionsFromDb({ q })
  ]);

  if (!order) {
    notFound();
  }

  const orderReference = getOrderReferenceForManualLines(order);
  const encodedOrderReference = encodeURIComponent(orderReference);
  const orderHref = `/portal/sales/orders/${encodedOrderReference}`;

  return (
    <PortalShell
      title={`Add line to ${orderReference}`}
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

        <LinkButton href={orderHref} size="sm" variant="secondary">
          <ShoppingBasket className="mr-2 size-4" />
          View order
        </LinkButton>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
              <CardDescription>
                Current manual order totals and line count.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                  {orderReference}
                </p>
                <h2 className="mt-1 text-lg font-black text-freshpac-charcoal">
                  {order.customer.siteName}
                </h2>
                <p className="text-sm text-freshpac-grey">{order.customer.accountNumber}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge>{formatOrderStatus(order.status)}</Badge>
                  <Badge tone={order.priceVisibilityAtOrder ? "success" : "warning"}>
                    {order.priceVisibilityAtOrder ? "Prices visible" : "Delivery Note Required"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <MiniDetail label="Lines" value={String(order.lines.length)} />
                <MiniDetail label="Ex VAT" value={formatOrderMoney(order.totalExVatPence, true)} />
                <MiniDetail label="VAT" value={formatOrderMoney(order.vatTotalPence, true)} />
                <MiniDetail label="Total" value={formatOrderMoney(order.totalIncVatPence, true)} />
              </div>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Current lines</CardTitle>
              <CardDescription>
                Lines already added to this order.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {order.lines.map((line) => (
                <div key={line.id} className="rounded-2xl border border-freshpac-panel bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                        {line.productCodeSnapshot}
                      </p>
                      <p className="mt-1 truncate text-sm font-black text-freshpac-charcoal">
                        {line.descriptionSnapshot}
                      </p>
                      <p className="text-xs text-freshpac-grey">
                        {line.packSizeSnapshot || "No pack size"} · {formatOrderLineSource(line.source)}
                      </p>
                    </div>

                    <Badge>{line.quantity}</Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniDetail label="Unit" value={formatOrderMoney(line.priceIncVatPence, true)} />
                    <MiniDetail label="Total" value={formatOrderMoney(line.lineTotalPence, true)} />
                  </div>
                </div>
              ))}

              {!order.lines.length ? (
                <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No lines have been added yet.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Find product</CardTitle>
              <CardDescription>
                Search by product code, description, group or pack size.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={`/portal/sales/orders/${encodedOrderReference}/add-line`} className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                  <Input
                    className="pl-9"
                    name="q"
                    defaultValue={q}
                    placeholder="Search product code, description, group..."
                  />
                </label>

                <Button type="submit" variant="secondary">
                  <Search className="mr-2 size-4" />
                  Search
                </Button>

                <Link
                  href={`/portal/sales/orders/${encodedOrderReference}/add-line`}
                  className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
                >
                  Clear
                </Link>
              </form>
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Product results</CardTitle>
                  <CardDescription>
                    Showing {products.length} product option{products.length === 1 ? "" : "s"}.
                  </CardDescription>
                </div>
                <Badge tone="success">Default pricing</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid gap-3 p-3 md:hidden">
                {products.map((product: ProductOption) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    orderReference={orderReference}
                    q={q}
                  />
                ))}

                {!products.length ? <EmptyProducts /> : null}
              </div>

              <div className="hidden md:block">
                <div className="portal-scroll-panel">
                  <table className="fp-compact-table min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Group</th>
                        <th>Pack</th>
                        <th>Ex VAT</th>
                        <th>VAT</th>
                        <th>Inc VAT</th>
                        <th>Add</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product: ProductOption) => {
                        const priceExVatPence = getProductPriceExVatPence(product);
                        const vatRateBasisPoints = getProductVatRateBasisPoints(product);
                        const vatPence = calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
                        const priceIncVatPence = calculatePriceIncVatPence(priceExVatPence, vatRateBasisPoints);

                        return (
                          <tr key={product.id}>
                            <td className="font-black">{(product as any).code}</td>
                            <td>
                              <div className="font-bold text-freshpac-charcoal">
                                {getProductDisplayName(product)}
                              </div>
                              <div className="text-xs text-freshpac-grey">
                                {getProductDescription(product)}
                              </div>
                            </td>
                            <td>{(product as any).productGroup || "None"}</td>
                            <td>{(product as any).packSize || "None"}</td>
                            <td>{formatMoneyFromPence(priceExVatPence)}</td>
                            <td>
                              {formatMoneyFromPence(vatPence)}
                              <div className="text-xs text-freshpac-grey">
                                {formatVatRate(vatRateBasisPoints)}
                              </div>
                            </td>
                            <td className="font-black">{formatMoneyFromPence(priceIncVatPence)}</td>
                            <td>
                              <form action={addManualOrderLine} className="flex min-w-36 items-center gap-2">
                                <input type="hidden" name="orderReference" value={orderReference} />
                                <input type="hidden" name="productId" value={product.id} />
                                <input type="hidden" name="q" value={q} />
                                <Input
                                  name="quantity"
                                  type="number"
                                  min={1}
                                  defaultValue={1}
                                  className="h-9 w-20"
                                />
                                <Button type="submit" size="sm">
                                  <PackagePlus className="mr-2 size-4" />
                                  Add
                                </Button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {!products.length ? <EmptyProducts /> : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function ProductCard({
  product,
  orderReference,
  q
}: {
  product: ProductOption;
  orderReference: string;
  q: string;
}) {
  const priceExVatPence = getProductPriceExVatPence(product);
  const vatRateBasisPoints = getProductVatRateBasisPoints(product);
  const vatPence = calculateVatAmountPence(priceExVatPence, vatRateBasisPoints);
  const priceIncVatPence = calculatePriceIncVatPence(priceExVatPence, vatRateBasisPoints);

  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
            {(product as any).code}
          </p>
          <p className="mt-1 text-sm font-black text-freshpac-charcoal">
            {getProductDisplayName(product)}
          </p>
          <p className="text-xs text-freshpac-grey">
            {(product as any).packSize || "No pack size"}
          </p>
        </div>

        <Badge>{(product as any).productGroup || "Product"}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniDetail label="Ex VAT" value={formatMoneyFromPence(priceExVatPence)} />
        <MiniDetail label="VAT" value={`${formatMoneyFromPence(vatPence)} · ${formatVatRate(vatRateBasisPoints)}`} />
        <MiniDetail label="Inc VAT" value={formatMoneyFromPence(priceIncVatPence)} />
        <MiniDetail label="Status" value={String((product as any).status || "Unknown")} />
      </div>

      <form action={addManualOrderLine} className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <input type="hidden" name="orderReference" value={orderReference} />
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="q" value={q} />
        <Input
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
        />
        <Button type="submit">
          <PackagePlus className="mr-2 size-4" />
          Add
        </Button>
      </form>
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
      No products matched that search.
    </div>
  );
}