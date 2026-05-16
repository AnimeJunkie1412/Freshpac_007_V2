import type { BadgeTone } from "@/lib/sales/customers";

export type OrderStatus =
  | "Draft Basket"
  | "Submitted"
  | "Awaiting Payment"
  | "Paid Submitted"
  | "Processed"
  | "Cancelled";

export type OrderSource =
  | "Customer portal"
  | "Freshpac staff"
  | "Call list"
  | "Standing Order"
  | "Retail Order"
  | "Offline pending";

export type OrderLineSource =
  | "Customer Added"
  | "Freshpac Added"
  | "Standing Order"
  | "Retail Order"
  | "Reordered From Past Order"
  | "System Auto-Submitted";

export type DeliveryMethod = "Freshpac route" | "Courier";

export type OrderLine = {
  productCode: string;
  description: string;
  packSize: string;
  quantity: number;
  source: OrderLineSource;
  priceExVat: string;
  vatAmount: string;
  priceIncVat: string;
  lineTotal: string;
  locked?: boolean;
};

export type OrderAuditEvent = {
  date: string;
  action: string;
  user: string;
  note: string;
};

export type SalesOrder = {
  reference: string;
  accountNumber: string;
  siteName: string;
  invoiceAddress: string[];
  deliveryAddress: string[];
  status: OrderStatus;
  source: OrderSource;
  orderDate: string;
  requiredDeliveryDay: string;
  driverOrCourier: string;
  deliveryMethod: DeliveryMethod;
  customerOrderNumber: string;
  priceVisibility: "On" | "Off";
  totalExVat: string;
  vatTotal: string;
  totalIncVat: string;
  minimumOrderCheck: "Passed" | "Below minimum" | "Not checked";
  carriageCharge: string;
  customerNotes: string;
  internalNotes: string;
  submittedBy: string;
  processedBy?: string;
  processedAt?: string;
  editedByFreshpac: boolean;
  printStatus: "Not printed" | "Printed" | "Reprint needed";
  paymentStatus: "Not required" | "Awaiting payment" | "Paid externally";
  lines: OrderLine[];
  audit: OrderAuditEvent[];
};

export type CallListEntry = {
  accountNumber: string;
  siteName: string;
  contactName: string;
  phone: string;
  deliveryDay: string;
  contactDay: string;
  contactFrequency: string;
  driverOrCourier: string;
  assignedSalesRep: string;
  status: "To call" | "Called" | "Nothing Needed" | "Order placed" | "Needs Freshpac contact";
  accountStatus: "Active" | "On Hold" | "Active with Prepayment";
  lastOrderDate: string;
  basketValue: string;
  basketStatus: "Empty" | "Has basket" | "Retail locked" | "Standing order due";
  notes: string;
};

export const orderStatusTone: Record<OrderStatus, BadgeTone> = {
  "Draft Basket": "neutral",
  Submitted: "info",
  "Awaiting Payment": "warning",
  "Paid Submitted": "success",
  Processed: "success",
  Cancelled: "danger"
};

export const orderSourceTone: Record<OrderSource, BadgeTone> = {
  "Customer portal": "info",
  "Freshpac staff": "neutral",
  "Call list": "warning",
  "Standing Order": "success",
  "Retail Order": "warning",
  "Offline pending": "danger"
};

