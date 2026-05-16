export const siteConfig = {
  name: "Freshpac Teas & Coffees Ltd",
  shortName: "Freshpac",
  tagline: "Artisan Coffee Roasters",
  description: "Family-run coffee roasting, trade supplies, machine support and customer care from Halesworth, Suffolk.",
  contact: {
    phone: "01986 873410",
    email: "sales@freshpac.co.uk",
    address: "Unit B, Broadway Drive, Halesworth, Suffolk, IP19 8QR",
    hours: "Monday to Friday, office hours"
  },
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Services", href: "/services" },
    { label: "Machines", href: "/machines" },
    { label: "Farms", href: "/farms" },
    { label: "Learn", href: "/learn" },
    { label: "Contact", href: "/contact" }
  ],
  portals: [
    { label: "Sales Portal", href: "/portal/sales", description: "Orders, call list, customers, products and reports." },
    { label: "Ordering Portal", href: "/portal/ordering", description: "Customer basket, assigned products and past orders." },
    { label: "Engineers Portal", href: "/portal/engineering", description: "Jobs, machines, parts and completed reports." },
    { label: "Desktop Offline Plan", href: "/portal/desktop", description: "Approved device, local queue and sync-safe workflows." }
  ]
};
