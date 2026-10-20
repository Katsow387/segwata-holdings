import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { adminStats, adminDeliveries, adminDisputes } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { FORMS, docsFor, fieldsFor, empty, roleLabel } from "./applicationForms";
import "./sgtgo.css";

const BUCKET = "application-docs";

const deliveryBadge = { Completed: "badge--green", "In progress": "badge--blue" };
const disputeBadge = { Investigating: "badge--amber", "Awaiting merchant response": "badge--red" };
const appBadge = { pending_review: "badge--amber", more_info_required: "badge--blue", approved: "badge--green", provisional: "badge--green", rejected: "badge--red", draft: "badge--blue" };
const appLabel = { pending_review: "Pending review", more_info_required: "More info needed", approved: "Approved", provisional: "Approved (provisional)", rejected: "Rejected", draft: "Draft" };

const TABS = [
  { key: "pending_review", label: "Pending", match: (a) => a.status === "pending_review" },
  { key: "more_info_required", label: "More info", match: (a) => a.status === "more_info_required" },
  { key: "approved", label: "Approved", match: (a) => ["approved", "provisional"].includes(a.status) },
  { key: "rejected", label: "Rejected", match: (a) => a.status === "rejected" },
  { key: "all", label: "All", match: (a) => a.status !== "draft" },
];

const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Applications", href: "#applications" },
  { label: "Deliveries", href: "#deliveries" },
  { label: "Disputes", href: "#disputes" },
];

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—");
const nameOf = (a) => a.data?.business_name || a.data?.company_name || a.data?.full_name || a.full_name || a.email;

