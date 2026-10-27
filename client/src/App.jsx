import { useState, useMemo, useEffect } from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SAMPLES = [
  "Waited 55 minutes past my appointment time and nobody said a word. Very disappointing.",
  "Lovely, caring team. The reception staff were so kind and helpful. Thank you!",
  "The online booking system kept timing out and I had to ring up anyway. Pretty annoying.",
];
const DEMO = [["positive","staff","low","Kind, caring clinic team"],["negative","wait_time","medium","Long unexplained wait"],["negative","booking","medium","Online booking system problems"],
  ["positive","staff","low","Thorough and friendly doctor"],["neutral","billing","medium","Unclear gap payment information"],["negative","staff","high","Concern about urgency handling at reception"],
  ["positive","cleanliness","low","Clean and tidy waiting room"],["negative","wait_time","medium","Long unexplained wait"],["positive","booking","low","Easy online booking"],
  ["negative","billing","medium","Unexpected fee at checkout"],["neutral","wait_time","low","Short delay, well explained"],["positive","staff","low","Kind, caring clinic team"]]
  .map(([sentiment,topic,urgency,key_issue],i)=>({sentiment,topic,urgency,key_issue,needs_human_review:urgency==="high",at:Date.now()-i*36e5}));

async function post(path, body) {
  const r = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Request failed. Is the server running?");
  return d;
}
const Badge = ({ k, v }) => <span className={`badge b-${k}`}>{String(v).replace("_", " ")}</span>;
function Copy({ text }) {
  const [ok, setOk] = useState(false);
  return <button className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>{ok ? "Copied ✓" : "Copy"}</button>;
}

function ReviewTab({ onSave }) {
  const [review, setReview] = useState(""); const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null); const [reply, setReply] = useState(""); const [err, setErr] = useState("");
  async function run() {
    setBusy(true); setErr(""); setRes(null);
    try { const d = await post("/api/analyze", { review }); setRes(d.result); setReply(d.result.draft_reply); onSave({ ...d.result, at: Date.now() }); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="grid fill">
      <div className="card">
        <h2>Review Replier</h2><p className="hint">Paste a patient review (fake or anonymised). The AI classifies it and drafts a reply for staff to approve.</p>
        <label htmlFor="rv">Patient review</label>
        <textarea id="rv" value={review} maxLength={2000} onChange={(e) => setReview(e.target.value)} placeholder="Paste a review here…" />
        <div className="row">{SAMPLES.map((s, i) => <span key={i} className="chip" onClick={() => setReview(s)}>Sample {i + 1}</span>)}</div>
        <div className="row"><button className="btn" disabled={busy || !review.trim()} onClick={run}>{busy && <span className="spin" />}{busy ? "Analysing…" : "Analyse review"}</button></div>
      </div>
      <div className="card">
        <h2>AI analysis</h2>
        {err && <div className="alert">{err}</div>}
        {!res && !err && <div className="empty"><b style={{ color: "var(--ink)" }}>Results will appear here</b><ol className="how"><li>Paste a review or pick a sample</li><li>AI scores sentiment, topic and urgency</li><li>Edit the draft reply and copy it</li></ol></div>}
        {res && <>
          <div className="row" style={{ marginTop: 8 }}><Badge k={res.sentiment} v={res.sentiment} /><Badge k="topic" v={res.topic} /><Badge k={res.urgency} v={`${res.urgency} urgency`} /></div>
          <p style={{ margin: "14px 0 4px", fontSize: 13, color: "var(--mut)" }}>Key issue</p><b>{res.key_issue}</b>
          {res.needs_human_review && <div className="alert" style={{ marginTop: 14 }}>⚠ Needs staff review before any reply is published.</div>}
          <label htmlFor="rp">Draft reply (editable)</label>
          <textarea id="rp" style={{ minHeight: 120 }} value={reply} onChange={(e) => setReply(e.target.value)} />
          <div className="row"><Copy text={reply} /></div>
        </>}
      </div>
    </div>
  );
}

