import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./Admin.css";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [session, setSession] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [plots, setPlots] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const emptyForm = { plot_code: "", name: "", location: "", area_sqft: "", price: "", status: "Available", description: "", cover_image_url: "" };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    let active = true;
    const verifyAdmin = async (currentSession) => {
      if (!currentSession) {
        if (active) { setSession(null); setAuthorized(false); }
        return;
      }
      const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", currentSession.user.id).maybeSingle();
      if (!active) return;
      if (error || !data) {
        setMessage("This email is not authorized for the admin portal. Sign in with the authorized admin email.");
        await supabase.auth.signOut();
        setSession(null);
        setAuthorized(false);
      } else {
        setSession(currentSession);
        setAuthorized(true);
        setMessage("");
      }
    };
    supabase.auth.getSession().then(({ data }) => verifyAdmin(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => verifyAdmin(nextSession), 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (authorized) loadPlots(); }, [authorized]);

  async function sendCode(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setBusy(false);
    if (error) setMessage(error.message);
    else { setCodeSent(true); setMessage("Email sent. Enter the verification code from the email. If you receive only a link, the Supabase email template needs to be configured to show the token."); }
  }
  async function verifyCode(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false); if (error) setMessage(error.message);
  }
  async function loadPlots() {
    const { data, error } = await supabase.from("plots").select("*").order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setPlots(data || []);
  }
  function changeField(event) { setForm((old) => ({ ...old, [event.target.name]: event.target.value })); }
  function resetForm() { setEditingId(null); setForm(emptyForm); }
  function editPlot(plot) {
    setEditingId(plot.id);
    setForm({ plot_code: plot.plot_code || "", name: plot.name || "", location: plot.location || "", area_sqft: plot.area_sqft ?? "", price: plot.price ?? "", status: plot.status || "Available", description: plot.description || "", cover_image_url: plot.cover_image_url || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function savePlot(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const record = { plot_code: form.plot_code.trim(), name: form.name.trim(), location: form.location.trim(), area_sqft: form.area_sqft === "" ? null : Number(form.area_sqft), price: form.price === "" ? null : Number(form.price), status: form.status, description: form.description.trim(), cover_image_url: form.cover_image_url.trim() || null, updated_at: new Date().toISOString() };
    const { error } = editingId ? await supabase.from("plots").update(record).eq("id", editingId) : await supabase.from("plots").insert(record);
    setBusy(false);
    if (error) setMessage(error.message); else { setMessage(editingId ? "Plot updated." : "Plot added."); resetForm(); await loadPlots(); }
  }
  async function deletePlot(plot) {
    if (!window.confirm(`Delete ${plot.plot_code} — ${plot.name}?`)) return;
    setBusy(true); const { error } = await supabase.from("plots").delete().eq("id", plot.id); setBusy(false);
    if (error) setMessage(error.message); else { setMessage("Plot deleted."); await loadPlots(); }
  }
  async function logout() { await supabase.auth.signOut(); setSession(null); setAuthorized(false); setCodeSent(false); setCode(""); }

  if (!authorized || !session) return <main className="admin-page"><section className="admin-login"><a className="admin-back" href="/">← Back to website</a><div className="admin-mark">A</div><p className="admin-eyebrow">AUREVIA PROPERTIES</p><h1>Admin <span>Portal</span></h1><p className="admin-muted">Secure access to property listings.</p>{!codeSent ? <form className="admin-form" onSubmit={sendCode}><label htmlFor="admin-email">Authorized admin email</label><input id="admin-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter admin email"/><button disabled={busy}>{busy ? "Sending..." : "Send email code →"}</button></form> : <form className="admin-form" onSubmit={verifyCode}><label htmlFor="admin-code">Verification code</label><input id="admin-code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code from email"/><button disabled={busy}>{busy ? "Verifying..." : "Verify and sign in →"}</button><button type="button" className="admin-secondary" onClick={() => { setCodeSent(false); setCode(""); setMessage(""); }}>Use another email</button></form>}{message && <p className="admin-message">{message}</p>}<p className="admin-muted admin-footnote">Only accounts assigned an admin role can manage listings.</p></section></main>;

  return <main className="admin-dashboard"><header className="admin-topbar"><a href="/" className="admin-brand">AUREVIA <span>PROPERTIES</span></a><button className="admin-secondary" onClick={logout}>Sign out</button></header><section className="admin-content"><p className="admin-eyebrow">PROPERTY MANAGEMENT</p><h1>Admin <span>Dashboard</span></h1><p className="admin-muted">Add, edit and manage database listings.</p>{message && <p className="admin-message">{message}</p>}
    <form className="admin-panel" onSubmit={savePlot}><h2>{editingId ? "Edit plot" : "Add a plot"}</h2><div className="admin-fields"><label>Plot code<input name="plot_code" required value={form.plot_code} onChange={changeField} placeholder="AV-007"/></label><label>Plot name<input name="name" required value={form.name} onChange={changeField} placeholder="Residential plot"/></label><label>Location<input name="location" value={form.location} onChange={changeField} placeholder="Area / city"/></label><label>Area (sq. ft.)<input name="area_sqft" type="number" min="0" step="0.01" value={form.area_sqft} onChange={changeField}/></label><label>Price (₹)<input name="price" type="number" min="0" step="1" value={form.price} onChange={changeField}/></label><label>Status<select name="status" value={form.status} onChange={changeField}><option>Available</option><option>Reserved</option><option>Sold</option></select></label><label className="admin-full">Cover image URL<input name="cover_image_url" type="url" value={form.cover_image_url} onChange={changeField} placeholder="https://..."/></label><label className="admin-full">Description<textarea name="description" rows="3" value={form.description} onChange={changeField}/></label></div><div className="admin-actions"><button disabled={busy}>{busy ? "Saving..." : editingId ? "Save changes" : "Add plot"}</button>{editingId && <button type="button" className="admin-secondary" onClick={resetForm}>Cancel</button>}</div></form>
    <section className="admin-panel"><div className="admin-list-heading"><h2>Property listings ({plots.length})</h2><button type="button" className="admin-secondary" onClick={loadPlots}>Refresh</button></div>{plots.length === 0 && <p className="admin-muted">No plots found.</p>}{plots.map((plot) => <article className="admin-plot" key={plot.id}><div><strong>{plot.plot_code} · {plot.name}</strong><p>{plot.location || "Location not specified"} · {plot.status}</p><small>{plot.price == null ? "Price not set" : `₹${Number(plot.price).toLocaleString("en-IN")}`}</small></div><div className="admin-actions"><button type="button" className="admin-secondary" onClick={() => editPlot(plot)}>Edit</button><button type="button" className="admin-danger" disabled={busy} onClick={() => deletePlot(plot)}>Delete</button></div></article>)}</section></section></main>;
}