export default function AdminDashboard() {
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState("pending_review");
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setError("");
    const { data, error: err } = await supabase.rpc("admin_applications");
    if (err) setError(err.message);
    else setApps(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => apps.filter(TABS.find((t) => t.key === tab).match), [apps, tab]);
  const pendingCount = apps.filter(TABS[0].match).length;

  return (
    <DashboardLayout role="admin" roleLabel="Admin" navItems={navItems}>
      <div id="overview" className="dash__header">
        <h1>SGT GO control centre</h1>
        <p>{supabase ? `${pendingCount} application${pendingCount === 1 ? "" : "s"} waiting for your review.` : "A snapshot of what's moving across the platform right now."}</p>
      </div>

      <div className="stat-grid">
        {adminStats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div id="applications" className="panel">
        <div className="panel__head">
          <h2>Applications</h2>
          <button className="btn btn--outline btn--small" onClick={load}>Refresh</button>
        </div>
        <div className="tabs" role="tablist">
          {TABS.map((t) => {
            const n = apps.filter(t.match).length;
            return (
              <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? "is-on" : ""} onClick={() => setTab(t.key)}>
                {t.label}{n > 0 && <span>{n}</span>}
              </button>
            );
          })}
        </div>
        {error && <p className="auth-error" style={{ margin: "1rem 1.4rem" }}>{error}. Make sure 0004_applications_admin.sql has been run and this account's role is admin.</p>}
        {!supabase && <p className="panel__empty">Connect Supabase to review real applications.</p>}
        {supabase && loading && <p className="panel__empty">Loading…</p>}
        {supabase && !loading && !error && shown.length === 0 && <p className="panel__empty">Nothing here right now.</p>}
        <ul className="applist">
          {shown.map((a) => (
            <li key={a.id}>
              <button onClick={() => setOpen(a)}>
                <span className="applist__main">
                  <strong>{nameOf(a)}</strong>
                  <small>{a.email}</small>
                </span>
                <span className={`badge badge--role`}>{roleLabel[a.role] || a.role}</span>
                <span className="applist__date">{fmt(a.submitted_at)}</span>
                <span className={`badge ${appBadge[a.status] || "badge--blue"}`}>{appLabel[a.status] || a.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div id="deliveries" className="panel">
        <div className="panel__head"><h2>Live deliveries</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Delivery</th><th>Driver</th><th>Route</th><th>Status</th></tr></thead>
            <tbody>
              {adminDeliveries.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td><td>{d.driver}</td><td>{d.route}</td>
                  <td><span className={`badge ${deliveryBadge[d.status] || "badge--blue"}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="disputes" className="panel">
        <div className="panel__head"><h2>Open disputes</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Dispute</th><th>Parties</th><th>Issue</th><th>Status</th></tr></thead>
            <tbody>
              {adminDisputes.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td><td>{d.parties}</td><td>{d.issue}</td>
                  <td><span className={`badge ${disputeBadge[d.status] || "badge--blue"}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && <ReviewModal app={open} onClose={() => setOpen(null)} onDone={() => { setOpen(null); load(); }} />}
    </DashboardLayout>
  );
}

function ReviewModal({ app, onClose, onDone }) {
  const form = FORMS[app.role];
  const d = app.data || {};
  const [note, setNote] = useState(app.reviewer_note || "");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const viewDoc = async (path) => {
    const w = window.open("", "_blank"); // open first so mobile browsers don't block it
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
    if (error) { w?.close(); return setErr(error.message); }
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  };

  const decide = async (status) => {
    if (["rejected", "more_info_required"].includes(status) && !note.trim()) {
      return setErr(status === "rejected" ? "Add a short reason so the applicant knows why." : "Tell the applicant what you need from them.");
    }
    setBusy(status); setErr("");
    const { error } = await supabase.rpc("review_application", { p_id: app.id, p_status: status, p_note: note.trim() || null });
    if (error) { setErr(error.message); setBusy(""); return; }
    onDone();
  };

  const canDecide = app.status !== "draft";
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Review application" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__head">
          <div>
            <h2>{nameOf(app)}</h2>
            <p>{roleLabel[app.role]} · {app.email}{app.phone ? ` · ${app.phone}` : ""}</p>
            <p>Submitted {fmt(app.submitted_at)} · <span className={`badge ${appBadge[app.status] || "badge--blue"}`}>{appLabel[app.status] || app.status}</span></p>
          </div>
          <button className="modal__x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal__body">
          {form?.steps.filter((s) => s.fields).map((s) => {
            const rows = fieldsFor(s, d).filter((f) => f.type !== "checkbox" && !empty(d[f.name]));
            if (!rows.length) return null;
            return (
              <div key={s.title} className="apply__block">
                <div className="apply__block-head"><h3>{s.title}</h3></div>
                <dl>{rows.map((f) => <div key={f.name}><dt>{f.label}</dt><dd>{String(d[f.name])}</dd></div>)}</dl>
              </div>
            );
          })}

          {form && (
            <div className="apply__block">
              <div className="apply__block-head"><h3>Documents</h3></div>
              <ul className="docview">
                {docsFor(form, d).map((x) => {
                  const path = d.documents?.[x.key];
                  return (
                    <li key={x.key}>
                      <span>{x.label}{x.optional && <small> (optional)</small>}</span>
                      {path
                        ? <button className="btn btn--outline btn--small" onClick={() => viewDoc(path)}>View</button>
                        : <span className={x.optional ? "docview__none" : "docview__missing"}>Not uploaded</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {canDecide && (
            <div className="modal__decide">
              <label htmlFor="note">Note to the applicant <small>(required for “more info” and “reject”)</small></label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Your licence photo is blurry. Please upload a clearer one." />
              {err && <p className="auth-error" role="alert">{err}</p>}
              <div className="modal__actions">
                <button className="btn btn--primary" disabled={Boolean(busy)} onClick={() => decide("approved")}>{busy === "approved" ? "Saving…" : "Approve"}</button>
                {app.role === "driver" && <button className="btn btn--outline" disabled={Boolean(busy)} onClick={() => decide("provisional")}>{busy === "provisional" ? "Saving…" : "Approve provisionally"}</button>}
                <button className="btn btn--outline" disabled={Boolean(busy)} onClick={() => decide("more_info_required")}>{busy === "more_info_required" ? "Saving…" : "Request more info"}</button>
                <button className="btn btn--danger" disabled={Boolean(busy)} onClick={() => decide("rejected")}>{busy === "rejected" ? "Saving…" : "Reject"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
