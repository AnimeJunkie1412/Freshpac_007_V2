import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Filter, Phone, Search, ShoppingBasket, UserRoundCheck } from "lucide-react";
import {
  markCallListCalled,
  markCallListNeedsContact,
  markCallListNothingNeeded,
  updateCallListNotes
} from "@/app/portal/sales/call-list/actions";
import { PortalShell } from "@/components/layout/portal-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatBasketStatus,
  formatCallListStatus,
  formatCustomerStatus,
  getBasketStatusTone,
  getCallListAttentionFromDb,
  getCallListEntriesFromDb,
  getCallListStatsFromDb,
  getCallListStatusTone,
  getCustomerStatusTone,
  getBasketValueText,
  getLatestOrderText
} from "@/lib/sales/call-list-db";

const filters = ["All", "To call", "Called", "Nothing Needed", "Order placed", "Needs contact", "Tuesday", "Courier"];

export default async function CallListPage() {
  const [entries, attentionEntries, stats] = await Promise.all([
    getCallListEntriesFromDb(),
    getCallListAttentionFromDb(),
    getCallListStatsFromDb()
  ]);

  return (
    <PortalShell
      title="Sales call list"
      subtitle="Live weekly telesales list from Supabase/PostgreSQL via Prisma."
      activeHref="/portal/sales/call-list"
    >
      <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Call list search</CardTitle>
            <CardDescription>
              Filter customers by delivery day, contact day, driver, courier, frequency, account status and sales rep.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-freshpac-grey" />
                <Input className="pl-9" placeholder="Search customer, account, contact, phone, driver..." />
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

        <Card className="portal-card-safe">
          <CardHeader>
            <CardTitle>Call counters</CardTitle>
            <CardDescription>Live weekly contact progress.</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3">
            <MiniStat label="Total" value={stats.total} icon={<ClipboardList className="size-4" />} />
            <MiniStat label="To call" value={stats.toCall} tone="info" icon={<Phone className="size-4" />} />
            <MiniStat label="Orders" value={stats.orderPlaced} tone="success" icon={<ShoppingBasket className="size-4" />} />
            <MiniStat label="Nothing" value={stats.nothingNeeded} icon={<CheckCircle2 className="size-4" />} />
            <MiniStat label="Contact" value={stats.needsContact} tone="warning" icon={<UserRoundCheck className="size-4" />} />
            <MiniStat label="Called" value={stats.called} tone="info" icon={<Phone className="size-4" />} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="portal-card-safe">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Weekly call list</CardTitle>
                <CardDescription>
                  These records now come from Supabase/PostgreSQL through Prisma.
                </CardDescription>
              </div>
              <Badge tone="success">Live database</Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="block p-3 md:hidden">
              <div className="grid gap-3">
                {entries.map((entry) => {
                  const primaryContact = entry.customer.contacts[0];

                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-freshpac-panel bg-white p-4 shadow-sm"
                    >
                      <Link href={`/portal/sales/customers/${entry.customer.accountNumber}`} className="block">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-freshpac-orange">
                              {entry.customer.accountNumber}
                            </p>
                            <p className="mt-1 truncate text-base font-black text-freshpac-charcoal">
                              {entry.customer.siteName}
                            </p>
                            <p className="truncate text-xs text-freshpac-grey">
                              {primaryContact?.name || "No contact"} · {primaryContact?.phone || "No phone"}
                            </p>
                          </div>

                          <Badge tone={getCallListStatusTone(entry.status)}>
                            {formatCallListStatus(entry.status)}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          <Badge tone={getBasketStatusTone(entry.basketStatus)}>
                            {formatBasketStatus(entry.basketStatus)}
                          </Badge>
                          <Badge tone={getCustomerStatusTone(entry.customer.status)}>
                            {formatCustomerStatus(entry.customer.status)}
                          </Badge>
                          {!entry.customer.priceVisibility ? <Badge tone="warning">Prices hidden</Badge> : null}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MobileDetail label="Delivery" value={entry.deliveryDay || entry.customer.deliveryDay || "Not set"} />
                          <MobileDetail label="Driver" value={entry.driverOrCourier || entry.customer.driverOrCourier || "No driver"} />
                          <MobileDetail label="Contact day" value={entry.contactDay || entry.customer.contactDay || "Not set"} />
                          <MobileDetail label="Frequency" value={`Every ${entry.customer.contactFrequencyWeeks} week(s)`} />
                          <MobileDetail label="Rep" value={entry.assignedSalesRep || entry.customer.assignedSalesRep || "Unassigned"} />
                          <MobileDetail label="Basket" value={getBasketValueText(entry)} />
                          <MobileDetail label="Last order" value={getLatestOrderText(entry.customer.orders)} />
                          <MobileDetail label="Status" value={formatCallListStatus(entry.status)} />
                        </div>

                        {entry.notes ? (
                          <p className="mt-3 rounded-xl bg-freshpac-cream/70 p-3 text-xs font-semibold text-freshpac-charcoal">
                            {entry.notes}
                          </p>
                        ) : null}
                      </Link>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <form action={markCallListCalled}>
                          <input type="hidden" name="entryId" value={entry.id} />
                          <input type="hidden" name="accountNumber" value={entry.customer.accountNumber} />
                          <Button type="submit" size="sm" variant="secondary" className="w-full">
                            Called
                          </Button>
                        </form>

                        <form action={markCallListNothingNeeded}>
                          <input type="hidden" name="entryId" value={entry.id} />
                          <input type="hidden" name="accountNumber" value={entry.customer.accountNumber} />
                          <Button type="submit" size="sm" variant="secondary" className="w-full">
                            Nothing
                          </Button>
                        </form>

                        <Link
                          href={`/portal/sales/customers/${entry.customer.accountNumber}`}
                          className="rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-center text-xs font-bold text-freshpac-charcoal hover:border-freshpac-orange"
                        >
                          Open account
                        </Link>

                        <Link
                          href="/portal/sales/orders/new"
                          className="rounded-xl bg-freshpac-orange px-3 py-2 text-center text-xs font-bold text-freshpac-charcoal hover:bg-orange-400"
                        >
                          Place order
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {!entries.length ? (
                  <div className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                    No call list entries found. Run <span className="font-bold">npm run prisma:seed</span> or run rollover later.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="portal-scroll-panel">
                <table className="fp-compact-table min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Delivery</th>
                      <th>Frequency</th>
                      <th>Rep</th>
                      <th>Status</th>
                      <th>Basket</th>
                      <th>Last order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {entries.map((entry) => {
                      const primaryContact = entry.customer.contacts[0];

                      return (
                        <tr key={entry.id}>
                          <td>
                            <Link
                              href={`/portal/sales/customers/${entry.customer.accountNumber}`}
                              className="font-black text-freshpac-charcoal underline decoration-freshpac-orange/40 underline-offset-4 hover:text-freshpac-orange"
                            >
                              {entry.customer.accountNumber}
                            </Link>
                          </td>
                          <td>
                            <div className="font-bold text-freshpac-charcoal">{entry.customer.siteName}</div>
                            <div className="text-xs text-freshpac-grey">{entry.notes || "No call notes."}</div>
                          </td>
                          <td>
                            <div className="font-semibold">{primaryContact?.name || "No contact"}</div>
                            <div className="text-xs text-freshpac-grey">{primaryContact?.phone || "No phone"}</div>
                          </td>
                          <td>
                            <div className="font-semibold">{entry.deliveryDay || entry.customer.deliveryDay || "Not set"}</div>
                            <div className="text-xs text-freshpac-grey">
                              {entry.driverOrCourier || entry.customer.driverOrCourier || "No driver"}
                            </div>
                          </td>
                          <td>
                            <div className="font-semibold">{entry.contactDay || entry.customer.contactDay || "Not set"}</div>
                            <div className="text-xs text-freshpac-grey">Every {entry.customer.contactFrequencyWeeks} week(s)</div>
                          </td>
                          <td>{entry.assignedSalesRep || entry.customer.assignedSalesRep || "Unassigned"}</td>
                          <td>
                            <Badge tone={getCallListStatusTone(entry.status)}>{formatCallListStatus(entry.status)}</Badge>
                          </td>
                          <td>
                            <div className="font-bold">{getBasketValueText(entry)}</div>
                            <Badge tone={getBasketStatusTone(entry.basketStatus)}>{formatBasketStatus(entry.basketStatus)}</Badge>
                          </td>
                          <td>{getLatestOrderText(entry.customer.orders)}</td>
                          <td>
                            <div className="flex min-w-72 flex-wrap gap-2">
                              <Link
                                href={`/portal/sales/customers/${entry.customer.accountNumber}`}
                                className="rounded-xl border border-freshpac-panel bg-white px-3 py-2 text-xs font-bold text-freshpac-charcoal hover:border-freshpac-orange"
                              >
                                Open
                              </Link>

                              <form action={markCallListCalled}>
                                <input type="hidden" name="entryId" value={entry.id} />
                                <input type="hidden" name="accountNumber" value={entry.customer.accountNumber} />
                                <Button type="submit" size="sm" variant="secondary">
                                  Called
                                </Button>
                              </form>

                              <form action={markCallListNothingNeeded}>
                                <input type="hidden" name="entryId" value={entry.id} />
                                <input type="hidden" name="accountNumber" value={entry.customer.accountNumber} />
                                <Button type="submit" size="sm" variant="secondary">
                                  Nothing
                                </Button>
                              </form>

                              <Link
                                href="/portal/sales/orders/new"
                                className="rounded-xl bg-freshpac-orange px-3 py-2 text-xs font-bold text-freshpac-charcoal hover:bg-orange-400"
                              >
                                Order
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!entries.length ? (
                  <div className="p-6 text-sm text-freshpac-grey">
                    No call list entries found. Run <span className="font-bold">npm run prisma:seed</span> or run rollover later.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Quick update</CardTitle>
              <CardDescription>Update the first call-list entry notes quickly.</CardDescription>
            </CardHeader>

            <CardContent>
              {entries[0] ? (
                <form action={updateCallListNotes} className="grid gap-3">
                  <input type="hidden" name="entryId" value={entries[0].id} />
                  <input type="hidden" name="accountNumber" value={entries[0].customer.accountNumber} />
                  <p className="text-sm font-bold text-freshpac-charcoal">{entries[0].customer.siteName}</p>
                  <textarea
                    name="notes"
                    defaultValue={entries[0].notes || ""}
                    placeholder="Update call notes..."
                    className="min-h-28 w-full rounded-2xl border border-freshpac-panel bg-white px-3 py-2 text-sm text-freshpac-charcoal outline-none transition placeholder:text-freshpac-grey/70 focus:border-freshpac-orange focus:ring-4 focus:ring-orange-100"
                    required
                  />
                  <Button type="submit">Save call note</Button>
                </form>
              ) : (
                <p className="text-sm text-freshpac-grey">No call list entry available.</p>
              )}
            </CardContent>
          </Card>

          <Card className="portal-card-safe">
            <CardHeader>
              <CardTitle>Needs Freshpac contact</CardTitle>
              <CardDescription>Accounts that need extra care before ordering.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {attentionEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-freshpac-panel bg-white p-3">
                  <Link href={`/portal/sales/customers/${entry.customer.accountNumber}`} className="block">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-freshpac-charcoal">{entry.customer.siteName}</p>
                        <p className="text-xs text-freshpac-grey">{entry.customer.accountNumber}</p>
                      </div>
                      <Badge tone={getCustomerStatusTone(entry.customer.status)}>
                        {formatCustomerStatus(entry.customer.status)}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge tone={getCallListStatusTone(entry.status)}>{formatCallListStatus(entry.status)}</Badge>
                      <Badge tone={getBasketStatusTone(entry.basketStatus)}>{formatBasketStatus(entry.basketStatus)}</Badge>
                    </div>

                    <p className="mt-2 text-xs text-freshpac-grey">{entry.notes || "No notes recorded."}</p>
                  </Link>

                  <form action={markCallListNeedsContact} className="mt-3">
                    <input type="hidden" name="entryId" value={entry.id} />
                    <input type="hidden" name="accountNumber" value={entry.customer.accountNumber} />
                    <Button type="submit" size="sm" variant="secondary">
                      <AlertTriangle className="mr-2 size-4" />
                      Keep flagged
                    </Button>
                  </form>
                </div>
              ))}

              {!attentionEntries.length ? (
                <p className="rounded-2xl border border-freshpac-panel bg-white p-4 text-sm text-freshpac-grey">
                  No call list entries currently need extra contact.
                </p>
              ) : null}
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

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-freshpac-charcoal">{value}</p>
    </div>
  );
}