import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  Coffee,
  FileClock,
  Home,
  PackageSearch,
  Route,
  Settings,
  ShoppingBasket,
  Truck,
  UsersRound,
  Wrench
} from "lucide-react";

type PortalShellProps = {
  title: string;
  subtitle?: string;
  activeHref?: string;
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/portal", icon: Home },
  { label: "Customers", href: "/portal/sales/customers", icon: Building2 },
  { label: "Orders", href: "/portal/sales/orders", icon: ShoppingBasket },
  { label: "Products", href: "/portal/sales/products", icon: PackageSearch },
  { label: "Call list", href: "/portal/sales/call-list", icon: ClipboardList },
  { label: "Trade requests", href: "/portal/sales/trade-requests", icon: UsersRound },
  { label: "Equipment", href: "/portal/equipment", icon: Coffee },
  { label: "Engineer jobs", href: "/portal/engineer/jobs", icon: Wrench },
  { label: "Stock", href: "/portal/stock", icon: Boxes },
  { label: "Routes", href: "/portal/routes", icon: Route },
  { label: "Reports", href: "/portal/reports", icon: BarChart3 },
  { label: "Audit", href: "/portal/audit", icon: FileClock },
  { label: "Settings", href: "/portal/settings", icon: Settings }
];

export function PortalShell({ title, subtitle, activeHref = "/portal", children }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-freshpac-cream text-freshpac-charcoal">
      <header className="sticky top-0 z-40 border-b border-freshpac-panel bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-2 sm:px-4">
          <Link href="/portal" className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-freshpac-orange text-sm font-black text-freshpac-charcoal">
              FP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-4 text-freshpac-charcoal">
                Freshpac
              </p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-freshpac-grey">
                B2B Platform
              </p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <div className="portal-scroll-panel max-w-full">
              <nav className="flex min-w-max justify-center gap-1 px-2">
                {navItems.slice(0, 8).map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isActive(activeHref, item.href)}
                  />
                ))}
              </nav>
            </div>
          </div>

          <div className="rounded-xl border border-freshpac-panel bg-freshpac-cream px-2.5 py-1.5 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-freshpac-grey">
              Portal
            </p>
            <p className="text-xs font-black text-freshpac-charcoal">Live</p>
          </div>
        </div>

        <div className="border-t border-freshpac-panel bg-white md:hidden">
          <div className="portal-scroll-panel">
            <nav className="flex min-w-max gap-1 px-3 py-2">
              {navItems.slice(0, 10).map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(activeHref, item.href)}
                />
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[190px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[66px] rounded-2xl border border-freshpac-panel bg-white p-2 shadow-sm">
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <SideNavLink
                  key={item.href}
                  item={item}
                  active={isActive(activeHref, item.href)}
                />
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-3 rounded-2xl border border-freshpac-panel bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-tight text-freshpac-charcoal sm:text-2xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-0.5 text-xs font-medium leading-5 text-freshpac-grey sm:text-sm">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active
}: {
  item: (typeof navItems)[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`inline-flex h-8 items-center rounded-xl px-2.5 text-xs font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "text-freshpac-grey hover:bg-orange-50 hover:text-freshpac-charcoal"
      }`}
    >
      <Icon className="mr-1.5 size-3.5" />
      {item.label}
    </Link>
  );
}

function SideNavLink({
  item,
  active
}: {
  item: (typeof navItems)[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center rounded-xl px-2.5 py-2 text-xs font-black transition ${
        active
          ? "bg-freshpac-orange text-freshpac-charcoal"
          : "text-freshpac-grey hover:bg-orange-50 hover:text-freshpac-charcoal"
      }`}
    >
      <Icon className="mr-2 size-4" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function isActive(activeHref: string, href: string) {
  if (href === "/portal") {
    return activeHref === "/portal";
  }

  return activeHref === href || activeHref.startsWith(`${href}/`);
}