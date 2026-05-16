export type ProductType = "Normal Product" | "Coffee Product" | "Retail Product";
export type ProductStatus = "Active" | "Inactive" | "Marked for Deletion";
export type VatCode = "T0" | "T1";

export type ProductPricing = {
  priceExVat: string;
  vatCode: VatCode;
  vatRate: string;
  vatAmount: string;
  priceIncVat: string;
};

export type ProductAssignment = {
  accountNumber: string;
  siteName: string;
  customerPrice: string;
  assignedDate: string;
};

export type ProductAuditEvent = {
  date: string;
  action: string;
  user: string;
  note: string;
};

export type ProductSalesHistory = {
  period: string;
  quantity: number;
  value: string;
};

export type Product = {
  code: string;
  name: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  category: string;
  group: string;
  packSize: string;
  imageUrl: string;
  sageRequired: boolean;
  publicVisibility: "Visible to logged-in customers" | "Assigned customers only" | "Staff only";
  customerCanSeeCode: boolean;
  pricing: ProductPricing;
  assignedCustomers: ProductAssignment[];
  salesHistory: ProductSalesHistory[];
  notes: string[];
  audit: ProductAuditEvent[];
};

export const productTypes: ProductType[] = ["Normal Product", "Coffee Product", "Retail Product"];

export const vatCodes: VatCode[] = ["T0", "T1"];

