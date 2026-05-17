import type { BadgeTone } from "@/lib/sales/customers";

export type ReportCategory = "Orders" | "Customers" | "Products" | "Engineers" | "Rollover" | "Audit";
export type ReportStatus = "Ready" | "Draft" | "Needs filters" | "PDF planned";

export type ReportDefinition = {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  tone: BadgeTone;
  output: "PDF" | "Table" | "PDF + Table";
  usefulFor: string;
};

export const reports: ReportDefinition[] = [
  {
    id: "order-sheets",
    title: "Order sheets",
    description: "Printable customer order sheets with product codes, quantities, VAT and delivery details.",
    category: "Orders",
    status: "PDF planned",
    tone: "info",
    output: "PDF",
    usefulFor: "Daily order processing"
  },
  {
    id: "delivery-note-needed",
    title: "Delivery note needed orders",
    description: "Orders for customers with price visibility turned off.",
    category: "Orders",
    status: "Ready",
    tone: "warning",
    output: "PDF + Table",
    usefulFor: "Hidden-price customers"
  },
  {
    id: "coffee-pick-list",
    title: "Coffee pick list",
    description: "Separate coffee picking list showing site, coffee product and quantity.",
    category: "Orders",
    status: "PDF planned",
    tone: "info",
    output: "PDF",
    usefulFor: "Roasting and packing"
  },
  {
    id: "retail-pick-list",
    title: "Retail pick list",
    description: "Retail products due after weekly rollover.",
    category: "Orders",
    status: "PDF planned",
    tone: "warning",
    output: "PDF",
    usefulFor: "Friday retail packing"
  },
  {
    id: "stocktaking-products",
    title: "Product stocktaking list",
    description: "Active product list with product codes, descriptions, groups and pack sizes.",
    category: "Products",
    status: "Ready",
    tone: "success",
    output: "PDF + Table",
    usefulFor: "Stock checks"
  },
  {
    id: "inactive-customers",
    title: "Inactive customers",
    description: "Customers with no order activity for the selected period, defaulting to eight weeks.",
    category: "Customers",
    status: "Needs filters",
    tone: "warning",
    output: "Table",
    usefulFor: "Sales review"
  },
  {
    id: "accounts-on-hold",
    title: "Accounts on hold",
    description: "Customer accounts currently blocked from submitting orders.",
    category: "Customers",
    status: "Ready",
    tone: "danger",
    output: "PDF + Table",
    usefulFor: "Accounts review"
  },
  {
    id: "completed-engineer-jobs",
    title: "Completed engineer jobs",
    description: "Completed breakdowns, services and water filter changes.",
    category: "Engineers",
    status: "Ready",
    tone: "success",
    output: "PDF + Table",
    usefulFor: "Engineering review"
  },
  {
    id: "chargeable-engineer-jobs",
    title: "Chargeable engineer jobs",
    description: "Chargeable jobs needing Sage invoice number entry or invoice confirmation.",
    category: "Engineers",
    status: "Ready",
    tone: "warning",
    output: "PDF + Table",
    usefulFor: "Sage invoicing"
  },
  {
    id: "weekly-rollover-preview",
    title: "Weekly rollover preview",
    description: "Pre-run report showing retail orders, standing orders, on-hold accounts and prepayment accounts affected.",
    category: "Rollover",
    status: "PDF planned",
    tone: "danger",
    output: "PDF",
    usefulFor: "Safe rollover confirmation"
  }
];

export function getReportStats() {
  return {
    total: reports.length,
    orders: reports.filter((report) => report.category === "Orders").length,
    customers: reports.filter((report) => report.category === "Customers").length,
    products: reports.filter((report) => report.category === "Products").length,
    engineers: reports.filter((report) => report.category === "Engineers").length,
    rollover: reports.filter((report) => report.category === "Rollover").length,
    pdfPlanned: reports.filter((report) => report.output.includes("PDF")).length
  };
}

export function getReportById(id: string) {
  return reports.find((report) => report.id === id);
}