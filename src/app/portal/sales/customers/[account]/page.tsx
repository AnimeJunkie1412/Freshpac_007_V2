import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Coffee, FileText, Pencil, Plus, Printer, ShoppingBasket, Wrench } from "lucide-react";
import { addCustomerNote } from "@/app/portal/sales/customers/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { DetailField } from "@/components/sales/detail-field";
import { ModuleSection } from "@/components/sales/module-section";
import { StatusBadge } from "@/components/sales/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildCustomerFlags,
  formatCustomerStatus,
  formatDate,
  formatDateTime,
  formatDeliveryMethod,
  formatEquipmentStatus,
  formatMoneyFromPence,
  formatOrderStatus,
  formatProductType,
  getAddressLines,
  getCustomerByAccountFromDb,
  getCustomerStatusTone
} from "@/lib/sales/customer-db";

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
  const customer = await getCustomerByAccountFromDb(decodeURIComponent(account));

  if (!customer) {
    notFound();
  }

  const invoiceAddress = getAddressLines(customer.addresses, "INVOICE");
  const deliveryAddress = getAddressLines(customer.addresses, "DELIVERY");
  const alternativeAddresses = customer.addresses.filter((address) => address.type === "ALTERNATIVE_DELIVERY");
  const flags = buildCustomerFlags(customer);
  const coffeeProducts = customer.productAccess.filter((access) => access.product.productType === "COFFEE");
  const retailProducts = customer.productAccess.filter((access) => access.product.productType === "RETAIL");

  return (
    <PortalShell
      title={customer.siteName}
      subtitle={`${customer.accountNumber} · ${customer.legalName || "No legal name recorded"}`}
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
                <StatusBadge status={formatCustomerStatus(customer.status)} tone={getCustomerStatusTone(customer.status)} />
                <Badge tone={customer.priceVisibility ? "success" : "warning"}>
                  Prices {customer.priceVisibility ? "On" : "Off"}
                </Badge>
                <Badge tone={customer.onCallList ? "info" : "neutral"}>
                  {customer.onCallList ? "On call list" : "Not on call list"}
                </Badge>
                <Badge>{formatDeliveryMethod(customer.deliveryMethod)}</Badge>
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-freshpac-charcoal">{customer.siteName}</h2>
              <p className="text-sm text-freshpac-grey">{customer.legalName || "No legal name recorded"}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailField label="Account" value={customer.accountNumber} />
                <DetailField
                  label="Delivery"
                  value={`${customer.deliveryDay || "Not set"} · ${customer.driverOrCourier || formatDeliveryMethod(customer.deliveryMethod)}`}
                />
                <DetailField label="Contact day" value={customer.contactDay || "Not set"} />
                <DetailField label="Sales rep" value={customer.assignedSalesRep || "Unassigned"} />
              </div>
            </div>

            <div className="rounded-2xl border border-freshpac-panel bg-orange-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-freshpac-grey">Account flags</p>
              <div className="mt-3 space-y-2">
                {flags.map((flag) => (
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
            <DetailField label="Parent account" value={customer.parentAccount?.accountNumber || "None"} />
            <DetailField
              label="Linked children"
              value={customer.childAccounts.length ? customer.childAccounts.map((child) => child.accountNumber).join(", ") : "None"}
            />
            <DetailField label="Opened" value={formatDate(customer.accountOpenedAt)} />
            <DetailField label="Orders" value={String(customer.orders.length)} />
            <DetailField label="Contact day" value={customer.contactDay || "Not set"} />
            <DetailField label="Contact frequency" value={`Every ${customer.contactFrequencyWeeks} week(s)`} />
            <DetailField label="Delivery method" value={formatDeliveryMethod(customer.deliveryMethod)} />
            <DetailField label="Driver / courier" value={customer.driverOrCourier || "Not set"} />
          </div>
        </ModuleSection>

        <ModuleSection
          id="contacts"
          title="Contacts"
          description="Customer contacts from the database."
          action={
            <Button type="button" variant="secondary" size="sm">
              <Plus className="mr-2 size-4" />
              Add contact
            </Button>
          }
        >
          {customer.contacts.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {customer.contacts.map((contact) => (
                <div key={contact.id} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-freshpac-charcoal">{contact.name}</p>
                      <p className="text-sm text-freshpac-grey">{contact.role || "No role recorded"}</p>
                    </div>
                    {contact.isPrimary ? <Badge tone="success">Primary</Badge> : null}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <p>
                      <span className="font-bold text-freshpac-charcoal">Phone:</span> {contact.phone || "Not recorded"}
                    </p>
                    <p>
                      <span className="font-bold text-freshpac-charcoal">Email:</span> {contact.email || "Not recorded"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No contacts recorded." />
          )}
        </ModuleSection>

        <ModuleSection id="delivery" title="Delivery" description="Invoice, delivery and alternative address details.">
          <div className="grid gap-4 lg:grid-cols-3">
            <AddressCard title="Invoice address" lines={invoiceAddress} />
            <AddressCard title="Delivery address" lines={deliveryAddress} />
            <div className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <p className="font-black text-freshpac-charcoal">Alternative delivery addresses</p>
              <div className="mt-3 space-y-2">
                {alternativeAddresses.length ? (
                  alternativeAddresses.map((address) => (
                    <div key={address.id} className="rounded-xl bg-freshpac-cream/70 p-3 text-sm text-freshpac-charcoal">
                      {address.lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-freshpac-cream/70 p-3 text-sm text-freshpac-grey">None recorded.</p>
                )}
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
          {customer.prices.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Default ex VAT</th>
                    <th>Customer ex VAT</th>
                    <th>VAT</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.prices.map((line) => (
                    <tr key={line.id}>
                      <td className="font-bold">{line.product.code}</td>
                      <td>{line.product.name}</td>
                      <td>{formatProductType(line.product.productType)}</td>
                      <td>{formatMoneyFromPence(line.product.priceExVatPence)}</td>
                      <td className="font-black text-freshpac-charcoal">{formatMoneyFromPence(line.priceExVatPence)}</td>
                      <td>{line.product.vatCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No customer-specific pricing recorded." />
          )}
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
            <ProductList
              title="Coffee products"
              products={coffeeProducts.map((access) => `${access.product.code} · ${access.product.name}`)}
              emptyText="No coffee products assigned."
            />
            <ProductList
              title="Retail products"
              products={retailProducts.map((access) => `${access.product.code} · ${access.product.name}`)}
              emptyText="No retail products assigned."
            />
          </div>
        </ModuleSection>

        <ModuleSection id="equipment" title="Equipment onsite" description="Machine records, serial numbers, status and service information.">
          {customer.equipment.length ? (
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
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.makeModel || "Not recorded"}</td>
                      <td className="font-bold">{item.serialNumber || "Not recorded"}</td>
                      <td>
                        <StatusBadge status={formatEquipmentStatus(item.status)} />
                      </td>
                      <td>{formatDate(item.installedAt)}</td>
                      <td>{formatDate(item.lastServiceAt)}</td>
                      <td>{item.breakdownCover || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No equipment recorded." />
          )}
        </ModuleSection>

        <ModuleSection id="instructions" title="Special instructions" description="Important customer-specific handling, access and delivery notes.">
          {customer.notes.length ? (
            <div className="grid gap-2">
              {customer.notes.slice(0, 4).map((note) => (
                <div key={note.id} className="rounded-xl border border-freshpac-panel bg-white p-3 text-sm font-semibold text-freshpac-charcoal">
                  {note.note}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No special instructions recorded yet." />
          )}
        </ModuleSection>

        <ModuleSection id="breakdowns" title="Breakdown history" description="Engineer jobs linked to this customer.">
          {customer.engineerJobs.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Fault</th>
                    <th>Chargeable</th>
                    <th>Parts</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.engineerJobs.map((job) => (
                    <tr key={job.id}>
                      <td>{formatDate(job.createdAt)}</td>
                      <td className="font-bold">{job.reference || job.temporaryReference || "No ref"}</td>
                      <td>{job.status}</td>
                      <td>{job.jobTypes.join(", ")}</td>
                      <td>{job.reportedFault || "No fault recorded"}</td>
                      <td>{job.chargeable}</td>
                      <td>{job.partsRequests.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No engineer jobs recorded." />
          )}
        </ModuleSection>

        <ModuleSection id="notes" title="Notes" description="Searchable customer notes with internal or customer-visible status.">
          <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
            <form action={addCustomerNote} className="rounded-2xl border border-freshpac-panel bg-white p-4">
              <input type="hidden" name="customerId" value={customer.id} />
              <input type="hidden" name="accountNumber" value={customer.accountNumber} />
              <input type="hidden" name="visibility" value="internal" />

              <p className="font-black text-freshpac-charcoal">Add note</p>
              <p className="mt-1 text-sm text-freshpac-grey">
                Add an internal account note. This will also create an audit event.
              </p>

              <textarea
                name="note"
                required
                placeholder="Type customer note..."
                className="mt-3 min-h-32 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
              />

              <div className="mt-3 flex justify-end">
                <Button type="submit">Add note</Button>
              </div>
            </form>

            <div>
              {customer.notes.length ? (
                <div className="space-y-3">
                  {customer.notes.map((note) => (
                    <div key={note.id} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-black text-freshpac-charcoal">{note.createdByUser?.fullName || "Unknown user"}</p>
                        <div className="flex gap-2">
                          <Badge>{formatDateTime(note.createdAt)}</Badge>
                          <Badge tone={note.visibility === "internal" ? "neutral" : "info"}>{note.visibility}</Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-freshpac-charcoal">{note.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No notes recorded." />
              )}
            </div>
          </div>
        </ModuleSection>

        <ModuleSection id="rental" title="Rental information" description="Rental notes and machine loan/rental records.">
          {customer.equipment.some((item) => item.rentalAmountPence || item.rentalNotes) ? (
            <div className="grid gap-3">
              {customer.equipment
                .filter((item) => item.rentalAmountPence || item.rentalNotes)
                .map((item) => (
                  <div key={item.id} className="rounded-2xl border border-freshpac-panel bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <DetailField label="Machine" value={item.description} />
                      <DetailField label="Rental amount" value={formatMoneyFromPence(item.rentalAmountPence)} />
                      <DetailField label="Condition" value={item.machineCondition || "Not recorded"} />
                      <DetailField label="Start date" value={formatDate(item.rentalStartAt)} />
                      <DetailField label="Duration" value={item.rentalDuration || "Not recorded"} />
                      <DetailField label="Install date" value={formatDate(item.installedAt)} />
                    </div>
                    <p className="mt-3 rounded-xl bg-freshpac-cream/70 p-3 text-sm text-freshpac-charcoal">
                      {item.rentalNotes || "No rental note."}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState message="No rental information recorded." />
          )}
        </ModuleSection>

        <ModuleSection id="orders" title="Orders" description="Recent order history for this account.">
          {customer.orders.length ? (
            <div className="overflow-x-auto">
              <table className="fp-compact-table min-w-full border-collapse">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total inc VAT</th>
                    <th>Source</th>
                    <th>Lines</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-bold">{order.reference || order.temporaryReference || "No reference"}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <StatusBadge status={formatOrderStatus(order.status)} />
                      </td>
                      <td>{formatMoneyFromPence(order.totalIncVatPence)}</td>
                      <td>{order.source}</td>
                      <td>{order.lines.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="No orders recorded." />
          )}
        </ModuleSection>

        <ModuleSection id="audit" title="Audit history" description="Audit log wiring comes next. This panel is ready for account-specific audit events.">
          <EmptyState message="Account-specific audit timeline will be wired after the audit module is added." />
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

function ProductList({
  title,
  products,
  emptyText = "No products assigned."
}: {
  title: string;
  products: string[];
  emptyText?: string;
}) {
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

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
      {message}
    </p>
  );
}