export const salesOrders: SalesOrder[] = [
  {
    reference: "FP0001845",
    accountNumber: "A100245",
    siteName: "Aldeburgh Beach Café",
    invoiceAddress: ["Aldeburgh Beach Café Ltd", "156 High Street", "Aldeburgh", "Suffolk", "IP15 5AN"],
    deliveryAddress: ["Aldeburgh Beach Café", "Beach Front", "Aldeburgh", "Suffolk", "IP15 5BD"],
    status: "Submitted",
    source: "Customer portal",
    orderDate: "15 May 2026 10:42",
    requiredDeliveryDay: "Tuesday",
    driverOrCourier: "Darrell",
    deliveryMethod: "Freshpac route",
    customerOrderNumber: "PO-7781",
    priceVisibility: "On",
    totalExVat: "£237.00",
    vatTotal: "£47.40",
    totalIncVat: "£284.40",
    minimumOrderCheck: "Passed",
    carriageCharge: "£0.00",
    customerNotes: "Please deliver before 10am using rear gate.",
    internalNotes: "Good regular account. Check retail quantity before weekly rollover.",
    submittedBy: "Rachel Morgan",
    editedByFreshpac: false,
    printStatus: "Not printed",
    paymentStatus: "Not required",
    lines: [
      {
        productCode: "ARHSETO6X1G",
        description: "Toscana House Beans 6x1kg",
        packSize: "6 x 1kg",
        quantity: 3,
        source: "Customer Added",
        priceExVat: "£66.30",
        vatAmount: "£0.00",
        priceIncVat: "£66.30",
        lineTotal: "£198.90"
      },
      {
        productCode: "ARK100067",
        description: "Arkadia Drinking Chocolate 28% 1kg",
        packSize: "1kg",
        quantity: 6,
        source: "Customer Added",
        priceExVat: "£6.45",
        vatAmount: "£0.00",
        priceIncVat: "£6.45",
        lineTotal: "£38.70"
      },
      {
        productCode: "20ZCLIPSLV",
        description: "4oz Black Ripple Cup Sleeve",
        packSize: "Pack",
        quantity: 10,
        source: "Customer Added",
        priceExVat: "£1.98",
        vatAmount: "£0.40",
        priceIncVat: "£2.38",
        lineTotal: "£23.80"
      }
    ],
    audit: [
      {
        date: "15 May 2026 10:42",
        action: "Order submitted",
        user: "Rachel Morgan",
        note: "Customer submitted order through ordering portal."
      },
      {
        date: "15 May 2026 10:43",
        action: "Minimum order check",
        user: "System",
        note: "Route minimum passed."
      }
    ]
  },
  {
    reference: "FP0001844",
    accountNumber: "S587984",
    siteName: "21 Young Hearts CIC",
    invoiceAddress: ["21 Young Hearts CIC", "Community House", "Ipswich", "IP1 2AB"],
    deliveryAddress: ["21 Young Hearts CIC", "Community House", "Ipswich", "IP1 2AB"],
    status: "Awaiting Payment",
    source: "Call list",
    orderDate: "15 May 2026 09:18",
    requiredDeliveryDay: "Tuesday",
    driverOrCourier: "Darrell",
    deliveryMethod: "Freshpac route",
    customerOrderNumber: "",
    priceVisibility: "Off",
    totalExVat: "Hidden",
    vatTotal: "Hidden",
    totalIncVat: "Hidden",
    minimumOrderCheck: "Passed",
    carriageCharge: "£0.00",
    customerNotes: "Call when delivery arrives.",
    internalNotes: "Prices hidden. Print as Delivery Note Needed.",
    submittedBy: "Sarah",
    editedByFreshpac: false,
    printStatus: "Not printed",
    paymentStatus: "Awaiting payment",
    lines: [
      {
        productCode: "FPEVERY6X1",
        description: "Freshpac Everyday Espresso 6x1kg",
        packSize: "6 x 1kg",
        quantity: 2,
        source: "Freshpac Added",
        priceExVat: "Hidden",
        vatAmount: "Hidden",
        priceIncVat: "Hidden",
        lineTotal: "Hidden"
      },
      {
        productCode: "CUPS8OZCOM",
        description: "8oz Compostable Cup",
        packSize: "Case",
        quantity: 1,
        source: "Freshpac Added",
        priceExVat: "Hidden",
        vatAmount: "Hidden",
        priceIncVat: "Hidden",
        lineTotal: "Hidden"
      }
    ],
    audit: [
      {
        date: "15 May 2026 09:18",
        action: "Order created",
        user: "Sarah",
        note: "Order placed on behalf of customer from call list."
      },
      {
        date: "15 May 2026 09:19",
        action: "Payment status set",
        user: "System",
        note: "Account requires prepayment handling."
      }
    ]
  },
  {
    reference: "FP0001843",
    accountNumber: "C442190",
    siteName: "Copper Kettle Garden Centre",
    invoiceAddress: ["Copper Kettle Garden Centre Ltd", "Station Road", "Norwich", "NR1 1AA"],
    deliveryAddress: ["Copper Kettle Garden Centre Café", "Station Road", "Norwich", "NR1 1AA"],
    status: "Processed",
    source: "Retail Order",
    orderDate: "14 May 2026 15:02",
    requiredDeliveryDay: "Courier",
    driverOrCourier: "Courier",
    deliveryMethod: "Courier",
    customerOrderNumber: "CK-443",
    priceVisibility: "On",
    totalExVat: "£91.20",
    vatTotal: "£0.00",
    totalIncVat: "£91.20",
    minimumOrderCheck: "Below minimum",
    carriageCharge: "£12.00 inc VAT",
    customerNotes: "",
    internalNotes: "On hold account. Confirmed by accounts before processing.",
    submittedBy: "System rollover",
    processedBy: "Amanda",
    processedAt: "15 May 2026 08:35",
    editedByFreshpac: true,
    printStatus: "Printed",
    paymentStatus: "Not required",
    lines: [
      {
        productCode: "RETAILHB227",
        description: "Retail House Blend 227g",
        packSize: "227g",
        quantity: 24,
        source: "Retail Order",
        priceExVat: "£3.80",
        vatAmount: "£0.00",
        priceIncVat: "£3.80",
        lineTotal: "£91.20",
        locked: true
      },
      {
        productCode: "CARRIAGE10",
        description: "Carriage charge",
        packSize: "Charge",
        quantity: 1,
        source: "Freshpac Added",
        priceExVat: "£10.00",
        vatAmount: "£2.00",
        priceIncVat: "£12.00",
        lineTotal: "£12.00"
      }
    ],
    audit: [
      {
        date: "14 May 2026 15:02",
        action: "Retail rollover",
        user: "System",
        note: "Retail order moved into customer basket and locked."
      },
      {
        date: "15 May 2026 08:35",
        action: "Order processed",
        user: "Amanda",
        note: "Printed successfully and marked as processed."
      }
    ]
  },
  {
    reference: "OFFLINE-2026-0001",
    accountNumber: "A100245",
    siteName: "Aldeburgh Beach Café",
    invoiceAddress: ["Aldeburgh Beach Café Ltd", "156 High Street", "Aldeburgh", "Suffolk", "IP15 5AN"],
    deliveryAddress: ["Aldeburgh Beach Café", "Beach Front", "Aldeburgh", "Suffolk", "IP15 5BD"],
    status: "Draft Basket",
    source: "Offline pending",
    orderDate: "15 May 2026 12:04",
    requiredDeliveryDay: "Tuesday",
    driverOrCourier: "Darrell",
    deliveryMethod: "Freshpac route",
    customerOrderNumber: "",
    priceVisibility: "On",
    totalExVat: "Pending sync",
    vatTotal: "Pending sync",
    totalIncVat: "Pending sync",
    minimumOrderCheck: "Not checked",
    carriageCharge: "Pending sync",
    customerNotes: "Created during offline-safe desktop mode.",
    internalNotes: "Temporary offline reference. Cloud will assign official FP reference after sync.",
    submittedBy: "Andrew",
    editedByFreshpac: false,
    printStatus: "Not printed",
    paymentStatus: "Not required",
    lines: [
      {
        productCode: "ARHSETO6X1G",
        description: "Toscana House Beans 6x1kg",
        packSize: "6 x 1kg",
        quantity: 1,
        source: "Freshpac Added",
        priceExVat: "Pending sync",
        vatAmount: "Pending sync",
        priceIncVat: "Pending sync",
        lineTotal: "Pending sync"
      }
    ],
    audit: [
      {
        date: "15 May 2026 12:04",
        action: "Offline draft created",
        user: "Andrew",
        note: "Order queued locally for sync."
      }
    ]
  }
];

