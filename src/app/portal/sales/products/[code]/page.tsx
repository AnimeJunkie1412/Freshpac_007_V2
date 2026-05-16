import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Coffee, FileText, Pencil, Plus, Printer, ShieldCheck } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductByCode } from "@/lib/sales/products";

const tabs = [
  { label: "Overview", href: "#overview" },
  { label: "Pricing", href: "#pricing" },
  { label: "Assignments", href: "#assignments" },
  { label: "Sales history", href: "#sales-history" },
  { label: "Notes", href: "#notes" },
  { label: "Audit", href: "#audit" }
];

export default function ProductDetailPage({ params }: { params: { code: string } }) {
  const product = getProductByCode(params.code);

  if (!product) {
    notFound();
  }

  return (
    <PortalShell
      title={product.name}
      subtitle={`${product.code} · ${product.type}`}
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
                <StatusBadge
                  status={product.status}
                  tone={product.status === "Active" ? "success" : product.status === "Inactive" ? "warning" : "danger"}
                />
                <ProductTypeBadge type={product.type} />
                <Badge tone={product.pricing.vatCode === "T1" ? "warning" : "neutral"}>
                  VAT {product.pricing.vatCode}
                </Badge>
                <Badge tone={product.publicVisibility === "Assigned customers only" ? "warning" : "neutral"}>
                  {product.publicVisibility}
                </Badge>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{product.name}</h2>
              <p className="mt-1 max-w-3xl text-sm text-freshpac-grey">{product.description}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Sage code" value={product.code} />
                <DetailField label="Category" value={product.category} />
                <DetailField label="Group" value={product.group} />
                <DetailField label="Pack size" value={product.packSize} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Control rules</p>

              <div className="mt-3 space-y-2">
                <RuleCard label="Sage code required" value={product.sageRequired ? "Yes" : "No"} />
                <RuleCard label="Customer can see code" value={product.customerCanSeeCode ? "Yes" : "No"} />
                <RuleCard label="Visibility" value={product.publicVisibility} />
                <RuleCard label="Assigned customers" value={String(product.assignedCustomers.length)} />
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
            <DetailField label="Product type" value={product.type} />
            <DetailField label="Status" value={product.status} />
            <DetailField label="Visibility" value={product.publicVisibility} />
            <DetailField label="Category" value={product.category} />
            <DetailField label="Group" value={product.group} />
            <DetailField label="Pack size" value={product.packSize} />
            <DetailField label="Sage required" value={product.sageRequired ? "Yes" : "No"} />
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
            <DetailField label="Price ex VAT" value={product.pricing.priceExVat} />
            <DetailField label="VAT code" value={product.pricing.vatCode} />
            <DetailField label="VAT rate" value={product.pricing.vatRate} />
            <DetailField label="VAT amount" value={product.pricing.vatAmount} />
            <DetailField label="Price inc VAT" value={product.pricing.priceIncVat} />
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
          {product.assignedCustomers.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Site</th>
                    <th>Customer price</th>
                    <th>Assigned date</th>
                  </tr>
                </thead>

                <tbody>
                  {product.assignedCustomers.map((customer) => (
                    <tr key={customer.accountNumber}>
                      <td>
                        <Link
                          href={`/portal/sales/customers/${customer.accountNumber}`}
                          className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                        >
                          {customer.accountNumber}
                        </Link>
                      </td>
                      <td>{customer.siteName}</td>
                      <td>{customer.customerPrice}</td>
                      <td>{customer.assignedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
              This product has no customer-specific assignments yet.
            </p>
          )}
        </ModuleSection>

        <ModuleSection id="sales-history" title="Sales history" description="Starter sales history view. Later this will come from processed order lines.">
          <div className="grid gap-3 md:grid-cols-3">
            {product.salesHistory.map((history) => (
              <div key={history.period} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-grey">{history.period}</p>
                <p className="mt-2 text-2xl font-black text-freshpac-charcoal">{history.quantity}</p>
                <p className="text-sm font-semibold text-freshpac-grey">{history.value}</p>
              </div>
            ))}
          </div>
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Operational notes for product handling and restrictions.">
          <div className="grid gap-2">
            {product.notes.map((note) => (
              <div key={note} className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                {note}
              </div>
            ))}
          </div>
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Price changes, assignments and product updates must be logged.">
          <div className="space-y-3">
            {product.audit.map((event) => (
              <div key={`${event.date}-${event.action}`} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-freshpac-charcoal">{event.action}</p>
                  <Badge>{event.date}</Badge>
                </div>
                <p className="mt-1 text-sm text-freshpac-grey">By {event.user}</p>
                <p className="mt-2 text-sm text-freshpac-charcoal">{event.note}</p>
              </div>
            ))}
          </div>
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

function ProductTypeBadge({ type }: { type: string }) {
  if (type === "Coffee Product") {
    return <Badge tone="info">Coffee Product</Badge>;
  }

  if (type === "Retail Product") {
    return <Badge tone="warning">Retail Product</Badge>;
  }

  return <Badge tone="neutral">Normal Product</Badge>;
}

function RuleCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-freshpac-panel bg-white p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-freshpac-grey">{label}</p>
      <p className="mt-1 text-sm font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}