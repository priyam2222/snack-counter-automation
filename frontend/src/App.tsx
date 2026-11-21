
import { useEffect, useState } from "react";
import {
  LayoutDashboard, ClipboardList, Users, Building2, Plus,
  RefreshCw, CheckCircle2, Clock, ShoppingBag, Search,
  Menu, X, ArrowRight, Package
} from "lucide-react";
import "./index.css";

const API = "/api";

type Office = { id: string; name: string; country: string; currency: string };
type Volunteer = { id: string; name: string; email: string; officeId: string; isActive: boolean };
type Request = {
  id: string; officeId: string; reportedBy: string; description: string;
  status: string; claimedBy?: string | null; purchaseAmount?: number | string;
  receiptReference?: string; office?: Office; reporter?: Volunteer;
};

function App() {
  const [page, setPage] = useState("Dashboard");
  const [offices, setOffices] = useState<Office[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [officeId, setOfficeId] = useState("BLR");
  const [reportedBy, setReportedBy] = useState("VOL001");
  const [description, setDescription] = useState("");
  const [volunteerId, setVolunteerId] = useState("VOL002");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptReference, setReceiptReference] = useState("");

  async function api(path: string, options?: RequestInit) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
    return data;
  }

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [o, v, r] = await Promise.all([
        api("/offices"), api("/volunteers"), api("/refill-requests")
      ]);
      setOffices(Array.isArray(o) ? o : []);
      setVolunteers(Array.isArray(v) ? v : []);
      setRequests(Array.isArray(r) ? r : r.value || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to backend");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function runAction(action: () => Promise<unknown>) {
    try {
      setError("");
      await action();
      await loadData();
      alert("Action completed successfully!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  const openCount = requests.filter(r => r.status === "OPEN").length;
  const claimedCount = requests.filter(r => r.status === "CLAIMED").length;
  const reviewCount = requests.filter(r => r.status === "RECEIPT_SUBMITTED").length;
  const completedCount = requests.filter(r => r.status === "COMPLETED").length;
  const filtered = requests.filter(r =>
    `${r.id} ${r.description} ${r.status} ${r.office?.name || r.officeId}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const nav = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Requests", icon: ClipboardList },
    { name: "Volunteers", icon: Users },
    { name: "Offices", icon: Building2 },
    { name: "HR Review", icon: CheckCircle2 },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Package size={23} /></div>
          <div><strong>SnackFlow</strong><small>COUNTER AUTOMATION</small></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        {nav.map(item => (
          <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`}
            onClick={() => setPage(item.name)}>
            <item.icon size={19} /> {item.name}
          </button>
        ))}
        <div className="sidebar-bottom">
          <div className="user-avatar">SA</div>
          <div><strong>Project Admin</strong><small>Snack Operations</small></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / <strong>{page}</strong></div>
            <h1>{page === "Dashboard" ? "Good day! 👋" : page}</h1>
            <p className="subheading">Manage your office snack operations in one place.</p>
          </div>
          <button className="refresh-button" onClick={loadData}><RefreshCw size={16}/> Refresh</button>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {page === "Dashboard" && <>
          <section className="welcome-card">
            <div><span className="welcome-tag">SNACK OPERATIONS</span>
              <h2>Everything running smoothly?</h2>
              <p>Track refill requests, coordinate volunteers and manage reimbursements.</p>
              <button className="primary-button" onClick={() => setPage("Requests")}>Manage requests <ArrowRight size={16}/></button>
            </div>
            <div className="welcome-art"><Package size={88}/></div>
          </section>

          <div className="section-heading"><div><h2>Overview</h2><p>Live summary of your snack operations</p></div></div>
          <section className="stats-grid">
            <Stat title="Total Requests" value={requests.length} icon={<ClipboardList/>} color="blue"/>
            <Stat title="Open Requests" value={openCount} icon={<Clock/>} color="orange"/>
            <Stat title="In Progress" value={claimedCount} icon={<ShoppingBag/>} color="purple"/>
            <Stat title="Awaiting HR" value={reviewCount} icon={<CheckCircle2/>} color="green"/>
          </section>

          <section className="content-card">
            <div className="card-heading"><div><h2>Recent Requests</h2><p>Latest activity across offices</p></div>
              <button className="text-button" onClick={() => setPage("Requests")}>View all <ArrowRight size={15}/></button>
            </div>
            <RequestTable requests={requests.slice(0, 5)} />
          </section>
        </>}

        {page === "Requests" && <>
          <section className="content-card">
            <div className="card-heading"><div><h2>Create a refill request</h2><p>Report snacks or supplies that need replenishing.</p></div></div>
            <form className="request-form" onSubmit={e => {
              e.preventDefault();
              runAction(() => api("/refill-requests", {
                method: "POST", body: JSON.stringify({ officeId, reportedBy, description })
              }).then(result => { setDescription(""); return result; }));
            }}>
              <label>Office<select value={officeId} onChange={e => setOfficeId(e.target.value)}>
                {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select></label>
              <label>Reported by<select value={reportedBy} onChange={e => setReportedBy(e.target.value)}>
                {volunteers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select></label>
              <label className="full-width">What needs replenishing?
                <textarea required value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Example: Coffee, tea and biscuits are running low..." />
              </label>
              <button className="primary-button" type="submit"><Plus size={17}/> Create request</button>
            </form>
          </section>

          <section className="content-card">
            <div className="card-heading"><div><h2>All Requests</h2><p>{requests.length} requests recorded</p></div>
              <div className="search-box"><Search size={16}/><input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            </div>
            <RequestTable requests={filtered}/>
          </section>
        </>}

        {page === "Volunteers" && <section className="content-card">
          <div className="card-heading"><div><h2>Volunteer Directory</h2><p>People supporting snack operations</p></div></div>
          <div className="volunteer-grid">{volunteers.map(v => <div className="volunteer-card" key={v.id}>
            <div className="user-avatar">{v.name.split(" ").map(n => n[0]).join("").slice(0,2)}</div>
            <div><strong>{v.name}</strong><p>{v.email}</p><small>{offices.find(o => o.id === v.officeId)?.name || v.officeId}</small></div>
            <span className={`status ${v.isActive ? "completed" : "cancelled"}`}>{v.isActive ? "Active" : "Inactive"}</span>
          </div>)}</div>
        </section>}

        {page === "Offices" && <section className="content-card">
          <div className="card-heading"><div><h2>Office Directory</h2><p>Offices registered in the system</p></div></div>
          <div className="office-grid">{offices.map(o => <div className="office-card" key={o.id}>
            <Building2 size={25}/><h3>{o.name}</h3><p>{o.country}</p><span>{o.currency} · {o.id}</span>
            <small>{volunteers.filter(v => v.officeId === o.id).length} volunteers</small>
          </div>)}</div>
        </section>}

        {page === "HR Review" && <section className="content-card">
          <div className="card-heading"><div><h2>Reimbursement Review</h2><p>Review submitted receipts and record a decision.</p></div></div>
          {requests.filter(r => r.status === "RECEIPT_SUBMITTED").length === 0
            ? <div className="empty-state"><CheckCircle2 size={38}/><h3>No pending reviews</h3><p>Submitted receipts will appear here.</p></div>
            : requests.filter(r => r.status === "RECEIPT_SUBMITTED").map(r => <div className="review-row" key={r.id}>
              <div><strong>{r.description}</strong><p>{r.id} · {r.office?.name || r.officeId}</p>
                <small>Amount: {r.purchaseAmount ?? "Not supplied"} · Receipt: {r.receiptReference || "—"}</small></div>
              <div className="action-group">
                <button className="approve-button" onClick={() => runAction(() => api(`/refill-requests/${r.id}/hr-review`, {method:"POST",body:JSON.stringify({approved:true,remarks:"Approved"})}))}>Approve</button>
                <button className="reject-button" onClick={() => runAction(() => api(`/refill-requests/${r.id}/hr-review`, {method:"POST",body:JSON.stringify({approved:false,remarks:"Rejected"})}))}>Reject</button>
              </div>
            </div>)}
        </section>}

        {(page === "Requests" || page === "Dashboard") && requests.length > 0 && (
          <section className="content-card workflow-card">
            <div className="card-heading"><div><h2>Volunteer Actions</h2><p>Claim requests and submit purchase information</p></div></div>
            <div className="request-form">
              <label>Request<select value={selectedRequest} onChange={e => setSelectedRequest(e.target.value)}>
                <option value="">Select a request</option>
                {requests.map(r => <option key={r.id} value={r.id}>{r.id} — {r.description.slice(0,45)}</option>)}
              </select></label>
              <label>Volunteer<select value={volunteerId} onChange={e => setVolunteerId(e.target.value)}>
                {volunteers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select></label>
              <label>Purchase amount<input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 1250"/></label>
              <label>Receipt reference<input value={receiptReference} onChange={e => setReceiptReference(e.target.value)} placeholder="Receipt number"/></label>
              <div className="action-group full-width">
                <button className="primary-button" disabled={!selectedRequest} onClick={() => runAction(() => api(`/refill-requests/${selectedRequest}/claim`, {method:"POST",body:JSON.stringify({volunteerId})}))}>Claim request</button>
                <button className="secondary-button" disabled={!selectedRequest || !amount || !receiptReference} onClick={() => runAction(() => api(`/refill-requests/${selectedRequest}/purchase`, {method:"POST",body:JSON.stringify({volunteerId,amount:Number(amount),receiptReference})}))}>Submit purchase</button>
                <button className="secondary-button" disabled={!selectedRequest} onClick={() => runAction(() => api(`/refill-requests/${selectedRequest}/receipt`, {method:"POST",body:JSON.stringify({volunteerId})}))}>Submit receipt</button>
              </div>
            </div>
          </section>
        )}
        <footer>SnackFlow · Snack Counter Automation · MVP</footer>
      </main>
    </div>
  );
}

function Stat({title,value,icon,color}:{title:string;value:number;icon:React.ReactNode;color:string}) {
  return <div className="stat-card"><div><span>{title}</span><strong>{value}</strong></div><div className={`stat-icon ${color}`}>{icon}</div></div>;
}

function RequestTable({requests}:{requests:Request[]}) {
  if (!requests.length) return <div className="empty-state"><ClipboardList size={34}/><h3>No requests yet</h3><p>Create a refill request to get started.</p></div>;
  return <div className="table-wrap"><table><thead><tr><th>Request</th><th>Office</th><th>Reported by</th><th>Status</th></tr></thead>
    <tbody>{requests.map(r=><tr key={r.id}><td><strong>{r.description}</strong><small>{r.id}</small></td>
      <td>{r.office?.name || r.officeId}</td><td>{r.reporter?.name || r.reportedBy}</td>
      <td><span className={`status ${r.status.toLowerCase()}`}>{r.status.replaceAll("_"," ")}</span></td></tr>)}</tbody></table></div>;
}

export default App;
