# setup-sgtgo.ps1 - run from project root: .\setup-sgtgo.ps1
$ErrorActionPreference = "Stop"
$COMPONENTS = "src\sgtgo"
$DATA       = "src\data"
$utf8 = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path "$COMPONENTS\sgtgo.css")) {
  Write-Host "ERROR: $COMPONENTS\sgtgo.css not found." -ForegroundColor Red; exit 1
}
New-Item -ItemType Directory -Force -Path $DATA | Out-Null

# ---------- applicationConfig.js ----------
$content = @'
const SA_ID = /^\d{13}$/;

export const applicationConfig = {
  merchant: {
    label: "Merchant",
    intro: "Tell us about your shop so we can verify you and start processing orders.",
    dashboardPath: "/sgt-go/merchant",
    sections: [
      {
        key: "identity", title: "Owner identity",
        blurb: "The person legally responsible for the business. Must match the ID document you upload.",
        fields: [
          { name: "ownerFullName", label: "Owner full legal name", type: "text", required: true },
          { name: "ownerIdNumber", label: "SA ID number", type: "text", required: true, help: "13 digits, no spaces" },
          { name: "ownerDateOfBirth", label: "Date of birth", type: "date", required: true },
          { name: "ownerMobile", label: "Owner mobile number", type: "tel", required: true },
        ],
        docs: [
          { name: "ownerIdDoc", label: "ID document / card", required: true, help: "Both sides. Clear photo, no flash glare." },
          { name: "ownerSelfie", label: "Selfie holding your ID", required: true },
        ],
      },
      {
        key: "business", title: "Business details",
        blurb: "Spaza shops and informal traders don't need a CIPC number - leave it blank if you don't have one.",
        fields: [
          { name: "tradingName", label: "Trading name", type: "text", required: true, help: "The name on your shopfront", half: true },
          { name: "registeredName", label: "Registered name (if any)", type: "text", half: true },
          { name: "businessType", label: "Business type", type: "select", required: true, half: true, options: ["Spaza shop", "Cash & carry", "General dealer", "Tuckshop", "Supermarket", "Other"] },
          { name: "yearsTrading", label: "Years trading", type: "number", half: true },
          { name: "cipcNumber", label: "CIPC registration number", type: "text", half: true, help: "Optional" },
          { name: "vatNumber", label: "VAT number", type: "text", half: true, help: "Optional" },
        ],
      },
      {
        key: "premises", title: "Trading premises",
        blurb: "Your driver needs to find you. The GPS pin and landmark matter more than the street address.",
        fields: [
          { name: "storeAddress", label: "Street address", type: "text", required: true },
          { name: "suburb", label: "Suburb / township", type: "text", required: true, half: true },
          { name: "city", label: "City", type: "text", required: true, half: true },
          { name: "postalCode", label: "Postal code", type: "text", half: true },
          { name: "gpsPin", label: "GPS pin", type: "gps", required: true, half: true },
          { name: "landmark", label: "Nearest landmark / directions", type: "textarea", required: true, help: "e.g. Corner of Andrew Mapheto Drive, opposite the Engen garage, green gate" },
        ],
        docs: [
          { name: "storefrontPhoto", label: "Photo of your shopfront", required: true, help: "Must show the shop name or signage." },
          { name: "proofOfAddress", label: "Proof of trading address", required: true, help: "Municipal bill, lease, or a sworn affidavit." },
          { name: "tradingPermit", label: "Trading permit / licence", required: false },
        ],
      },
      {
        key: "contacts", title: "Contacts & trading preferences",
        fields: [
          { name: "storePhone", label: "Store phone / WhatsApp", type: "tel", required: true, half: true },
          { name: "receivingContactName", label: "Who receives deliveries", type: "text", required: true, half: true },
          { name: "receivingContactPhone", label: "Their mobile number", type: "tel", required: true, half: true },
          { name: "operatingHours", label: "Operating hours", type: "text", required: true, half: true, placeholder: "e.g. Mon-Sat 07:00-19:00" },
          { name: "deliveryDays", label: "Preferred delivery days", type: "checkboxes", required: true, options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
          { name: "productCategories", label: "What do you buy?", type: "checkboxes", required: true, options: ["Beverages", "Grains & maize", "Snacks", "Confectionery", "Household", "Personal care", "Dairy", "Bakery", "Other"] },
          { name: "monthlySpend", label: "Estimated monthly stock spend", type: "select", required: true, half: true, options: ["Under R5 000", "R5 000 - R15 000", "R15 000 - R50 000", "R50 000 - R150 000", "Over R150 000"] },
        ],
      },
      {
        key: "payout", title: "Refund account",
        blurb: "Used if you cancel a paid order before delivery. Must be in the owner's or business's name.",
        fields: [
          { name: "accountHolder", label: "Account holder name", type: "text", required: true },
          { name: "bankName", label: "Bank", type: "select", required: true, options: ["FNB", "Standard Bank", "ABSA", "Nedbank", "Capitec", "TymeBank", "African Bank", "Other"] },
          { name: "accountNumber", label: "Account number", type: "text", required: true, half: true },
          { name: "branchCode", label: "Branch code", type: "text", required: true, half: true },
          { name: "accountType", label: "Account type", type: "select", required: true, half: true, options: ["Cheque / Current", "Savings", "Transmission"] },
        ],
        docs: [ { name: "bankConfirmation", label: "Bank confirmation letter", required: true, help: "Stamped by the bank, or a bank statement header." } ],
      },
    ],
  },

  supplier: {
    label: "Supplier",
    intro: "Register your company so merchants across Gauteng can order from you.",
    dashboardPath: "/sgt-go/supplier",
    sections: [
      {
        key: "company", title: "Company registration",
        blurb: "Suppliers are formal businesses, so CIPC and SARS details are mandatory here.",
        fields: [
          { name: "registeredName", label: "Registered company name", type: "text", required: true },
          { name: "tradingName", label: "Trading name", type: "text", required: true, half: true },
          { name: "cipcNumber", label: "CIPC registration number", type: "text", required: true, half: true, placeholder: "e.g. 1998/012345/07" },
          { name: "vatNumber", label: "VAT number", type: "text", required: true, half: true },
          { name: "taxPin", label: "SARS Tax Compliance PIN", type: "text", required: true, half: true },
          { name: "bbbeeLevel", label: "B-BBEE level", type: "select", required: true, half: true, options: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8", "Non-compliant", "Exempt"] },
          { name: "yearsOperating", label: "Years operating", type: "number", half: true },
        ],
        docs: [
          { name: "cipcCertificate", label: "CIPC registration certificate", required: true },
          { name: "vatCertificate", label: "VAT registration certificate", required: true },
          { name: "taxPinLetter", label: "SARS Tax Compliance Status letter", required: true, help: "Issued within the last 12 months." },
          { name: "directorId", label: "Director ID document", required: true },
        ],
      },
      {
        key: "contacts", title: "Key contacts",
        fields: [
          { name: "kamName", label: "Key account manager", type: "text", required: true, half: true },
          { name: "kamEmail", label: "Their email", type: "email", required: true, half: true },
          { name: "kamMobile", label: "Their mobile", type: "tel", required: true, half: true },
          { name: "dispatchContact", label: "Dispatch contact person", type: "text", required: true, half: true },
          { name: "dispatchPhone", label: "Dispatch phone", type: "tel", required: true, half: true },
          { name: "financeEmail", label: "Accounts / finance email", type: "email", required: true, half: true },
        ],
      },
      {
        key: "dispatch", title: "Dispatch & coverage",
        fields: [
          { name: "warehouses", label: "Warehouse / dispatch addresses", type: "textarea", required: true, help: "One per line. Add the suburb." },
          { name: "dispatchGps", label: "Primary dispatch GPS pin", type: "gps", required: true },
          { name: "orderCutoffTime", label: "Daily order cut-off time", type: "time", required: true, half: true },
          { name: "leadTimeDays", label: "Lead time (days)", type: "number", required: true, half: true },
          { name: "minimumOrderValue", label: "Minimum order value (R)", type: "number", required: true, half: true },
          { name: "fleetType", label: "Who delivers?", type: "select", required: true, half: true, options: ["Own fleet", "SGT GO drivers", "Both"] },
          { name: "deliveryZones", label: "Delivery zones covered", type: "textarea", required: true, help: "e.g. Tembisa, Kempton Park, Ivory Park, Midrand" },
        ],
      },
      {
        key: "commercial", title: "Commercial terms",
        fields: [
          { name: "productCategories", label: "Product categories supplied", type: "checkboxes", required: true, options: ["Beverages", "Grains & maize", "Snacks", "Confectionery", "Household", "Personal care", "Dairy", "Bakery", "Frozen", "Other"] },
          { name: "brandsRepresented", label: "Brands represented", type: "textarea", help: "e.g. Tiger Brands, Coca-Cola, Clover" },
          { name: "paymentTerms", label: "Payment terms offered", type: "select", required: true, half: true, options: ["COD", "7 days", "14 days", "30 days", "Negotiable"] },
          { name: "priceListUpload", label: "Price list (CSV)", type: "file", half: true, help: "Optional - you can upload this later." },
        ],
      },
      {
        key: "payout", title: "Payout account",
        fields: [
          { name: "accountHolder", label: "Account holder (must be the company)", type: "text", required: true },
          { name: "bankName", label: "Bank", type: "select", required: true, options: ["FNB", "Standard Bank", "ABSA", "Nedbank", "Capitec", "Investec", "Other"] },
          { name: "accountNumber", label: "Account number", type: "text", required: true, half: true },
          { name: "branchCode", label: "Branch code", type: "text", required: true, half: true },
          { name: "accountType", label: "Account type", type: "select", required: true, half: true, options: ["Cheque / Current", "Savings", "Transmission"] },
        ],
        docs: [
          { name: "bankConfirmation", label: "Bank confirmation letter", required: true },
          { name: "proofOfBusinessAddress", label: "Proof of business address", required: true },
          { name: "foodSafetyCert", label: "Food safety certificate (FSSC 22000 / HACCP)", required: false },
          { name: "goodsInTransit", label: "Goods-in-transit insurance", required: false },
        ],
      },
    ],
  },

  driver: {
    label: "Driver",
    intro: "We verify every driver before their first job. Have your ID, licence and PrDP ready.",
    dashboardPath: "/sgt-go/driver",
    sections: [
      {
        key: "type", title: "How will you drive?",
        fields: [
          { name: "driverType", label: "Driver type", type: "select", required: true, options: ["Employee driver (use an SGT GO vehicle)", "Owner-operator (use my own vehicle)"], help: "Owner-operators must also submit vehicle documents further down." },
        ],
      },
      {
        key: "personal", title: "Personal details",
        fields: [
          { name: "fullName", label: "Full legal name", type: "text", required: true, half: true },
          { name: "idNumber", label: "SA ID number", type: "text", required: true, half: true },
          { name: "dateOfBirth", label: "Date of birth", type: "date", required: true, half: true },
          { name: "mobile", label: "Mobile / WhatsApp number", type: "tel", required: true, half: true },
          { name: "residentialAddress", label: "Residential address", type: "text", required: true },
          { name: "emergencyContactName", label: "Emergency contact name", type: "text", required: true, half: true },
          { name: "emergencyContactRelation", label: "Relationship", type: "text", required: true, half: true },
          { name: "emergencyContactPhone", label: "Emergency contact phone", type: "tel", required: true, half: true },
        ],
        docs: [
          { name: "idDoc", label: "ID document / card", required: true },
          { name: "profilePhoto", label: "Profile photo", required: true, help: "Plain background, face clearly visible." },
          { name: "proofOfAddress", label: "Proof of residential address", required: true },
        ],
      },
      {
        key: "licence", title: "Driving licence & PrDP",
        blurb: "Your PrDP expiry date is tracked automatically - the account suspends on the day it lapses.",
        fields: [
          { name: "licenceNumber", label: "Licence number", type: "text", required: true, half: true },
          { name: "licenceCode", label: "Licence code", type: "select", required: true, half: true, options: ["B", "C1", "C", "EB", "EC"] },
          { name: "licenceIssueDate", label: "Issue date", type: "date", required: true, half: true },
          { name: "licenceExpiryDate", label: "Expiry date", type: "date", required: true, half: true },
          { name: "pdpNumber", label: "PrDP number", type: "text", required: true, half: true },
          { name: "pdpCategory", label: "PrDP category", type: "select", required: true, half: true, options: ["Goods", "Passengers", "Both"] },
          { name: "pdpExpiryDate", label: "PrDP expiry date", type: "date", required: true, half: true },
          { name: "yearsExperience", label: "Years of driving experience", type: "number", required: true, half: true },
        ],
        docs: [
          { name: "licenceFront", label: "Licence - front", required: true },
          { name: "licenceBack", label: "Licence - back", required: true },
          { name: "pdpDoc", label: "PrDP certificate", required: true },
          { name: "policeClearance", label: "Police clearance certificate", required: true, help: "Takes 4-8 weeks in SA. You can be approved provisionally while this is pending." },
        ],
      },
      {
        key: "vehicle", title: "Vehicle details",
        showIf: (d) => String(d.driverType || "").startsWith("Owner-operator"),
        fields: [
          { name: "vehicleMake", label: "Make", type: "text", required: true, half: true },
          { name: "vehicleModel", label: "Model", type: "text", required: true, half: true },
          { name: "vehicleYear", label: "Year", type: "number", required: true, half: true },
          { name: "vehicleRegistration", label: "Registration number", type: "text", required: true, half: true },
          { name: "vehicleVin", label: "VIN", type: "text", required: true, half: true },
          { name: "vehicleType", label: "Vehicle type", type: "select", required: true, half: true, options: ["Bakkie", "Panel van", "4-ton truck", "8-ton truck", "Motorcycle", "Other"] },
          { name: "loadCapacityKg", label: "Load capacity (kg)", type: "number", required: true, half: true },
          { name: "loadVolumeM3", label: "Load volume (m3)", type: "number", required: true, half: true },
          { name: "licenceDiskExpiry", label: "Licence disk expiry", type: "date", required: true, half: true },
          { name: "trackingFitted", label: "Vehicle has a tracking device fitted", type: "consent", required: true, half: true },
        ],
        docs: [
          { name: "vehicleRegCert", label: "Vehicle registration certificate", required: true },
          { name: "licenceDisk", label: "Current licence disk", required: true },
          { name: "roadworthy", label: "Roadworthy certificate", required: true },
          { name: "vehicleInsurance", label: "Insurance certificate", required: true },
          { name: "vehiclePhoto", label: "Photo of the vehicle", required: true },
        ],
      },
      {
        key: "work", title: "Work preferences",
        fields: [
          { name: "homeBase", label: "Home base / suburb", type: "text", required: true, half: true },
          { name: "availabilityShifts", label: "Preferred shift", type: "select", required: true, half: true, options: ["Morning", "Afternoon", "Full day", "Flexible"] },
          { name: "serviceAreas", label: "Areas you can serve", type: "textarea", required: true, help: "e.g. Tembisa, Kempton Park, Ivory Park" },
          { name: "availabilityDays", label: "Days available", type: "checkboxes", required: true, options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
          { name: "nightShiftWilling", label: "Willing to take night shifts", type: "consent", half: true },
        ],
      },
      {
        key: "payout", title: "Payout & agreement",
        fields: [
          { name: "accountHolder", label: "Account holder name", type: "text", required: true },
          { name: "bankName", label: "Bank", type: "select", required: true, options: ["FNB", "Standard Bank", "ABSA", "Nedbank", "Capitec", "TymeBank", "African Bank", "Other"] },
          { name: "accountNumber", label: "Account number", type: "text", required: true, half: true },
          { name: "branchCode", label: "Branch code", type: "text", required: true, half: true },
          { name: "accountType", label: "Account type", type: "select", required: true, half: true, options: ["Cheque / Current", "Savings", "Transmission"] },
          { name: "contractorAgreement", label: "I accept the independent contractor agreement and POPIA consent", type: "consent", required: true },
        ],
        docs: [ { name: "bankConfirmation", label: "Bank confirmation letter", required: true } ],
      },
    ],
  },
};

export const roleLabel = (role) => applicationConfig[role]?.label ?? role;

export function validateSection(section, data) {
  const errs = {};
  (section.fields || []).forEach((f) => {
    const v = data[f.name];
    const empty = f.type === "checkboxes" ? !(Array.isArray(v) && v.length)
                : f.type === "consent" ? !v
                : !String(v ?? "").trim();
    if (f.required && empty) { errs[f.name] = "This is required"; return; }
    if (empty) return;
    if (f.type === "email" && !/^\S+@\S+\.\S+$/.test(v)) errs[f.name] = "Enter a valid email address";
    if (f.type === "tel" && !/^[0-9+\s()-]{9,}$/.test(v)) errs[f.name] = "Enter a valid phone number";
    if (f.name === "idNumber" || f.name === "ownerIdNumber") {
      if (!SA_ID.test(String(v).replace(/\s/g, ""))) errs[f.name] = "SA ID must be exactly 13 digits";
    }
  });
  (section.docs || []).forEach((d) => {
    if (d.required && !data[d.name]) errs[d.name] = "Please attach this document";
  });
  return errs;
}
'@
[System.IO.File]::WriteAllText("$PWD\$DATA\applicationConfig.js", $content, $utf8)
Write-Host "OK applicationConfig.js"

# ---------- verificationStore.js ----------
$content = @'
import { useEffect, useState } from "react";

const KEY = "sgtgo.verification.v1";
const EVENT = "sgtgo:verification";

export const STATUS = {
  NONE: "none", DRAFT: "draft", PENDING: "pending_review",
  MORE_INFO: "more_info_required", APPROVED: "approved",
  PROVISIONAL: "provisional", REJECTED: "rejected", SUSPENDED: "suspended",
};

export const STATUS_LABEL = {
  [STATUS.NONE]: "Not started", [STATUS.DRAFT]: "Draft",
  [STATUS.PENDING]: "Pending review", [STATUS.MORE_INFO]: "More info required",
  [STATUS.APPROVED]: "Approved", [STATUS.PROVISIONAL]: "Provisionally approved",
  [STATUS.REJECTED]: "Not approved", [STATUS.SUSPENDED]: "Suspended",
};

export const REASON_CODES = [
  "Blurry or unreadable document", "Name mismatch across documents",
  "Expired document", "Address could not be verified",
  "Duplicate account detected", "Suspected fraud", "Other",
];

function readAll() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export const getRecord = (role) => readAll()[role] || null;
export const getAllRecords = () => Object.keys(readAll()).map((r) => readAll()[r]);

export function saveDraft(role, data) {
  const all = readAll();
  const existing = all[role] || {};
  all[role] = { ...existing, role,
    status: existing.status && existing.status !== STATUS.NONE ? existing.status : STATUS.DRAFT,
    data, draftSavedAt: new Date().toISOString() };
  writeAll(all); return all[role];
}

export function submitApplication(role, data) {
  const all = readAll();
  all[role] = { ...(all[role] || {}), role, status: STATUS.PENDING, data,
    submittedAt: new Date().toISOString(),
    reviewedAt: null, reviewedBy: null, reasonCode: "", reviewNote: "" };
  writeAll(all); return all[role];
}

export function reviewApplication(role, { status, reviewedBy = "Admin", reasonCode = "", reviewNote = "" }) {
  const all = readAll();
  if (!all[role]) return null;
  all[role] = { ...all[role], status, reviewedBy, reviewedAt: new Date().toISOString(), reasonCode, reviewNote };
  writeAll(all); return all[role];
}

export function clearRecord(role) {
  const all = readAll(); delete all[role]; writeAll(all);
}

export function useVerification(role) {
  const [record, setRecord] = useState(() => getRecord(role));
  useEffect(() => {
    const sync = () => setRecord(getRecord(role));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [role]);
  return record;
}

export function useAllApplications() {
  const [records, setRecords] = useState(() => getAllRecords());
  useEffect(() => {
    const sync = () => setRecords(getAllRecords());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return records;
}
'@
[System.IO.File]::WriteAllText("$PWD\$DATA\verificationStore.js", $content, $utf8)
Write-Host "OK verificationStore.js"

# ---------- Signup.jsx patch ----------
$signupPath = "$PWD\$COMPONENTS\Signup.jsx"
$text = [System.IO.File]::ReadAllText($signupPath)
$text = $text.Replace('dashboardPath: "/sgt-go/merchant"', 'dashboardPath: "/sgt-go/merchant/apply"')
$text = $text.Replace('dashboardPath: "/sgt-go/supplier"', 'dashboardPath: "/sgt-go/supplier/apply"')
$text = $text.Replace('dashboardPath: "/sgt-go/driver"',   'dashboardPath: "/sgt-go/driver/apply"')
[System.IO.File]::WriteAllText($signupPath, $text, $utf8)
Write-Host "OK Signup.jsx patched"

# ---------- RequireApproved.jsx ----------
$content = @'
import { Navigate } from "react-router-dom";
import { STATUS, useVerification } from "../data/verificationStore";

export default function RequireApproved({ role, children }) {
  const record = useVerification(role);
  const status = record?.status ?? STATUS.NONE;
  if (status === STATUS.APPROVED || status === STATUS.PROVISIONAL) return children;
  if (status === STATUS.NONE || status === STATUS.DRAFT) {
    return <Navigate to={`/sgt-go/${role}/apply`} replace />;
  }
  return <Navigate to={`/sgt-go/${role}/pending`} replace />;
}
'@
[System.IO.File]::WriteAllText("$PWD\$COMPONENTS\RequireApproved.jsx", $content, $utf8)
Write-Host "OK RequireApproved.jsx"

# ---------- PendingApproval.jsx ----------
$content = @'
import { useParams, Link, Navigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import { applicationConfig } from "../data/applicationConfig";
import { STATUS, STATUS_LABEL, useVerification } from "../data/verificationStore";
import "./sgtgo.css";

const COPY = {
  [STATUS.PENDING]: { tone: "info", title: "Application received", body: "Our team is reviewing your details. Most applications are checked within 1-2 business days. We'll send you a WhatsApp the moment there's news." },
  [STATUS.MORE_INFO]: { tone: "warn", title: "We need a bit more from you", body: "One or more items couldn't be verified. Fix the items below and resubmit - you won't lose anything you've already filled in." },
  [STATUS.REJECTED]: { tone: "danger", title: "Application not approved", body: "We weren't able to verify your details. If you believe this is a mistake, reply to our WhatsApp message and we'll take another look." },
  [STATUS.SUSPENDED]: { tone: "danger", title: "Account suspended", body: "Your account has been temporarily suspended. Contact SGT GO support to resolve this." },
  [STATUS.PROVISIONAL]: { tone: "warn", title: "Provisionally approved", body: "You can start using SGT GO with limits while we finish verifying the outstanding documents." },
};

const TIMELINE = [
  { key: "created", label: "Account created" },
  { key: "submitted", label: "Application submitted" },
  { key: "review", label: "Under review" },
  { key: "decision", label: "Decision" },
];

export default function PendingApproval() {
  const { role } = useParams();
  const config = applicationConfig[role];
  const record = useVerification(role);

  if (!config) return <Navigate to="/sgt-go" replace />;
  if (!record || record.status === STATUS.NONE || record.status === STATUS.DRAFT) return <Navigate to={`/sgt-go/${role}/apply`} replace />;
  if (record.status === STATUS.APPROVED) return <Navigate to={config.dashboardPath} replace />;

  const copy = COPY[record.status] || COPY[STATUS.PENDING];
  const reached = {
    created: true,
    submitted: !!record.submittedAt,
    review: !!record.submittedAt,
    decision: [STATUS.APPROVED, STATUS.PROVISIONAL, STATUS.REJECTED, STATUS.MORE_INFO].includes(record.status),
  };

  return (
    <div className="auth-page">
      <div className="pending-card">
        <img src={logo} alt="Segwata Holdings" className="auth-card__logo" />
        <span className="auth-card__badge">SGT GO · {config.label}</span>

        <div className={`status-banner status-banner--${copy.tone}`}>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </div>

        <div className="pending-meta">
          <div><span className="pending-meta__label">Status</span><strong>{STATUS_LABEL[record.status]}</strong></div>
          {record.submittedAt && (<div><span className="pending-meta__label">Submitted</span><strong>{new Date(record.submittedAt).toLocaleString("en-ZA")}</strong></div>)}
          <div><span className="pending-meta__label">Reference</span><strong>SGT-{role.slice(0, 3).toUpperCase()}-{String(record.submittedAt || "").slice(0, 10).replace(/-/g, "") || "——"}</strong></div>
        </div>

        {(record.reasonCode || record.reviewNote) && (
          <div className="pending-note">
            <span className="pending-note__label">Reviewer note</span>
            {record.reasonCode && <p className="pending-note__code">{record.reasonCode}</p>}
            {record.reviewNote && <p>{record.reviewNote}</p>}
          </div>
        )}

        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li key={t.key} className={reached[t.key] ? "is-done" : ""}>
              <span className="timeline__dot" />
              <span className="timeline__label">{t.label}</span>
            </li>
          ))}
        </ol>

        <div className="pending-actions">
          {record.status === STATUS.MORE_INFO && (<Link to={`/sgt-go/${role}/apply`} className="btn btn--primary">Fix and resubmit</Link>)}
          <Link to="/sgt-go" className="btn btn--outline">Back to SGT GO home</Link>
        </div>
      </div>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText("$PWD\$COMPONENTS\PendingApproval.jsx", $content, $utf8)
Write-Host "OK PendingApproval.jsx"

# ---------- ApplicationForm.jsx ----------
$content = @'
import { useMemo, useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import { applicationConfig, validateSection } from "../data/applicationConfig";
import { STATUS, useVerification, saveDraft, submitApplication } from "../data/verificationStore";
import "./sgtgo.css";

export default function ApplicationForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const config = applicationConfig[role];
  const record = useVerification(role);

  const [data, setData] = useState(() => record?.data || {});
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sections = useMemo(
    () => (config ? config.sections.filter((s) => !s.showIf || s.showIf(data)) : []),
    [config, data]
  );

  if (!config) return <Navigate to="/sgt-go" replace />;
  if (record?.status === STATUS.APPROVED) return <Navigate to={config.dashboardPath} replace />;
  if (record?.status === STATUS.PENDING) return <Navigate to={`/sgt-go/${role}/pending`} replace />;

  const step = Math.min(stepIndex, sections.length - 1);
  const section = sections[step];
  const isLast = step === sections.length - 1;

  const setField = (name, value) => {
    setData((d) => ({ ...d, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };
  const flash = (msg) => { setToast(msg); window.setTimeout(() => setToast(""), 2200); };

  const goNext = () => {
    const errs = validateSection(section, data);
    if (Object.keys(errs).length) { setErrors(errs); flash("Please complete the highlighted fields."); return; }
    setErrors({}); saveDraft(role, data); setStepIndex(step + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => { setErrors({}); if (step === 0) return; setStepIndex(step - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSaveDraft = () => { saveDraft(role, data); flash("Draft saved."); };
  const handleSubmit = () => {
    const allErrs = {};
    sections.forEach((s) => Object.assign(allErrs, validateSection(s, data)));
    if (Object.keys(allErrs).length) {
      setErrors(allErrs);
      const firstBad = sections.findIndex((s) => Object.keys(validateSection(s, data)).length);
      if (firstBad >= 0) setStepIndex(firstBad);
      flash("Some sections still need attention.");
      return;
    }
    setSubmitting(true);
    submitApplication(role, data);
    navigate(`/sgt-go/${role}/pending`, { replace: true });
  };

  return (
    <div className="apply-page">
      <div className="apply-shell">
        <header className="apply-head">
          <img src={logo} alt="Segwata Holdings" className="apply-head__logo" />
          <div>
            <span className="auth-card__badge">SGT GO · {config.label} application</span>
            <h1>{config.label} verification</h1>
            <p className="apply-head__intro">{config.intro}</p>
          </div>
        </header>

        <ol className="apply-steps">
          {sections.map((s, i) => (
            <li key={s.key} className={`apply-step ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}>
              <button type="button" onClick={() => i < step && setStepIndex(i)} disabled={i > step}>
                <span className="apply-step__num">{i < step ? "OK" : i + 1}</span>
                <span className="apply-step__title">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>

        <section className="apply-section">
          <div className="apply-section__head">
            <h2>{section.title}</h2>
            {section.blurb && <p>{section.blurb}</p>}
          </div>

          <div className="apply-grid">
            {(section.fields || []).map((f) => (
              <Field key={f.name} field={f} value={data[f.name]} error={errors[f.name]} onChange={(v) => setField(f.name, v)} />
            ))}
          </div>

          {(section.docs || []).length > 0 && (
            <div className="apply-docs">
              <h3 className="apply-docs__title">Documents</h3>
              <div className="apply-grid">
                {section.docs.map((d) => (
                  <DocField key={d.name} doc={d} value={data[d.name]} error={errors[d.name]} onChange={(v) => setField(d.name, v)} />
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="apply-actions">
          <div className="apply-actions__left">
            {step > 0 && (<button type="button" className="btn btn--ghost-dark" onClick={goBack}>Back</button>)}
            <button type="button" className="btn btn--ghost-dark" onClick={handleSaveDraft}>Save draft</button>
          </div>
          <div className="apply-actions__right">
            <span className="apply-actions__count">Step {step + 1} of {sections.length}</span>
            {isLast
              ? <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit for approval"}</button>
              : <button type="button" className="btn btn--primary" onClick={goNext}>Continue</button>}
          </div>
        </div>

        <Link to="/sgt-go" className="auth-card__back">Back to SGT GO</Link>
        {toast && <div className="apply-toast">{toast}</div>}
      </div>
    </div>
  );
}

function Field({ field, value, error, onChange }) {
  const cls = `apply-field ${field.half ? "apply-field--half" : "apply-field--full"} ${error ? "has-error" : ""}`;
  const common = { id: field.name, name: field.name, value: value ?? "", placeholder: field.placeholder || "", onChange: (e) => onChange(e.target.value) };

  if (field.type === "checkboxes") {
    return (
      <div className={cls}>
        <span className="apply-field__label">{field.label}{field.required && <em>*</em>}</span>
        <CheckboxChips field={field} value={value} onChange={onChange} />
        {field.help && <span className="apply-field__help">{field.help}</span>}
        {error && <span className="apply-field__error">{error}</span>}
      </div>
    );
  }
  if (field.type === "consent") {
    return (
      <div className={cls}>
        <label className="apply-consent">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>{field.label}{field.required && <em>*</em>}</span>
        </label>
        {field.help && <span className="apply-field__help">{field.help}</span>}
        {error && <span className="apply-field__error">{error}</span>}
      </div>
    );
  }
  if (field.type === "gps") {
    return (
      <div className={cls}>
        <label className="apply-field__label" htmlFor={field.name}>{field.label}{field.required && <em>*</em>}</label>
        <div className="apply-gps">
          <input {...common} placeholder="Latitude, Longitude" />
          <button type="button" className="btn btn--outline btn--small" onClick={() => captureGps(onChange)}>Use my location</button>
        </div>
        {field.help && <span className="apply-field__help">{field.help}</span>}
        {error && <span className="apply-field__error">{error}</span>}
      </div>
    );
  }
  return (
    <div className={cls}>
      <label className="apply-field__label" htmlFor={field.name}>{field.label}{field.required && <em>*</em>}</label>
      {field.type === "textarea" ? (<textarea rows={3} {...common} />)
        : field.type === "select" ? (<select {...common}><option value="">Select...</option>{field.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>)
        : field.type === "file" ? (<input id={field.name} type="file" onChange={(e) => onChange(e.target.files?.[0]?.name || "")} />)
        : (<input type={field.type} {...common} inputMode={field.type === "tel" ? "tel" : undefined} />)}
      {field.help && <span className="apply-field__help">{field.help}</span>}
      {error && <span className="apply-field__error">{error}</span>}
    </div>
  );
}

function CheckboxChips({ field, value, onChange }) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  return (
    <div className="apply-chips">
      {field.options.map((opt) => (
        <button type="button" key={opt} className={`apply-chip ${selected.includes(opt) ? "is-on" : ""}`} onClick={() => toggle(opt)}>{opt}</button>
      ))}
    </div>
  );
}

function DocField({ doc, value, error, onChange }) {
  const attached = value && typeof value === "object";
  return (
    <div className={`apply-doc ${error ? "has-error" : ""} ${doc.required ? "" : "is-optional"}`}>
      <div className="apply-doc__top">
        <span className="apply-doc__label">{doc.label}{doc.required && <em>*</em>}</span>
        {!doc.required && <span className="apply-doc__pill">Optional</span>}
      </div>
      {attached ? (
        <div className="apply-doc__file">
          <span className="apply-doc__name">{value.fileName}</span>
          <button type="button" className="apply-doc__remove" onClick={() => onChange(null)}>Remove</button>
        </div>
      ) : (
        <label className="apply-doc__drop">
          <input type="file" accept="image/*,application/pdf" onChange={(e) => {
            const file = e.target.files?.[0]; if (!file) return;
            onChange({ fileName: file.name, size: file.size, attachedAt: new Date().toISOString() });
          }} />
          <span>Tap to attach a photo or PDF</span>
        </label>
      )}
      {doc.help && <span className="apply-field__help">{doc.help}</span>}
      {error && <span className="apply-field__error">{error}</span>}
    </div>
  );
}

function captureGps(onChange) {
  if (!navigator.geolocation) { window.alert("Browser can't get location - type coordinates manually."); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => onChange(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
    () => window.alert("Couldn't get location. Type coordinates manually."),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
'@
[System.IO.File]::WriteAllText("$PWD\$COMPONENTS\ApplicationForm.jsx", $content, $utf8)
Write-Host "OK ApplicationForm.jsx"

# ---------- AdminApplications.jsx ----------
$content = @'
import { useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { applicationConfig, roleLabel } from "../data/applicationConfig";
import { STATUS, STATUS_LABEL, REASON_CODES, useAllApplications, reviewApplication } from "../data/verificationStore";
import "./sgtgo.css";

const navItems = [
  { label: "Overview", href: "/sgt-go/admin" },
  { label: "Applications", href: "/sgt-go/admin/applications" },
];

export default function AdminApplications() {
  const records = useAllApplications();
  const [selected, setSelected] = useState(null);
  const [reasonCode, setReasonCode] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("pending");

  const list = useMemo(() => {
    const rows = records.filter((r) => r.submittedAt);
    if (filter === "pending") return rows.filter((r) => r.status === STATUS.PENDING);
    if (filter === "attention") return rows.filter((r) => r.status === STATUS.MORE_INFO);
    if (filter === "decided") return rows.filter((r) => [STATUS.APPROVED, STATUS.PROVISIONAL, STATUS.REJECTED, STATUS.SUSPENDED].includes(r.status));
    return rows;
  }, [records, filter]);

  const active = selected ? records.find((r) => r.role === selected) : null;
  const config = active ? applicationConfig[active.role] : null;

  const decide = (status) => {
    if (!active) return;
    if (status !== STATUS.APPROVED && status !== STATUS.PROVISIONAL && !reasonCode) {
      window.alert("Pick a reason code before rejecting or requesting more info."); return;
    }
    reviewApplication(active.role, { status, reasonCode, reviewNote: note });
    setSelected(null); setReasonCode(""); setNote("");
  };

  return (
    <DashboardLayout role="admin" roleLabel="Admin" navItems={navItems}>
      <div className="dash__header">
        <h1>Application review queue</h1>
        <p>Approve, query or reject new merchants, suppliers and drivers.</p>
      </div>

      <div className="queue-filters">
        {[["pending","Pending"],["attention","Awaiting applicant"],["decided","Decided"],["all","All"]].map(([key, label]) => (
          <button key={key} className={`queue-filter ${filter === key ? "is-on" : ""}`} onClick={() => setFilter(key)}>{label}</button>
        ))}
      </div>

      <div className="queue">
        <div className="queue__list panel">
          <div className="panel__head"><h2>Applications ({list.length})</h2></div>
          {list.length === 0 ? (
            <p className="queue__empty">Nothing here right now.</p>
          ) : (
            <ul>
              {list.map((r) => (
                <li key={r.role}>
                  <button className={`queue__item ${selected === r.role ? "is-active" : ""}`} onClick={() => setSelected(r.role)}>
                    <div>
                      <strong>{roleLabel(r.role)}</strong>
                      <span className="queue__sub">{r.data?.tradingName || r.data?.registeredName || r.data?.fullName || "-"}</span>
                    </div>
                    <StatusPill status={r.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="queue__detail panel">
          {!active ? (
            <p className="queue__empty">Select an application to review it.</p>
          ) : (
            <>
              <div className="panel__head">
                <h2>{roleLabel(active.role)} - {active.data?.tradingName || active.data?.fullName || active.role}</h2>
                <StatusPill status={active.status} />
              </div>

              <div className="queue__body">
                {config.sections.filter((s) => !s.showIf || s.showIf(active.data)).map((s) => (
                  <div key={s.key} className="review-block">
                    <h3>{s.title}</h3>
                    <dl className="review-dl">
                      {(s.fields || []).map((f) => (
                        <div key={f.name}><dt>{f.label}</dt><dd>{formatValue(active.data[f.name])}</dd></div>
                      ))}
                      {(s.docs || []).map((d) => (
                        <div key={d.name}>
                          <dt>{d.label}</dt>
                          <dd>{active.data[d.name] ? <span className="review-doc">Attached: {active.data[d.name].fileName || "yes"}</span> : <span className="review-missing">Not provided</span>}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>

              <div className="queue__actions">
                <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}>
                  <option value="">Reason code (required unless approving)...</option>
                  {REASON_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea rows={2} placeholder="Note to the applicant (they'll see this)..." value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="queue__buttons">
                  <button className="btn btn--primary" onClick={() => decide(STATUS.APPROVED)}>Approve</button>
                  <button className="btn btn--outline" onClick={() => decide(STATUS.PROVISIONAL)}>Approve provisionally</button>
                  <button className="btn btn--outline" onClick={() => decide(STATUS.MORE_INFO)}>Request more info</button>
                  <button className="btn btn--danger" onClick={() => decide(STATUS.REJECTED)}>Reject</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusPill({ status }) {
  const tone = { [STATUS.PENDING]:"amber", [STATUS.MORE_INFO]:"amber", [STATUS.APPROVED]:"green", [STATUS.PROVISIONAL]:"green", [STATUS.REJECTED]:"red", [STATUS.SUSPENDED]:"red" }[status] || "blue";
  return <span className={`badge badge--${tone}`}>{STATUS_LABEL[status]}</span>;
}

function formatValue(v) {
  if (v === undefined || v === null || v === "") return <span className="review-missing">-</span>;
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return v.fileName || "Attached";
  return String(v);
}
'@
[System.IO.File]::WriteAllText("$PWD\$COMPONENTS\AdminApplications.jsx", $content, $utf8)
Write-Host "OK AdminApplications.jsx"

# ---------- CSS append ----------
$css = @'

/* ---------- Application wizard ---------- */
.apply-page { min-height: 100vh; background: var(--navy-950); padding: 2.5rem 1.5rem 4rem; }
.apply-shell { max-width: 880px; margin: 0 auto; background: var(--white); border-radius: 8px; padding: 2.2rem 2.4rem 2.6rem; }
.apply-head { display: flex; gap: 1.2rem; align-items: flex-start; margin-bottom: 1.8rem; }
.apply-head__logo { height: 38px; width: auto; object-fit: contain; }
.apply-head h1 { font-size: 1.45rem; margin: 0.5rem 0 0.4rem; }
.apply-head__intro { color: var(--muted); font-size: 0.94rem; max-width: 60ch; }
.apply-steps { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0.9rem 0 1.4rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
.apply-step button { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; font-family: var(--font-body); font-size: 0.85rem; color: var(--muted); padding: 0.35rem 0.7rem; border-radius: 20px; cursor: default; }
.apply-step.is-done button { color: var(--blue-600); cursor: pointer; }
.apply-step.is-active button { background: var(--ice-100); color: var(--navy-950); font-weight: 600; }
.apply-step__num { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; background: var(--border); color: var(--white); font-size: 0.7rem; font-weight: 600; }
.apply-step.is-done .apply-step__num { background: var(--green-600); }
.apply-step.is-active .apply-step__num { background: var(--blue-600); }
.apply-section__head { margin-bottom: 1.4rem; }
.apply-section__head h2 { font-size: 1.2rem; }
.apply-section__head p { color: var(--muted); font-size: 0.9rem; margin-top: 0.35rem; max-width: 65ch; }
.apply-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.1rem; }
.apply-field { display: flex; flex-direction: column; gap: 0.35rem; }
.apply-field--full { grid-column: 1 / -1; }
.apply-field--half { grid-column: span 1; }
.apply-field__label { font-size: 0.86rem; font-weight: 500; color: var(--navy-800); }
.apply-field__label em { color: var(--red-500); font-style: normal; margin-left: 2px; }
.apply-field input, .apply-field select, .apply-field textarea { padding: 0.7rem 0.85rem; border: 1px solid var(--border); border-radius: 5px; font-size: 0.94rem; font-family: var(--font-body); color: var(--ink); background: var(--white); width: 100%; }
.apply-field textarea { resize: vertical; }
.apply-field input:focus, .apply-field select:focus, .apply-field textarea:focus { outline: 2px solid var(--blue-400); outline-offset: 1px; border-color: var(--blue-600); }
.apply-field.has-error input, .apply-field.has-error select, .apply-field.has-error textarea { border-color: var(--red-500); }
.apply-field__help { font-size: 0.78rem; color: var(--muted); }
.apply-field__error { font-size: 0.78rem; color: var(--red-500); }
.apply-gps { display: flex; gap: 0.5rem; }
.apply-gps input { flex: 1; }
.apply-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.apply-chip { padding: 0.35rem 0.8rem; border: 1px solid var(--border); background: var(--white); border-radius: 20px; font-size: 0.83rem; font-family: var(--font-body); color: var(--navy-800); cursor: pointer; }
.apply-chip.is-on { background: var(--blue-600); border-color: var(--blue-600); color: var(--white); }
.apply-consent { display: flex; gap: 0.6rem; align-items: flex-start; font-size: 0.88rem; }
.apply-consent input { width: auto; margin-top: 2px; }
.apply-docs { margin-top: 2rem; padding-top: 1.6rem; border-top: 1px dashed var(--border); }
.apply-docs__title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 1rem; }
.apply-doc { border: 1px solid var(--border); border-radius: 6px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.55rem; background: var(--ice-50); }
.apply-doc.has-error { border-color: var(--red-500); background: #fdf6f6; }
.apply-doc__top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.apply-doc__label { font-size: 0.86rem; font-weight: 500; color: var(--navy-800); }
.apply-doc__label em { color: var(--red-500); font-style: normal; margin-left: 2px; }
.apply-doc__pill { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); background: var(--white); border: 1px solid var(--border); padding: 0.15rem 0.5rem; border-radius: 20px; }
.apply-doc__drop { border: 1px dashed var(--border); border-radius: 5px; background: var(--white); padding: 0.9rem; text-align: center; font-size: 0.84rem; color: var(--blue-600); cursor: pointer; }
.apply-doc__drop input { display: none; }
.apply-doc__drop:hover { border-color: var(--blue-600); }
.apply-doc__file { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; background: var(--white); border: 1px solid var(--border); border-radius: 5px; padding: 0.6rem 0.8rem; font-size: 0.84rem; }
.apply-doc__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.apply-doc__remove { background: none; border: none; color: var(--red-500); font-size: 0.8rem; font-family: var(--font-body); cursor: pointer; }
.apply-actions { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: 2.2rem; padding-top: 1.4rem; border-top: 1px solid var(--border); flex-wrap: wrap; }
.apply-actions__left, .apply-actions__right { display: flex; align-items: center; gap: 0.7rem; }
.apply-actions__count { font-size: 0.82rem; color: var(--muted); }
.btn--ghost-dark { background: none; border: 1px solid var(--border); color: var(--navy-800); }
.btn--ghost-dark:hover { border-color: var(--navy-800); }
.btn--danger { background: var(--red-500); color: var(--white); border: 1px solid var(--red-500); }
.apply-toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: var(--navy-950); color: var(--white); padding: 0.7rem 1.2rem; border-radius: 20px; font-size: 0.86rem; z-index: 50; }

/* ---------- Pending / status screens ---------- */
.pending-card { background: var(--white); border-radius: 8px; padding: 2.4rem 2.4rem 2.6rem; max-width: 560px; width: 100%; }
.status-banner { border-radius: 6px; padding: 1.1rem 1.2rem; margin-bottom: 1.6rem; }
.status-banner h1 { font-size: 1.2rem; margin-bottom: 0.4rem; }
.status-banner p { font-size: 0.9rem; line-height: 1.5; }
.status-banner--info { background: #e6effa; color: var(--blue-600); }
.status-banner--warn { background: #fbf0dd; color: #8a5f1d; }
.status-banner--danger { background: #fbe9e9; color: var(--red-500); }
.pending-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; padding: 1rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 1.4rem; }
.pending-meta__label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 0.25rem; }
.pending-meta strong { font-size: 0.88rem; font-weight: 500; color: var(--navy-950); }
.pending-note { background: var(--ice-50); border-left: 3px solid var(--amber-500); padding: 0.9rem 1rem; border-radius: 0 5px 5px 0; margin-bottom: 1.4rem; font-size: 0.88rem; }
.pending-note__label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 0.3rem; }
.pending-note__code { font-weight: 600; color: var(--navy-950); margin-bottom: 0.2rem; }
.timeline { list-style: none; display: flex; flex-direction: column; gap: 0.9rem; margin-bottom: 1.8rem; }
.timeline li { display: flex; align-items: center; gap: 0.7rem; font-size: 0.88rem; color: var(--muted); }
.timeline__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border); flex-shrink: 0; }
.timeline li.is-done { color: var(--navy-950); }
.timeline li.is-done .timeline__dot { background: var(--green-600); }
.pending-actions { display: flex; gap: 0.7rem; flex-wrap: wrap; }

/* ---------- Admin review queue ---------- */
.queue-filters { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; flex-wrap: wrap; }
.queue-filter { padding: 0.4rem 0.9rem; border-radius: 20px; border: 1px solid var(--border); background: var(--white); font-size: 0.84rem; font-family: var(--font-body); color: var(--navy-800); cursor: pointer; }
.queue-filter.is-on { background: var(--blue-600); border-color: var(--blue-600); color: var(--white); }
.queue { display: grid; grid-template-columns: 300px 1fr; gap: 1.2rem; align-items: start; }
.queue__list ul { list-style: none; }
.queue__item { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; padding: 0.85rem 1.2rem; background: none; border: none; border-bottom: 1px solid var(--border); text-align: left; cursor: pointer; font-family: var(--font-body); }
.queue__item:hover { background: var(--ice-50); }
.queue__item.is-active { background: var(--ice-100); }
.queue__sub { display: block; font-size: 0.8rem; color: var(--muted); margin-top: 0.15rem; }
.queue__empty { padding: 1.6rem 1.4rem; color: var(--muted); font-size: 0.9rem; }
.queue__body { padding: 1.2rem 1.4rem; max-height: 60vh; overflow-y: auto; }
.review-block { margin-bottom: 1.6rem; }
.review-block h3 { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 0.7rem; }
.review-dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem 1.4rem; }
.review-dl dt { font-size: 0.78rem; color: var(--muted); margin-bottom: 0.15rem; }
.review-dl dd { font-size: 0.88rem; color: var(--navy-950); }
.review-missing { color: var(--red-500); font-size: 0.85rem; }
.review-doc { color: var(--blue-600); font-size: 0.85rem; }
.queue__actions { padding: 1.2rem 1.4rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.8rem; }
.queue__actions select, .queue__actions textarea { padding: 0.65rem 0.8rem; border: 1px solid var(--border); border-radius: 5px; font-family: var(--font-body); font-size: 0.9rem; width: 100%; }
.queue__buttons { display: flex; gap: 0.6rem; flex-wrap: wrap; }
@media (max-width: 900px) {
  .queue { grid-template-columns: 1fr; }
  .apply-grid { grid-template-columns: 1fr; }
  .apply-field--half { grid-column: 1 / -1; }
  .review-dl { grid-template-columns: 1fr; }
  .apply-shell { padding: 1.6rem 1.4rem; }
}
'@
Add-Content -Path "$COMPONENTS\sgtgo.css" -Value $css -Encoding UTF8
Write-Host "OK CSS appended"

Write-Host ""
Write-Host "ALL DONE." -ForegroundColor Green
Write-Host "Now edit src\App.jsx (or wherever your routes live) and add the routes + imports." -ForegroundColor Yellow
Write-Host "Then run: npm run dev" -ForegroundColor Green