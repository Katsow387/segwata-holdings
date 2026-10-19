export const merchantStats = [
  { label: "Open orders", value: "6" },
  { label: "This month spend", value: "R48,200" },
  { label: "Pending deliveries", value: "3" },
  { label: "Saved suppliers", value: "9" },
];

export const merchantOrders = [
  { id: "ORD-2291", supplier: "Tiger Brands", items: 14, total: "R6,420", status: "In transit" },
  { id: "ORD-2287", supplier: "Coca-Cola Beverages SA", items: 22, total: "R9,180", status: "Delivered" },
  { id: "ORD-2280", supplier: "Clover", items: 8, total: "R2,340", status: "Delivered" },
  { id: "ORD-2276", supplier: "Reckitt", items: 5, total: "R1,860", status: "Preparing" },
  { id: "ORD-2270", supplier: "PepsiCo South Africa", items: 30, total: "R11,050", status: "Delivered" },
];

export const supplierStats = [
  { label: "New orders", value: "11" },
  { label: "This month sales", value: "R214,600" },
  { label: "Active merchants", value: "37" },
  { label: "Avg. fulfilment time", value: "6.4 hrs" },
];

export const supplierOrders = [
  { id: "ORD-3312", merchant: "Nomvula's Cash & Carry", items: 18, total: "R7,940", status: "Awaiting acceptance" },
  { id: "ORD-3309", merchant: "Kempton Fresh Market", items: 6, total: "R1,220", status: "Accepted" },
  { id: "ORD-3301", merchant: "Tembisa General Dealer", items: 40, total: "R15,300", status: "Fulfilled" },
  { id: "ORD-3298", merchant: "Corner Stop Spaza", items: 9, total: "R2,410", status: "Fulfilled" },
];

export const driverJobs = [
  { id: "JOB-771", pickup: "Makro Woodmead", dropoff: "Tembisa General Dealer", distance: "18.4 km", payout: "R145", status: "Assigned" },
  { id: "JOB-768", pickup: "Coca-Cola Depot, Isando", dropoff: "Kempton Fresh Market", distance: "9.1 km", payout: "R90", status: "In progress" },
  { id: "JOB-762", pickup: "Builders Warehouse Kempton Park", dropoff: "Corner Stop Spaza", distance: "6.7 km", payout: "R75", status: "Completed" },
];

export const driverStats = [
  { label: "Today's earnings", value: "R310" },
  { label: "Jobs completed", value: "3" },
  { label: "Jobs assigned", value: "2" },
  { label: "Rating", value: "4.8 ★" },
];

export const adminStats = [
  { label: "Active suppliers", value: "24" },
  { label: "Active merchants", value: "112" },
  { label: "Deliveries today", value: "58" },
  { label: "Open disputes", value: "2" },
];

export const adminDeliveries = [
  { id: "DEL-9012", driver: "Sipho M.", route: "Isando → Tembisa", status: "In progress" },
  { id: "DEL-9008", driver: "Thabo N.", route: "Woodmead → Kempton Park", status: "In progress" },
  { id: "DEL-9001", driver: "Karabo L.", route: "Midrand → Tembisa", status: "Completed" },
  { id: "DEL-8994", driver: "Sipho M.", route: "Isando → Kempton Park", status: "Completed" },
];

export const adminDisputes = [
  { id: "DIS-104", parties: "Nomvula's Cash & Carry vs. Tiger Brands", issue: "Short delivery — 3 cases missing", status: "Investigating" },
  { id: "DIS-101", parties: "Corner Stop Spaza vs. Driver JOB-762", issue: "Late delivery, no notice", status: "Awaiting merchant response" },
];
