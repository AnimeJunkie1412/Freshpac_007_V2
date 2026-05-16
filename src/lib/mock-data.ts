import { formatCurrency } from "@/lib/utils";

export const salesMetrics = [
  { label: "Orders ready", value: "42", tone: "success", helper: "Submitted or paid submitted" },
  { label: "Awaiting payment", value: "7", tone: "warning", helper: "Prepayment customers" },
  { label: "Call list", value: "118", tone: "neutral", helper: "Due this week" },
  { label: "Sync conflicts", value: "3", tone: "danger", helper: "Needs review" },
  { label: "Trade requests", value: "5", tone: "info", helper: "Waiting contact" },
  { label: "Chargeable jobs", value: "9", tone: "warning", helper: "Invoice check" }
];

export const callListRows = [
  {
    account: "S587984",
    customer: "21 Young Hearts CIC",
    contact: "Amanda Haxell / Sharon",
    phone: "01473 941349",
    lastOrdered: "12/05/26",
    contactDay: "Mon",
    deliveryDay: "Tue",
    van: "Darrell",
    status: "Start"
  },
  {
    account: "S587985",
    customer: "7 Surrey Street Cafe",
    contact: "Kerry / Carol",
    phone: "01603 666604",
    lastOrdered: "14/05/26",
    contactDay: "Tue",
    deliveryDay: "Thu",
    van: "Darrell",
    status: "Start"
  },
  {
    account: "TJ51851",
    customer: "Harbour Inn - Moss and Co",
    contact: "Rachel",
    phone: "01502 576 890",
    lastOrdered: "03/07/25",
    contactDay: "Wed",
    deliveryDay: "Thu",
    van: "Andy",
    status: "On stop"
  },
  {
    account: "S588013",
    customer: "Bishops Cafe & Tea Room",
    contact: "Sarah Quinton",
    phone: "07810 173796",
    lastOrdered: "14/05/26",
    contactDay: "Tue",
    deliveryDay: "Wed",
    van: "Andy",
    status: formatCurrency(163.7)
  }
];

export const customerTabs = [
  "Overview",
  "Contacts",
  "Delivery",
  "Pricing",
  "Assigned Coffee",
  "Equipment",
  "Special Instructions",
  "Breakdown History",
  "Notes",
  "Rental",
  "Orders",
  "Audit"
];

export const productRows = [
  { code: "ARK100067", name: "Arkadia Drinking Chocolate 28% 1kg", group: "Bulk Chocolate", pack: "1 x 1kg", vat: "T0", list: "£6.75" },
  { code: "ARHSETO6X1G", name: "Aragon House Cafe Toscana Beans 6x1kg", group: "Fresh Ground/Beans", pack: "6 x 1kg", vat: "T0", list: "£69.90" },
  { code: "20ZCLIPSLV", name: "4oz Black Ripple Cup Sleeve", group: "Consumables", pack: "50 singles", vat: "T1", list: "£2.07" },
  { code: "ARK100184", name: "Arkadia Espresso Frappe 1kg", group: "Frappe Mixes", pack: "1 x 1kg", vat: "T0", list: "£8.90" }
];

export const engineerJobs = [
  { ref: "JOB-1029", site: "Angel Inn Coffee House", type: "Breakdown", status: "New", priority: "Urgent", engineer: "Unassigned" },
  { ref: "JOB-1030", site: "Bishops Dining Room", type: "Water Filter Change", status: "Assigned", priority: "Normal", engineer: "Clive" },
  { ref: "JOB-1031", site: "Broadlands Residential", type: "Service", status: "Follow-up", priority: "Normal", engineer: "Andy" }
];

export const publicHighlights = [
  "In-house roasted coffee",
  "Tea, chocolate and syrups",
  "Machine packages and engineering",
  "Training and customer support",
  "Trade ordering portal"
];
