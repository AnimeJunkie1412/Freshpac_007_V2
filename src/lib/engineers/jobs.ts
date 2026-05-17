import type { BadgeTone } from "@/lib/sales/customers";

export type EngineerJobStatus =
  | "New"
  | "Assigned"
  | "In Progress"
  | "Follow-up Required"
  | "Completed"
  | "Completed - Invoiced"
  | "Cancelled";

export type EngineerJobType = "Breakdown" | "Service" | "Water Filter Change";

export type EngineerPriority = "Normal" | "Urgent" | "Low";

export type ChargeableStatus = "Yes" | "No" | "To review";

export type MachineJobSheet = {
  machineDescription: string;
  makeModel: string;
  serialNumber: string;
  reportedFault: string;
  workCarriedOut: string;
  repairedOnSite: "Yes" | "No" | "Partial";
  machineExchanged: "Yes" | "No";
  exchangedMachine?: string;
  settings?: {
    steamPressureBar?: string;
    pumpPressureBar?: string;
    espressoTimeSeconds?: string;
    espressoVolumeFlOz?: string;
  };
};

export type PartUsed = {
  partNumber: string;
  description: string;
  quantity: number;
};

export type PartsRequest = {
  requestRef: string;
  status: "Draft" | "Submitted" | "Printed" | "Completed";
  machineMakeModel: string;
  machineSerialNumber: string;
  partNumber: string;
  partDescription: string;
  quantity: number;
  notes: string;
};

export type EngineerJobAuditEvent = {
  date: string;
  action: string;
  user: string;
  note: string;
};

export type EngineerJob = {
  jobRef: string;
  status: EngineerJobStatus;
  priority: EngineerPriority;
  jobTypes: EngineerJobType[];
  createdAt: string;
  reportedBy: string;
  assignedEngineer: string;
  scheduledDate: string;
  dateAttended: string;
  arrivalTime: string;
  departureTime: string;
  timeOnSite: string;
  accountNumber: string;
  siteName: string;
  contactName: string;
  contactPhone: string;
  siteAddress: string[];
  assignedCoffeeProducts: string[];
  reportedFault: string;
  chargeable: ChargeableStatus;
  calloutCharge: string;
  additionalCharges: string;
  chargeableReviewNote: string;
  sageInvoiceNumber: string;
  customerSignatureStatus: "Not signed" | "Signed" | "Not required";
  customerPrintedName: string;
  signatureDate: string;
  followUpRequired: "Yes" | "No";
  followUpReason: string;
  photosCount: number;
  offlineStatus: "Cloud only" | "Saved offline" | "Pending sync" | "Synced";
  machineSheets: MachineJobSheet[];
  partsUsed: PartUsed[];
  partsRequests: PartsRequest[];
  notes: string[];
  audit: EngineerJobAuditEvent[];
};

export const engineerStatusTone: Record<EngineerJobStatus, BadgeTone> = {
  New: "info",
  Assigned: "warning",
  "In Progress": "warning",
  "Follow-up Required": "danger",
  Completed: "success",
  "Completed - Invoiced": "success",
  Cancelled: "neutral"
};

export const engineerPriorityTone: Record<EngineerPriority, BadgeTone> = {
  Normal: "neutral",
  Urgent: "danger",
  Low: "info"
};

