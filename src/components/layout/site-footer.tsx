import { siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-freshpac-panel bg-freshpac-charcoal text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-black">{siteConfig.shortName}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">{siteConfig.description}</p>
        </div>
        <div>
          <p className="font-bold">Contact</p>
          <div className="mt-2 space-y-1 text-sm text-white/70">
            <p>{siteConfig.contact.phone}</p>
            <p>{siteConfig.contact.email}</p>
            <p>{siteConfig.contact.address}</p>
          </div>
        </div>
        <div>
          <p className="font-bold">Platform note</p>
          <p className="mt-2 text-sm leading-6 text-white/70">Starter scaffold for the public website, customer ordering, sales operations and engineering workflows.</p>
        </div>
      </div>
    </footer>
  );
}
