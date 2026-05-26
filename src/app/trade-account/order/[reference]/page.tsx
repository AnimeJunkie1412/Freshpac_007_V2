import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save, Search, Send } from "lucide-react";
import {
  saveCustomerBasket,
  submitCustomerBasket
} from "@/app/trade-account/order/[reference]/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  calculateCustomerVatAmountPence,
  formatCustomerOrderStatus,
  formatCustomerPortalMoney,
  getCustomerOrderStatusTone,
  getCustomerPortalOrderFromDb,
  getCustomerPortalProductDescription,
  getCustomerPortalProductDisplayName,
  getCustomerPortalProductPriceExVatPence
} from "@/lib/customer-portal/customer-portal-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CustomerProductAccess = {
  id: string;
  productId: string;
  product: {
    id: string;
    code: string;
    description?: string | null;
    name?: string | null;
    productName?: string | null;
    packSize?: string | null;
    productGroup?: string | null;
    priceExVatPence?: number | null;
    vatRateBasisPoints?: number | null;
    customerPrices?: Array<{
      priceExVatPence: number;
    }>;
  };
};

type SubmittedOrderLine = {
  id: string;
  productId?: string | null;
  productCodeSnapshot: string;
  descriptionSnapshot: string;
  packSizeSnapshot?: string | null;
  quantity: number;
  priceExVatPence: number;
  vatPence: number;
  priceIncVatPence: number;
  lineTotalPence: number;
};

