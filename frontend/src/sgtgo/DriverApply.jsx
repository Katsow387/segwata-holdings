import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import "./sgtgo.css";

const BUCKET = "application-docs";
const MAX_MB = 5;
const YEAR = new Date().getFullYear();
const today = () => new Date().toISOString().slice(0, 10);

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
const saId = (v) => {
  if (!/^\d{13}$/.test(v)) return "Enter your 13-digit South African ID number.";
  const m = Number(v.slice(2, 4)), d = Number(v.slice(4, 6));
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 && luhnOk(v) ? null : "That ID number isn't valid. Check each digit.";
};
const phone = (v) =>
  /^(\+27|0)[1-9]\d{8}$/.test(String(v).replace(/[\s-]/g, "")) ? null : "Use a South African number, e.g. 082 123 4567.";
const empty = (v) => v === undefined || v === null || String(v).trim() === "";

/* ---------- form definition ---------- */
const YESNO = [["no", "No"], ["yes", "Yes"]];
const STEPS = [
  {
    title: "Personal details",
    fields: [
      { name: "full_name", label: "Full name (as on your ID)", autoComplete: "name" },
      { name: "nationality", label: "Nationality", type: "select", options: [["citizen", "South African citizen"], ["foreign", "Foreign national"]] },
      { name: "id_number", label: "ID number (or passport number)", validate: (v, d) => (d.nationality === "foreign" ? (v.trim().length >= 6 ? null : "Enter your passport number.") : saId(v)) },
      { name: "phone", label: "Cell phone number", type: "tel", validate: phone },
      { name: "address_street", label: "Street address" },
      { name: "address_suburb", label: "Suburb", optional: true },
      { name: "address_city", label: "City / town" },
      { name: "address_postal", label: "Postal code", validate: (v) => (/^\d{4}$/.test(v) ? null : "Postal codes have 4 digits.") },
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
      { name: "licence_expiry", label: "Licence expiry date", type: "date", validate: (v) => (v > today() ? null : "Your licence must not be expired.") },
      { name: "years_experience", label: "Years of driving experience", type: "number", validate: (v) => (Number(v) >= 2 && Number(v) <= 60 ? null : "We require at least 2 years of driving experience.") },
      { name: "has_prdp", label: "Do you hold a PrDP (professional driving permit)?", type: "select", options: YESNO },
      { name: "prdp_number", label: "PrDP number", when: (d) => d.has_prdp === "yes" },
      { name: "prdp_expiry", label: "PrDP expiry date", type: "date", when: (d) => d.has_prdp === "yes", validate: (v) => (v > today() ? null : "Your PrDP must not be expired.") },
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
      { name: "vehicle_reg", label: "Registration number", validate: (v) => (/^[A-Za-z0-9 ]{4,12}$/.test(v) ? null : "Enter the number plate, e.g. CA 123 456.") },
    ],
  },
  { title: "Documents", docs: true },
  {
    title: "Banking & declarations",
    fields: [
      { name: "bank_name", label: "Bank", type: "select", options: ["ABSA", "African Bank", "Capitec", "Discovery Bank", "FNB", "Nedbank", "Standard Bank", "TymeBank", "Other"] },
      { name: "bank_account_type", label: "Account type", type: "select", options: ["Cheque / current", "Savings"] },
      { name: "bank_account_holder", label: "Account holder name", validate: (v, d) => (v.trim().toLowerCase() === String(d.full_name || "").trim().toLowerCase() ? null : "The account must be in your own name, same as your ID.") },
      { name: "bank_account_number", label: "Account number", validate: (v) => (/^\d{6,16}$/.test(v.replace(/\s/g, "")) ? null : "Account numbers are 6 to 16 digits.") },
      { name: "bank_branch_code", label: "Branch code", validate: (v) => (/^\d{6}$/.test(v) ? null : "Branch codes have 6 digits.") },
      { name: "criminal_record", label: "Do you have any criminal record or pending charges?", type: "select", options: YESNO },
      { name: "criminal_details", label: "Please explain", type: "textarea", when: (d) => d.criminal_record === "yes" },
      { name: "consent_popia", type: "checkbox", label: "I consent to Segwata Holdings collecting and processing my personal information under POPIA, for this application and for managing my work as a driver." },
      { name: "consent_background", type: "checkbox", label: "I consent to ID, driver's licence, criminal record and reference checks being done on me." },
      { name: "declaration_true", type: "checkbox", label: "I declare that every detail and document I submitted is true and genuine. I understand false information means rejection and may be reported to the authorities." },
    ],
  },
  { title: "Review & submit", review: true },
];

