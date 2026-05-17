import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coffee, FileText, Pencil, Plus, Printer, ShieldCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculatePriceIncVatPence,
  calculateVatAmountPence,
  formatDate,
  formatMoneyFromPence,
  formatProductStatus,
  formatProductType,
  formatPublicVisibility,
  formatVatRate,
  getProductByCodeFromDb,
  getProductSalesStats,
  getProductStatusTone,
  getProductTypeTone,
  getProductWarnings
} from "@/lib/sales/product-db";

const tabs = [
  { label: "Overview", href: "#overview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Assignments", href: "#assignments" },
  { label: "Customer prices", href: "#customer-prices" },
  { label: "Sales history", href: "#sales-history" },
  { label: "Standing", href: "#standing" },
  { label: "Retail", href: "#retail" },
  { label: "Notes", href: "#notes" },
  { label: "Audit", href: "#audit" }
];

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const product = await getProductByCodeFromDb(decodeURIComponent(code));

  if (!product) {
    notFound();
  }

  const priceIncVatPence = calculatePriceIncVatPence(product.priceExVatPence, product.vatRateBasisPoints);
  const vatAmountPence = calculateVatAmountPence(product.priceExVatPence, product.vatRateBasisPoints);
  const salesStats = getProductSalesStats(product.orderLines);
  const warnings = getProductWarnings(product);

  return (
    <PortalShell
      title={product.name}
      subtitle={`${product.code} · ${formatProductType(product.productType)}`}
      activeHref="/portal/sales/products"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/sales/products"
          className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to products
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm">
            <Pencil className="mr-2 size-4" />
            Edit product
          </Button>
          <Button type="button" variant="secondary" size="sm">
            <Coffee className="mr-2 size-4" />
            Manage assignments
          </Button>
          <Button type="button" size="sm">
            <Printer className="mr-2 size-4" />
            Print product report
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={getProductStatusTone(product.status)}>{formatProductStatus(product.status)}</Badge>
                <Badge tone={getProductTypeTone(product.productType)}>{formatProductType(product.productType)}</Badge>
                <Badge tone={product.vatCode === "T1" ? "warning" : "neutral"}>VAT {product.vatCode}</Badge>
                <Badge tone={formatPublicVisibility(product) === "Assigned customers only" ? "warning" : "neutral"}>
                  {formatPublicVisibility(product)}
                </Badge>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{product.name}</h2>
              <p className="mt-1 max-w-3xl text-sm text-freshpac-grey">
                {product.description || "No description recorded."}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Sage code" value={product.code} />
                <DetailField label="Category" value={product.category || "None"} />
                <DetailField label="Group" value={product.productGroup || "None"} />
                <DetailField label="Pack size" value={product.packSize || "None"} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Product warnings</p>

              <div className="mt-3 space-y-2">
                {warnings.map((warning) => (
                  <div key={warning.label} className="rounded-xl border border-freshpac-panel bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-freshpac-charcoal">{warning.label}</p>
                      <Badge tone={warning.tone}>{warning.label}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-freshpac-grey">{warning.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-[86px] z-20 mb-4 overflow-x-auto rounded-2xl border border-freshpac-panel bg-white p-1 shadow-panel">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="rounded-xl px-3 py-2 text-xs font-bold text-freshpac-grey transition hover:bg-orange-50 hover:text-freshpac-charcoal"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <ModuleSection
          id="overview"
          title="Overview"
          description="Core product details and visibility controls."
          action={
            <Button type="button" variant="secondary" size="sm">
              <FileText className="mr-2 size-4" />
              View history
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Product code" value={product.code} />
            <DetailField label="Product type" value={formatProductType(product.productType)} />
            <DetailField label="Status" value={formatProductStatus(product.status)} />
            <DetailField label="Visibility" value={formatPublicVisibility(product)} />
            <DetailField label="Category" value={product.category || "None"} />
            <DetailField label="Group" value={product.productGroup || "None"} />
            <DetailField label="Pack size" value={product.packSize || "None"} />
            <DetailField label="Sage required" value={product.sageCodeRequired ? "Yes" : "No"} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="pricing"
          title="Default pricing"
          description="Customer-specific pricing overrides these defaults."
          action={
            <Button type="button" variant="secondary" size="sm">
              <ShieldCheck className="mr-2 size-4" />
              Audit price changes
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <DetailField label="Price ex VAT" value={formatMoneyFromPence(product.priceExVatPence)} />
            <DetailField label="VAT code" value={product.vatCode} />
            <DetailField label="VAT rate" value={formatVatRate(product.vatRateBasisPoints)} />
            <DetailField label="VAT amount" value={formatMoneyFromPence(vatAmountPence)} />
            <DetailField label="Price inc VAT" value={formatMoneyFromPence(priceIncVatPence)} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="assignments"
          title="Customer assignments"
          description="Coffee and retail products must be assigned to customers before they can see or order them."
          action={
            <Button type="button" variant="secondary" size="sm">
              <Plus className="mr-2 size-4" />
              Assign customer
            </Button>
          }
        >
          {product.customerAccess.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Site</th>
                    <th>Status</th>
                    <th>Assigned date</th>
                  </tr>
                </thead>

                <tbody>
                  {product.customerAccess.map((access) => (
                    <tr key={access.id}>
                      <td>
                        <Link
                          href={`/portal/sales/customers/${access.customer.accountNumber}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {access.customer.accountNumber}
                        </Link>
                      </td>
                      <td>{access.customer.siteName}</td>
                      <td>{access.customer.status}</td>
                      <td>{formatDate(access.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="This product has no customer-specific assignments yet." />
          )}
        </ModuleSection>

        <ModuleSection
          id="customer-prices"
          title="Customer-specific prices"
          description="Customer-specific prices override the product default price."
        >
          {product.customerPrices.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Site</th>
                    <th>Default ex VAT</th>
                    <th>Customer ex VAT</th>
                    <th>Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {product.customerPrices.map((price) => (
                    <tr key={price.id}>
                      <td>
                        <Link
                          href={`/portal/sales/customers/${price.customer.accountNumber}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {price.customer.accountNumber}
                        </Link>
                      </td>
                      <td>{price.customer.siteName}</td>
                      <td>{formatMoneyFromPence(product.priceExVatPence)}</td>
                      <td className="font-black text-freshpac-charcoal">{formatMoneyFromPence(price.priceExVatPence)}</td>
                      <td>{formatDate(price.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No customer-specific price overrides recorded." />
          )}
        </ModuleSection>

        <ModuleSection id="sales-history" title="Sales history" description="Calculated from order lines linked to this product.">
          <div className="grid gap-3 md:grid-cols-3">
            {salesStats.map((history) => (
              <div key={history.period} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">{history.period}</p>
                <p className="mt-2 text-2xl font-black text-freshpac-charcoal">{history.quantity}</p>
                <p className="text-sm font-semibold text-freshpac-grey">{history.value}</p>
              </div>
            ))}
          </div>

          {product.orderLines.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Qty</th>
                    <th>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {product.orderLines.slice(0, 10).map((line) => (
                    <tr key={line.id}>
                      <td>{line.order.reference || line.order.temporaryReference || "No reference"}</td>
                      <td>{line.order.customer.siteName}</td>
                      <td>{formatDate(line.createdAt)}</td>
                      <td>{line.quantity}</td>
                      <td>{formatMoneyFromPence(line.lineTotalPence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </ModuleSection>

        <ModuleSection id="standing" title="Standing order use" description="Standing order lines linked to this product.">
          {product.standingLines.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Interval</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {product.standingLines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.standingOrder.customer.siteName}</td>
                      <td>{line.standingOrder.status}</td>
                      <td>Every {line.standingOrder.intervalWeeks} week(s)</td>
                      <td>{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="This product is not currently used in standing orders." />
          )}
        </ModuleSection>

        <ModuleSection id="retail" title="Retail order use" description="Retail order lines linked to this product.">
          {product.retailLines.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Week start</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {product.retailLines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.retailOrder.customer.siteName}</td>
                      <td>{line.retailOrder.status}</td>
                      <td>{formatDate(line.retailOrder.orderWeekStart)}</td>
                      <td>{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="This product is not currently used in retail orders." />
          )}
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Operational notes for product handling and restrictions.">
          <div className="grid gap-2">
            <div className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
              Product notes will be added as a database field later. For now, visibility and pricing rules are stored in structured fields.
            </div>
            {product.productType === "COFFEE" ? (
              <div className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                Coffee products must not be visible to unassigned customers.
              </div>
            ) : null}
            {product.productType === "RETAIL" ? (
              <div className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                Retail products are assigned like coffee products and roll into baskets during weekly rollover.
              </div>
            ) : null}
          </div>
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Price changes, assignments and product updates must be logged.">
          <EmptyState message="Product-specific audit timeline will be wired after the audit module is added." />
        </ModuleSection>

        <div className="flex justify-end">
          <LinkButton href="/portal/sales/products" variant="secondary">
            Back to product list
          </LinkButton>
        </div>
      </div>
    </PortalShell>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
      {message}
    </p>
  );
}