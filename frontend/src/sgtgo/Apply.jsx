import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/segwata-logo.jpg";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { FORMS, IMG, docsFor, fieldsFor, validateStep, empty, roleLabel } from "./applicationForms";
import "./sgtgo.css";

const BUCKET = "application-docs";
const MAX_MB = 5;

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
        <input type={f.type || "text"} autoComplete={f.autoComplete} inputMode={f.type === "tel" ? "tel" : undefined} {...common} />
      )}
      {error && <span className="apply__err" role="alert">{error}</span>}
    </div>
  );
}

/* Entry: waits for the application row, then mounts the form. */
export default function Apply() {
  const { session, profile, application, refreshApplication } = useAuth();
  const form = FORMS[profile?.role];
  if (!supabase) {
    return (
      <div className="auth-page"><div className="auth-card">
        <h1>Supabase isn't connected</h1>
        <p className="auth-card__intro">Add your keys to the .env file and restart the dev server to use the application form.</p>
        <Link to="/sgt-go" className="btn btn--outline">Back</Link>
      </div></div>
    );
  }
  if (!form) return <Navigate to="/sgt-go/continue" replace />;
  if (application && !["draft", "more_info_required"].includes(application.status)) {
    return <Navigate to="/sgt-go/continue" replace />;
  }
  if (!application) return <StartApplication form={form} uid={session.user.id} onDone={refreshApplication} />;
  return <ApplyForm form={form} />;
}

function StartApplication({ form, uid, onDone }) {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true); setErr("");
    const { error } = await supabase.from("applications").insert({ user_id: uid, role: form.role, status: "draft" });
    if (error && error.code !== "23505") { setErr(error.message); setBusy(false); return; }
    await onDone();
  };
  return (
    <div className="auth-page"><div className="auth-card">
      <span className="auth-card__badge">{roleLabel[form.role]} application</span>
      <h1>Start your {form.role} application</h1>
      <p className="auth-card__intro">It takes about 10 minutes. Have your ID and documents handy; your progress saves as you go.</p>
      {err && <p className="auth-error" role="alert">{err}</p>}
      <button className="btn btn--primary btn--block" disabled={busy} onClick={start}>{busy ? "Starting…" : "Begin"}</button>
    </div></div>
  );
}

function ApplyForm({ form }) {
  const navigate = useNavigate();
  const { session, application, refreshApplication, signOut } = useAuth();
  const uid = session.user.id;
  const STEPS = form.steps;
  const docStep = STEPS.findIndex((s) => s.docs);

  const [data, setData] = useState(() => {
    const m = session.user.user_metadata || {};
    const saved = application.data || {};
    const legacy = { full_name: saved.fullName, licence_number: saved.licenceNumber };
    const prefill = Object.fromEntries(Object.entries({ ...form.prefill(m), ...legacy }).filter(([, v]) => !empty(v)));
    return { ...prefill, ...saved };
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(null); // "save" | "submit" | doc key
  const [message, setMessage] = useState("");

  const current = STEPS[step];
  const set = (name, v) => { setData((d) => ({ ...d, [name]: v })); setErrors((e) => ({ ...e, [name]: undefined })); };
  const persist = async (next) => {
    const { error } = await supabase.from("applications").update({ data: next }).eq("user_id", uid);
    if (error) throw error;
  };
  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const next = async () => {
    const errs = validateStep(form, current, data);
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
      const errs = validateStep(form, STEPS[i], data);
      if (Object.keys(errs).length) { setErrors(errs); setStep(i); setMessage(`Step ${i + 1} (${STEPS[i].title}) is incomplete.`); top(); return; }
    }
    setBusy("submit"); setMessage("");
    try {
      await persist(data);
      const { error } = await supabase.rpc("submit_application");
      if (error) throw error;
      await refreshApplication();
      navigate("/sgt-go/status", { replace: true });
    } catch (e) { setMessage(e.message); setBusy(null); }
  };

  return (
    <div className="apply">
      <header className="apply__top">
        <img src={logo} alt="Segwata Holdings" className="apply__logo" />
        <button className="apply__out" onClick={async () => { await signOut(); navigate("/login"); }}>Log out</button>
      </header>

      <div className="apply__wrap">
        <span className="eyebrow">SGT GO · {roleLabel[form.role]}</span>
        <h1>{form.title}</h1>
        <p className="apply__lead">{form.lead}</p>
        {application.status === "more_info_required" && application.reviewer_note && (
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
              {docsFor(form, data).map((x) => {
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
                  <div className="apply__block-head"><h3>{s.title}</h3><button type="button" onClick={() => { setStep(STEPS.indexOf(s)); top(); }}>Edit</button></div>
                  <dl>
                    {fieldsFor(s, data).filter((f) => f.type !== "checkbox" && !empty(data[f.name])).map((f) => (
                      <div key={f.name}><dt>{f.label}</dt><dd>{f.name === "bank_account_number" ? `••••${String(data[f.name]).slice(-4)}` : String(data[f.name])}</dd></div>
                    ))}
                  </dl>
                </div>
              ))}
              <div className="apply__block">
                <div className="apply__block-head"><h3>Documents</h3><button type="button" onClick={() => { setStep(docStep); top(); }}>Edit</button></div>
                <dl>{docsFor(form, data).map((x) => (<div key={x.key}><dt>{x.label}</dt><dd>{data.documents?.[x.key] ? "✓ Uploaded" : "Missing"}</dd></div>))}</dl>
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
