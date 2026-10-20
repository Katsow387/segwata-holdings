import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({
  session: null, profile: null, application: null, loading: false,
  signOut: async () => {}, refreshApplication: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(undefined); // undefined = still loading
  const [loading, setLoading] = useState(Boolean(supabase));

  const readApplication = useCallback(async (userId) => {
    const { data } = await supabase.from("applications").select("*").eq("user_id", userId).maybeSingle();
    setApplication(data ?? null);
  }, []);

  const loadProfile = useCallback(async (user) => {
    if (!user) { setProfile(null); setApplication(null); return; }
    const read = () => supabase.from("profiles").select("*").eq("id", user.id).single();
    let { data } = await read();
    const pending = localStorage.getItem("sgtgo.pendingRole");
    if (data && !data.role_locked && pending) {
      await supabase.rpc("choose_role", { new_role: pending });
      localStorage.removeItem("sgtgo.pendingRole");
      ({ data } = await read());
    }
    await readApplication(user.id);
    setProfile(data);
  }, [readApplication]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession()
      .then(({ data }) => { setSession(data.session); return loadProfile(data.session?.user); })
      .finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => loadProfile(s?.user), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo(() => ({
    session, profile, application, loading,
    signOut: async () => { await supabase?.auth.signOut(); },
    refreshApplication: async () => { if (session) await readApplication(session.user.id); },
  }), [session, profile, application, loading, readApplication]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
