import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const portalNav = [
  { label: "Portal Home", href: "/portal" },
  { label: "Sales", href: "/portal/sales" },
  { label: "Customers", href: "/portal/sales/customers" },
  { label: "Orders", href: "/portal/sales/orders" },
  { label: "Call List", href: "/portal/sales/call-list" },
  { label: "Products", href: "/portal/sales/products" },
  { label: "Engineering", href: "/portal/engineering" },
  { label: "Ordering", href: "/portal/ordering" },
  { label: "Reports", href: "/portal/sales/reports" },
  { label: "Sync Conflicts", href: "/portal/sales/sync-conflicts" },
  { label: "Desktop Plan", href: "/portal/desktop" }
];

export function PortalShell({
  title,
  subtitle,
  activeHref,
  children,
  status = "Online"
}: {
  title: string;
  subtitle: string;
  activeHref: string;
  children: React.ReactNode;
  status?: "Online" | "Offline" | "Pending Sync";
}) {
  const tone = status === "Online" ? "success" : status === "Offline" ? "danger" : "warning";

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-freshpac-panel bg-white p-4 lg:block">
        <Link href="/" className="mb-5 flex items-center rounded-2xl border border-freshpac-panel p-3">
          <Image src="/brand/freshpac-logo.jpg" alt="Freshpac" width={170} height={54} className="h-auto w-full object-contain" />
        </Link>
        <nav className="space-y-1">
          {portalNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition",
                activeHref === item.href ? "bg-freshpac-charcoal text-white" : "text-freshpac-grey hover:bg-orange-50 hover:text-freshpac-charcoal"
              )}
            >
              {item.label}
              {item.href === "/portal/sales/sync-conflicts" ? <span className="rounded-full bg-freshpac-orange px-2 py-0.5 text-[10px] font-black text-freshpac-charcoal">3</span> : null}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-freshpac-panel bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-freshpac-orange">Freshpac Operations</p>
              <h1 className="text-xl font-black tracking-tight text-freshpac-charcoal">{title}</h1>
              <p className="hidden text-sm text-freshpac-grey md:block">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={tone}>{status}</Badge>
              <Badge>Last sync 09:42</Badge>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-freshpac-panel px-4 py-2 lg:hidden">
            {portalNav.map((item) => (
              <Link key={item.href} href={item.href} className={cn("whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold", activeHref === item.href ? "bg-freshpac-charcoal text-white" : "bg-white text-freshpac-grey")}>
                {item.label}
              </Link>
            ))}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
