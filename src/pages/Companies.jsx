import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Save, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import SetupBanner from "../components/SetupBanner.jsx";
import { useToast } from "../components/Toast.jsx";
import { supabase, friendlyError, isSupabaseConfigured } from "../supabaseClient.js";

export default function Companies() {
  const { showToast, ToastEl } = useToast();
  const [companies, setCompanies] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({ id: "", name: "", details: "" });
  const [formError, setFormError] = useState("");
  const [companyPreset, setCompanyPreset] = useState("");
  const editing = !!form.id;

  const loadCompanies = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    let query = supabase.from("companies").select("*").order("name");
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) { setErrorMsg(friendlyError(error)); setLoading(false); return; }
    setCompanies(data || []);

    const { data: recs } = await supabase.from("employee_records").select("company_id");
    const map = {};
    (recs || []).forEach((r) => { map[r.company_id] = (map[r.company_id] || 0) + 1; });
    setCounts(map);
    setLoading(false);
  }, [search]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);

  async function saveCompany(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Company name is required."); return; }
    setFormError("");

    let result;
    if (editing) {
      result = await supabase.from("companies").update({ name: form.name.trim(), details: form.details.trim() }).eq("id", form.id);
    } else {
      result = await supabase.from("companies").insert({ name: form.name.trim(), details: form.details.trim() });
    }

    if (result.error) { setFormError(friendlyError(result.error)); return; }

    showToast(editing ? "Company update ho gayi." : "Company add ho gayi.");
    setForm({ id: "", name: "", details: "" });
    setCompanyPreset("");
    loadCompanies();
  }

  function editCompany(c) {
    setForm({ id: c.id, name: c.name, details: c.details || "" });
    setCompanyPreset(c.name || "");
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleActive(c) {
    const { error } = await supabase.from("companies").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) { showToast(friendlyError(error), true); return; }
    showToast(!c.is_active ? "Company activate ho gayi." : "Company deactivate ho gayi.");
    loadCompanies();
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <SetupBanner errorMessage={errorMsg} />

        <div className="card">
          <h3 style={{ marginTop: 0 }}>{editing ? "Edit Company" : "Add Company"}</h3>
          <form onSubmit={saveCompany}>
            <div className="form-grid">
              <div><label>Quick Select</label>
                <select value={companyPreset} onChange={(e) => {
                  const value = e.target.value;
                  setCompanyPreset(value);
                  if (value) setForm((f) => ({ ...f, name: value }));
                }}>
                  <option value="">Custom company</option>
                  <option value="Revival">Revival</option>
                </select>
              </div>
              <div><label>Company Name *</label>
                <input type="text" value={form.name} onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  setCompanyPreset(e.target.value || "");
                }} required />
              </div>
              <div><label>Details / Notes</label>
                <input type="text" placeholder="Optional" value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} />
              </div>
            </div>
            {formError && <div className="error-text show">{formError}</div>}
            <div className="actions-row">
              <button type="submit" className="btn btn-primary"><Save size={15} /> {editing ? "Update Company" : "Add Company"}</button>
              {editing && (
                <button type="button" className="btn btn-secondary" onClick={() => { setForm({ id: "", name: "", details: "" }); setCompanyPreset(""); setFormError(""); }}>
                  <X size={15} /> Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>All Companies</h3>
          <div className="actions-row">
            <input type="text" placeholder="Search companies..." style={{ maxWidth: 280, marginBottom: 0 }}
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Details</th><th>Status</th><th>Records</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="empty-state">Loading...</td></tr>
                ) : companies.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state">Koi company nahi mili. Upar form se naya company add karein.</td></tr>
                ) : (
                  companies.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.details || "-"}</td>
                      <td><span className={`badge ${c.is_active ? "badge-active" : "badge-inactive"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                      <td><Link to={`/employees?company=${c.id}`}>{counts[c.id] || 0} records</Link></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => editCompany(c)}>Edit</button>{" "}
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(c)}>
                          {c.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {ToastEl}
    </>
  );
}
