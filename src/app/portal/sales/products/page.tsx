import Link from "next/link";
import type { ReactNode } from "react";
import { Archive, Coffee, Filter, PackageCheck, Plus, Search, ShoppingBag, Tags } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/sales/status-badge";
import { getProductStats, products } from "@/lib/sales/products";

const filters = ["All", "Normal", "Coffee", "Retail", "Active", "Inactive", "T0", "T1"];

export default function ProductsPage() {
  const stats = getProductStats();

  return (
    <PortalShell
      title="Products and pricing"
      subtitle="Manage products, Sage codes, VAT, customer pricing, restricted coffee products and retail products."
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
            <CardDescription>Starter values from mock product data.</CardDescription>
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
                  Staff see Sage product codes. Customer portals must hide product codes.
                </CardDescription>
              </div>
              <Badge tone="info">Mock data</Badge>
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
                    <tr key={product.code}>
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
                        <div className="max-w-md truncate text-xs text-freshpac-grey">{product.description}</div>
                      </td>
                      <td>
                        <ProductTypeBadge type={product.type} />
                      </td>
                      <td>
                        <StatusBadge
                          status={product.status}
                          tone={product.status === "Active" ? "success" : product.status === "Inactive" ? "warning" : "danger"}
                        />
                      </td>
                      <td>{product.category}</td>
                      <td>{product.group}</td>
                      <td>{product.packSize}</td>
                      <td>{product.pricing.vatCode}</td>
                      <td>{product.pricing.priceExVat}</td>
                      <td>{product.pricing.priceIncVat}</td>
                      <td>
                        <Badge tone={product.publicVisibility === "Assigned customers only" ? "warning" : "neutral"}>
                          {product.publicVisibility}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                .filter((product) => product.type !== "Normal Product")
                .map((product) => (
                  <Link
                    href={`/portal/sales/products/${product.code}`}
                    key={product.code}
                    className="block rounded-2xl border border-freshpac-panel bg-white p-3 transition hover:border-freshpac-orange hover:bg-orange-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-freshpac-charcoal">{product.name}</p>
                        <p className="text-xs text-freshpac-grey">{product.code}</p>
                      </div>
                      <ProductTypeBadge type={product.type} />
                    </div>

                    <p className="mt-2 text-xs text-freshpac-grey">
                      Assigned customers: {product.assignedCustomers.length}
                    </p>
                  </Link>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next build hooks</CardTitle>
              <CardDescription>These actions will become live once Supabase is connected.</CardDescription>
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

function ProductTypeBadge({ type }: { type: string }) {
  if (type === "Coffee Product") {
    return <Badge tone="info">Coffee</Badge>;
  }

  if (type === "Retail Product") {
    return <Badge tone="warning">Retail</Badge>;
  }

  return <Badge tone="neutral">Normal</Badge>;
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