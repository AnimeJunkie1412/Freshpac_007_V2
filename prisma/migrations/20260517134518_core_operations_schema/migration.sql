-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MASTER_USER', 'ADMIN_USER', 'CHIEF_ENGINEER', 'ENGINEER', 'PARENT_USER', 'CHILD_USER');

-- CreateEnum
CREATE TYPE "CustomerAccountStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'ACTIVE_PREPAYMENT', 'INACTIVE', 'ARCHIVED', 'MARKED_FOR_DELETION', 'DELETED');

-- CreateEnum
CREATE TYPE "CustomerAddressType" AS ENUM ('INVOICE', 'DELIVERY', 'ALTERNATIVE_DELIVERY');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('FRESHPAC_ROUTE', 'COURIER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('NORMAL', 'COFFEE', 'RETAIL');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'MARKED_FOR_DELETION');

-- CreateEnum
CREATE TYPE "VatCode" AS ENUM ('T0', 'T1');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT_BASKET', 'SUBMITTED', 'AWAITING_PAYMENT', 'PAID_SUBMITTED', 'PROCESSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('CUSTOMER_PORTAL', 'FRESHPAC_STAFF', 'CALL_LIST', 'STANDING_ORDER', 'RETAIL_ORDER', 'SYSTEM_AUTO_SUBMITTED', 'OFFLINE_PENDING');

-- CreateEnum
CREATE TYPE "OrderLineSource" AS ENUM ('CUSTOMER_ADDED', 'FRESHPAC_ADDED', 'STANDING_ORDER', 'RETAIL_ORDER', 'REORDERED_FROM_PAST_ORDER', 'SYSTEM_AUTO_SUBMITTED');

-- CreateEnum
CREATE TYPE "EngineerJobStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP_REQUIRED', 'COMPLETED', 'COMPLETED_INVOICED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EngineerJobType" AS ENUM ('BREAKDOWN', 'SERVICE', 'WATER_FILTER_CHANGE');

-- CreateEnum
CREATE TYPE "EngineerPriority" AS ENUM ('LOW', 'NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "ChargeableStatus" AS ENUM ('YES', 'NO', 'TO_REVIEW');

-- CreateEnum
CREATE TYPE "CustomerSignatureStatus" AS ENUM ('NOT_SIGNED', 'SIGNED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('OWNED', 'RENTED', 'LOANED', 'TRIAL', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "PartRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PRINTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CallListStatus" AS ENUM ('TO_CALL', 'CALLED', 'NOTHING_NEEDED', 'ORDER_PLACED', 'NEEDS_FRESHPAC_CONTACT');

-- CreateEnum
CREATE TYPE "BasketStatus" AS ENUM ('EMPTY', 'HAS_BASKET', 'RETAIL_LOCKED', 'STANDING_ORDER_DUE');

-- CreateEnum
CREATE TYPE "StandingOrderStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RetailOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ROLLED_OVER', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RolloverStatus" AS ENUM ('PREVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TradeRequestStatus" AS ENUM ('NEW', 'CONTACTED', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL_CUSTOMERS', 'SELECTED_CUSTOMERS', 'DELIVERY_DAY', 'DRIVER_ROUTE', 'COURIER_CUSTOMERS', 'ACCOUNT_STATUS', 'INTERNAL_STAFF');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED', 'CONFLICT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncConflictStatus" AS ENUM ('NEEDS_REVIEW', 'ACCEPTED_OFFLINE', 'KEPT_CLOUD', 'MERGED', 'ARCHIVED_DUPLICATE', 'CANCELLED_PENDING_CHANGE');

-- CreateEnum
CREATE TYPE "AuditRetentionClass" AS ENUM ('SECURITY_60_DAYS', 'BUSINESS_PERMANENT');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('ORDERS', 'CUSTOMERS', 'PRODUCTS', 'ENGINEERS', 'ROLLOVER', 'AUDIT');

-- CreateEnum
CREATE TYPE "ReportExportStatus" AS ENUM ('REQUESTED', 'GENERATED', 'FAILED');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "authUserId" UUID,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "customerAccountId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAccount" (
    "id" UUID NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "legalName" TEXT,
    "status" "CustomerAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "parentAccountId" UUID,
    "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'FRESHPAC_ROUTE',
    "deliveryDay" TEXT,
    "contactDay" TEXT,
    "contactFrequencyWeeks" INTEGER NOT NULL DEFAULT 1,
    "driverOrCourier" TEXT,
    "assignedSalesRep" TEXT,
    "accountOpenedAt" TIMESTAMP(3),
    "priceVisibility" BOOLEAN NOT NULL DEFAULT true,
    "onCallList" BOOLEAN NOT NULL DEFAULT true,
    "sageAccountRequired" BOOLEAN NOT NULL DEFAULT true,
    "markedForDeletionAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "type" "CustomerAddressType" NOT NULL,
    "label" TEXT,
    "lines" TEXT[],
    "postcode" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerContact" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerNote" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'internal',
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "productType" "ProductType" NOT NULL DEFAULT 'NORMAL',
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT,
    "productGroup" TEXT,
    "packSize" TEXT,
    "imageUrl" TEXT,
    "priceExVatPence" INTEGER NOT NULL,
    "vatCode" "VatCode" NOT NULL DEFAULT 'T1',
    "vatRateBasisPoints" INTEGER NOT NULL DEFAULT 2000,
    "customerCanSeeCode" BOOLEAN NOT NULL DEFAULT false,
    "sageCodeRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProductAccess" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerProductAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPrice" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "priceExVatPence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "reference" TEXT,
    "temporaryReference" TEXT,
    "customerId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT_BASKET',
    "source" "OrderSource" NOT NULL DEFAULT 'CUSTOMER_PORTAL',
    "deliveryDay" TEXT,
    "deliveryMethod" "DeliveryMethod",
    "driverOrCourier" TEXT,
    "customerPoNumber" TEXT,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "totalExVatPence" INTEGER NOT NULL DEFAULT 0,
    "vatTotalPence" INTEGER NOT NULL DEFAULT 0,
    "totalIncVatPence" INTEGER NOT NULL DEFAULT 0,
    "carriageExVatPence" INTEGER NOT NULL DEFAULT 0,
    "carriageVatPence" INTEGER NOT NULL DEFAULT 0,
    "carriageIncVatPence" INTEGER NOT NULL DEFAULT 0,
    "minimumOrderPassed" BOOLEAN,
    "priceVisibilityAtOrder" BOOLEAN NOT NULL DEFAULT true,
    "orderedByFreshpac" BOOLEAN NOT NULL DEFAULT false,
    "editedByFreshpac" BOOLEAN NOT NULL DEFAULT false,
    "editNote" TEXT,
    "placedByUserId" UUID,
    "processedByUserId" UUID,
    "submittedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLine" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID,
    "productCodeSnapshot" TEXT NOT NULL,
    "descriptionSnapshot" TEXT NOT NULL,
    "packSizeSnapshot" TEXT,
    "quantity" INTEGER NOT NULL,
    "source" "OrderLineSource" NOT NULL DEFAULT 'CUSTOMER_ADDED',
    "priceExVatPence" INTEGER NOT NULL,
    "vatPence" INTEGER NOT NULL,
    "priceIncVatPence" INTEGER NOT NULL,
    "lineTotalPence" INTEGER NOT NULL,
    "lockedFromCustomer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "makeModel" TEXT,
    "serialNumber" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'OWNED',
    "installedAt" TIMESTAMP(3),
    "lastServiceAt" TIMESTAMP(3),
    "breakdownCover" TEXT,
    "rentalAmountPence" INTEGER,
    "rentalStartAt" TIMESTAMP(3),
    "rentalDuration" TEXT,
    "machineCondition" TEXT,
    "rentalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineerJob" (
    "id" UUID NOT NULL,
    "reference" TEXT,
    "temporaryReference" TEXT,
    "customerId" UUID NOT NULL,
    "status" "EngineerJobStatus" NOT NULL DEFAULT 'NEW',
    "priority" "EngineerPriority" NOT NULL DEFAULT 'NORMAL',
    "jobTypes" "EngineerJobType"[],
    "reportedFault" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "dateAttended" TIMESTAMP(3),
    "arrivalTime" TEXT,
    "departureTime" TEXT,
    "timeOnSiteMinutes" INTEGER,
    "chargeable" "ChargeableStatus" NOT NULL DEFAULT 'TO_REVIEW',
    "calloutChargePence" INTEGER,
    "additionalChargesPence" INTEGER,
    "chargeableReviewNote" TEXT,
    "sageInvoiceNumber" TEXT,
    "customerSignatureStatus" "CustomerSignatureStatus" NOT NULL DEFAULT 'NOT_SIGNED',
    "customerPrintedName" TEXT,
    "signatureDate" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpReason" TEXT,
    "parentJobId" UUID,
    "photosCount" INTEGER NOT NULL DEFAULT 0,
    "offlineStatus" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "createdByUserId" UUID,
    "assignedEngineerId" UUID,
    "completedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "EngineerJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineerJobMachineSheet" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "equipmentId" UUID,
    "machineDescription" TEXT NOT NULL,
    "makeModel" TEXT,
    "serialNumber" TEXT,
    "reportedFault" TEXT,
    "workCarriedOut" TEXT,
    "repairedOnSite" TEXT,
    "machineExchanged" TEXT,
    "exchangedMachineDescription" TEXT,
    "exchangedMachineSerialNumber" TEXT,
    "steamPressureBar" TEXT,
    "pumpPressureBar" TEXT,
    "espressoTimeSeconds" TEXT,
    "espressoVolumeFluidOz" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineerJobMachineSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPartUsed" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "partNumber" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPartUsed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPart" (
    "id" UUID NOT NULL,
    "partNumber" TEXT,
    "description" TEXT NOT NULL,
    "supplier" TEXT,
    "costToCustomerPence" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartsRequest" (
    "id" UUID NOT NULL,
    "reference" TEXT,
    "jobId" UUID,
    "status" "PartRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "machineMakeModel" TEXT,
    "machineSerialNumber" TEXT,
    "partNumber" TEXT,
    "partDescription" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "machineFault" TEXT,
    "notes" TEXT,
    "requestedByUserId" UUID,
    "printedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartsRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandingOrder" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "StandingOrderStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "intervalWeeks" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandingOrderLine" (
    "id" UUID NOT NULL,
    "standingOrderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StandingOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailOrder" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "RetailOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "orderWeekStart" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "rolledOverAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailOrderLine" (
    "id" UUID NOT NULL,
    "retailOrderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetailOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallListEntry" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "status" "CallListStatus" NOT NULL DEFAULT 'TO_CALL',
    "basketStatus" "BasketStatus" NOT NULL DEFAULT 'EMPTY',
    "assignedSalesRep" TEXT,
    "contactDay" TEXT,
    "deliveryDay" TEXT,
    "driverOrCourier" TEXT,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolloverRun" (
    "id" UUID NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "status" "RolloverStatus" NOT NULL DEFAULT 'PREVIEW',
    "previewSummary" JSONB,
    "completionSummary" JSONB,
    "runByUserId" UUID,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolloverRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeAccountRequest" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "relationToCompany" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TradeRequestStatus" NOT NULL DEFAULT 'NEW',
    "assignedSalesRep" TEXT,
    "customerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeAccountRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" "AnnouncementAudience" NOT NULL DEFAULT 'ALL_CUSTOMERS',
    "targetDeliveryDay" TEXT,
    "targetDriver" TEXT,
    "targetCustomerIds" TEXT[],
    "targetAccountStatus" "CustomerAccountStatus",
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovedDevice" (
    "id" UUID NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceKeyHash" TEXT NOT NULL,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offlineAdminCacheAllowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ApprovedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfflineActionQueue" (
    "id" UUID NOT NULL,
    "deviceId" UUID,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "temporaryReference" TEXT,
    "payload" JSONB NOT NULL,
    "lastKnownCloudVersion" TEXT,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "OfflineActionQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncConflict" (
    "id" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "offlinePayload" JSONB NOT NULL,
    "cloudPayload" JSONB,
    "status" "SyncConflictStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "decisionNote" TEXT,
    "decidedByUserId" UUID,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncConflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExport" (
    "id" UUID NOT NULL,
    "reportId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "status" "ReportExportStatus" NOT NULL DEFAULT 'REQUESTED',
    "filters" JSONB,
    "filePath" TEXT,
    "errorMessage" TEXT,
    "requestedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedAt" TIMESTAMP(3),

    CONSTRAINT "ReportExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferenceCounter_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" UUID,
    "beforeValue" JSONB,
    "afterValue" JSONB,
    "reason" TEXT,
    "retentionClass" "AuditRetentionClass" NOT NULL DEFAULT 'BUSINESS_PERMANENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_authUserId_key" ON "UserProfile"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "UserProfile_role_idx" ON "UserProfile"("role");

-- CreateIndex
CREATE INDEX "UserProfile_active_idx" ON "UserProfile"("active");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAccount_accountNumber_key" ON "CustomerAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "CustomerAccount_siteName_idx" ON "CustomerAccount"("siteName");

-- CreateIndex
CREATE INDEX "CustomerAccount_status_idx" ON "CustomerAccount"("status");

-- CreateIndex
CREATE INDEX "CustomerAccount_deliveryDay_idx" ON "CustomerAccount"("deliveryDay");

-- CreateIndex
CREATE INDEX "CustomerAccount_driverOrCourier_idx" ON "CustomerAccount"("driverOrCourier");

-- CreateIndex
CREATE INDEX "CustomerAccount_assignedSalesRep_idx" ON "CustomerAccount"("assignedSalesRep");

-- CreateIndex
CREATE INDEX "CustomerAccount_onCallList_idx" ON "CustomerAccount"("onCallList");

-- CreateIndex
CREATE INDEX "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

-- CreateIndex
CREATE INDEX "CustomerAddress_type_idx" ON "CustomerAddress"("type");

-- CreateIndex
CREATE INDEX "CustomerContact_customerId_idx" ON "CustomerContact"("customerId");

-- CreateIndex
CREATE INDEX "CustomerContact_email_idx" ON "CustomerContact"("email");

-- CreateIndex
CREATE INDEX "CustomerContact_phone_idx" ON "CustomerContact"("phone");

-- CreateIndex
CREATE INDEX "CustomerNote_customerId_idx" ON "CustomerNote"("customerId");

-- CreateIndex
CREATE INDEX "CustomerNote_createdAt_idx" ON "CustomerNote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_productType_idx" ON "Product"("productType");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_productGroup_idx" ON "Product"("productGroup");

-- CreateIndex
CREATE INDEX "CustomerProductAccess_customerId_idx" ON "CustomerProductAccess"("customerId");

-- CreateIndex
CREATE INDEX "CustomerProductAccess_productId_idx" ON "CustomerProductAccess"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProductAccess_customerId_productId_key" ON "CustomerProductAccess"("customerId", "productId");

-- CreateIndex
CREATE INDEX "CustomerPrice_customerId_idx" ON "CustomerPrice"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPrice_productId_idx" ON "CustomerPrice"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPrice_customerId_productId_key" ON "CustomerPrice"("customerId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Order_temporaryReference_key" ON "Order"("temporaryReference");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_source_idx" ON "Order"("source");

-- CreateIndex
CREATE INDEX "Order_deliveryDay_idx" ON "Order"("deliveryDay");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderLine_orderId_idx" ON "OrderLine"("orderId");

-- CreateIndex
CREATE INDEX "OrderLine_productId_idx" ON "OrderLine"("productId");

-- CreateIndex
CREATE INDEX "OrderLine_source_idx" ON "OrderLine"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "Equipment_customerId_idx" ON "Equipment"("customerId");

-- CreateIndex
CREATE INDEX "Equipment_serialNumber_idx" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EngineerJob_reference_key" ON "EngineerJob"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "EngineerJob_temporaryReference_key" ON "EngineerJob"("temporaryReference");

-- CreateIndex
CREATE INDEX "EngineerJob_customerId_idx" ON "EngineerJob"("customerId");

-- CreateIndex
CREATE INDEX "EngineerJob_status_idx" ON "EngineerJob"("status");

-- CreateIndex
CREATE INDEX "EngineerJob_priority_idx" ON "EngineerJob"("priority");

-- CreateIndex
CREATE INDEX "EngineerJob_scheduledAt_idx" ON "EngineerJob"("scheduledAt");

-- CreateIndex
CREATE INDEX "EngineerJob_offlineStatus_idx" ON "EngineerJob"("offlineStatus");

-- CreateIndex
CREATE INDEX "EngineerJobMachineSheet_jobId_idx" ON "EngineerJobMachineSheet"("jobId");

-- CreateIndex
CREATE INDEX "EngineerJobMachineSheet_equipmentId_idx" ON "EngineerJobMachineSheet"("equipmentId");

-- CreateIndex
CREATE INDEX "EngineerJobMachineSheet_serialNumber_idx" ON "EngineerJobMachineSheet"("serialNumber");

-- CreateIndex
CREATE INDEX "JobPartUsed_jobId_idx" ON "JobPartUsed"("jobId");

-- CreateIndex
CREATE INDEX "JobPartUsed_partNumber_idx" ON "JobPartUsed"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPart_partNumber_key" ON "SavedPart"("partNumber");

-- CreateIndex
CREATE INDEX "SavedPart_description_idx" ON "SavedPart"("description");

-- CreateIndex
CREATE INDEX "SavedPart_active_idx" ON "SavedPart"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PartsRequest_reference_key" ON "PartsRequest"("reference");

-- CreateIndex
CREATE INDEX "PartsRequest_jobId_idx" ON "PartsRequest"("jobId");

-- CreateIndex
CREATE INDEX "PartsRequest_status_idx" ON "PartsRequest"("status");

-- CreateIndex
CREATE INDEX "PartsRequest_partNumber_idx" ON "PartsRequest"("partNumber");

-- CreateIndex
CREATE INDEX "PartsRequest_machineSerialNumber_idx" ON "PartsRequest"("machineSerialNumber");

-- CreateIndex
CREATE INDEX "StandingOrder_customerId_idx" ON "StandingOrder"("customerId");

-- CreateIndex
CREATE INDEX "StandingOrder_status_idx" ON "StandingOrder"("status");

-- CreateIndex
CREATE INDEX "StandingOrderLine_standingOrderId_idx" ON "StandingOrderLine"("standingOrderId");

-- CreateIndex
CREATE INDEX "StandingOrderLine_productId_idx" ON "StandingOrderLine"("productId");

-- CreateIndex
CREATE INDEX "RetailOrder_customerId_idx" ON "RetailOrder"("customerId");

-- CreateIndex
CREATE INDEX "RetailOrder_status_idx" ON "RetailOrder"("status");

-- CreateIndex
CREATE INDEX "RetailOrder_orderWeekStart_idx" ON "RetailOrder"("orderWeekStart");

-- CreateIndex
CREATE INDEX "RetailOrderLine_retailOrderId_idx" ON "RetailOrderLine"("retailOrderId");

-- CreateIndex
CREATE INDEX "RetailOrderLine_productId_idx" ON "RetailOrderLine"("productId");

-- CreateIndex
CREATE INDEX "CallListEntry_weekStart_idx" ON "CallListEntry"("weekStart");

-- CreateIndex
CREATE INDEX "CallListEntry_status_idx" ON "CallListEntry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CallListEntry_customerId_weekStart_key" ON "CallListEntry"("customerId", "weekStart");

-- CreateIndex
CREATE INDEX "RolloverRun_status_idx" ON "RolloverRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RolloverRun_weekStart_key" ON "RolloverRun"("weekStart");

-- CreateIndex
CREATE INDEX "TradeAccountRequest_status_idx" ON "TradeAccountRequest"("status");

-- CreateIndex
CREATE INDEX "TradeAccountRequest_createdAt_idx" ON "TradeAccountRequest"("createdAt");

-- CreateIndex
CREATE INDEX "TradeAccountRequest_email_idx" ON "TradeAccountRequest"("email");

-- CreateIndex
CREATE INDEX "Announcement_audience_idx" ON "Announcement"("audience");

-- CreateIndex
CREATE INDEX "Announcement_active_idx" ON "Announcement"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovedDevice_deviceKeyHash_key" ON "ApprovedDevice"("deviceKeyHash");

-- CreateIndex
CREATE INDEX "ApprovedDevice_revokedAt_idx" ON "ApprovedDevice"("revokedAt");

-- CreateIndex
CREATE INDEX "ApprovedDevice_lastSyncAt_idx" ON "ApprovedDevice"("lastSyncAt");

-- CreateIndex
CREATE INDEX "OfflineActionQueue_status_idx" ON "OfflineActionQueue"("status");

-- CreateIndex
CREATE INDEX "OfflineActionQueue_entityType_entityId_idx" ON "OfflineActionQueue"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "OfflineActionQueue_temporaryReference_idx" ON "OfflineActionQueue"("temporaryReference");

-- CreateIndex
CREATE INDEX "SyncConflict_status_idx" ON "SyncConflict"("status");

-- CreateIndex
CREATE INDEX "SyncConflict_entityType_entityId_idx" ON "SyncConflict"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ReportExport_reportId_idx" ON "ReportExport"("reportId");

-- CreateIndex
CREATE INDEX "ReportExport_category_idx" ON "ReportExport"("category");

-- CreateIndex
CREATE INDEX "ReportExport_status_idx" ON "ReportExport"("status");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_idx" ON "AuditLog"("actionType");

-- CreateIndex
CREATE INDEX "AuditLog_retentionClass_idx" ON "AuditLog"("retentionClass");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_customerAccountId_fkey" FOREIGN KEY ("customerAccountId") REFERENCES "CustomerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAccount" ADD CONSTRAINT "CustomerAccount_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "CustomerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProductAccess" ADD CONSTRAINT "CustomerProductAccess_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProductAccess" ADD CONSTRAINT "CustomerProductAccess_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPrice" ADD CONSTRAINT "CustomerPrice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPrice" ADD CONSTRAINT "CustomerPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_placedByUserId_fkey" FOREIGN KEY ("placedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_processedByUserId_fkey" FOREIGN KEY ("processedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJob" ADD CONSTRAINT "EngineerJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJob" ADD CONSTRAINT "EngineerJob_parentJobId_fkey" FOREIGN KEY ("parentJobId") REFERENCES "EngineerJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJob" ADD CONSTRAINT "EngineerJob_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJob" ADD CONSTRAINT "EngineerJob_assignedEngineerId_fkey" FOREIGN KEY ("assignedEngineerId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJob" ADD CONSTRAINT "EngineerJob_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJobMachineSheet" ADD CONSTRAINT "EngineerJobMachineSheet_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "EngineerJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineerJobMachineSheet" ADD CONSTRAINT "EngineerJobMachineSheet_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPartUsed" ADD CONSTRAINT "JobPartUsed_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "EngineerJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartsRequest" ADD CONSTRAINT "PartsRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "EngineerJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartsRequest" ADD CONSTRAINT "PartsRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandingOrder" ADD CONSTRAINT "StandingOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandingOrderLine" ADD CONSTRAINT "StandingOrderLine_standingOrderId_fkey" FOREIGN KEY ("standingOrderId") REFERENCES "StandingOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandingOrderLine" ADD CONSTRAINT "StandingOrderLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailOrder" ADD CONSTRAINT "RetailOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailOrderLine" ADD CONSTRAINT "RetailOrderLine_retailOrderId_fkey" FOREIGN KEY ("retailOrderId") REFERENCES "RetailOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailOrderLine" ADD CONSTRAINT "RetailOrderLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallListEntry" ADD CONSTRAINT "CallListEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolloverRun" ADD CONSTRAINT "RolloverRun_runByUserId_fkey" FOREIGN KEY ("runByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeAccountRequest" ADD CONSTRAINT "TradeAccountRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovedDevice" ADD CONSTRAINT "ApprovedDevice_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncConflict" ADD CONSTRAINT "SyncConflict_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExport" ADD CONSTRAINT "ReportExport_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
