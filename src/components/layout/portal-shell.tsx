import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  ClipboardList,
  Coffee,
  FileText,
  HardHat,
  Home,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBasket,
  UsersRound,
  Wrench
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/portal", icon: Home },
  { label: "Customers", href: "/portal/sales/customers", icon: UsersRound },
  { label: "Products", href: "/portal/sales/products", icon: Package },
  { label: "Orders", href: "/portal/sales/orders", icon: ShoppingBasket },
  { label: "Call List", href: "/portal/sales/call-list", icon: Phone },
  { label: "Reports", href: "/portal/sales/reports", icon: BarChart3 },
  { label: "Trade Requests", href: "/portal/sales/trade-requests", icon: Coffee },
  { label: "Audit Log", href: "/portal/sales/audit-log", icon: ShieldCheck },
  { label: "Engineers", href: "/portal/engineers", icon: HardHat },
  { label: "Engineer Jobs", href: "/portal/engineers/jobs", icon: Wrench },
  { label: "Documents", href: "/portal/documents", icon: FileText },
  { label: "Rollover", href: "/portal/rollover", icon: ClipboardList }
];

export function PortalShell({
  title,
  subtitle,
  activeHref,
  children
}: {
  title: string;
  subtitle?: string;
  activeHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="portal-mobile-safe min-h-screen bg-freshpac-cream">
      <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-freshpac-panel bg-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="sticky top-0 z-30 bg-white">
            <div className="border-b border-freshpac-panel p-4">
              <Link href="/portal" className="block">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-freshpac-orange">
                  Freshpac
                </p>
                <p className="mt-1 text-lg font-black text-freshpac-charcoal">
                  Operations Portal
                </p>
              </Link>
            </div>

            <nav className="portal-scroll-panel flex gap-2 p-3 lg:block lg:max-h-[calc(100vh-88px)] lg:space-y-1 lg:overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeHref
                  ? activeHref === item.href || activeHref.startsWith(`${item.href}/`)
                  : false;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition lg:w-full ${
                      isActive
                        ? "bg-freshpac-orange text-freshpac-charcoal"
                        : "text-freshpac-grey hover:bg-orange-50 hover:text-freshpac-charcoal"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="portal-content-safe flex-1">
          <header className="sticky top-0 z-20 border-b border-freshpac-panel bg-freshpac-cream/95 px-3 py-4 backdrop-blur sm:px-5 lg:px-6">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black tracking-tight text-freshpac-charcoal sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 line-clamp-2 text-sm text-freshpac-grey">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </header>

          <div className="portal-content-safe px-2 py-4 sm:px-5 lg:px-6">
            <div className="portal-content-safe mx-auto max-w-[1600px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}