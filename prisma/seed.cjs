const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.reportExport.deleteMany();
  await prisma.syncConflict.deleteMany();
  await prisma.offlineActionQueue.deleteMany();
  await prisma.approvedDevice.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.tradeAccountRequest.deleteMany();
  await prisma.rolloverRun.deleteMany();
  await prisma.callListEntry.deleteMany();
  await prisma.retailOrderLine.deleteMany();
  await prisma.retailOrder.deleteMany();
  await prisma.standingOrderLine.deleteMany();
  await prisma.standingOrder.deleteMany();
  await prisma.partsRequest.deleteMany();
  await prisma.savedPart.deleteMany();
  await prisma.jobPartUsed.deleteMany();
  await prisma.engineerJobMachineSheet.deleteMany();
  await prisma.engineerJob.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customerPrice.deleteMany();
  await prisma.customerProductAccess.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customerContact.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.customerAccount.deleteMany();
  await prisma.referenceCounter.deleteMany();

  const masterUser = await prisma.userProfile.create({
    data: {
      email: "master@freshpac.local",
      fullName: "Freshpac Master User",
      role: "MASTER_USER"
    }
  });

  const adminUser = await prisma.userProfile.create({
    data: {
      email: "admin@freshpac.local",
      fullName: "Freshpac Admin User",
      role: "ADMIN_USER"
    }
  });

  const engineerUser = await prisma.userProfile.create({
    data: {
      email: "engineer@freshpac.local",
      fullName: "Freshpac Engineer",
      role: "ENGINEER"
    }
  });

  const customer = await prisma.customerAccount.create({
    data: {
      accountNumber: "A100245",
      siteName: "Aldeburgh Beach Café",
      legalName: "Aldeburgh Beach Café Ltd",
      status: "ACTIVE",
      deliveryMethod: "FRESHPAC_ROUTE",
      deliveryDay: "Tuesday",
      contactDay: "Monday",
      contactFrequencyWeeks: 1,
      driverOrCourier: "Darrell",
      assignedSalesRep: "Sarah",
      accountOpenedAt: new Date("2021-01-14"),
      priceVisibility: true,
      onCallList: true,
      addresses: {
        create: [
          {
            type: "INVOICE",
            label: "Invoice address",
            lines: ["Aldeburgh Beach Café Ltd", "156 High Street", "Aldeburgh", "Suffolk", "IP15 5AN"],
            postcode: "IP15 5AN",
            isPrimary: true
          },
          {
            type: "DELIVERY",
            label: "Delivery address",
            lines: ["Aldeburgh Beach Café", "Beach Front", "Aldeburgh", "Suffolk", "IP15 5BD"],
            postcode: "IP15 5BD",
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            name: "Rachel Morgan",
            role: "Manager",
            phone: "01728 000111",
            email: "rachel@example.co.uk",
            isPrimary: true
          }
        ]
      },
      notes: {
        create: [
          {
            note: "Use rear gate for deliveries before 10am.",
            visibility: "internal",
            createdByUserId: adminUser.id
          }
        ]
      }
    }
  });

  const secondCustomer = await prisma.customerAccount.create({
    data: {
      accountNumber: "S587984",
      siteName: "21 Young Hearts CIC",
      legalName: "21 Young Hearts CIC",
      status: "ACTIVE_PREPAYMENT",
      deliveryMethod: "FRESHPAC_ROUTE",
      deliveryDay: "Tuesday",
      contactDay: "Monday",
      contactFrequencyWeeks: 1,
      driverOrCourier: "Darrell",
      assignedSalesRep: "Sarah",
      priceVisibility: false,
      onCallList: true,
      addresses: {
        create: [
          {
            type: "INVOICE",
            label: "Invoice and delivery",
            lines: ["21 Young Hearts CIC", "Community House", "Ipswich", "IP1 2AB"],
            postcode: "IP1 2AB",
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            name: "Amanda Haxell",
            role: "Manager",
            phone: "01473 941349",
            email: "amanda@example.org",
            isPrimary: true
          }
        ]
      }
    }
  });

  const coffee = await prisma.product.create({
    data: {
      code: "ARHSETO6X1G",
      name: "Toscana House Beans 6x1kg",
      description: "Freshpac house espresso coffee beans.",
      productType: "COFFEE",
      status: "ACTIVE",
      category: "Coffee",
      productGroup: "Beans",
      packSize: "6 x 1kg",
      priceExVatPence: 6630,
      vatCode: "T0",
      vatRateBasisPoints: 0,
      customerCanSeeCode: false
    }
  });

  const chocolate = await prisma.product.create({
    data: {
      code: "ARK100067",
      name: "Arkadia Drinking Chocolate 28% 1kg",
      description: "Premium drinking chocolate powder for catering and café use.",
      productType: "NORMAL",
      status: "ACTIVE",
      category: "Hot Chocolate",
      productGroup: "Beverages",
      packSize: "1kg",
      priceExVatPence: 675,
      vatCode: "T0",
      vatRateBasisPoints: 0,
      customerCanSeeCode: false
    }
  });

  const retailCoffee = await prisma.product.create({
    data: {
      code: "RETAILHB227",
      name: "Retail House Blend 227g",
      description: "Retail coffee bag for customer resale.",
      productType: "RETAIL",
      status: "ACTIVE",
      category: "Retail Coffee",
      productGroup: "Retail Bags",
      packSize: "227g",
      priceExVatPence: 380,
      vatCode: "T0",
      vatRateBasisPoints: 0,
      customerCanSeeCode: false
    }
  });

  await prisma.customerProductAccess.createMany({
    data: [
      {
        customerId: customer.id,
        productId: coffee.id
      },
      {
        customerId: customer.id,
        productId: retailCoffee.id
      },
      {
        customerId: secondCustomer.id,
        productId: coffee.id
      }
    ]
  });

  await prisma.customerPrice.create({
    data: {
      customerId: customer.id,
      productId: chocolate.id,
      priceExVatPence: 645
    }
  });

  const machine = await prisma.equipment.create({
    data: {
      customerId: customer.id,
      description: "Traditional espresso machine",
      makeModel: "Sanremo Zoe 2 Group",
      serialNumber: "SR-ZOE-22819",
      status: "LOANED",
      installedAt: new Date("2022-02-19"),
      lastServiceAt: new Date("2026-03-14"),
      breakdownCover: "7 day",
      machineCondition: "Reconditioned",
      rentalNotes: "Loan agreement required on file."
    }
  });

  await prisma.order.create({
    data: {
      reference: "FP0001845",
      customerId: customer.id,
      status: "SUBMITTED",
      source: "CUSTOMER_PORTAL",
      deliveryDay: "Tuesday",
      deliveryMethod: "FRESHPAC_ROUTE",
      driverOrCourier: "Darrell",
      customerPoNumber: "PO-7781",
      customerNotes: "Please deliver before 10am using rear gate.",
      totalExVatPence: 23700,
      vatTotalPence: 4740,
      totalIncVatPence: 28440,
      minimumOrderPassed: true,
      priceVisibilityAtOrder: true,
      placedByUserId: adminUser.id,
      submittedAt: new Date("2026-05-15T10:42:00Z"),
      lines: {
        create: [
          {
            productId: coffee.id,
            productCodeSnapshot: "ARHSETO6X1G",
            descriptionSnapshot: "Toscana House Beans 6x1kg",
            packSizeSnapshot: "6 x 1kg",
            quantity: 3,
            source: "CUSTOMER_ADDED",
            priceExVatPence: 6630,
            vatPence: 0,
            priceIncVatPence: 6630,
            lineTotalPence: 19890
          },
          {
            productId: chocolate.id,
            productCodeSnapshot: "ARK100067",
            descriptionSnapshot: "Arkadia Drinking Chocolate 28% 1kg",
            packSizeSnapshot: "1kg",
            quantity: 6,
            source: "CUSTOMER_ADDED",
            priceExVatPence: 645,
            vatPence: 0,
            priceIncVatPence: 645,
            lineTotalPence: 3870
          }
        ]
      }
    }
  });

  await prisma.engineerJob.create({
    data: {
      reference: "JOB-1038",
      customerId: customer.id,
      status: "ASSIGNED",
      priority: "URGENT",
      jobTypes: ["BREAKDOWN"],
      reportedFault: "Steam pressure dropping during morning service.",
      scheduledAt: new Date("2026-05-15T09:00:00Z"),
      chargeable: "NO",
      customerSignatureStatus: "NOT_SIGNED",
      offlineStatus: "SYNCED",
      createdByUserId: adminUser.id,
      assignedEngineerId: engineerUser.id,
      machineSheets: {
        create: [
          {
            equipmentId: machine.id,
            machineDescription: "Traditional espresso machine",
            makeModel: "Sanremo Zoe 2 Group",
            serialNumber: "SR-ZOE-22819",
            reportedFault: "Steam pressure drop"
          }
        ]
      }
    }
  });

  await prisma.callListEntry.createMany({
    data: [
      {
        customerId: customer.id,
        weekStart: new Date("2026-05-11"),
        status: "TO_CALL",
        basketStatus: "EMPTY",
        assignedSalesRep: "Sarah",
        contactDay: "Monday",
        deliveryDay: "Tuesday",
        driverOrCourier: "Darrell",
        notes: "Ask about summer retail stock."
      },
      {
        customerId: secondCustomer.id,
        weekStart: new Date("2026-05-11"),
        status: "ORDER_PLACED",
        basketStatus: "HAS_BASKET",
        assignedSalesRep: "Sarah",
        contactDay: "Monday",
        deliveryDay: "Tuesday",
        driverOrCourier: "Darrell",
        notes: "Prices hidden. Prepayment handling required."
      }
    ]
  });

  await prisma.referenceCounter.createMany({
    data: [
      {
        key: "ORDER_REFERENCE",
        value: 1845
      },
      {
        key: "ENGINEER_JOB_REFERENCE",
        value: 1038
      },
      {
        key: "PARTS_REQUEST_REFERENCE",
        value: 2201
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      actionType: "SEED_DATABASE",
      entityType: "SYSTEM",
      entityId: "INITIAL_SEED",
      userId: masterUser.id,
      reason: "Initial development seed data created."
    }
  });

  console.log("Freshpac seed data created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });