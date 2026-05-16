export const offlineAllowedActions = [
  "View cached customer files",
  "View cached products and pricing with staff permissions",
  "Create pending customer orders",
  "Record call list outcomes",
  "Create pending engineer jobs",
  "Complete assigned engineer job sheets",
  "Create pending parts requests",
  "Generate draft PDFs from cached data",
  "Create local audit queue entries"
];

export const offlineBlockedActions = [
  "Permanent deletion",
  "Weekly rollover",
  "Final order processing",
  "Staff account creation or deletion",
  "Customer account creation",
  "Product code or VAT changes",
  "Customer-specific price changes",
  "Standing order approval",
  "Retail rollover approval",
  "Processed order edits"
];
