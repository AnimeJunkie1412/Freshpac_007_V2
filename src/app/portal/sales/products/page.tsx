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

const filters = ["All", "Normal", "Coffee", "Retail", "Active", "Inactive", "T0", "T1"];

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([getProductListFromDb(), getProductStatsFromDb()]);

  return (
    <PortalShell
      title="Products and pricing"
      subtitle="Live product records from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/products"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Product search</CardTitle>
                <CardDescription>
                  Search by product code, description, category, group, VAT code or restricted product type.
                </CardDescription>
              </div>
              <LinkButton href="/portal/sales/products/new" size="sm">
                <Plus className="mr-2 size-4" />
                Create product
              </LinkButton>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search product code, name, category, group..." />
              </label>

              <Button variant="secondary" type="button">
                <Filter className="mr-2 size-4" />
                More filters
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Button key={filter} type="button" size="sm" variant={index === 0 ? "primary" : "secondary"}>
                  {filter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
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
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Product list</CardTitle>
                <CardDescription>
                  These records now come from Supabase/PostgreSQL through Prisma.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                  No products found. Run <span className="font-bold">npm run prisma:seed</span> or create a product.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
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
                      <div>
                        <p className="text-sm font-black text-freshpac-charcoal">{product.name}</p>
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
                  No restricted products found.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database status</CardTitle>
              <CardDescription>The product module is now reading real records.</CardDescription>
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