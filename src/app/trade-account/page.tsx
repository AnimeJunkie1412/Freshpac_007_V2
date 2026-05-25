import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, LogOut, PackageSearch, ShoppingBasket, UserRound } from "lucide-react";
import { logout } from "@/app/login/actions";
import { startCustomerOrder } from "@/app/trade-account/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatCustomerOrderStatus,
  formatCustomerPortalDate,
  formatCustomerPortalMoney,
  getCustomerOrderStatusTone,
  getCustomerPortalProfileFromDb
} from "@/lib/customer-portal/customer-portal-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TradeAccountPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/trade-account");
  }

  const profile = await getCustomerPortalProfileFromDb(user.id, user.email);

  if (!profile) {
    redirect("/login?error=profile");
  }

  if (!profile.active) {
    redirect("/login?error=disabled");
  }

  if (profile.role !== "PARENT_USER" && profile.role !== "CHILD_USER") {
    redirect("/portal");
  }

  if (!profile.customerAccount) {
    redirect("/login?error=customer");
  }

  const customer = profile.customerAccount;
  const draftOrder = customer.orders.find((order) => order.status === "DRAFT_BASKET");
  const recentOrders = customer.orders.filter((order) => order.status !== "DRAFT_BASKET");
  const productCount = customer.productAccess.length;
  const priceVisible = customer.priceVisibility;

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

          <form action={logout}>
            <Button type="submit" size="sm" variant="secondary">
              <LogOut className="mr-1.5 size-3.5" />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-3 px-3 py-3 sm:px-4">
        <Card className="portal-card-safe">
          <CardContent className="p-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="success">{profile.role === "PARENT_USER" ? "Parent user" : "Child user"}</Badge>
                  <Badge tone={customer.priceVisibility ? "success" : "warning"}>
                    {customer.priceVisibility ? "Prices visible" : "Prices hidden"}
                  </Badge>
                  <Badge>{customer.status.replace(/_/g, " ")}</Badge>
                </div>

                <h1 className="mt-3 truncate text-2xl font-black tracking-tight text-freshpac-charcoal">
                  {customer.siteName}
                </h1>
                <p className="mt-1 text-sm font-semibold text-freshpac-grey">
                  {customer.accountNumber} · Signed in as {profile.fullName}
                </p>
              </div>

              <form action={startCustomerOrder}>
                <Button type="submit" className="w-full lg:w-auto">
                  <ShoppingBasket className="mr-2 size-4" />
                  {draftOrder ? "Continue basket" : "Start order"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat
            icon={<PackageSearch className="size-4" />}
            label="Shopping list"
            value={`${productCount} items`}
          />
          <MiniStat
            icon={<ClipboardList className="size-4" />}
            label="Recent orders"
            value={`${recentOrders.length}`}
          />
          <MiniStat
            icon={<UserRound className="size-4" />}
            label="Delivery day"
            value={customer.deliveryDay || "Not set"}
          />
          <MiniStat
            icon={<ShoppingBasket className="size-4" />}
            label="Current basket"
            value={draftOrder ? "In progress" : "Empty"}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
          <Card className="portal-card-safe">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Recent orders</CardTitle>
                  <CardDescription>
                    Your latest submitted and processed orders.
                  </CardDescription>
                </div>

                <form action={startCustomerOrder}>
                  <Button type="submit" size="sm">
                    <ShoppingBasket className="mr-1.5 size-3.5" />
                    {draftOrder ? "Continue basket" : "New order"}
                  </Button>
                </form>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid gap-2 p-3 md:hidden">
                {recentOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    reference={order.reference || order.temporaryReference || "Draft"}
                    status={order.status}
                    date={order.createdAt}
                    lines={order.lines.length}
                    total={formatCustomerPortalMoney(order.totalIncVatPence, priceVisible)}
                  />
                ))}

                {!recentOrders.length ? <EmptyOrders /> : null}
              </div>

              <div className="hidden md:block">
                <div className="portal-scroll-panel">
                  <table className="fp-compact-table min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Lines</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-black">
                            {order.reference || order.temporaryReference || "Draft"}
                          </td>
                          <td>{formatCustomerPortalDate(order.createdAt)}</td>
                          <td>
                            <Badge tone={getCustomerOrderStatusTone(order.status)}>
                              {formatCustomerOrderStatus(order.status)}
                            </Badge>
                          </td>
                          <td>{order.lines.length}</td>
                          <td className="font-black">
                            {formatCustomerPortalMoney(order.totalIncVatPence, priceVisible)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!recentOrders.length ? <EmptyOrders /> : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid content-start gap-3">
            {draftOrder ? (
              <Card className="portal-card-safe border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle>Basket in progress</CardTitle>
                  <CardDescription>
                    You have a draft basket ready to continue.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3">
                  <div className="rounded-xl border border-amber-200 bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
                      Reference
                    </p>
                    <p className="mt-1 text-sm font-black text-freshpac-charcoal">
                      {draftOrder.reference || draftOrder.temporaryReference}
                    </p>
                  </div>

                  <form action={startCustomerOrder}>
                    <Button type="submit" className="w-full">
                      Continue basket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            <Card className="portal-card-safe">
              <CardHeader>
                <CardTitle>Account details</CardTitle>
                <CardDescription>
                  Delivery and account setup.
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-2 text-sm font-semibold text-freshpac-charcoal">
                <InfoLine label="Account" value={customer.accountNumber} />
                <InfoLine label="Delivery" value={customer.deliveryDay || "Not set"} />
                <InfoLine label="Method" value={customer.deliveryMethod.replace(/_/g, " ")} />
                <InfoLine label="Driver" value={customer.driverOrCourier || "Not set"} />
                <InfoLine label="Contact day" value={customer.contactDay || "Not set"} />
              </CardContent>
            </Card>

            <Card className="portal-card-safe">
              <CardHeader>
                <CardTitle>Need help?</CardTitle>
                <CardDescription>
                  Contact Freshpac if your shopping list or pricing looks wrong.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Link
                  href="/contact"
                  className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-freshpac-panel bg-white px-3 text-sm font-black text-freshpac-charcoal hover:border-freshpac-orange hover:bg-orange-50"
                >
                  Contact Freshpac
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="portal-card-safe">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-freshpac-orange">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
            {label}
          </p>
          <p className="truncate text-sm font-black text-freshpac-charcoal">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderCard({
  reference,
  status,
  date,
  lines,
  total
}: {
  reference: string;
  status: string;
  date: Date;
  lines: number;
  total: string;
}) {
  return (
    <div className="rounded-xl border border-freshpac-panel bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-orange">
            {reference}
          </p>
          <p className="mt-1 text-xs font-semibold text-freshpac-grey">
            {formatCustomerPortalDate(date)}
          </p>
        </div>

        <Badge tone={getCustomerOrderStatusTone(status)}>
          {formatCustomerOrderStatus(status)}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <InfoBox label="Lines" value={String(lines)} />
        <InfoBox label="Total" value={total} />
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-freshpac-cream/70 px-3 py-2">
      <span className="text-xs font-black uppercase tracking-[0.1em] text-freshpac-grey">
        {label}
      </span>
      <span className="truncate text-right text-sm font-bold text-freshpac-charcoal">
        {value}
      </span>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-freshpac-cream/70 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-freshpac-grey">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black text-freshpac-charcoal">
        {value}
      </p>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="p-6 text-sm text-freshpac-grey">
      No recent orders yet.
    </div>
  );
}