export default async function CustomerOrderPage({
  params,
  searchParams
}: {
  params: Promise<{
    reference: string;
  }>;
  searchParams?: {
    saved?: string;
    q?: string;
    activeOnly?: string;
  };
}) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);
  const q = String(searchParams?.q || "").trim();
  const activeOnly = searchParams?.activeOnly === "1";

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/trade-account/order/${encodeURIComponent(decodedReference)}`);
  }

  let result: Awaited<ReturnType<typeof getCustomerPortalOrderFromDb>> | null = null;

  try {
    result = await getCustomerPortalOrderFromDb({
      authUserId: user.id,
      email: user.email,
      reference: decodedReference
    });
  } catch {
    notFound();
  }

  const { profile, order } = result;
  const customer = order.customer;
  const editable = order.status === "DRAFT_BASKET";
  const priceVisible = order.priceVisibilityAtOrder;
  const orderReference = order.reference || order.temporaryReference || decodedReference;
  const orderHref = `/trade-account/order/${encodeURIComponent(orderReference)}`;

  const lineByProductId = new Map<string, any>();

  for (const line of order.lines) {
    if (line.productId && !lineByProductId.has(line.productId)) {
      lineByProductId.set(line.productId, line);
    }
  }

  const allProducts = [...((customer.productAccess || []) as CustomerProductAccess[])].sort((a, b) => {
    const aLine = lineByProductId.get(a.productId);
    const bLine = lineByProductId.get(b.productId);
    const aQty = aLine?.quantity || 0;
    const bQty = bLine?.quantity || 0;

    if (aQty > 0 && bQty === 0) return -1;
    if (bQty > 0 && aQty === 0) return 1;

    return String(a.product?.code || "").localeCompare(String(b.product?.code || ""));
  });

  const filteredProducts = allProducts.filter((access) => {
    const existingLine = lineByProductId.get(access.productId);
    const quantity = Number(existingLine?.quantity || 0);

    if (activeOnly && quantity <= 0) {
      return false;
    }

    if (!q) {
      return true;
    }

    const product = access.product;
    const haystack = [
      product.code,
      product.name,
      product.productName,
      product.description,
      product.packSize,
      product.productGroup
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q.toLowerCase());
  });

  const activeLines = order.lines.filter((line) => line.quantity > 0) as SubmittedOrderLine[];
  const canSubmit = editable && allProducts.length > 0;

  return (
    <main className="min-h-screen bg-freshpac-cream text-freshpac-charcoal">
      <header className="sticky top-0 z-40 border-b border-freshpac-panel bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
          <Link href="/trade-account" className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-freshpac-orange text-sm font-black text-freshpac-charcoal">
              FP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-4 text-freshpac-charcoal">
                Freshpac
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-freshpac-grey">
                Trade Account
              </p>
            </div>
          </Link>

          <Link
            href="/trade-account"
            className="inline-flex h-8 items-center rounded-lg border border-freshpac-panel bg-white px-2.5 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-3 px-3 py-3 sm:px-4">
        <Card className="portal-card-safe">
          <CardContent className="p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={getCustomerOrderStatusTone(order.status)}>
                    {formatCustomerOrderStatus(order.status)}
                  </Badge>
                  <Badge tone={priceVisible ? "success" : "warning"}>
                    {priceVisible ? "Prices visible" : "Prices hidden"}
                  </Badge>
                  {searchParams?.saved ? <Badge tone="success">Basket saved</Badge> : null}
                </div>

                <h1 className="mt-3 truncate text-2xl font-black tracking-tight text-freshpac-charcoal">
                  {editable ? "Basket" : "Order"} {orderReference}
                </h1>
                <p className="mt-1 text-sm font-semibold text-freshpac-grey">
                  {customer.siteName} · signed in as {profile.fullName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <BasketMetric label="Lines" value={String(activeLines.length)} />
                <BasketMetric label="Total" value={formatCustomerPortalMoney(order.totalIncVatPence, priceVisible)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {!editable ? (
          <Card className="portal-card-safe border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <p className="font-black text-emerald-900">Order submitted</p>
              <p className="mt-1 text-sm font-semibold text-emerald-800">
                This order has been sent to Freshpac and can no longer be edited.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {editable ? (
          <Card className="portal-card-safe">
            <CardHeader className="p-3 pb-1">
              <CardTitle>Find products</CardTitle>
              <CardDescription>
                Search your shopping list. Save before changing search if you have unsaved quantity changes.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 pt-1">
              <form action={orderHref} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                {activeOnly ? <input type="hidden" name="activeOnly" value="1" /> : null}

                <label className="relative block min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-freshpac-grey" />
                  <Input
                    className="h-8 pl-8 text-xs"
                    name="q"
                    defaultValue={q}
                    placeholder="Search code, product, pack..."
                  />
                </label>

                <Button type="submit" variant="secondary" size="sm">
                  <Search className="mr-1.5 size-3.5" />
                  Search
                </Button>

                <Link
                  href={orderHref}
                  className="inline-flex h-8 items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 text-xs font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
                >
                  Clear
                </Link>
              </form>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <BasketFilterLink
                  href={buildCustomerOrderHref({ orderHref, q, activeOnly: false })}
                  active={!activeOnly}
                  label={`All products (${allProducts.length})`}
                />
                <BasketFilterLink
                  href={buildCustomerOrderHref({ orderHref, q, activeOnly: true })}
                  active={activeOnly}
                  label={`Active only (${activeLines.length})`}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <form action={saveCustomerBasket}>
          <input type="hidden" name="reference" value={orderReference} />

          <Card className="portal-card-safe">
            <CardHeader className="p-3 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{editable ? "Your order details" : "Order details"}</CardTitle>
                  <CardDescription>
                    {editable
                      ? "Add a purchase order reference or notes for Freshpac."
                      : "Reference and notes submitted with this order."}
                  </CardDescription>
                </div>

                {editable ? (
                  <Button type="submit" size="sm">
                    <Save className="mr-1.5 size-3.5" />
                    Save basket
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 p-3 md:grid-cols-[260px_1fr]">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                  Customer PO reference
                </span>
                <Input
                  name="customerPoNumber"
                  defaultValue={order.customerPoNumber || ""}
                  disabled={!editable}
                  placeholder="Optional PO/reference"
                  className="mt-1"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                  Order notes
                </span>
                <textarea
                  name="customerNotes"
                  defaultValue={order.customerNotes || ""}
                  disabled={!editable}
                  placeholder="Delivery notes, special requests, anything Freshpac should know..."
                  className="mt-1 min-h-20 w-full rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100 disabled:bg-freshpac-cream disabled:text-freshpac-grey"
                />
              </label>
            </CardContent>
          </Card>

          {editable ? (
            <EditableShoppingList
              filteredProducts={filteredProducts}
              allProducts={allProducts}
              lineByProductId={lineByProductId}
              priceVisible={priceVisible}
            />
          ) : (
            <SubmittedOrderLines
              lines={activeLines}
              priceVisible={priceVisible}
            />
          )}

          {editable ? (
            <Card className="portal-card-safe">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-black text-freshpac-charcoal">Ready to send?</p>
                  <p className="mt-1 text-sm font-semibold text-freshpac-grey">
                    Submit your current quantities, PO reference and notes to Freshpac for processing.
                  </p>
                </div>

                <Button formAction={submitCustomerBasket} type="submit" disabled={!canSubmit}>
                  <Send className="mr-2 size-4" />
                  Submit order
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </form>
      </div>
    </main>
  );
}

function EditableShoppingList({
  filteredProducts,
  allProducts,
  lineByProductId,
  priceVisible
}: {
  filteredProducts: CustomerProductAccess[];
  allProducts: CustomerProductAccess[];
  lineByProductId: Map<string, any>;
  priceVisible: boolean;
}) {
  return (
    <Card className="portal-card-safe">
      <CardHeader className="p-3 pb-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Your shopping list</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {allProducts.length} product{allProducts.length === 1 ? "" : "s"}.
            </CardDescription>
          </div>

          <Button type="submit" size="sm">
            <Save className="mr-1.5 size-3.5" />
            Save basket
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-1.5 p-2 sm:hidden">
          {filteredProducts.map((access) => {
            const existingLine = lineByProductId.get(access.productId);

            return (
              <CustomerProductCard
                key={access.id}
                access={access}
                existingLine={existingLine}
                editable
                priceVisible={priceVisible}
              />
            );
          })}
        </div>

        <div className="hidden max-h-[70vh] overflow-auto sm:block">
          <table className="min-w-[760px] border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10 bg-freshpac-charcoal text-left text-white">
              <tr>
                <CompactTh className="w-24">Code</CompactTh>
                <CompactTh className="w-80">Product</CompactTh>
                <CompactTh className="w-20">Pack</CompactTh>
                <CompactTh className="w-28">Price</CompactTh>
                <CompactTh className="w-20">Qty</CompactTh>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((access) => {
                const existingLine = lineByProductId.get(access.productId);

                return (
                  <CustomerProductRow
                    key={access.id}
                    access={access}
                    existingLine={existingLine}
                    editable
                    priceVisible={priceVisible}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {!filteredProducts.length ? (
          <div className="p-6 text-sm text-freshpac-grey">
            No products match this view.
          </div>
        ) : null}

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-freshpac-panel bg-white p-3">
          <Button type="submit" size="sm" variant="secondary">
            <Save className="mr-1.5 size-3.5" />
            Save basket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SubmittedOrderLines({
  lines,
  priceVisible
}: {
  lines: SubmittedOrderLine[];
  priceVisible: boolean;
}) {
  return (
    <Card className="portal-card-safe">
      <CardHeader className="p-3 pb-1">
        <CardTitle>Submitted order lines</CardTitle>
        <CardDescription>
          These are the items sent to Freshpac.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-1.5 p-2 sm:hidden">
          {lines.map((line) => (
            <SubmittedLineCard
              key={line.id}
              line={line}
              priceVisible={priceVisible}
            />
          ))}
        </div>

        <div className="hidden sm:block">
          <div className="portal-scroll-panel">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Pack</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="font-black">{line.productCodeSnapshot}</td>
                    <td>{line.descriptionSnapshot}</td>
                    <td>{line.packSizeSnapshot || "None"}</td>
                    <td>{line.quantity}</td>
                    <td>{formatCustomerPortalMoney(line.priceIncVatPence, priceVisible)}</td>
                    <td className="font-black">
                      {formatCustomerPortalMoney(line.lineTotalPence, priceVisible)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!lines.length ? (
          <div className="p-6 text-sm text-freshpac-grey">
            No submitted lines found for this order.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SubmittedLineCard({
  line,
  priceVisible
}: {
  line: SubmittedOrderLine;
  priceVisible: boolean;
}) {
  return (
    <div className="rounded-xl border border-freshpac-panel bg-white p-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-freshpac-orange">
            {line.productCodeSnapshot}
          </p>
          <p className="truncate text-xs font-black leading-4 text-freshpac-charcoal">
            {line.descriptionSnapshot}
          </p>
          <p className="truncate text-[10px] font-semibold leading-3 text-freshpac-grey">
            {line.packSizeSnapshot || "No pack"}
          </p>
        </div>

        <span className="rounded-lg bg-freshpac-cream px-2 py-1 text-xs font-black text-freshpac-charcoal">
          {line.quantity}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <MiniInfo label="Price" value={formatCustomerPortalMoney(line.priceIncVatPence, priceVisible)} />
        <MiniInfo label="Total" value={formatCustomerPortalMoney(line.lineTotalPence, priceVisible)} />
      </div>
    </div>
  );
}

function CustomerProductCard({
  access,
  existingLine,
  editable,
  priceVisible
}: {
  access: CustomerProductAccess;
  existingLine?: any;
  editable: boolean;
  priceVisible: boolean;
}) {
  const product = access.product;
  const productId = String(access.productId);
  const quantity = existingLine?.quantity ?? 0;
  const isActive = quantity > 0;
  const priceExVatPence = getCustomerPortalProductPriceExVatPence(product);

  return (
    <div className={`rounded-xl border p-2 ${isActive ? "border-emerald-200 bg-emerald-50" : "border-freshpac-panel bg-white"}`}>
      <input type="hidden" name="productId" value={productId} />

      <div className="grid grid-cols-[1fr_64px] items-end gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.1em] text-freshpac-orange">
            {product.code}
          </p>
          <p className="truncate text-xs font-black leading-4 text-freshpac-charcoal">
            {getCustomerPortalProductDisplayName(product)}
          </p>
          <p className="truncate text-[10px] font-semibold leading-3 text-freshpac-grey">
            {getCustomerPortalProductDescription(product)}
          </p>
        </div>

        <label className="block">
          <span className="text-[9px] font-black uppercase tracking-[0.08em] text-freshpac-grey">
            Qty
          </span>
          <Input
            name={`quantity_${productId}`}
            type="number"
            min={0}
            defaultValue={quantity}
            disabled={!editable}
            aria-label="Quantity"
            className={`mt-0.5 h-8 w-full rounded-lg px-1.5 text-xs ${isActive ? "border-emerald-300 bg-white" : ""}`}
          />
        </label>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <MiniInfo label="Pack" value={String(product.packSize || "None")} />
        <MiniInfo label="Price" value={formatCustomerPortalMoney(priceExVatPence, priceVisible)} />
      </div>
    </div>
  );
}

function CustomerProductRow({
  access,
  existingLine,
  editable,
  priceVisible
}: {
  access: CustomerProductAccess;
  existingLine?: any;
  editable: boolean;
  priceVisible: boolean;
}) {
  const product = access.product;
  const productId = String(access.productId);
  const quantity = existingLine?.quantity ?? 0;
  const isActive = quantity > 0;
  const priceExVatPence = getCustomerPortalProductPriceExVatPence(product);
  const vatPence = calculateCustomerVatAmountPence(priceExVatPence, Number(product.vatRateBasisPoints || 0));
  const priceIncVatPence = priceExVatPence + vatPence;

  return (
    <tr className={`border-b border-freshpac-panel align-middle hover:bg-orange-50 ${isActive ? "bg-emerald-50" : ""}`}>
      <CompactTd className="w-24">
        <input type="hidden" name="productId" value={productId} />
        <p className="truncate whitespace-nowrap font-black text-freshpac-charcoal">
          {product.code}
        </p>
      </CompactTd>

      <CompactTd className="w-80">
        <p className="truncate whitespace-nowrap font-black leading-4 text-freshpac-charcoal">
          {getCustomerPortalProductDisplayName(product)}
        </p>
        <p className="mt-0.5 truncate whitespace-nowrap text-[10px] leading-3 text-freshpac-grey">
          {getCustomerPortalProductDescription(product)}
        </p>
      </CompactTd>

      <CompactTd className="w-20">
        <p className="truncate whitespace-nowrap leading-4">
          {product.packSize || "None"}
        </p>
      </CompactTd>

      <CompactTd className="w-28">
        <p className="whitespace-nowrap font-black text-freshpac-charcoal">
          {formatCustomerPortalMoney(priceIncVatPence, priceVisible)}
        </p>
        <p className="whitespace-nowrap text-[10px] text-freshpac-grey">
          Inc VAT
        </p>
      </CompactTd>

      <CompactTd className="w-20">
        <Input
          name={`quantity_${productId}`}
          type="number"
          min={0}
          defaultValue={quantity}
          disabled={!editable}
          aria-label="Quantity"
          className={`h-7 w-14 rounded-lg px-1.5 text-[11px] ${isActive ? "border-emerald-300 bg-white" : ""}`}
        />
      </CompactTd>
    </tr>
  );
}

function BasketFilterLink({
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
      className={`inline-flex h-7 items-center whitespace-nowrap rounded-lg px-2.5 text-[11px] font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "border border-freshpac-panel bg-white text-freshpac-grey hover:border-freshpac-orange hover:text-freshpac-charcoal"
      }`}
    >
      {label}
    </Link>
  );
}

function buildCustomerOrderHref({
  orderHref,
  q,
  activeOnly
}: {
  orderHref: string;
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

  return query ? `${orderHref}?${query}` : orderHref;
}

function BasketMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-freshpac-panel bg-white px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-freshpac-cream/70 p-1.5">
      <p className="text-[9px] font-black uppercase tracking-[0.08em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-black text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function CompactTh({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`whitespace-nowrap px-2 py-1.5 text-[9.5px] font-black uppercase tracking-[0.1em] ${className}`}>
      {children}
    </th>
  );
}

function CompactTd({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-2 py-1.5 text-[10.5px] font-semibold leading-4 text-freshpac-charcoal ${className}`}>
      {children}
    </td>
  );
}