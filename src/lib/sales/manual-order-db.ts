import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ManualOrderCustomerSearchFilters = {
  q?: string;
};

export type ManualOrderCreateInput = {
  customerId: string;
  customerPoNumber?: string;
  deliveryDay?: string;
  driverOrCourier?: string;
  deliveryMethod?: string;
  customerNotes?: string;
  internalNotes?: string;
  status: "DRAFT_BASKET" | "SUBMITTED";
};

export function formatCustomerStatus(status?: string | null) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    ACTIVE_PREPAYMENT: "Active Prepayment",
    ON_HOLD: "On Hold",
    INACTIVE: "Inactive",
    ARCHIVED: "Archived",
    MARKED_FOR_DELETION: "Marked For Deletion"
  };

  return status ? labels[status] ?? status : "Unknown";
}

export function formatPriceVisibility(value?: boolean | null) {
  return value ? "Prices visible" : "Delivery Note Required";
}

function buildCustomerSearchWhere(filters?: ManualOrderCustomerSearchFilters): Prisma.CustomerAccountWhereInput {
  const q = filters?.q?.trim();

  if (!q) {
    return {};
  }

  return {
    OR: [
      { accountNumber: { contains: q, mode: "insensitive" } },
      { siteName: { contains: q, mode: "insensitive" } },
      { legalName: { contains: q, mode: "insensitive" } },
      { deliveryDay: { contains: q, mode: "insensitive" } },
      { driverOrCourier: { contains: q, mode: "insensitive" } }
    ]
  };
}

export async function getManualOrderCustomerOptionsFromDb(filters?: ManualOrderCustomerSearchFilters) {
  return prisma.customerAccount.findMany({
    where: buildCustomerSearchWhere(filters),
    orderBy: [
      {
        siteName: "asc"
      },
      {
        accountNumber: "asc"
      }
    ],
    select: {
      id: true,
      accountNumber: true,
      siteName: true,
      legalName: true,
      status: true,
      deliveryDay: true,
      deliveryMethod: true,
      driverOrCourier: true,
      priceVisibility: true
    },
    take: 40
  });
}

export async function getManualOrderCustomerByIdFromDb(customerId?: string | null) {
  if (!customerId) {
    return null;
  }

  return prisma.customerAccount.findUnique({
    where: {
      id: customerId
    },
    select: {
      id: true,
      accountNumber: true,
      siteName: true,
      legalName: true,
      status: true,
      deliveryDay: true,
      deliveryMethod: true,
      driverOrCourier: true,
      priceVisibility: true
    }
  });
}

export async function createManualOrderShellFromDb(input: ManualOrderCreateInput) {
  const customer = await prisma.customerAccount.findUnique({
    where: {
      id: input.customerId
    },
    select: {
      id: true,
      priceVisibility: true,
      deliveryDay: true,
      deliveryMethod: true,
      driverOrCourier: true
    }
  });

  if (!customer) {
    throw new Error("Customer account was not found.");
  }

  const status = input.status || "DRAFT_BASKET";
  const now = new Date();
  const temporaryReference = await createUniqueManualOrderReference();

  const data: any = {
    customerId: customer.id,
    temporaryReference,
    status,
    customerPoNumber: cleanOptionalText(input.customerPoNumber),
    deliveryDay: cleanOptionalText(input.deliveryDay) || customer.deliveryDay,
    driverOrCourier: cleanOptionalText(input.driverOrCourier) || customer.driverOrCourier,
    deliveryMethod: cleanOptionalText(input.deliveryMethod) || customer.deliveryMethod,
    customerNotes: cleanOptionalText(input.customerNotes),
    internalNotes: cleanOptionalText(input.internalNotes),
    priceVisibilityAtOrder: customer.priceVisibility,
    orderedByFreshpac: true,
    editedByFreshpac: true,
    minimumOrderPassed: true,
    totalExVatPence: 0,
    vatTotalPence: 0,
    carriageIncVatPence: 0,
    totalIncVatPence: 0,
    submittedAt: status === "SUBMITTED" ? now : null
  };

  return prisma.order.create({
    data,
    include: {
      customer: true
    }
  });
}

export function getCreatedManualOrderReference(order: {
  reference: string | null;
  temporaryReference: string | null;
}) {
  return order.reference || order.temporaryReference || "";
}

function cleanOptionalText(value?: string | null) {
  const text = value?.trim();

  return text ? text : null;
}

async function createUniqueManualOrderReference() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = createManualOrderReference();

    const existing = await prisma.order.findFirst({
      where: {
        OR: [
          {
            reference
          },
          {
            temporaryReference: reference
          }
        ]
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return reference;
    }
  }

  return createManualOrderReference();
}

function createManualOrderReference() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `MAN-${stamp}-${suffix}`;
}