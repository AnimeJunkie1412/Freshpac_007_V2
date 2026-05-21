import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, Coffee, Filter, PackageCheck, Plus, Search, ShoppingBag, Tags } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  calculatePriceIncVatPence,
  formatMoneyFromPence,
  formatProductStatus,
  formatProductType,
  formatPublicVisibility,
  getProductListFromDb,
  getProductStatsFromDb,
  getProductStatusTone,
  getProductTypeTone
} from "@/lib/sales/product-db";

const typeFilters = [
  { label: "All types", value: "ALL" },
  { label: "Normal", value: "NORMAL" },
  { label: "Coffee", value: "COFFEE" },
  { label: "Retail", value: "RETAIL" }
];

const statusFilters = [
  { label: "All status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" }
];

const vatFilters = [
  { label: "All VAT", value: "ALL" },
  { label: "T0", value: "T0" },
  { label: "T1", value: "T1" }
];

export default async function ProductsPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
    type?: string;
    status?: string;
    vat?: string;
  };
}) {
  const q = searchParams?.q || "";
  const type = searchParams?.type || "ALL";
  const status = searchParams?.status || "ALL";
  const vat = searchParams?.vat || "ALL";

  const [products, stats] = await Promise.all([
    getProductListFromDb({ q, type, status, vat }),
    getProductStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Products and pricing"
      subtitle="Live product records from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/products"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Product search</CardTitle>
                <CardDescription>
                  Search by product code, description, category, group, VAT code or customer assignment.
                </CardDescription>
              </div>
              <LinkButton href="/portal/sales/products/new" size="sm">
                <Plus className="mr-2 size-4" />
                Create product
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent>
            <form action="/portal/sales/products" className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="vat" value={vat} />

              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input
                  className="pl-9"
                  name="q"
                  defaultValue={q}
                  placeholder="Search product code, name, category, group, customer..."
                />
              </label>

              <Button variant="secondary" type="submit">
                <Search className="mr-2 size-4" />
                Search
              </Button>

              <Link
                href="/portal/sales/products"
                className="inline-flex items-center justify-center rounded-xl border border-freshpac-panel bg-white px-4 py-2 text-sm font-bold text-freshpac-charcoal hover:border-freshpac-orange"
              >
                Clear
              </Link>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {typeFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={buildProductsHref({ q, type: filter.value, status, vat })}
                  active={type === filter.value || (!searchParams?.type && filter.value === "ALL")}
                  label={filter.label}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={buildProductsHref({ q, type, status: filter.value, vat })}
                  active={status === filter.value || (!searchParams?.status && filter.value === "ALL")}
                  label={filter.label}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {vatFilters.map((filter) => (
                <FilterLink
                  key={filter.value}
                  href={buildProductsHref({ q, type, status, vat: filter.value })}
                  active={vat === filter.value || (!searchParams?.vat && filter.value === "ALL")}
                  label={filter.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Product counters</CardTitle>
            <CardDescription>Live values from the database.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<Tags className="size-4" />} />
            <MiniStat label="Active" value={stats.active} tone="success" icon={<PackageCheck className="size-4" />} />
            <MiniStat label="Inactive" value={stats.inactive} tone="warning" icon={<Archive className="size-4" />} />
            <MiniStat label="Normal" value={stats.normal} icon={<ShoppingBag className="size-4" />} />
            <MiniStat label="Coffee" value={stats.coffee} tone="info" icon={<Coffee className="size-4" />} />
            <MiniStat label="Retail" value={stats.retail} tone="warning" icon={<ShoppingBag className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Product list</CardTitle>
                <CardDescription>
                  Showing {products.length} matching product{products.length === 1 ? "" : "s"}.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="block p-3 md:hidden">
              <div className="grid gap-3">
                {products.map((product) => {
                  const visibility = formatPublicVisibility(product);
                  const incVat = calculatePriceIncVatPence(product.priceExVatPence, product.vatRateBasisPoints);

                  return (
                    <Link
                      key={product.id}
                      href={`/portal/sales/products/${product.code}`}
                      className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm transition hover:border-freshpac-orange hover:bg-orange-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">{product.code}</p>
                          <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">{product.name}</p>
                          <p className="truncate text-xs text-freshpac-grey">{product.description || "No description recorded"}</p>
                        </div>

                        <Badge tone={getProductStatusTone(product.status)}>
                          {formatProductStatus(product.status)}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        <Badge tone={getProductTypeTone(product.productType)}>{formatProductType(product.productType)}</Badge>
                        <Badge tone={product.vatCode === "T1" ? "warning" : "neutral"}>{product.vatCode}</Badge>
                        <Badge tone={visibility === "Assigned customers only" ? "warning" : "neutral"}>{visibility}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <MobileDetail label="Category" value={product.category || "None"} />
                        <MobileDetail label="Group" value={product.productGroup || "None"} />
                        <MobileDetail label="Pack" value={product.packSize || "None"} />
                        <MobileDetail label="Assigned" value={String(product.customerAccess.length)} />
                        <MobileDetail label="Ex VAT" value={formatMoneyFromPence(product.priceExVatPence)} />
                        <MobileDetail label="Inc VAT" value={formatMoneyFromPence(incVat)} />
                      </div>
                    </Link>
                  );
                })}

                {!products.length ? (
                  <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                    No products match that search.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="portal-scroll-panel">
                <table className="fp-compact-table min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Group</th>
                      <th>Pack</th>
                      <th>VAT</th>
                      <th>Ex VAT</th>
                      <th>Inc VAT</th>
                      <th>Visibility</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <Link
                            href={`/portal/sales/products/${product.code}`}
                            className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                          >
                            {product.code}
                          </Link>
                        </td>
                        <td>
                          <div className="font-bold text-freshpac-charcoal">{product.name}</div>
                          <div className="max-w-md truncate text-xs text-freshpac-grey">
                            {product.description || "No description recorded"}
                          </div>
                        </td>
                        <td>
                          <Badge tone={getProductTypeTone(product.productType)}>{formatProductType(product.productType)}</Badge>
                        </td>
                        <td>
                          <Badge tone={getProductStatusTone(product.status)}>{formatProductStatus(product.status)}</Badge>
                        </td>
                        <td>{product.category || "None"}</td>
                        <td>{product.productGroup || "None"}</td>
                        <td>{product.packSize || "None"}</td>
                        <td>{product.vatCode}</td>
                        <td>{formatMoneyFromPence(product.priceExVatPence)}</td>
                        <td>{formatMoneyFromPence(calculatePriceIncVatPence(product.priceExVatPence, product.vatRateBasisPoints))}</td>
                        <td>
                          <Badge tone={formatPublicVisibility(product) === "Assigned customers only" ? "warning" : "neutral"}>
                            {formatPublicVisibility(product)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!products.length ? (
                  <div className="p-6 text-sm text-freshpac-grey">
                    No products match that search.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Restricted products</CardTitle>
              <CardDescription>Coffee and retail products need customer assignment.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {products
                .filter((product) => product.productType !== "NORMAL")
                .map((product) => (
                  <Link
                    href={`/portal/sales/products/${product.code}`}
                    key={product.id}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-freshpac-charcoal">{product.name}</p>
                        <p className="text-xs text-freshpac-grey">{product.code}</p>
                      </div>
                      <Badge tone={getProductTypeTone(product.productType)}>{formatProductType(product.productType)}</Badge>
                    </div>

                    <p className="mt-2 text-xs text-freshpac-grey">
                      Assigned customers: {product.customerAccess.length}
                    </p>
                  </Link>
                ))}

              {!products.some((product) => product.productType !== "NORMAL") ? (
                <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No restricted products found in this result set.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Database status</CardTitle>
              <CardDescription>The product module is now reading filtered live records.</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2">
              <Button type="button" variant="secondary">
                Import Sage product list
              </Button>
              <Button type="button" variant="secondary">
                Print stocktaking list
              </Button>
              <Button type="button" variant="secondary">
                Print coffee pick list
              </Button>
              <Button type="button" variant="secondary">
                Review inactive products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}

function buildProductsHref({
  q,
  type,
  status,
  vat
}: {
  q: string;
  type: string;
  status: string;
  vat: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (type && type !== "ALL") params.set("type", type);
  if (status && status !== "ALL") params.set("status", status);
  if (vat && vat !== "ALL") params.set("vat", vat);

  const query = params.toString();

  return query ? `/portal/sales/products?${query}` : "/portal/sales/products";
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "border border-freshpac-panel bg-white text-freshpac-grey hover:border-freshpac-orange hover:text-freshpac-charcoal"
      }`}
    >
      <Filter className="mr-2 size-3" />
      {label}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  icon,
  tone = "neutral"
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-white text-freshpac-charcoal",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700"
  };

  return (
    <div className={`rounded-2xl border border-freshpac-panel p-3 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}