const IMG = "img";
const DOCS = [
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
];
const docsFor = (d) => DOCS.filter((x) => !x.when || x.when(d));
const fieldsFor = (step, d) => (step.fields || []).filter((f) => !f.when || f.when(d));

function validateStep(step, d) {
  const errors = {};
  if (step.docs) {
    docsFor(d).forEach((x) => { if (!x.optional && !d.documents?.[x.key]) errors[`doc:${x.key}`] = "Upload this document."; });
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

/* ---------- field ---------- */
function Field({ f, value, error, onChange }) {
  const id = `f-${f.name}`;
  if (f.type === "checkbox") {
    return (
      <label className={"apply__check" + (error ? " has-error" : "")}>
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        <span>{f.label}{error && <em className="apply__err"> {error}</em>}</span>
      </label>
    );
  }
  const common = { id, value: value ?? "", onChange: (e) => onChange(e.target.value), "aria-invalid": Boolean(error) };
  return (
    <div className={"apply__field" + (f.type === "textarea" ? " apply__field--wide" : "")}>
      <label htmlFor={id}>{f.label}{f.optional && <small> (optional)</small>}</label>
      {f.type === "select" ? (
        <select {...common}>
          <option value="">Choose…</option>
          {f.options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
        </select>
      ) : f.type === "textarea" ? (
        <textarea rows={3} {...common} />
      ) : (
        <input type={f.type || "text"} autoComplete={f.autoComplete} {...common} />
      )}
      {error && <span className="apply__err" role="alert">{error}</span>}
    </div>
  );
}

/* ---------- page ---------- */
export default function DriverApply() {
  const navigate = useNavigate();
  const { session, application, refreshApplication, signOut } = useAuth();
  const uid = session?.user?.id;

  const [data, setData] = useState(() => {
    const s = application?.data || {};
    return { full_name: s.fullName, phone: s.phone, licence_number: s.licenceNumber, ...s };
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(null); // "save" | "submit" | doc key
  const [message, setMessage] = useState("");

  if (!supabase) {
    return (
      <div className="auth-page"><div className="auth-card">
        <h1>Supabase isn't connected</h1>
        <p className="auth-card__intro">Add your keys to the .env file and restart the dev server to use the application form.</p>
        <Link to="/sgt-go" className="btn btn--outline">Back</Link>
      </div></div>
    );
  }
  if (application === null) return <NoApplication uid={uid} onDone={refreshApplication} />;
  if (application && !["draft", "more_info_required"].includes(application.status)) {
    return <Navigate to="/sgt-go/driver/status" replace />;
  }

  const current = STEPS[step];
  const set = (name, v) => { setData((d) => ({ ...d, [name]: v })); setErrors((e) => ({ ...e, [name]: undefined })); };
  const persist = async (next) => {
    const { error } = await supabase.from("applications").update({ data: next }).eq("user_id", uid);
    if (error) throw error;
  };
  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const next = async () => {
    const errs = validateStep(current, data);
    setErrors(errs);
    if (Object.keys(errs).length) { setMessage("Please fix the highlighted items."); return; }
    setMessage(""); setBusy("save");
    try { await persist(data); setStep(step + 1); top(); }
    catch (e) { setMessage(`Couldn't save: ${e.message}`); }
    setBusy(null);
  };

  const upload = async (doc, file) => {
    const fail = (m) => setErrors((e) => ({ ...e, [`doc:${doc.key}`]: m }));
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return fail("Use a PDF, JPG or PNG file.");
    if (doc.type === IMG && file.type === "application/pdf") return fail("Upload a photo (JPG or PNG) for this one.");
    if (file.size > MAX_MB * 1024 * 1024) return fail(`File is too big. The limit is ${MAX_MB} MB.`);
    setBusy(doc.key); fail(undefined);
    const ext = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${uid}/${doc.key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) { setBusy(null); return fail(error.message); }
    const old = data.documents?.[doc.key];
    const nextData = {
      ...data,
      documents: { ...data.documents, [doc.key]: path },
      documents_meta: { ...data.documents_meta, [doc.key]: { name: file.name, size: file.size } },
    };
    setData(nextData);
    try { await persist(nextData); } catch (e) { fail(e.message); }
    if (old) await supabase.storage.from(BUCKET).remove([old]);
    setBusy(null);
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length - 1; i++) {
      const errs = validateStep(STEPS[i], data);
      if (Object.keys(errs).length) { setErrors(errs); setStep(i); setMessage(`Step ${i + 1} (${STEPS[i].title}) is incomplete.`); top(); return; }
    }
    setBusy("submit"); setMessage("");
    try {
      await persist(data);
      const { error } = await supabase.rpc("submit_driver_application");
      if (error) throw error;
      await refreshApplication();
      navigate("/sgt-go/driver/status", { replace: true });
    } catch (e) { setMessage(e.message); setBusy(null); }
  };

  return (
    <div className="apply">
      <header className="apply__top">
        <img src={logo} alt="Segwata Holdings" className="apply__logo" />
        <button className="apply__out" onClick={signOut}>Log out</button>
      </header>

      <div className="apply__wrap">
        <h1>Driver application</h1>
        <p className="apply__lead">Every section and document is required. Your progress saves each time you press Continue, so you can log out and come back. Your dashboard opens once we approve you.</p>
        {application?.status === "more_info_required" && application.reviewer_note && (
          <div className="apply__notice"><strong>We need more from you:</strong> {application.reviewer_note}</div>
        )}

        <ol className="apply__steps" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.title} className={i === step ? "is-current" : i < step ? "is-done" : ""}>
              <span>{i < step ? "✓" : i + 1}</span><em>{s.title}</em>
            </li>
          ))}
        </ol>

        <section className="apply__card">
          <h2>Step {step + 1} of {STEPS.length}: {current.title}</h2>

          {current.fields && (
            <div className="apply__grid">
              {fieldsFor(current, data).map((f) => (
                <Field key={f.name} f={f} value={data[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} />
              ))}
            </div>
          )}

          {current.docs && (
            <div className="apply__docs">
              <p className="apply__hint">PDF, JPG or PNG, up to {MAX_MB} MB each. Photos must be sharp, uncropped and in good light.</p>
              {docsFor(data).map((x) => {
                const file = data.documents?.[x.key];
                const err = errors[`doc:${x.key}`];
                return (
                  <div key={x.key} className={"apply__doc" + (file ? " is-done" : "") + (err ? " has-error" : "")}>
                    <div>
                      <strong>{x.label}{x.optional && <small> (optional)</small>}</strong>
                      {x.hint && <p>{x.hint}</p>}
                      {file && <p className="apply__file">✓ {data.documents_meta?.[x.key]?.name || "Uploaded"}</p>}
                      {err && <p className="apply__err" role="alert">{err}</p>}
                    </div>
                    <label className="btn btn--outline btn--small apply__upload">
                      {busy === x.key ? "Uploading…" : file ? "Replace" : "Choose file"}
                      <input type="file" hidden disabled={busy === x.key}
                        accept={x.type === IMG ? "image/jpeg,image/png" : "application/pdf,image/jpeg,image/png"}
                        onChange={(e) => { upload(x, e.target.files[0]); e.target.value = ""; }} />
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {current.review && (
            <div className="apply__review">
              {STEPS.filter((s) => s.fields).map((s) => (
                <div key={s.title} className="apply__block">
                  <div className="apply__block-head"><h3>{s.title}</h3><button type="button" onClick={() => setStep(STEPS.indexOf(s))}>Edit</button></div>
                  <dl>
                    {fieldsFor(s, data).filter((f) => f.type !== "checkbox" && !empty(data[f.name])).map((f) => (
                      <div key={f.name}><dt>{f.label}</dt><dd>{f.name.startsWith("bank_account_number") ? `••••${String(data[f.name]).slice(-4)}` : String(data[f.name])}</dd></div>
                    ))}
                  </dl>
                </div>
              ))}
              <div className="apply__block">
                <div className="apply__block-head"><h3>Documents</h3><button type="button" onClick={() => setStep(3)}>Edit</button></div>
                <dl>{docsFor(data).map((x) => (<div key={x.key}><dt>{x.label}</dt><dd>{data.documents?.[x.key] ? "✓ Uploaded" : "Missing"}</dd></div>))}</dl>
              </div>
              <p className="apply__hint">When you submit, you can't edit the application unless we ask you for more information. Reviews usually take 2 to 3 working days.</p>
            </div>
          )}

          {message && <p className="auth-error" role="alert">{message}</p>}

          <div className="apply__nav">
            {step > 0 && <button type="button" className="btn btn--outline" onClick={() => { setStep(step - 1); setMessage(""); top(); }}>Back</button>}
            {current.review ? (
              <button type="button" className="btn btn--primary" onClick={submit} disabled={busy === "submit"}>{busy === "submit" ? "Submitting…" : "Submit application"}</button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={next} disabled={busy !== null}>{busy === "save" ? "Saving…" : "Continue"}</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function NoApplication({ uid, onDone }) {
  const start = async () => {
    await supabase.from("applications").insert({ user_id: uid, role: "driver", status: "draft" });
    await onDone();
  };
  return (
    <div className="auth-page"><div className="auth-card">
      <h1>Start your driver application</h1>
      <p className="auth-card__intro">We'll ask for your details, licence, vehicle and documents.</p>
      <button className="btn btn--primary" onClick={start}>Begin</button>
    </div></div>
  );
}
