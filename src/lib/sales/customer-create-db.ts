import {
  CustomerAccountStatus,
  CustomerAddressType,
  DeliveryMethod
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CustomerCreateInput = {
  mode: "active" | "draft";
  accountNumber?: string;
  siteName?: string;
  legalName?: string;
  status?: string;
  parentAccountId?: string;
  deliveryMethod?: string;
  deliveryDay?: string;
  contactDay?: string;
  contactFrequencyWeeks?: number;
  driverOrCourier?: string;
  assignedSalesRep?: string;
  accountOpenedAt?: string;
  priceVisibility?: boolean;
  onCallList?: boolean;
  sageAccountRequired?: boolean;
  invoiceAddressLines?: string[];
  invoicePostcode?: string;
  deliveryAddressLines?: string[];
  deliveryPostcode?: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  contactEmail?: string;
  note?: string;
};

export async function getCustomerCreateParentOptionsFromDb() {
  return prisma.customerAccount.findMany({
    where: {
      status: {
        in: ["ACTIVE", "ACTIVE_PREPAYMENT", "ON_HOLD", "INACTIVE"]
      }
    },
    orderBy: [
      {
        accountNumber: "asc"
      }
    ],
    select: {
      id: true,
      accountNumber: true,
      siteName: true,
      status: true
    },
    take: 500
  });
}

export async function createCustomerAccountFromDb(input: CustomerCreateInput) {
  const isDraft = input.mode === "draft";

  const accountNumber = isDraft
    ? cleanText(input.accountNumber) || generateDraftAccountNumber()
    : readRequiredText(input.accountNumber, "Account number");

  const siteName = isDraft
    ? cleanText(input.siteName) || "Draft customer"
    : readRequiredText(input.siteName, "Site name");

  const existing = await prisma.customerAccount.findUnique({
    where: {
      accountNumber
    },
    select: {
      id: true
    }
  });

  if (existing) {
    throw new Error(`Customer account ${accountNumber} already exists.`);
  }

  const status = isDraft
    ? CustomerAccountStatus.INACTIVE
    : readCustomerStatus(input.status);

  const deliveryMethod = readDeliveryMethod(input.deliveryMethod);
  const contactFrequencyWeeks = normaliseFrequency(input.contactFrequencyWeeks);

  const invoiceAddressLines = cleanLines(input.invoiceAddressLines || []);
  const deliveryAddressLines = cleanLines(input.deliveryAddressLines || []);

  const shouldCreateInvoiceAddress = invoiceAddressLines.length > 0 || cleanText(input.invoicePostcode);
  const shouldCreateDeliveryAddress = deliveryAddressLines.length > 0 || cleanText(input.deliveryPostcode);

  const shouldCreateContact =
    cleanText(input.contactName) ||
    cleanText(input.contactRole) ||
    cleanText(input.contactPhone) ||
    cleanText(input.contactEmail);

  const shouldCreateNote = Boolean(cleanText(input.note));

  const customer = await prisma.customerAccount.create({
    data: {
      accountNumber,
      siteName,
      legalName: cleanText(input.legalName),
      status,
      parentAccountId: cleanText(input.parentAccountId),
      deliveryMethod,
      deliveryDay: cleanText(input.deliveryDay),
      contactDay: cleanText(input.contactDay),
      contactFrequencyWeeks,
      driverOrCourier: cleanText(input.driverOrCourier),
      assignedSalesRep: cleanText(input.assignedSalesRep),
      accountOpenedAt: parseOptionalDate(input.accountOpenedAt),
      priceVisibility: isDraft ? Boolean(input.priceVisibility) : input.priceVisibility ?? true,
      onCallList: isDraft ? false : input.onCallList ?? true,
      sageAccountRequired: isDraft ? false : input.sageAccountRequired ?? true,
      addresses: shouldCreateInvoiceAddress || shouldCreateDeliveryAddress
        ? {
            create: [
              ...(shouldCreateInvoiceAddress
                ? [
                    {
                      type: CustomerAddressType.INVOICE,
                      label: "Invoice address",
                      lines: invoiceAddressLines,
                      postcode: cleanText(input.invoicePostcode),
                      isPrimary: true
                    }
                  ]
                : []),
              ...(shouldCreateDeliveryAddress
                ? [
                    {
                      type: CustomerAddressType.DELIVERY,
                      label: "Delivery address",
                      lines: deliveryAddressLines,
                      postcode: cleanText(input.deliveryPostcode),
                      isPrimary: true
                    }
                  ]
                : [])
            ]
          }
        : undefined,
      contacts: shouldCreateContact
        ? {
            create: {
              name: cleanText(input.contactName) || "Unnamed contact",
              role: cleanText(input.contactRole),
              phone: cleanText(input.contactPhone),
              email: cleanText(input.contactEmail),
              isPrimary: true
            }
          }
        : undefined,
      notes: shouldCreateNote
        ? {
            create: {
              note: cleanText(input.note) || "",
              visibility: "internal"
            }
          }
        : undefined
    } as any,
    include: {
      addresses: true,
      contacts: true,
      notes: true
    }
  });

  return customer;
}

export function getCustomerCreateRedirectAccountNumber(customer: {
  accountNumber: string;
}) {
  return customer.accountNumber;
}

function readRequiredText(value: string | undefined, label: string) {
  const text = cleanText(value);

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text;
}

function cleanText(value?: string | null) {
  const text = String(value || "").trim();

  return text ? text : null;
}

function cleanLines(lines: string[]) {
  return lines
    .map((line) => cleanText(line))
    .filter(Boolean) as string[];
}

function readCustomerStatus(value?: string) {
  const status = cleanText(value) || "ACTIVE";
  const allowed = Object.values(CustomerAccountStatus);

  if (!allowed.includes(status as CustomerAccountStatus)) {
    return CustomerAccountStatus.ACTIVE;
  }

  if (status === "DELETED") {
    return CustomerAccountStatus.INACTIVE;
  }

  return status as CustomerAccountStatus;
}

function readDeliveryMethod(value?: string) {
  const method = cleanText(value) || "FRESHPAC_ROUTE";
  const allowed = Object.values(DeliveryMethod);

  if (!allowed.includes(method as DeliveryMethod)) {
    return DeliveryMethod.FRESHPAC_ROUTE;
  }

  return method as DeliveryMethod;
}

function normaliseFrequency(value?: number) {
  const number = Number(value || 1);

  if (!Number.isFinite(number)) {
    return 1;
  }

  return Math.max(1, Math.min(52, Math.floor(number)));
}

function parseOptionalDate(value?: string) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function generateDraftAccountNumber() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");

  return `DRAFT-${stamp}`;
}