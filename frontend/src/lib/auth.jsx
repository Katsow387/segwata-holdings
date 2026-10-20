import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

export const APPLICANT_ROLES = ["merchant", "supplier", "driver"];
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

/** Where should this person be right now? One place decides, so login, signup and guards all agree. */
export function destinationFor(profile, application) {
  if (!profile) return "/login";
  const role = profile.role;
  if (role === "admin") return "/sgt-go/admin";
  if (!APPLICANT_ROLES.includes(role)) return "/sgt-go";
  const s = application?.status;
  if (s === "approved" || (s === "provisional" && role === "driver")) return `/sgt-go/${role}`;
  if (!application || s === "draft" || s === "more_info_required") return "/sgt-go/apply";
  return "/sgt-go/status"; // pending_review, rejected
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [data, setData] = useState({ uid: null, profile: null, application: null });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: d }) => { setSession(d.session); setSessionReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user?.id ?? null;

  const load = useCallback(async (id) => {
    // Google sign-up remembers the chosen role in localStorage; apply it once.
    const pending = localStorage.getItem("sgtgo.pendingRole");
    if (pending) {
      localStorage.removeItem("sgtgo.pendingRole");
      await supabase.rpc("set_my_role", { p_role: pending });
    }
    const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", id).maybeSingle();
    let application = null;
    if (profile && APPLICANT_ROLES.includes(profile.role)) {
      const res = await supabase.from("applications").select("*").eq("user_id", id).maybeSingle();
      application = res.data ?? null;
    }
    setData({ uid: id, profile, application });
  }, []);

  useEffect(() => {
    if (!supabase || !uid) return;
    load(uid);
  }, [uid, load]);

  const refreshApplication = useCallback(async () => {
    if (supabase && uid) await load(uid);
  }, [uid, load]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setData({ uid: null, profile: null, application: null });
  }, []);

  const loading = !sessionReady || (Boolean(uid) && data.uid !== uid);
  const value = useMemo(
    () => ({
      session, loading, signOut, refreshApplication,
      profile: uid && data.uid === uid ? data.profile : null,
      application: uid && data.uid === uid ? data.application : null,
    }),
    [session, loading, data, uid, signOut, refreshApplication]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
