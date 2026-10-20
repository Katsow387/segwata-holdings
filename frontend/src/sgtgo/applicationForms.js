// One place that defines every application form (driver, merchant, supplier).
// The Apply page and the admin review screen both read from here.

const YEAR = new Date().getFullYear();
export const today = () => new Date().toISOString().slice(0, 10);
export const IMG = "img";
export const empty = (v) => v === undefined || v === null || String(v).trim() === "";

/* ---------- validators ---------- */
const luhnOk = (id) => {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let n = Number(id[12 - i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
};
export const saId = (v) => {
  if (!/^\d{13}$/.test(v)) return "Enter your 13-digit South African ID number.";
  const m = Number(v.slice(2, 4)), d = Number(v.slice(4, 6));
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && luhnOk(v) ? null : "That ID number isn't valid. Check each digit.";
};
export const phone = (v) =>
  /^(\+27|0)[1-9]\d{8}$/.test(String(v).replace(/[\s-]/g, "")) ? null : "Use a South African number, e.g. 082 123 4567.";
const postal = (v) => (/^\d{4}$/.test(v) ? null : "Postal codes have 4 digits.");
const cipc = (v) => (/^\d{4}\/\d{6}\/\d{2}$/.test(v.trim()) ? null : "Use the CIPC format, e.g. 2020/123456/07.");
const vat = (v) => (/^4\d{9}$/.test(v.replace(/\s/g, "")) ? null : "VAT numbers have 10 digits and start with 4.");
const bankNo = (v) => (/^\d{6,16}$/.test(v.replace(/\s/g, "")) ? null : "Account numbers are 6 to 16 digits.");
const branch = (v) => (/^\d{6}$/.test(v) ? null : "Branch codes have 6 digits.");
const notExpired = (what) => (v) => (v > today() ? null : `Your ${what} must not be expired.`);

const YESNO = [["no", "No"], ["yes", "Yes"]];
const BANKS = ["ABSA", "African Bank", "Capitec", "Discovery Bank", "FNB", "Nedbank", "Standard Bank", "TymeBank", "Other"];

const address = (prefix = "") => [
  { name: `${prefix}address_street`, label: "Street address" },
  { name: `${prefix}address_suburb`, label: "Suburb", optional: true },
  { name: `${prefix}address_city`, label: "City / town" },
  { name: `${prefix}address_postal`, label: "Postal code", validate: postal },
];

const bank = (holderRule) => [
  { name: "bank_name", label: "Bank", type: "select", options: BANKS },
  { name: "bank_account_type", label: "Account type", type: "select", options: ["Cheque / current", "Savings"] },
  { name: "bank_account_holder", label: "Account holder name", validate: holderRule },
  { name: "bank_account_number", label: "Account number", validate: bankNo },
  { name: "bank_branch_code", label: "Branch code", validate: branch },
];

const consent = (who) => [
  { name: "consent_popia", type: "checkbox", label: `I consent to Segwata Holdings collecting and processing my personal information under POPIA, for this application and for managing my work on SGT GO.` },
  { name: "declaration_true", type: "checkbox", label: `I declare that every detail and document I submitted is true and genuine. I understand false information means rejection and may be reported to the authorities.` },
  ...(who === "driver" ? [{ name: "consent_background", type: "checkbox", label: "I consent to ID, driver's licence, criminal record and reference checks being done on me." }] : []),
];

/* ================= DRIVER ================= */
const driver = {
  role: "driver",
  title: "Driver application",
  lead: "Every section and document is required. Your progress saves each time you press Continue, so you can log out and come back. Your dashboard opens once we approve you.",
  prefill: (u) => ({ full_name: u.full_name, phone: u.phone }),
  steps: [
    {
      title: "Personal details",
      fields: [
        { name: "full_name", label: "Full name (as on your ID)", autoComplete: "name" },
        { name: "nationality", label: "Nationality", type: "select", options: [["citizen", "South African citizen"], ["foreign", "Foreign national"]] },
        { name: "id_number", label: "ID number (or passport number)", validate: (v, d) => (d.nationality === "foreign" ? (v.trim().length >= 6 ? null : "Enter your passport number.") : saId(v)) },
        { name: "phone", label: "Cell phone number", type: "tel", validate: phone },
        ...address(),
        { name: "emergency_name", label: "Emergency contact name" },
        { name: "emergency_relationship", label: "Relationship to you" },
        { name: "emergency_phone", label: "Emergency contact number", type: "tel", validate: (v, d) => phone(v) || (v.replace(/\D/g, "").slice(-9) === String(d.phone || "").replace(/\D/g, "").slice(-9) ? "Use someone else's number." : null) },
      ],
    },
    {
      title: "Licence & permits",
      fields: [
        { name: "licence_code", label: "Driver's licence code", type: "select", options: ["B", "EB", "C1", "C", "EC1", "EC"] },
        { name: "licence_number", label: "Licence number" },
        { name: "licence_expiry", label: "Licence expiry date", type: "date", validate: notExpired("licence") },
        { name: "years_experience", label: "Years of driving experience", type: "number", validate: (v) => (Number(v) >= 2 && Number(v) <= 60 ? null : "We require at least 2 years of driving experience.") },
        { name: "has_prdp", label: "Do you hold a PrDP (professional driving permit)?", type: "select", options: YESNO },
        { name: "prdp_number", label: "PrDP number", when: (d) => d.has_prdp === "yes" },
        { name: "prdp_expiry", label: "PrDP expiry date", type: "date", when: (d) => d.has_prdp === "yes", validate: notExpired("PrDP") },
      ],
    },
    {
      title: "Your vehicle",
      fields: [
        { name: "vehicle_type", label: "Vehicle type", type: "select", options: ["Small delivery (0.5 ton)", "Standard load (1.3 ton)", "1.5 to 3.5 ton", "Over 3.5 ton"] },
        { name: "vehicle_ownership", label: "Who owns the vehicle?", type: "select", options: [["own", "I own it"], ["family", "A family member"], ["employer", "My employer"], ["rented", "I rent it"]] },
        { name: "owner_name", label: "Owner's full name", when: (d) => d.vehicle_ownership && d.vehicle_ownership !== "own" },
        { name: "vehicle_make", label: "Make (e.g. Toyota)" },
        { name: "vehicle_model", label: "Model (e.g. Hilux)" },
        { name: "vehicle_year", label: "Year", type: "number", validate: (v) => (Number(v) >= YEAR - 20 && Number(v) <= YEAR + 1 ? null : `Vehicles must be ${YEAR - 20} or newer.`) },
        { name: "vehicle_colour", label: "Colour" },
        { name: "vehicle_reg", label: "Registration number (number plate)", validate: (v) => (/^[A-Za-z0-9 ]{4,12}$/.test(v) ? null : "Enter the number plate, e.g. CA 123 456.") },
      ],
    },
    { title: "Documents", docs: true },
    {
      title: "Banking & declarations",
      fields: [
        ...bank((v, d) => (v.trim().toLowerCase() === String(d.full_name || "").trim().toLowerCase() ? null : "The account must be in your own name, same as your ID.")),
        { name: "criminal_record", label: "Do you have any criminal record or pending charges?", type: "select", options: YESNO },
        { name: "criminal_details", label: "Please explain", type: "textarea", when: (d) => d.criminal_record === "yes" },
        ...consent("driver"),
      ],
    },
    { title: "Review & submit", review: true },
  ],
  docs: [
    { key: "id_document", label: "ID document or passport", hint: "Clear copy of your ID (front and back) or the passport photo page." },
    { key: "work_permit", label: "Valid work permit or visa", when: (d) => d.nationality === "foreign" },
    { key: "licence_front", label: "Driver's licence, front", type: IMG, hint: "A photo, not a scan of a copy." },
    { key: "licence_back", label: "Driver's licence, back", type: IMG },
    { key: "prdp", label: "PrDP card", when: (d) => d.has_prdp === "yes" },
    { key: "selfie", label: "Selfie holding your ID", type: IMG, hint: "Your face and the ID must both be clearly visible." },
    { key: "proof_of_address", label: "Proof of residence", hint: "Utility bill or bank statement, not older than 3 months." },
    { key: "vehicle_registration", label: "Vehicle registration papers and licence disc" },
    { key: "vehicle_photo_front", label: "Vehicle photo, front", type: IMG, hint: "Number plate must be readable." },
    { key: "vehicle_photo_side", label: "Vehicle photo, side", type: IMG, hint: "Show the whole load area." },
    { key: "police_clearance", label: "Police clearance certificate (SAPS)", hint: "Issued in the last 6 months." },
    { key: "bank_letter", label: "Bank confirmation letter", hint: "Must show your name, account number and branch code." },
    { key: "insurance", label: "Goods-in-transit or vehicle insurance", optional: true },
  ],
};

/* ================= MERCHANT ================= */
const merchant = {
  role: "merchant",
  title: "Merchant application",
  lead: "Tell us about your shop so we can verify and activate your account. Your progress saves each time you press Continue, so you can log out and come back. Your dashboard opens once we approve you.",
  prefill: (u) => ({ owner_name: u.full_name, phone: u.phone }),
  steps: [
    {
      title: "Business details",
      fields: [
        { name: "business_name", label: "Business / shop name" },
        { name: "business_type", label: "Type of business", type: "select", options: ["Spaza shop", "Tuck shop", "Cash & carry", "Retail store", "Restaurant / takeaway", "Other"] },
        { name: "years_trading", label: "Years trading", type: "number", validate: (v) => (Number(v) >= 0 && Number(v) <= 80 ? null : "Enter a number of years, 0 if you're just starting.") },
        { name: "is_registered", label: "Is the business registered with CIPC?", type: "select", options: YESNO },
        { name: "registration_number", label: "CIPC registration number", when: (d) => d.is_registered === "yes", validate: cipc },
        { name: "vat_registered", label: "Are you VAT registered?", type: "select", options: YESNO },
        { name: "vat_number", label: "VAT number", when: (d) => d.vat_registered === "yes", validate: vat },
      ],
    },
    {
      title: "Owner & contact",
      fields: [
        { name: "owner_name", label: "Owner's full name (as on ID)", autoComplete: "name" },
        { name: "id_number", label: "Owner's ID number", validate: saId },
        { name: "phone", label: "Cell phone number", type: "tel", validate: phone },
        { name: "alt_phone", label: "Alternative number", type: "tel", optional: true, validate: phone },
      ],
    },
    {
      title: "Store location",
      fields: [
        ...address(),
        { name: "delivery_area", label: "Delivery area", type: "select", options: ["Tembisa", "Kempton Park", "Other Gauteng area"] },
        { name: "delivery_notes", label: "Delivery instructions (gate, landmarks…)", type: "textarea", optional: true },
      ],
    },
    {
      title: "Ordering needs",
      fields: [
        { name: "monthly_spend", label: "Roughly how much stock do you buy a month?", type: "select", options: ["Under R10,000", "R10,000 to R30,000", "R30,000 to R100,000", "Over R100,000"] },
        { name: "order_frequency", label: "How often do you restock?", type: "select", options: ["Daily", "A few times a week", "Weekly", "Every two weeks", "Monthly"] },
        { name: "product_categories", label: "What do you mostly buy?", type: "textarea", validate: (v) => (v.trim().length >= 5 ? null : "Give a few examples, e.g. maize meal, cooldrinks, airtime.") },
      ],
    },
    { title: "Documents", docs: true },
    {
      title: "Declarations",
      fields: [
        ...consent("merchant"),
        { name: "consent_terms", type: "checkbox", label: "I agree to the SGT GO merchant terms, including paying for orders on the agreed terms." },
      ],
    },
    { title: "Review & submit", review: true },
  ],
  docs: [
    { key: "id_document", label: "Owner's ID document", hint: "Clear copy of the ID (front and back)." },
    { key: "proof_of_address", label: "Proof of business address", hint: "Utility bill, lease or municipal account, not older than 3 months." },
    { key: "shop_photo", label: "Photo of the shop front", type: IMG, hint: "Show the shop name or signage if you have it." },
    { key: "business_registration", label: "CIPC registration certificate", when: (d) => d.is_registered === "yes" },
    { key: "business_licence", label: "Municipal business licence / spaza shop registration", optional: true, hint: "Upload it if you have one. It speeds up approval." },
    { key: "vat_certificate", label: "VAT registration certificate", when: (d) => d.vat_registered === "yes" },
  ],
};

/* ================= SUPPLIER ================= */
const supplier = {
  role: "supplier",
  title: "Supplier application",
  lead: "Tell us about your company and products so we can verify and activate your account. Your progress saves each time you press Continue, so you can log out and come back. Your dashboard opens once we approve you.",
  prefill: (u) => ({ contact_name: u.full_name, phone: u.phone }),
  steps: [
    {
      title: "Company details",
      fields: [
        { name: "company_name", label: "Registered company name" },
        { name: "trading_name", label: "Trading name", optional: true },
        { name: "company_type", label: "Type of supplier", type: "select", options: ["Manufacturer", "Wholesaler", "Distributor", "Importer", "Other"] },
        { name: "registration_number", label: "CIPC registration number", validate: cipc },
        { name: "years_in_business", label: "Years in business", type: "number", validate: (v) => (Number(v) >= 0 && Number(v) <= 100 ? null : "Enter a number of years.") },
        { name: "vat_registered", label: "Are you VAT registered?", type: "select", options: YESNO },
        { name: "vat_number", label: "VAT number", when: (d) => d.vat_registered === "yes", validate: vat },
      ],
    },
    {
      title: "Contact person",
      fields: [
        { name: "contact_name", label: "Contact person's full name", autoComplete: "name" },
        { name: "contact_title", label: "Job title" },
        { name: "id_number", label: "Contact person's ID number", validate: saId },
        { name: "phone", label: "Cell phone number", type: "tel", validate: phone },
        { name: "office_phone", label: "Office number", type: "tel", optional: true, validate: phone },
      ],
    },
    {
      title: "Address & coverage",
      fields: [
        ...address(),
        { name: "areas_served", label: "Areas you can supply", type: "textarea", validate: (v) => (v.trim().length >= 3 ? null : "List the areas, e.g. Tembisa, Kempton Park, all Gauteng.") },
        { name: "own_delivery", label: "Can you deliver orders yourself?", type: "select", options: YESNO },
      ],
    },
    {
      title: "Products & terms",
      fields: [
        { name: "product_categories", label: "Product categories you supply", type: "textarea", validate: (v) => (v.trim().length >= 5 ? null : "List your main categories, e.g. groceries, toiletries, beverages.") },
        { name: "main_brands", label: "Main brands", optional: true },
        { name: "min_order", label: "Minimum order value (R)", type: "number", optional: true },
        { name: "payment_terms", label: "Payment terms you offer", type: "select", options: ["Cash on delivery", "7 days", "14 days", "30 days"] },
      ],
    },
    {
      title: "Banking",
      fields: bank(() => null),
    },
    { title: "Documents", docs: true },
    { title: "Declarations", fields: [...consent("supplier"), { name: "consent_terms", type: "checkbox", label: "I agree to the SGT GO supplier terms, including fulfilling accepted orders at the listed prices." }] },
    { title: "Review & submit", review: true },
  ],
  docs: [
    { key: "company_registration", label: "CIPC company registration documents" },
    { key: "id_document", label: "Contact person's ID document", hint: "Clear copy of the ID (front and back)." },
    { key: "proof_of_address", label: "Proof of business address", hint: "Utility bill or lease, not older than 3 months." },
    { key: "bank_letter", label: "Bank confirmation letter", hint: "Must show the company name, account number and branch code." },
    { key: "vat_certificate", label: "VAT registration certificate", when: (d) => d.vat_registered === "yes" },
    { key: "tax_compliance", label: "SARS tax compliance status (PIN or letter)", optional: true },
    { key: "product_list", label: "Product and price list", optional: true },
    { key: "insurance", label: "Public liability or goods insurance", optional: true },
  ],
};

export const FORMS = { driver, merchant, supplier };
export const docsFor = (form, d) => form.docs.filter((x) => !x.when || x.when(d));
export const fieldsFor = (step, d) => (step.fields || []).filter((f) => !f.when || f.when(d));
export const roleLabel = { driver: "Driver", merchant: "Merchant", supplier: "Supplier" };

export function validateStep(form, step, d) {
  const errors = {};
  if (step.docs) {
    docsFor(form, d).forEach((x) => { if (!x.optional && !d.documents?.[x.key]) errors[`doc:${x.key}`] = "Upload this document."; });
    return errors;
  }
  fieldsFor(step, d).forEach((f) => {
    const v = d[f.name];
    if (f.type === "checkbox") { if (v !== true) errors[f.name] = "You must agree to continue."; return; }
    if (empty(v)) { if (!f.optional) errors[f.name] = "Required."; return; }
    const msg = f.validate?.(String(v), d);
    if (msg) errors[f.name] = msg;
  });
  return errors;
}