export const engineerJobs: EngineerJob[] = [
  {
    jobRef: "JOB-1038",
    status: "Assigned",
    priority: "Urgent",
    jobTypes: ["Breakdown"],
    createdAt: "15 May 2026 08:40",
    reportedBy: "Sarah",
    assignedEngineer: "Clive",
    scheduledDate: "15 May 2026",
    dateAttended: "",
    arrivalTime: "",
    departureTime: "",
    timeOnSite: "",
    accountNumber: "A100245",
    siteName: "Aldeburgh Beach Café",
    contactName: "Rachel Morgan",
    contactPhone: "01728 000111",
    siteAddress: ["Aldeburgh Beach Café", "Beach Front", "Aldeburgh", "Suffolk", "IP15 5BD"],
    assignedCoffeeProducts: ["Toscana House Beans 6x1kg", "Freshpac Suffolk Espresso 6x1kg"],
    reportedFault: "Steam pressure dropping during morning service. Customer says machine recovers after ten minutes.",
    chargeable: "No",
    calloutCharge: "£0.00",
    additionalCharges: "£0.00",
    chargeableReviewNote: "",
    sageInvoiceNumber: "",
    customerSignatureStatus: "Not signed",
    customerPrintedName: "",
    signatureDate: "",
    followUpRequired: "No",
    followUpReason: "",
    photosCount: 0,
    offlineStatus: "Saved offline",
    machineSheets: [
      {
        machineDescription: "Traditional espresso machine",
        makeModel: "Sanremo Zoe 2 Group",
        serialNumber: "SR-ZOE-22819",
        reportedFault: "Steam pressure drop",
        workCarriedOut: "",
        repairedOnSite: "No",
        machineExchanged: "No",
        settings: {
          steamPressureBar: "",
          pumpPressureBar: "",
          espressoTimeSeconds: "",
          espressoVolumeFlOz: ""
        }
      }
    ],
    partsUsed: [],
    partsRequests: [],
    notes: ["Customer needs machine checked before weekend trading.", "Access machine through rear service door before 10am."],
    audit: [
      {
        date: "15 May 2026 08:40",
        action: "Job created",
        user: "Sarah",
        note: "Breakdown reported from Sales Portal."
      },
      {
        date: "15 May 2026 08:44",
        action: "Job assigned",
        user: "Chief Engineer",
        note: "Assigned to Clive."
      }
    ]
  },
  {
    jobRef: "JOB-1051",
    status: "Completed",
    priority: "Normal",
    jobTypes: ["Service"],
    createdAt: "02 Apr 2026 09:10",
    reportedBy: "Amanda",
    assignedEngineer: "Neil",
    scheduledDate: "02 Apr 2026",
    dateAttended: "02 Apr 2026",
    arrivalTime: "10:15",
    departureTime: "11:40",
    timeOnSite: "1h 25m",
    accountNumber: "S587984",
    siteName: "21 Young Hearts CIC",
    contactName: "Amanda Haxell",
    contactPhone: "01473 941349",
    siteAddress: ["21 Young Hearts CIC", "Community House", "Ipswich", "IP1 2AB"],
    assignedCoffeeProducts: ["Freshpac Everyday Espresso 6x1kg"],
    reportedFault: "Routine annual service due.",
    chargeable: "No",
    calloutCharge: "£0.00",
    additionalCharges: "£0.00",
    chargeableReviewNote: "",
    sageInvoiceNumber: "",
    customerSignatureStatus: "Signed",
    customerPrintedName: "Amanda Haxell",
    signatureDate: "02 Apr 2026",
    followUpRequired: "No",
    followUpReason: "",
    photosCount: 2,
    offlineStatus: "Synced",
    machineSheets: [
      {
        machineDescription: "Bean to cup machine",
        makeModel: "Franke A600",
        serialNumber: "FR-A600-44912",
        reportedFault: "Routine service",
        workCarriedOut: "Service completed. Grinder checked. Cleaning cycle tested. No faults found.",
        repairedOnSite: "Yes",
        machineExchanged: "No",
        settings: {}
      }
    ],
    partsUsed: [
      {
        partNumber: "FLT-A600",
        description: "Internal service filter",
        quantity: 1
      }
    ],
    partsRequests: [],
    notes: ["Customer asked for cleaning guidance. Engineer demonstrated cleaning cycle."],
    audit: [
      {
        date: "02 Apr 2026 09:10",
        action: "Job created",
        user: "Amanda",
        note: "Routine service created."
      },
      {
        date: "02 Apr 2026 11:42",
        action: "Job completed",
        user: "Neil",
        note: "Report signed and synced."
      }
    ]
  },
  {
    jobRef: "JOB-1062",
    status: "Follow-up Required",
    priority: "Normal",
    jobTypes: ["Breakdown", "Water Filter Change"],
    createdAt: "13 May 2026 14:25",
    reportedBy: "Andrew",
    assignedEngineer: "Clive",
    scheduledDate: "14 May 2026",
    dateAttended: "14 May 2026",
    arrivalTime: "13:10",
    departureTime: "15:05",
    timeOnSite: "1h 55m",
    accountNumber: "C442190",
    siteName: "Copper Kettle Garden Centre",
    contactName: "Martin Cole",
    contactPhone: "01603 000888",
    siteAddress: ["Copper Kettle Garden Centre Café", "Station Road", "Norwich", "NR1 1AA"],
    assignedCoffeeProducts: ["Freshpac Garden Centre Blend 6x1kg"],
    reportedFault: "Machine leaking from right group. Water filter also due for replacement.",
    chargeable: "To review",
    calloutCharge: "Preset callout",
    additionalCharges: "Parts to confirm",
    chargeableReviewNote: "Account owns equipment. Review parts and callout charge before Sage invoice.",
    sageInvoiceNumber: "",
    customerSignatureStatus: "Signed",
    customerPrintedName: "Martin Cole",
    signatureDate: "14 May 2026",
    followUpRequired: "Yes",
    followUpReason: "Right group gasket requires replacement. Part requested.",
    photosCount: 4,
    offlineStatus: "Synced",
    machineSheets: [
      {
        machineDescription: "Traditional espresso machine",
        makeModel: "La Spaziale S5",
        serialNumber: "LS-S5-88210",
        reportedFault: "Leak from right group",
        workCarriedOut: "Inspected group. Temporary fix completed. Gasket replacement required.",
        repairedOnSite: "Partial",
        machineExchanged: "No",
        settings: {
          steamPressureBar: "1.2",
          pumpPressureBar: "9",
          espressoTimeSeconds: "28",
          espressoVolumeFlOz: "2"
        }
      }
    ],
    partsUsed: [],
    partsRequests: [
      {
        requestRef: "PART-2201",
        status: "Submitted",
        machineMakeModel: "La Spaziale S5",
        machineSerialNumber: "LS-S5-88210",
        partNumber: "LS-GRP-GSK",
        partDescription: "Group head gasket",
        quantity: 2,
        notes: "Required for follow-up visit."
      }
    ],
    notes: ["Potentially chargeable. Admin to confirm before invoicing through Sage."],
    audit: [
      {
        date: "13 May 2026 14:25",
        action: "Job created",
        user: "Andrew",
        note: "Breakdown and filter change created."
      },
      {
        date: "14 May 2026 15:07",
        action: "Follow-up required",
        user: "Clive",
        note: "Group gasket needed."
      },
      {
        date: "14 May 2026 15:10",
        action: "Parts request submitted",
        user: "Clive",
        note: "PART-2201 submitted to Sales Portal."
      }
    ]
  },
  {
    jobRef: "OFFLINE-JOB-2026-0001",
    status: "New",
    priority: "Normal",
    jobTypes: ["Service"],
    createdAt: "15 May 2026 12:14",
    reportedBy: "Andrew",
    assignedEngineer: "Unassigned",
    scheduledDate: "",
    dateAttended: "",
    arrivalTime: "",
    departureTime: "",
    timeOnSite: "",
    accountNumber: "A100245",
    siteName: "Aldeburgh Beach Café",
    contactName: "Rachel Morgan",
    contactPhone: "01728 000111",
    siteAddress: ["Aldeburgh Beach Café", "Beach Front", "Aldeburgh", "Suffolk", "IP15 5BD"],
    assignedCoffeeProducts: ["Toscana House Beans 6x1kg"],
    reportedFault: "Offline draft service request created during connection loss.",
    chargeable: "To review",
    calloutCharge: "Pending sync",
    additionalCharges: "Pending sync",
    chargeableReviewNote: "Temporary offline job. Cloud will assign official reference after sync.",
    sageInvoiceNumber: "",
    customerSignatureStatus: "Not signed",
    customerPrintedName: "",
    signatureDate: "",
    followUpRequired: "No",
    followUpReason: "",
    photosCount: 0,
    offlineStatus: "Pending sync",
    machineSheets: [],
    partsUsed: [],
    partsRequests: [],
    notes: ["Offline-safe mode draft. Cannot be treated as final until synced."],
    audit: [
      {
        date: "15 May 2026 12:14",
        action: "Offline job draft created",
        user: "Andrew",
        note: "Pending sync to cloud."
      }
    ]
  }
];

export function getEngineerJobByRef(jobRef: string) {
  return engineerJobs.find((job) => job.jobRef === jobRef);
}

export function getEngineerJobStats() {
  return {
    total: engineerJobs.length,
    newJobs: engineerJobs.filter((job) => job.status === "New").length,
    assigned: engineerJobs.filter((job) => job.status === "Assigned").length,
    followUp: engineerJobs.filter((job) => job.status === "Follow-up Required").length,
    completed: engineerJobs.filter((job) => job.status === "Completed" || job.status === "Completed - Invoiced").length,
    chargeableReview: engineerJobs.filter((job) => job.chargeable === "To review").length,
    pendingSync: engineerJobs.filter((job) => job.offlineStatus === "Pending sync").length,
    partsRequests: engineerJobs.reduce((total, job) => total + job.partsRequests.length, 0)
  };
}