function RecallTab() {
  const [f, setF] = useState({ name: "", reason: "Flu vaccination", channel: "sms", tone: "friendly" });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function run() { setBusy(true); setErr(""); setMsg(""); try { setMsg((await post("/api/recall", f)).message); } catch (e) { setErr(e.message); } finally { setBusy(false); } }
  return (
    <div className="grid fill">
      <div className="card">
        <h2>Recall Messages</h2><p className="hint">Generate a friendly reminder. Use a fake first name only. Never enter real patient details.</p>
        <label>First name (fake)</label><input value={f.name} maxLength={40} onChange={set("name")} placeholder="e.g. Sam" />
        <label>Reason</label>
        <select value={f.reason} onChange={set("reason")}>{["Flu vaccination", "General check-up", "Health assessment", "Follow-up appointment", "Cervical screening reminder"].map((r) => <option key={r}>{r}</option>)}</select>
        <div className="grid" style={{ gap: 12 }}>
          <div><label>Channel</label><select value={f.channel} onChange={set("channel")}><option value="sms">SMS</option><option value="email">Email</option></select></div>
          <div><label>Tone</label><select value={f.tone} onChange={set("tone")}><option value="friendly">Friendly</option><option value="formal">Formal</option></select></div>
        </div>
        <div className="row"><button className="btn" disabled={busy || !f.name.trim()} onClick={run}>{busy && <span className="spin" />}{busy ? "Writing…" : "Generate message"}</button></div>
      </div>
      <div className="card">
        <h2>Message</h2>
        {err && <div className="alert">{err}</div>}
        {!msg && !err && <div className="empty">Your message will appear here.</div>}
        {msg && <><textarea style={{ minHeight: 200, marginTop: 10 }} value={msg} onChange={(e) => setMsg(e.target.value)} /><div className="row"><Copy text={msg} /><span className="hint" style={{ margin: 0 }}>{msg.length} characters</span></div></>}
      </div>
    </div>
  );
}

const COL = { positive: "#16a34a", neutral: "#94a3b8", negative: "#dc2626" };
function Insights({ items, onDemo, onClear }) {
  const d = useMemo(() => {
    const cnt = (k) => items.reduce((a, i) => ((a[i[k]] = (a[i[k]] || 0) + 1), a), {});
    const issues = Object.entries(cnt("key_issue")).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { s: cnt("sentiment"), t: Object.entries(cnt("topic")).sort((a, b) => b[1] - a[1]), issues, high: items.filter((i) => i.urgency === "high").length, rev: items.filter((i) => i.needs_human_review).length };
  }, [items]);
  const n = items.length; const C = 2 * Math.PI * 40; let off = 0;
  if (!n) return <div className="card empty"><h2>No data yet</h2><p>Analyse a review, or load demo data to see the dashboard.</p><button className="btn" onClick={onDemo}>Load demo data</button></div>;
  return (<>
    <div className="stats">
      {[["Reviews analysed", n], ["Positive", Math.round(((d.s.positive || 0) / n) * 100) + "%"], ["High urgency", d.high], ["Need staff review", d.rev]].map(([l, v]) => <div key={l} className="card stat"><b>{v}</b><span>{l}</span></div>)}
    </div>
    <div className="grid">
      <div className="card"><h3>Sentiment</h3><div className="donut">
        <svg width="140" height="140" viewBox="0 0 100 100"><g transform="rotate(-90 50 50)">{["positive", "neutral", "negative"].map((k) => { const len = ((d.s[k] || 0) / n) * C; const el = <circle key={k} cx="50" cy="50" r="40" fill="none" stroke={COL[k]} strokeWidth="16" shapeRendering="geometricPrecision" strokeDasharray={`${len ? Math.min(len + 0.6, C - off) : 0} ${C}`} strokeDashoffset={-off} />; off += len; return el; })}</g></svg>
        <div className="leg">{["positive", "neutral", "negative"].map((k) => <p key={k}><span className="dot" style={{ background: COL[k] }} />{k}: <b>{d.s[k] || 0}</b></p>)}</div></div></div>
      <div className="card"><h3>Topics patients mention</h3>{d.t.map(([k, v]) => <div className="bar" key={k}><span>{k.replace("_", " ")}</span><div><i style={{ width: `${(v / d.t[0][1]) * 100}%` }} /></div><b>{v}</b></div>)}</div>
      <div className="card" style={{ gridColumn: "1/-1" }}><h3>Most common issues</h3>{d.issues.map(([k, v]) => <div className="hist" key={k}><span>{k}</span><b>{v}×</b></div>)}
        <div className="row"><button className="btn ghost sm" onClick={onDemo}>Load demo data</button><button className="btn ghost sm" onClick={onClear}>Clear all</button></div></div>
    </div></>);
}

export default function App() {
  const [tab, setTab] = useState("review");
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem("cp_items")) || []; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem("cp_items", JSON.stringify(items)); } catch {} }, [items]);
  const tabs = [["review", "Review Replier"], ["recall", "Recall Messages"], ["insights", "Insights"]];
  return (<>
    <header><div className="wrap topbar">
      <div className="logo"><i>✚</i>ClinicPulse</div>
      <nav>{tabs.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}{k === "insights" && items.length ? ` (${items.length})` : ""}</button>)}</nav>
      <span className="pill">Demo · fake data only</span>
    </div></header>
    <main className="wrap">
      {tab === "review" && <ReviewTab onSave={(r) => setItems((x) => [r, ...x])} />}
      {tab === "recall" && <RecallTab />}
      {tab === "insights" && <Insights items={items} onDemo={() => setItems(DEMO)} onClear={() => setItems([])} />}
    </main>
    <footer>All AI replies are drafts for staff approval. Not medical advice. Do not enter real patient information.</footer>
  </>);
}
