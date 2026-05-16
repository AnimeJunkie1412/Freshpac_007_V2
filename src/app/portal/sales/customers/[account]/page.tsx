import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Coffee, FileText, Pencil, Plus, Printer, ShoppingBasket, Wrench } from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomerByAccount } from "@/lib/sales/customers";

const tabs = [
  { label: "Overview", href: "#overview" },
  { label: "Contacts", href: "#contacts" },
  { label: "Delivery", href: "#delivery" },
  { label: "Pricing", href: "#pricing" },
  { label: "Coffee", href: "#coffee" },
  { label: "Equipment", href: "#equipment" },
  { label: "Instructions", href: "#instructions" },
  { label: "Breakdowns", href: "#breakdowns" },
  { label: "Notes", href: "#notes" },
  { label: "Rental", href: "#rental" },
  { label: "Orders", href: "#orders" },
  { label: "Audit", href: "#audit" }
];

export default async function CustomerDetailPage({
  params
}: {
  params: Promise<{ account: string }>;
}) {
  const { account } = await params;
  const customer = getCustomerByAccount(decodeURIComponent(account));

  if (!customer) {
    notFound();
  }

  return (
    <PortalShell
      title={customer.siteName}
      subtitle={`${customer.accountNumber} · ${customer.legalName}`}
      activeHref="/portal/sales/customers"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/sales/customers"
          className="inline-flex items-center rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-sm font-semibold text-freshpac-charcoal hover:border-freshpac-orange"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to customers
        </Link>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm">
            <Pencil className="mr-2 size-4" />
            Edit account
          </Button>
          <Button type="button" variant="secondary" size="sm">
            <ShoppingBasket className="mr-2 size-4" />
            Place order
          </Button>
          <Button type="button" variant="secondary" size="sm">
            <Wrench className="mr-2 size-4" />
            Create engineer job
          </Button>
          <Button type="button" size="sm">
            <Printer className="mr-2 size-4" />
            Print report
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={customer.status} tone={customer.statusTone} />
                <Badge tone={customer.priceVisibility === "On" ? "success" : "warning"}>
                  Prices {customer.priceVisibility}
                </Badge>
                <Badge tone={customer.onCallList ? "info" : "neutral"}>
                  {customer.onCallList ? "On call list" : "Not on call list"}
                </Badge>
                <Badge>{customer.deliveryMethod}</Badge>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{customer.siteName}</h2>
              <p className="text-sm text-freshpac-grey">{customer.legalName}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Account" value={customer.accountNumber} />
                <DetailField label="Delivery" value={`${customer.deliveryDay} · ${customer.driverOrCourier}`} />
                <DetailField label="Cut-off" value={customer.nextCutOff} />
                <DetailField label="Sales rep" value={customer.assignedSalesRep} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Account flags</p>
              <div className="mt-3 space-y-2">
                {customer.flags.map((flag) => (
                  <div key={flag.label} className="rounded-xl border border-freshpac-panel bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-freshpac-charcoal">{flag.label}</p>
                      <Badge tone={flag.tone}>{flag.label}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-freshpac-grey">{flag.description}</p>
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
          description="The main account controls and fast-reference information."
          action={
            <Button type="button" variant="secondary" size="sm">
              <ClipboardList className="mr-2 size-4" />
              Add account note
            </Button>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Parent account" value={customer.parentAccount} />
            <DetailField label="Linked children" value={customer.linkedChildren.length ? customer.linkedChildren.join(", ") : "None"} />
            <DetailField label="Opened" value={customer.accountOpened} />
            <DetailField label="Last order" value={customer.lastOrderDate} />
            <DetailField label="Contact day" value={customer.contactDay} />
            <DetailField label="Contact frequency" value={customer.contactFrequency} />
            <DetailField label="Delivery method" value={customer.deliveryMethod} />
            <DetailField label="Driver / courier" value={customer.driverOrCourier} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="contacts"
          title="Contacts"
          description="Up to four customer contacts will be supported when this is wired to the database."
          action={
            <Button type="button" variant="secondary" size="sm">
              <Plus className="mr-2 size-4" />
              Add contact
            </Button>
          }
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {customer.contacts.map((contact) => (
              <div key={contact.email} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-freshpac-charcoal">{contact.name}</p>
                    <p className="text-sm text-freshpac-grey">{contact.role}</p>
                  </div>
                  {contact.primary ? <Badge tone="success">Primary</Badge> : null}
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <p>
                    <span className="font-bold text-freshpac-charcoal">Phone:</span> {contact.phone}
                  </p>
                  <p>
                    <span className="font-bold text-freshpac-charcoal">Email:</span> {contact.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ModuleSection>

        <ModuleSection id="delivery" title="Delivery" description="Invoice, delivery and alternative address details.">
          <div className="grid gap-4 lg:grid-cols-3">
            <AddressCard title="Invoice address" lines={customer.invoiceAddress} />
            <AddressCard title="Delivery address" lines={customer.deliveryAddress} />
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Alternative delivery addresses</p>
              <div className="mt-3 space-y-2">
                {customer.alternativeDeliveryAddresses.map((address) => (
                  <p key={address} className="rounded-xl bg-freshpac-cream/70 p-3 text-sm text-freshpac-charcoal">
                    {address}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </ModuleSection>

        <ModuleSection
          id="pricing"
          title="Pricing"
          description="Customer-specific pricing overrides default pricing. Product codes are visible to staff only."
          action={
            <Button type="button" variant="secondary" size="sm">
              <FileText className="mr-2 size-4" />
              Pricing report
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  <th>Default</th>
                  <th>Customer</th>
                  <th>VAT</th>
                </tr>
              </thead>
              <tbody>
                {customer.pricing.map((line) => (
                  <tr key={line.productCode}>
                    <td className="font-bold">{line.productCode}</td>
                    <td>{line.productName}</td>
                    <td>{line.defaultPrice}</td>
                    <td className="font-black text-freshpac-charcoal">{line.customerPrice}</td>
                    <td>{line.vat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleSection>

        <ModuleSection
          id="coffee"
          title="Assigned coffee and retail products"
          description="Coffee and retail products are restricted and must be assigned to each account individually."
          action={
            <Button type="button" variant="secondary" size="sm">
              <Coffee className="mr-2 size-4" />
              Manage assignments
            </Button>
          }
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ProductList title="Coffee products" products={customer.coffeeProducts} />
            <ProductList title="Retail products" products={customer.retailProducts} emptyText="No retail products assigned." />
          </div>
        </ModuleSection>

        <ModuleSection id="equipment" title="Equipment onsite" description="Machine records, serial numbers, status and service information.">
          <div className="overflow-x-auto">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Make / model</th>
                  <th>Serial</th>
                  <th>Status</th>
                  <th>Installed</th>
                  <th>Last service</th>
                  <th>Cover</th>
                </tr>
              </thead>
              <tbody>
                {customer.equipment.map((item) => (
                  <tr key={item.serialNumber}>
                    <td>{item.description}</td>
                    <td>{item.makeModel}</td>
                    <td className="font-bold">{item.serialNumber}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{item.installedDate}</td>
                    <td>{item.lastServiceDate}</td>
                    <td>{item.breakdownCover}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleSection>

        <ModuleSection id="instructions" title="Special instructions" description="Important customer-specific handling, access and delivery notes.">
          <div className="grid gap-2">
            {customer.specialInstructions.map((instruction) => (
              <div key={instruction} className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                {instruction}
              </div>
            ))}
          </div>
        </ModuleSection>

        <ModuleSection id="breakdowns" title="Breakdown history" description="Machine breakdowns, service outcomes and chargeable indicators.">
          <div className="overflow-x-auto">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Job</th>
                  <th>Machine</th>
                  <th>Fault</th>
                  <th>Outcome</th>
                  <th>Chargeable</th>
                </tr>
              </thead>
              <tbody>
                {customer.breakdownHistory.map((job) => (
                  <tr key={job.jobRef}>
                    <td>{job.date}</td>
                    <td className="font-bold">{job.jobRef}</td>
                    <td>{job.machine}</td>
                    <td>{job.fault}</td>
                    <td>{job.outcome}</td>
                    <td>{job.chargeable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Searchable customer notes with internal or customer-visible status.">
          <div className="space-y-3">
            {customer.notes.map((note) => (
              <div key={`${note.date}-${note.author}`} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-freshpac-charcoal">{note.author}</p>
                  <div className="flex gap-2">
                    <Badge>{note.date}</Badge>
                    <Badge tone={note.visibility === "Internal" ? "neutral" : "info"}>{note.visibility}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-freshpac-charcoal">{note.note}</p>
              </div>
            ))}
          </div>
        </ModuleSection>

        <ModuleSection id="rental" title="Rental information" description="Rental notes and machine loan/rental records.">
          {customer.rentalInformation.length ? (
            <div className="grid gap-3">
              {customer.rentalInformation.map((rental) => (
                <div key={rental.machine} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <DetailField label="Machine" value={rental.machine} />
                    <DetailField label="Rental amount" value={rental.rentalAmount} />
                    <DetailField label="Condition" value={rental.condition} />
                    <DetailField label="Start date" value={rental.rentalStartDate} />
                    <DetailField label="Duration" value={rental.duration} />
                    <DetailField label="Install date" value={rental.installationDate} />
                  </div>
                  <p className="mt-3 rounded-xl bg-freshpac-cream/70 p-3 text-sm text-freshpac-charcoal">{rental.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
              No rental information recorded.
            </p>
          )}
        </ModuleSection>

        <ModuleSection id="orders" title="Orders" description="Recent order history for this account.">
          <div className="overflow-x-auto">
            <table className="fp-compact-table min-w-full border-collapse">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((order) => (
                  <tr key={order.reference}>
                    <td className="font-bold">{order.reference}</td>
                    <td>{order.date}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{order.total}</td>
                    <td>{order.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Important customer events and system changes.">
          <div className="space-y-3">
            {customer.audit.map((event) => (
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
          <LinkButton href="/portal/sales/customers" variant="secondary">
            Back to customer list
          </LinkButton>
        </div>
      </div>
    </PortalShell>
  );
}

function AddressCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
      <p className="font-black text-freshpac-charcoal">{title}</p>
      <div className="mt-3 text-sm leading-6 text-freshpac-charcoal">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function ProductList({ title, products, emptyText = "No products assigned." }: { title: string; products: string[]; emptyText?: string }) {
  return (
    <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
      <p className="font-black text-freshpac-charcoal">{title}</p>
      <div className="mt-3 grid gap-2">
        {products.length ? (
          products.map((product) => (
            <div key={product} className="rounded-xl bg-freshpac-cream/70 p-3 text-sm font-semibold text-freshpac-charcoal">
              {product}
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-freshpac-cream/70 p-3 text-sm text-freshpac-grey">{emptyText}</p>
        )}
      </div>
    </div>
  );
}