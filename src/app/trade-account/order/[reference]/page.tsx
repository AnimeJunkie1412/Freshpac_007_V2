import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save, Send } from "lucide-react";
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
    priceExVatPence?: number | null;
    vatRateBasisPoints?: number | null;
    customerPrices?: Array<{
      priceExVatPence: number;
    }>;
  };
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
  };
}) {
  const { reference } = await params;
  const decodedReference = decodeURIComponent(reference);

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
  const customer = (order as any).customer;
  const editable = order.status === "DRAFT_BASKET";
  const priceVisible = order.priceVisibilityAtOrder;
  const orderReference = order.reference || order.temporaryReference || decodedReference;

  const lineByProductId = new Map<string, any>();

  for (const line of (order as any).lines as any[]) {
    if (line.productId && !lineByProductId.has(line.productId)) {
      lineByProductId.set(line.productId, line);
    }
  }

  const products = [...((customer.productAccess || []) as CustomerProductAccess[])].sort((a, b) => {
    const aLine = lineByProductId.get(a.productId);
    const bLine = lineByProductId.get(b.productId);
    const aQty = aLine?.quantity || 0;
    const bQty = bLine?.quantity || 0;

    if (aQty > 0 && bQty === 0) return -1;
    if (bQty > 0 && aQty === 0) return 1;

    return String(a.product?.code || "").localeCompare(String(b.product?.code || ""));
  });

  const activeLines = ((order as any).lines as any[]).filter((line) => line.quantity > 0);
  const canSubmit = editable && activeLines.length > 0;

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
                  Basket {orderReference}
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
            <CardContent className="p-4 text-sm font-semibold text-emerald-900">
              This order has been submitted and can no longer be edited.
            </CardContent>
          </Card>
        ) : null}

        <form action={saveCustomerBasket}>
          <input type="hidden" name="reference" value={orderReference} />

          <Card className="portal-card-safe">
            <CardHeader className="p-3 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Your shopping list</CardTitle>
                  <CardDescription>
                    Set quantities, save your basket, then submit when ready.
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

            <CardContent className="p-0">
              <div className="grid gap-1.5 p-2 sm:hidden">
                {products.map((access) => {
                  const existingLine = lineByProductId.get(access.productId);

                  return (
                    <CustomerProductCard
                      key={access.id}
                      access={access}
                      existingLine={existingLine}
                      editable={editable}
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
                    {products.map((access) => {
                      const existingLine = lineByProductId.get(access.productId);

                      return (
                        <CustomerProductRow
                          key={access.id}
                          access={access}
                          existingLine={existingLine}
                          editable={editable}
                          priceVisible={priceVisible}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!products.length ? (
                <div className="p-6 text-sm text-freshpac-grey">
                  No products are currently available on your shopping list.
                </div>
              ) : null}

              {editable ? (
                <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-freshpac-panel bg-white p-3">
                  <Button type="submit" size="sm" variant="secondary">
                    <Save className="mr-1.5 size-3.5" />
                    Save basket
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </form>

        {editable ? (
          <Card className="portal-card-safe">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-black text-freshpac-charcoal">Ready to send?</p>
                <p className="mt-1 text-sm font-semibold text-freshpac-grey">
                  Submit your basket to Freshpac for processing.
                </p>
              </div>

              <form action={submitCustomerBasket}>
                <input type="hidden" name="reference" value={orderReference} />
                <Button type="submit" disabled={!canSubmit}>
                  <Send className="mr-2 size-4" />
                  Submit order
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
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