export const callListEntries: CallListEntry[] = [
  {
    accountNumber: "A100245",
    siteName: "Aldeburgh Beach Café",
    contactName: "Rachel Morgan",
    phone: "01728 000111",
    deliveryDay: "Tuesday",
    contactDay: "Monday",
    contactFrequency: "1 week",
    driverOrCourier: "Darrell",
    assignedSalesRep: "Sarah",
    status: "To call",
    accountStatus: "Active",
    lastOrderDate: "13 May 2026",
    basketValue: "£0.00",
    basketStatus: "Empty",
    notes: "Ask about summer retail stock."
  },
  {
    accountNumber: "S587984",
    siteName: "21 Young Hearts CIC",
    contactName: "Amanda Haxell",
    phone: "01473 941349",
    deliveryDay: "Tuesday",
    contactDay: "Monday",
    contactFrequency: "1 week",
    driverOrCourier: "Darrell",
    assignedSalesRep: "Sarah",
    status: "Order placed",
    accountStatus: "Active with Prepayment",
    lastOrderDate: "12 May 2026",
    basketValue: "Hidden",
    basketStatus: "Has basket",
    notes: "Prices hidden. Prepayment handling required."
  },
  {
    accountNumber: "C442190",
    siteName: "Copper Kettle Garden Centre",
    contactName: "Martin Cole",
    phone: "01603 000888",
    deliveryDay: "Courier",
    contactDay: "Wednesday",
    contactFrequency: "2 weeks",
    driverOrCourier: "Courier",
    assignedSalesRep: "Andrew",
    status: "Needs Freshpac contact",
    accountStatus: "On Hold",
    lastOrderDate: "01 Apr 2026",
    basketValue: "£91.20",
    basketStatus: "Retail locked",
    notes: "Account on hold. Retail items rolled into basket but needs accounts review."
  },
  {
    accountNumber: "B775430",
    siteName: "Bramble Barn Café",
    contactName: "Louise Carter",
    phone: "01502 000555",
    deliveryDay: "Thursday",
    contactDay: "Wednesday",
    contactFrequency: "1 week",
    driverOrCourier: "Mark",
    assignedSalesRep: "Andrew",
    status: "Nothing Needed",
    accountStatus: "Active",
    lastOrderDate: "09 May 2026",
    basketValue: "£0.00",
    basketStatus: "Empty",
    notes: "Customer confirmed nothing needed this week."
  }
];

export function getOrderByReference(reference: string) {
  return salesOrders.find((order) => order.reference === reference);
}

export function getOrderStats() {
  return {
    total: salesOrders.length,
    submitted: salesOrders.filter((order) => order.status === "Submitted").length,
    awaitingPayment: salesOrders.filter((order) => order.status === "Awaiting Payment").length,
    processed: salesOrders.filter((order) => order.status === "Processed").length,
    offlinePending: salesOrders.filter((order) => order.source === "Offline pending").length,
    needsPrint: salesOrders.filter((order) => order.printStatus !== "Printed").length
  };
}

export function getCallListStats() {
  return {
    total: callListEntries.length,
    toCall: callListEntries.filter((entry) => entry.status === "To call").length,
    orderPlaced: callListEntries.filter((entry) => entry.status === "Order placed").length,
    nothingNeeded: callListEntries.filter((entry) => entry.status === "Nothing Needed").length,
    needsContact: callListEntries.filter((entry) => entry.status === "Needs Freshpac contact").length
  };
}