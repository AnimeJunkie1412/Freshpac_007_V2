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

  const salesUser = await prisma.userProfile.create({
    data: {
      email: "sales@freshpac.local",
      fullName: "Sarah Sales",
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

  const chiefEngineerUser = await prisma.userProfile.create({
    data: {
      email: "chief.engineer@freshpac.local",
      fullName: "Chief Engineer",
      role: "CHIEF_ENGINEER"
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
          },
          {
            type: "ALTERNATIVE_DELIVERY",
            label: "Rear access",
            lines: ["Rear service gate before 10am", "Main entrance after 10am"],
            postcode: "IP15 5BD",
            isPrimary: false
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
          },
          {
            name: "Tom Morgan",
            role: "Owner",
            phone: "07700 900222",
            email: "tom@example.co.uk",
            isPrimary: false
          }
        ]
      },
      notes: {
        create: [
          {
            note: "Use rear gate for deliveries before 10am.",
            visibility: "internal",
            createdByUserId: adminUser.id
          },
          {
            note: "Customer asked about increasing retail quantities for summer.",
            visibility: "internal",
            createdByUserId: salesUser.id
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
          },
          {
            type: "DELIVERY",
            label: "Delivery",
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
      },
      notes: {
        create: [
          {
            note: "Prices hidden. Customer documents should state Delivery Note Needed.",
            visibility: "internal",
            createdByUserId: salesUser.id
          }
        ]
      }
    }
  });

  const thirdCustomer = await prisma.customerAccount.create({
    data: {
      accountNumber: "C442190",
      siteName: "Copper Kettle Garden Centre",
      legalName: "Copper Kettle Garden Centre Ltd",
      status: "ON_HOLD",
      deliveryMethod: "COURIER",
      deliveryDay: "Courier",
      contactDay: "Wednesday",
      contactFrequencyWeeks: 2,
      driverOrCourier: "Courier",
      assignedSalesRep: "Andrew",
      accountOpenedAt: new Date("2020-09-22"),
      priceVisibility: true,
      onCallList: true,
      addresses: {
        create: [
          {
            type: "INVOICE",
            label: "Invoice address",
            lines: ["Copper Kettle Garden Centre Ltd", "Station Road", "Norwich", "NR1 1AA"],
            postcode: "NR1 1AA",
            isPrimary: true
          },
          {
            type: "DELIVERY",
            label: "Café delivery",
            lines: ["Copper Kettle Garden Centre Café", "Station Road", "Norwich", "NR1 1AA"],
            postcode: "NR1 1AA",
            isPrimary: true
          }
        ]
      },
      contacts: {
        create: [
          {
            name: "Martin Cole",
            role: "Buyer",
            phone: "01603 000888",
            email: "martin@example.co.uk",
            isPrimary: true
          }
        ]
      },
      notes: {
        create: [
          {
            note: "Account placed on hold pending payment.",
            visibility: "internal",
            createdByUserId: adminUser.id
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

  const sleeve = await prisma.product.create({
    data: {
      code: "20ZCLIPSLV",
      name: "4oz Black Ripple Cup Sleeve",
      description: "Black ripple cup sleeve for takeaway hot drinks.",
      productType: "NORMAL",
      status: "ACTIVE",
      category: "Takeaway",
      productGroup: "Cups and Lids",
      packSize: "Pack",
      priceExVatPence: 207,
      vatCode: "T1",
      vatRateBasisPoints: 2000,
      customerCanSeeCode: false
    }
  });

  const everydayCoffee = await prisma.product.create({
    data: {
      code: "FPEVERY6X1",
      name: "Freshpac Everyday Espresso 6x1kg",
      description: "Everyday espresso beans for regular route customers.",
      productType: "COFFEE",
      status: "ACTIVE",
      category: "Coffee",
      productGroup: "Beans",
      packSize: "6 x 1kg",
      priceExVatPence: 6120,
      vatCode: "T0",
      vatRateBasisPoints: 0,
      customerCanSeeCode: false
    }
  });

  const cups = await prisma.product.create({
    data: {
      code: "CUPS8OZCOM",
      name: "8oz Compostable Cup",
      description: "Compostable takeaway cup.",
      productType: "NORMAL",
      status: "ACTIVE",
      category: "Takeaway",
      productGroup: "Cups and Lids",
      packSize: "Case",
      priceExVatPence: 4950,
      vatCode: "T1",
      vatRateBasisPoints: 2000,
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

  const gardenCoffee = await prisma.product.create({
    data: {
      code: "GCBLEND6X1",
      name: "Freshpac Garden Centre Blend 6x1kg",
      description: "Coffee blend for garden centre café accounts.",
      productType: "COFFEE",
      status: "ACTIVE",
      category: "Coffee",
      productGroup: "Beans",
      packSize: "6 x 1kg",
      priceExVatPence: 6575,
      vatCode: "T0",
      vatRateBasisPoints: 0,
      customerCanSeeCode: false
    }
  });

  await prisma.customerProductAccess.createMany({
    data: [
      { customerId: customer.id, productId: coffee.id },
      { customerId: customer.id, productId: retailCoffee.id },
      { customerId: secondCustomer.id, productId: everydayCoffee.id },
      { customerId: thirdCustomer.id, productId: gardenCoffee.id },
      { customerId: thirdCustomer.id, productId: retailCoffee.id }
    ]
  });

  await prisma.customerPrice.createMany({
    data: [
      {
        customerId: customer.id,
        productId: chocolate.id,
        priceExVatPence: 645
      },
      {
        customerId: customer.id,
        productId: sleeve.id,
        priceExVatPence: 198
      },
      {
        customerId: secondCustomer.id,
        productId: cups.id,
        priceExVatPence: 4950
      }
    ]
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

  const grinder = await prisma.equipment.create({
    data: {
      customerId: customer.id,
      description: "Coffee grinder",
      makeModel: "Eureka Zenith 65",
      serialNumber: "EZ65-77102",
      status: "LOANED",
      installedAt: new Date("2022-02-19"),
      lastServiceAt: new Date("2026-03-14"),
      breakdownCover: "7 day",
      machineCondition: "Reconditioned",
      rentalNotes: "Installed with espresso machine."
    }
  });

  const frankieMachine = await prisma.equipment.create({
    data: {
      customerId: secondCustomer.id,
      description: "Bean to cup machine",
      makeModel: "Franke A600",
      serialNumber: "FR-A600-44912",
      status: "RENTED",
      installedAt: new Date("2024-04-04"),
      lastServiceAt: new Date("2026-04-02"),
      breakdownCover: "5 day",
      rentalAmountPence: 7500,
      rentalStartAt: new Date("2024-04-04"),
      rentalDuration: "36 months",
      machineCondition: "New",
      rentalNotes: "Rental review due April 2027."
    }
  });

  const spazialeMachine = await prisma.equipment.create({
    data: {
      customerId: thirdCustomer.id,
      description: "Traditional espresso machine",
      makeModel: "La Spaziale S5",
      serialNumber: "LS-S5-88210",
      status: "OWNED",
      installedAt: new Date("2020-10-12"),
      lastServiceAt: new Date("2026-01-18"),
      breakdownCover: "None",
      machineCondition: "Owned"
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
      internalNotes: "Good regular account. Check retail quantity before weekly rollover.",
      totalExVatPence: 26140,
      vatTotalPence: 396,
      totalIncVatPence: 26536,
      minimumOrderPassed: true,
      priceVisibilityAtOrder: true,
      placedByUserId: salesUser.id,
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
          },
          {
            productId: sleeve.id,
            productCodeSnapshot: "20ZCLIPSLV",
            descriptionSnapshot: "4oz Black Ripple Cup Sleeve",
            packSizeSnapshot: "Pack",
            quantity: 10,
            source: "CUSTOMER_ADDED",
            priceExVatPence: 198,
            vatPence: 40,
            priceIncVatPence: 238,
            lineTotalPence: 2380
          }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      reference: "FP0001844",
      customerId: secondCustomer.id,
      status: "AWAITING_PAYMENT",
      source: "CALL_LIST",
      deliveryDay: "Tuesday",
      deliveryMethod: "FRESHPAC_ROUTE",
      driverOrCourier: "Darrell",
      customerNotes: "Call when delivery arrives.",
      internalNotes: "Prices hidden. Print as Delivery Note Needed.",
      totalExVatPence: 11070,
      vatTotalPence: 990,
      totalIncVatPence: 12060,
      minimumOrderPassed: true,
      priceVisibilityAtOrder: false,
      placedByUserId: salesUser.id,
      submittedAt: new Date("2026-05-15T09:18:00Z"),
      lines: {
        create: [
          {
            productId: everydayCoffee.id,
            productCodeSnapshot: "FPEVERY6X1",
            descriptionSnapshot: "Freshpac Everyday Espresso 6x1kg",
            packSizeSnapshot: "6 x 1kg",
            quantity: 1,
            source: "FRESHPAC_ADDED",
            priceExVatPence: 6120,
            vatPence: 0,
            priceIncVatPence: 6120,
            lineTotalPence: 6120
          },
          {
            productId: cups.id,
            productCodeSnapshot: "CUPS8OZCOM",
            descriptionSnapshot: "8oz Compostable Cup",
            packSizeSnapshot: "Case",
            quantity: 1,
            source: "FRESHPAC_ADDED",
            priceExVatPence: 4950,
            vatPence: 990,
            priceIncVatPence: 5940,
            lineTotalPence: 5940
          }
        ]
      }
    }
  });

  await prisma.order.create({
    data: {
      reference: "FP0001843",
      customerId: thirdCustomer.id,
      status: "PROCESSED",
      source: "RETAIL_ORDER",
      deliveryDay: "Courier",
      deliveryMethod: "COURIER",
      driverOrCourier: "Courier",
      customerPoNumber: "CK-443",
      internalNotes: "On hold account. Confirmed by accounts before processing.",
      totalExVatPence: 10120,
      vatTotalPence: 200,
      totalIncVatPence: 10320,
      carriageExVatPence: 1000,
      carriageVatPence: 200,
      carriageIncVatPence: 1200,
      minimumOrderPassed: false,
      priceVisibilityAtOrder: true,
      orderedByFreshpac: true,
      editedByFreshpac: true,
      placedByUserId: adminUser.id,
      processedByUserId: adminUser.id,
      submittedAt: new Date("2026-05-14T15:02:00Z"),
      processedAt: new Date("2026-05-15T08:35:00Z"),
      lines: {
        create: [
          {
            productId: retailCoffee.id,
            productCodeSnapshot: "RETAILHB227",
            descriptionSnapshot: "Retail House Blend 227g",
            packSizeSnapshot: "227g",
            quantity: 24,
            source: "RETAIL_ORDER",
            priceExVatPence: 380,
            vatPence: 0,
            priceIncVatPence: 380,
            lineTotalPence: 9120,
            lockedFromCustomer: true
          },
          {
            productCodeSnapshot: "CARRIAGE10",
            descriptionSnapshot: "Carriage charge",
            packSizeSnapshot: "Charge",
            quantity: 1,
            source: "FRESHPAC_ADDED",
            priceExVatPence: 1000,
            vatPence: 200,
            priceIncVatPence: 1200,
            lineTotalPence: 1200,
            lockedFromCustomer: true
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
      createdByUserId: salesUser.id,
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

  await prisma.engineerJob.create({
    data: {
      reference: "JOB-1051",
      customerId: secondCustomer.id,
      status: "COMPLETED",
      priority: "NORMAL",
      jobTypes: ["SERVICE"],
      reportedFault: "Routine annual service due.",
      scheduledAt: new Date("2026-04-02T09:00:00Z"),
      dateAttended: new Date("2026-04-02"),
      arrivalTime: "10:15",
      departureTime: "11:40",
      timeOnSiteMinutes: 85,
      chargeable: "NO",
      customerSignatureStatus: "SIGNED",
      customerPrintedName: "Amanda Haxell",
      signatureDate: new Date("2026-04-02"),
      photosCount: 2,
      offlineStatus: "SYNCED",
      createdByUserId: adminUser.id,
      assignedEngineerId: engineerUser.id,
      completedByUserId: engineerUser.id,
      completedAt: new Date("2026-04-02T11:42:00Z"),
      machineSheets: {
        create: [
          {
            equipmentId: frankieMachine.id,
            machineDescription: "Bean to cup machine",
            makeModel: "Franke A600",
            serialNumber: "FR-A600-44912",
            reportedFault: "Routine service",
            workCarriedOut: "Service completed. Grinder checked. Cleaning cycle tested. No faults found.",
            repairedOnSite: "Yes"
          }
        ]
      },
      partsUsed: {
        create: [
          {
            partNumber: "FLT-A600",
            description: "Internal service filter",
            quantity: 1
          }
        ]
      }
    }
  });

  await prisma.engineerJob.create({
    data: {
      reference: "JOB-1062",
      customerId: thirdCustomer.id,
      status: "FOLLOW_UP_REQUIRED",
      priority: "NORMAL",
      jobTypes: ["BREAKDOWN", "WATER_FILTER_CHANGE"],
      reportedFault: "Machine leaking from right group. Water filter also due for replacement.",
      scheduledAt: new Date("2026-05-14T13:00:00Z"),
      dateAttended: new Date("2026-05-14"),
      arrivalTime: "13:10",
      departureTime: "15:05",
      timeOnSiteMinutes: 115,
      chargeable: "TO_REVIEW",
      calloutChargePence: 6500,
      additionalChargesPence: 0,
      chargeableReviewNote: "Account owns equipment. Review parts and callout charge before Sage invoice.",
      customerSignatureStatus: "SIGNED",
      customerPrintedName: "Martin Cole",
      signatureDate: new Date("2026-05-14"),
      followUpRequired: true,
      followUpReason: "Right group gasket requires replacement. Part requested.",
      photosCount: 4,
      offlineStatus: "SYNCED",
      createdByUserId: adminUser.id,
      assignedEngineerId: engineerUser.id,
      machineSheets: {
        create: [
          {
            equipmentId: spazialeMachine.id,
            machineDescription: "Traditional espresso machine",
            makeModel: "La Spaziale S5",
            serialNumber: "LS-S5-88210",
            reportedFault: "Leak from right group",
            workCarriedOut: "Inspected group. Temporary fix completed. Gasket replacement required.",
            repairedOnSite: "Partial",
            steamPressureBar: "1.2",
            pumpPressureBar: "9",
            espressoTimeSeconds: "28",
            espressoVolumeFluidOz: "2"
          }
        ]
      },
      partsRequests: {
        create: [
          {
            reference: "PART-2201",
            status: "SUBMITTED",
            machineMakeModel: "La Spaziale S5",
            machineSerialNumber: "LS-S5-88210",
            partNumber: "LS-GRP-GSK",
            partDescription: "Group head gasket",
            quantity: 2,
            notes: "Required for follow-up visit.",
            requestedByUserId: engineerUser.id
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
      },
      {
        customerId: thirdCustomer.id,
        weekStart: new Date("2026-05-11"),
        status: "NEEDS_FRESHPAC_CONTACT",
        basketStatus: "RETAIL_LOCKED",
        assignedSalesRep: "Andrew",
        contactDay: "Wednesday",
        deliveryDay: "Courier",
        driverOrCourier: "Courier",
        notes: "Account on hold. Retail items rolled into basket but needs accounts review."
      }
    ]
  });

  await prisma.tradeAccountRequest.createMany({
    data: [
      {
        name: "Emily Hart",
        phone: "01502 000321",
        email: "emily@example.co.uk",
        businessName: "Harbour View Café",
        businessAddress: "Harbour View Café\n12 Sea Road\nSouthwold\nSuffolk\nIP18 6AA",
        relationToCompany: "Owner",
        notes: "Interested in coffee, hot chocolate and machine options.",
        status: "NEW",
        assignedSalesRep: "Sarah"
      },
      {
        name: "James Porter",
        phone: "01603 000654",
        email: "james@example.co.uk",
        businessName: "Porter Garden Centre",
        businessAddress: "Porter Garden Centre\nGreen Lane\nNorwich\nNR4 7AA",
        relationToCompany: "Café Manager",
        notes: "Asked about retail coffee and takeaway cups.",
        status: "CONTACTED",
        assignedSalesRep: "Andrew"
      }
    ]
  });

  await prisma.announcement.create({
    data: {
      title: "Bank holiday delivery reminder",
      body: "Please check delivery schedules before placing orders for the bank holiday week.",
      audience: "ALL_CUSTOMERS",
      active: true,
      startsAt: new Date("2026-05-18"),
      endsAt: new Date("2026-05-25")
    }
  });

  await prisma.referenceCounter.createMany({
    data: [
      { key: "ORDER_REFERENCE", value: 1845 },
      { key: "ENGINEER_JOB_REFERENCE", value: 1062 },
      { key: "PARTS_REQUEST_REFERENCE", value: 2201 },
      { key: "TRADE_REQUEST_REFERENCE", value: 2 }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actionType: "SEED_DATABASE",
        entityType: "SYSTEM",
        entityId: "INITIAL_SEED",
        userId: masterUser.id,
        reason: "Initial development seed data created."
      },
      {
        actionType: "CREATE_ORDER",
        entityType: "ORDER",
        entityId: "FP0001845",
        userId: salesUser.id,
        reason: "Starter customer portal order created."
      },
      {
        actionType: "PRICE_OVERRIDE",
        entityType: "PRODUCT",
        entityId: "ARK100067",
        userId: salesUser.id,
        reason: "Customer-specific price created for Aldeburgh Beach Café."
      },
      {
        actionType: "CREATE_ENGINEER_JOB",
        entityType: "ENGINEER_JOB",
        entityId: "JOB-1038",
        userId: salesUser.id,
        reason: "Starter breakdown job created."
      },
      {
        actionType: "CREATE_TRADE_REQUEST",
        entityType: "TRADE_ACCOUNT_REQUEST",
        entityId: "Harbour View Café",
        userId: null,
        reason: "Public trade request seed record created."
      }
    ]
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