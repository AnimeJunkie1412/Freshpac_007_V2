export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export type CustomerStatus = "Active" | "On Hold" | "Active with Prepayment" | "Inactive";

export type CustomerFlag = {
  label: string;
  tone: BadgeTone;
  description: string;
};

export type CustomerContact = {
  name: string;
  role: string;
  phone: string;
  email: string;
  primary?: boolean;
};

export type CustomerPricingLine = {
  productCode: string;
  productName: string;
  defaultPrice: string;
  customerPrice: string;
  vat: "T0" | "T1";
};

export type CustomerEquipment = {
  description: string;
  makeModel: string;
  serialNumber: string;
  status: "Owned" | "Rented" | "Loaned" | "Trial" | "Obsolete";
  installedDate: string;
  lastServiceDate: string;
  breakdownCover: "5 day" | "7 day" | "None";
};

export type CustomerBreakdown = {
  date: string;
  jobRef: string;
  machine: string;
  fault: string;
  outcome: string;
  chargeable: "Yes" | "No";
};

export type CustomerNote = {
  date: string;
  author: string;
  visibility: "Internal" | "Customer visible";
  note: string;
};

export type CustomerRentalInfo = {
  machine: string;
  rentalAmount: string;
  rentalStartDate: string;
  duration: string;
  installationDate: string;
  condition: "New" | "Reconditioned";
  note: string;
};

export type CustomerOrder = {
  reference: string;
  date: string;
  status: "Draft Basket" | "Submitted" | "Awaiting Payment" | "Paid Submitted" | "Processed" | "Cancelled";
  total: string;
  source: string;
};

export type CustomerAuditEvent = {
  date: string;
  action: string;
  user: string;
  note: string;
};

export type CustomerAccount = {
  accountNumber: string;
  siteName: string;
  legalName: string;
  status: CustomerStatus;
  statusTone: BadgeTone;
  parentAccount: string;
  linkedChildren: string[];
  priceVisibility: "On" | "Off";
  onCallList: boolean;
  deliveryMethod: "Freshpac route" | "Courier";
  deliveryDay: string;
  contactDay: string;
  contactFrequency: string;
  driverOrCourier: string;
  assignedSalesRep: string;
  accountOpened: string;
  lastOrderDate: string;
  nextCutOff: string;
  invoiceAddress: string[];
  deliveryAddress: string[];
  alternativeDeliveryAddresses: string[];
  contacts: CustomerContact[];
  flags: CustomerFlag[];
  specialInstructions: string[];
  coffeeProducts: string[];
  retailProducts: string[];
  pricing: CustomerPricingLine[];
  equipment: CustomerEquipment[];
  breakdownHistory: CustomerBreakdown[];
  notes: CustomerNote[];
  rentalInformation: CustomerRentalInfo[];
  orders: CustomerOrder[];
  audit: CustomerAuditEvent[];
};

export const customerSearchHints = [
  "Account number",
  "Site name",
  "Invoice address",
  "Delivery address",
  "Contact name",
  "Phone",
  "Email",
  "Notes",
  "Equipment serial"
];

export const customerAccounts: CustomerAccount[] = [
  {
    accountNumber: "A100245",
    siteName: "Aldeburgh Beach Café",
    legalName: "Aldeburgh Beach Café Ltd",
    status: "Active",
    statusTone: "success",
    parentAccount: "None",
    linkedChildren: ["A100246"],
    priceVisibility: "On",
    onCallList: true,
    deliveryMethod: "Freshpac route",
    deliveryDay: "Tuesday",
    contactDay: "Monday",
    contactFrequency: "1 week",
    driverOrCourier: "Darrell",
    assignedSalesRep: "Sarah",
    accountOpened: "14 Jan 2021",
    lastOrderDate: "13 May 2026",
    nextCutOff: "Monday 3:00pm",
    invoiceAddress: ["Aldeburgh Beach Café Ltd", "156 High Street", "Aldeburgh", "Suffolk", "IP15 5AN"],
    deliveryAddress: ["Aldeburgh Beach Café", "Beach Front", "Aldeburgh", "Suffolk", "IP15 5BD"],
    alternativeDeliveryAddresses: ["Rear service door before 10am", "Main entrance after 10am"],
    contacts: [
      {
        name: "Rachel Morgan",
        role: "Manager",
        phone: "01728 000111",
        email: "rachel@example.co.uk",
        primary: true
      },
      {
        name: "Tom Morgan",
        role: "Owner",
        phone: "07700 900222",
        email: "tom@example.co.uk"
      }
    ],
    flags: [
      {
        label: "Call list",
        tone: "info",
        description: "Customer should be contacted during weekly telesales."
      },
      {
        label: "Coffee assigned",
        tone: "success",
        description: "Customer has restricted coffee products assigned."
      }
    ],
    specialInstructions: [
      "Use rear gate for deliveries before 10am.",
      "Leave goods with duty manager only.",
      "Machine access is behind main bar."
    ],
    coffeeProducts: ["Toscana House Beans 6x1kg", "Freshpac Suffolk Espresso 6x1kg"],
    retailProducts: ["Retail House Blend 227g", "Retail Decaf 227g"],
    pricing: [
      {
        productCode: "ARHSETO6X1G",
        productName: "Toscana House Beans 6x1kg",
        defaultPrice: "£69.90",
        customerPrice: "£66.30",
        vat: "T0"
      },
      {
        productCode: "ARK100067",
        productName: "Arkadia Drinking Chocolate 28% 1kg",
        defaultPrice: "£6.75",
        customerPrice: "£6.45",
        vat: "T0"
      },
      {
        productCode: "20ZCLIPSLV",
        productName: "4oz Black Ripple Cup Sleeve",
        defaultPrice: "£2.07",
        customerPrice: "£1.98",
        vat: "T1"
      }
    ],
    equipment: [
      {
        description: "Traditional espresso machine",
        makeModel: "Sanremo Zoe 2 Group",
        serialNumber: "SR-ZOE-22819",
        status: "Loaned",
        installedDate: "19 Feb 2022",
        lastServiceDate: "14 Mar 2026",
        breakdownCover: "7 day"
      },
      {
        description: "Coffee grinder",
        makeModel: "Eureka Zenith 65",
        serialNumber: "EZ65-77102",
        status: "Loaned",
        installedDate: "19 Feb 2022",
        lastServiceDate: "14 Mar 2026",
        breakdownCover: "7 day"
      }
    ],
    breakdownHistory: [
      {
        date: "14 Mar 2026",
        jobRef: "JOB-1038",
        machine: "Sanremo Zoe 2 Group",
        fault: "Steam pressure drop",
        outcome: "Adjusted pressurestat and tested",
        chargeable: "No"
      },
      {
        date: "11 Nov 2025",
        jobRef: "JOB-0962",
        machine: "Eureka Zenith 65",
        fault: "Grinding too coarse",
        outcome: "Burrs checked and grind reset",
        chargeable: "No"
      }
    ],
    notes: [
      {
        date: "15 May 2026 09:14",
        author: "Amanda",
        visibility: "Internal",
        note: "Customer asked about increasing retail quantities for summer."
      },
      {
        date: "02 May 2026 11:36",
        author: "Andrew",
        visibility: "Internal",
        note: "Confirmed machine serial numbers during account review."
      }
    ],
    rentalInformation: [
      {
        machine: "Sanremo Zoe 2 Group",
        rentalAmount: "£0.00 free loan",
        rentalStartDate: "19 Feb 2022",
        duration: "Rolling while purchasing Freshpac coffee",
        installationDate: "19 Feb 2022",
        condition: "Reconditioned",
        note: "Loan agreement required on file. Replacement value to be checked before renewal."
      }
    ],
    orders: [
      {
        reference: "FP0001845",
        date: "13 May 2026",
        status: "Processed",
        total: "£284.40",
        source: "Customer portal"
      },
      {
        reference: "FP0001732",
        date: "06 May 2026",
        status: "Processed",
        total: "£198.16",
        source: "Call list"
      }
    ],
    audit: [
      {
        date: "15 May 2026 09:14",
        action: "Note added",
        user: "Amanda",
        note: "Summer retail discussion logged."
      },
      {
        date: "14 Mar 2026 16:22",
        action: "Engineer job completed",
        user: "Clive",
        note: "JOB-1038 synced successfully."
      }
    ]
  },
  {
    accountNumber: "S587984",
    siteName: "21 Young Hearts CIC",
    legalName: "21 Young Hearts CIC",
    status: "Active",
    statusTone: "success",
    parentAccount: "None",
    linkedChildren: [],
    priceVisibility: "Off",
    onCallList: true,
    deliveryMethod: "Freshpac route",
    deliveryDay: "Tuesday",
    contactDay: "Monday",
    contactFrequency: "1 week",
    driverOrCourier: "Darrell",
    assignedSalesRep: "Sarah",
    accountOpened: "17 Mar 2024",
    lastOrderDate: "12 May 2026",
    nextCutOff: "Monday 3:00pm",
    invoiceAddress: ["21 Young Hearts CIC", "Community House", "Ipswich", "IP1 2AB"],
    deliveryAddress: ["21 Young Hearts CIC", "Community House", "Ipswich", "IP1 2AB"],
    alternativeDeliveryAddresses: ["Main reception if kitchen is locked"],
    contacts: [
      {
        name: "Amanda Haxell",
        role: "Manager",
        phone: "01473 941349",
        email: "amanda@example.org",
        primary: true
      }
    ],
    flags: [
      {
        label: "Prices hidden",
        tone: "warning",
        description: "Customer documents should state Delivery Note Needed."
      },
      {
        label: "Call list",
        tone: "info",
        description: "Weekly contact required."
      }
    ],
    specialInstructions: [
      "Delivery through main reception.",
      "Prices are hidden for customer users.",
      "Call if no order by Monday lunchtime."
    ],
    coffeeProducts: ["Freshpac Everyday Espresso 6x1kg"],
    retailProducts: [],
    pricing: [
      {
        productCode: "FPEVERY6X1",
        productName: "Freshpac Everyday Espresso 6x1kg",
        defaultPrice: "£64.80",
        customerPrice: "£61.20",
        vat: "T0"
      },
      {
        productCode: "CUPS8OZCOM",
        productName: "8oz Compostable Cup",
        defaultPrice: "£52.00",
        customerPrice: "£49.50",
        vat: "T1"
      }
    ],
    equipment: [
      {
        description: "Bean to cup machine",
        makeModel: "Franke A600",
        serialNumber: "FR-A600-44912",
        status: "Rented",
        installedDate: "04 Apr 2024",
        lastServiceDate: "02 Apr 2026",
        breakdownCover: "5 day"
      }
    ],
    breakdownHistory: [
      {
        date: "02 Apr 2026",
        jobRef: "JOB-1051",
        machine: "Franke A600",
        fault: "Service due",
        outcome: "Service completed",
        chargeable: "No"
      }
    ],
    notes: [
      {
        date: "12 May 2026 10:20",
        author: "Sarah",
        visibility: "Internal",
        note: "Customer prefers Monday morning call."
      }
    ],
    rentalInformation: [
      {
        machine: "Franke A600",
        rentalAmount: "£75.00 per month",
        rentalStartDate: "04 Apr 2024",
        duration: "36 months",
        installationDate: "04 Apr 2024",
        condition: "New",
        note: "Rental review due April 2027."
      }
    ],
    orders: [
      {
        reference: "FP0001810",
        date: "12 May 2026",
        status: "Processed",
        total: "Hidden",
        source: "Call list"
      }
    ],
    audit: [
      {
        date: "12 May 2026 10:20",
        action: "Call list note added",
        user: "Sarah",
        note: "Preferred call time logged."
      }
    ]
  },
  {
    accountNumber: "C442190",
    siteName: "Copper Kettle Garden Centre",
    legalName: "Copper Kettle Garden Centre Ltd",
    status: "On Hold",
    statusTone: "danger",
    parentAccount: "None",
    linkedChildren: ["C442191", "C442192"],
    priceVisibility: "On",
    onCallList: true,
    deliveryMethod: "Courier",
    deliveryDay: "Courier",
    contactDay: "Wednesday",
    contactFrequency: "2 weeks",
    driverOrCourier: "Courier",
    assignedSalesRep: "Andrew",
    accountOpened: "22 Sep 2020",
    lastOrderDate: "01 Apr 2026",
    nextCutOff: "Courier orders require office review",
    invoiceAddress: ["Copper Kettle Garden Centre Ltd", "Station Road", "Norwich", "NR1 1AA"],
    deliveryAddress: ["Copper Kettle Garden Centre Café", "Station Road", "Norwich", "NR1 1AA"],
    alternativeDeliveryAddresses: ["Goods-in entrance beside café"],
    contacts: [
      {
        name: "Martin Cole",
        role: "Buyer",
        phone: "01603 000888",
        email: "martin@example.co.uk",
        primary: true
      }
    ],
    flags: [
      {
        label: "On hold",
        tone: "danger",
        description: "Customer can build basket but cannot submit."
      },
      {
        label: "Inactive 8 weeks",
        tone: "warning",
        description: "Customer needs review."
      },
      {
        label: "Courier",
        tone: "info",
        description: "Courier minimum and carriage rules apply."
      }
    ],
    specialInstructions: [
      "Do not submit orders until accounts have cleared hold.",
      "Courier delivery only.",
      "Garden centre seasonal volumes increase from March."
    ],
    coffeeProducts: ["Freshpac Garden Centre Blend 6x1kg"],
    retailProducts: ["Retail Garden Centre Blend 227g"],
    pricing: [
      {
        productCode: "GCBLEND6X1",
        productName: "Freshpac Garden Centre Blend 6x1kg",
        defaultPrice: "£68.50",
        customerPrice: "£65.75",
        vat: "T0"
      }
    ],
    equipment: [
      {
        description: "Traditional espresso machine",
        makeModel: "La Spaziale S5",
        serialNumber: "LS-S5-88210",
        status: "Owned",
        installedDate: "12 Oct 2020",
        lastServiceDate: "18 Jan 2026",
        breakdownCover: "None"
      }
    ],
    breakdownHistory: [
      {
        date: "18 Jan 2026",
        jobRef: "JOB-1015",
        machine: "La Spaziale S5",
        fault: "Annual service",
        outcome: "Service completed",
        chargeable: "Yes"
      }
    ],
    notes: [
      {
        date: "01 Apr 2026 14:40",
        author: "Accounts",
        visibility: "Internal",
        note: "Account placed on hold pending payment."
      }
    ],
    rentalInformation: [],
    orders: [
      {
        reference: "FP0001412",
        date: "01 Apr 2026",
        status: "Processed",
        total: "£318.20",
        source: "Customer portal"
      }
    ],
    audit: [
      {
        date: "01 Apr 2026 14:40",
        action: "Account status changed",
        user: "Accounts",
        note: "Set to On Hold."
      }
    ]
  }
];

export function getCustomerStats() {
  return {
    total: customerAccounts.length,
    active: customerAccounts.filter((customer) => customer.status === "Active").length,
    onHold: customerAccounts.filter((customer) => customer.status === "On Hold").length,
    prepayment: customerAccounts.filter((customer) => customer.status === "Active with Prepayment").length,
    pricesHidden: customerAccounts.filter((customer) => customer.priceVisibility === "Off").length,
    onCallList: customerAccounts.filter((customer) => customer.onCallList).length
  };
}

export function getCustomerByAccount(accountNumber: string) {
  return customerAccounts.find((customer) => customer.accountNumber === accountNumber);
}