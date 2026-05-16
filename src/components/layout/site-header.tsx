import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-freshpac-panel bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/freshpac-logo.jpg" alt="Freshpac" width={190} height={58} className="h-11 w-auto object-contain" priority />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {siteConfig.navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-freshpac-grey transition hover:bg-orange-50 hover:text-freshpac-charcoal">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton href="/request-trade-account" variant="secondary" size="sm" className="hidden sm:inline-flex">
            Request trade account
          </LinkButton>
          <LinkButton href="/login" size="sm">Login</LinkButton>
        </div>
      </div>
    </header>
  );
}