export const products: Product[] = [
  {
    code: "ARHSETO6X1G",
    name: "Toscana House Beans 6x1kg",
    description:
      "Freshpac house espresso coffee beans. Restricted coffee product requiring account assignment before customer visibility.",
    type: "Coffee Product",
    status: "Active",
    category: "Coffee",
    group: "Beans",
    packSize: "6 x 1kg",
    imageUrl: "/images/placeholders/coffee-bag.svg",
    sageRequired: true,
    publicVisibility: "Assigned customers only",
    customerCanSeeCode: false,
    pricing: {
      priceExVat: "£66.30",
      vatCode: "T0",
      vatRate: "0%",
      vatAmount: "£0.00",
      priceIncVat: "£66.30"
    },
    assignedCustomers: [
      {
        accountNumber: "A100245",
        siteName: "Aldeburgh Beach Café",
        customerPrice: "£66.30",
        assignedDate: "19 Feb 2022"
      }
    ],
    salesHistory: [
      {
        period: "This week",
        quantity: 18,
        value: "£1,193.40"
      },
      {
        period: "Last 4 weeks",
        quantity: 74,
        value: "£4,906.20"
      },
      {
        period: "Last 12 weeks",
        quantity: 211,
        value: "£13,989.30"
      }
    ],
    notes: [
      "Coffee products must not be visible to unassigned customers.",
      "Should appear on coffee pick lists separately from general products."
    ],
    audit: [
      {
        date: "15 May 2026 09:20",
        action: "Customer price changed",
        user: "Sarah",
        note: "Aldeburgh Beach Café price updated."
      },
      {
        date: "14 May 2026 15:45",
        action: "Assignment added",
        user: "Andrew",
        note: "Assigned to Aldeburgh Beach Café."
      }
    ]
  },
  {
    code: "ARK100067",
    name: "Arkadia Drinking Chocolate 28% 1kg",
    description: "Premium drinking chocolate powder for catering and café use.",
    type: "Normal Product",
    status: "Active",
    category: "Hot Chocolate",
    group: "Beverages",
    packSize: "1kg",
    imageUrl: "/images/placeholders/product-box.svg",
    sageRequired: true,
    publicVisibility: "Visible to logged-in customers",
    customerCanSeeCode: false,
    pricing: {
      priceExVat: "£6.75",
      vatCode: "T0",
      vatRate: "0%",
      vatAmount: "£0.00",
      priceIncVat: "£6.75"
    },
    assignedCustomers: [
      {
        accountNumber: "A100245",
        siteName: "Aldeburgh Beach Café",
        customerPrice: "£6.45",
        assignedDate: "10 Jan 2024"
      }
    ],
    salesHistory: [
      {
        period: "This week",
        quantity: 42,
        value: "£283.50"
      },
      {
        period: "Last 4 weeks",
        quantity: 189,
        value: "£1,275.75"
      },
      {
        period: "Last 12 weeks",
        quantity: 506,
        value: "£3,415.50"
      }
    ],
    notes: ["Normal product visible to customers unless inactive or restricted later by account rules."],
    audit: [
      {
        date: "12 May 2026 11:10",
        action: "Product updated",
        user: "Amanda",
        note: "Description checked."
      }
    ]
  },
  {
    code: "20ZCLIPSLV",
    name: "4oz Black Ripple Cup Sleeve",
    description: "Black ripple cup sleeve for takeaway hot drinks.",
    type: "Normal Product",
    status: "Active",
    category: "Takeaway",
    group: "Cups and Lids",
    packSize: "Pack",
    imageUrl: "/images/placeholders/product-box.svg",
    sageRequired: true,
    publicVisibility: "Visible to logged-in customers",
    customerCanSeeCode: false,
    pricing: {
      priceExVat: "£2.07",
      vatCode: "T1",
      vatRate: "20%",
      vatAmount: "£0.41",
      priceIncVat: "£2.48"
    },
    assignedCustomers: [],
    salesHistory: [
      {
        period: "This week",
        quantity: 65,
        value: "£134.55"
      },
      {
        period: "Last 4 weeks",
        quantity: 240,
        value: "£496.80"
      },
      {
        period: "Last 12 weeks",
        quantity: 702,
        value: "£1,453.14"
      }
    ],
    notes: ["VAT T1 applies. Customer sees price only when account price visibility is enabled."],
    audit: [
      {
        date: "09 May 2026 13:02",
        action: "VAT checked",
        user: "Accounts",
        note: "Confirmed as T1."
      }
    ]
  },
  {
    code: "RETAILHB227",
    name: "Retail House Blend 227g",
    description:
      "Retail coffee bag for customer resale. Treated as restricted visibility and assigned like coffee products.",
    type: "Retail Product",
    status: "Active",
    category: "Retail Coffee",
    group: "Retail Bags",
    packSize: "227g",
    imageUrl: "/images/placeholders/coffee-bag.svg",
    sageRequired: true,
    publicVisibility: "Assigned customers only",
    customerCanSeeCode: false,
    pricing: {
      priceExVat: "£3.80",
      vatCode: "T0",
      vatRate: "0%",
      vatAmount: "£0.00",
      priceIncVat: "£3.80"
    },
    assignedCustomers: [
      {
        accountNumber: "A100245",
        siteName: "Aldeburgh Beach Café",
        customerPrice: "£3.65",
        assignedDate: "01 Mar 2026"
      }
    ],
    salesHistory: [
      {
        period: "This week",
        quantity: 24,
        value: "£91.20"
      },
      {
        period: "Last 4 weeks",
        quantity: 96,
        value: "£364.80"
      },
      {
        period: "Last 12 weeks",
        quantity: 244,
        value: "£927.20"
      }
    ],
    notes: [
      "Retail products order one week in advance.",
      "Retail products should lock in basket after weekly rollover."
    ],
    audit: [
      {
        date: "13 May 2026 08:50",
        action: "Retail assignment added",
        user: "Sarah",
        note: "Assigned to Aldeburgh Beach Café."
      }
    ]
  },
  {
    code: "OLDTEA001",
    name: "Archived Breakfast Tea 250s",
    description: "Old tea line retained for history only.",
    type: "Normal Product",
    status: "Inactive",
    category: "Tea",
    group: "Tea Bags",
    packSize: "250s",
    imageUrl: "/images/placeholders/product-box.svg",
    sageRequired: true,
    publicVisibility: "Staff only",
    customerCanSeeCode: false,
    pricing: {
      priceExVat: "£8.50",
      vatCode: "T0",
      vatRate: "0%",
      vatAmount: "£0.00",
      priceIncVat: "£8.50"
    },
    assignedCustomers: [],
    salesHistory: [
      {
        period: "This week",
        quantity: 0,
        value: "£0.00"
      },
      {
        period: "Last 4 weeks",
        quantity: 0,
        value: "£0.00"
      },
      {
        period: "Last 12 weeks",
        quantity: 3,
        value: "£25.50"
      }
    ],
    notes: ["Inactive product. Kept for historical order records."],
    audit: [
      {
        date: "02 May 2026 10:12",
        action: "Product made inactive",
        user: "Master User",
        note: "Replaced by new tea line."
      }
    ]
  }
];

export function getProductByCode(code: string) {
  return products.find((product) => product.code === code);
}

export function getProductStats() {
  return {
    total: products.length,
    active: products.filter((product) => product.status === "Active").length,
    inactive: products.filter((product) => product.status === "Inactive").length,
    coffee: products.filter((product) => product.type === "Coffee Product").length,
    retail: products.filter((product) => product.type === "Retail Product").length,
    normal: products.filter((product) => product.type === "Normal Product").length
  };
}