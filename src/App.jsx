import { useState, useEffect, useRef, useCallback } from "react";

/* ---------- helpers ---------- */
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const PAGES = [
  { id: "home", label: "Home / Dashboard" },
  { id: "focus", label: "Focus Guard" },
  { id: "vent", label: "Anonymous Vent Space" },
  { id: "counsel", label: "Campus Counseling" },
];
const DURATIONS = { focus: 1500, break: 300, demo: 10 };
const SEED = [
  { t: "CS Senior", x: "FYP deadline and three quizzes in the same week. I haven’t slept properly in days.", h: 12, ago: "2h ago" },
  { t: "CS Sophomore", x: "Data Structures felt impossible today. Everyone else seems to get it instantly.", h: 21, ago: "5h ago" },
  { t: "CS Freshman", x: "Spent till 3am watching reels again and missed my morning lab. Feeling guilty.", h: 34, ago: "1d ago" },
];
const BAD = /\b(idiot|stupid|hate you|kill you)\b/i;
const PII = /(\d{5}[-\s]?\d{7}|\b\d{2}[a-z]{2,3}\d{2,4}\b|@\w+\.\w+|\b0?3\d{2}[-\s]?\d{7}\b|\bmy name is\b)/i;
const CRISIS = /(suicide|kill myself|end it all|self[- ]harm|want to die)/i;

/* ---------- app ---------- */
export default function App() {
  const [page, setPage] = useState(() => {
    const h = window.location.hash.slice(1);
    return PAGES.some((p) => p.id === h) ? h : "home";
  });
  const [bw, setBw] = useState(false);
  const [stats, setStats] = useState(() => load("mp_stats", { pts: 0, streak: 0, sess: 0, last: "" }));
  const [modal, setModal] = useState(null); // "direct" | "emerg" | null
  const [toast, setToast] = useState("");

  const showToast = useCallback((t) => { setToast(t); setTimeout(() => setToast(""), 2400); }, []);

  const go = (p) => {
    setPage(p);
    window.history.replaceState(null, "", "#" + p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1);
      if (PAGES.some((p) => p.id === h)) setPage(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => { document.documentElement.classList.toggle("bw", bw); }, [bw]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const awardBreak = () => {
    setStats((s) => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 864e5).toDateString();
      let streak = s.streak, last = s.last;
      if (s.last !== today) { streak = s.last === yesterday ? s.streak + 1 : 1; last = today; }
      const n = { pts: s.pts + 10, sess: s.sess + 1, streak, last };
      save("mp_stats", n);
      return n;
    });
    showToast("+10 Focus Points 🌱");
  };

  return (
    <div className="mp">
      <style>{CSS}</style>
      {bw && <div className="sleepbar">🌙 B&amp;W Sleep Mode is on — colour cues are removed to help you wind down.</div>}

      <nav>
        <div className="wrap bar">
          <div className="brand">Mind<b>Pulse</b> CS<small>GUTECH Al-Ghazali University</small></div>
          <div className="tabs">
            {PAGES.map((p) => (
              <button key={p.id} className={"tab" + (page === p.id ? " on" : "")} onClick={() => go(p.id)}>{p.label}</button>
            ))}
          </div>
          <div className="tools">
            <span className="pill">CS Student Protocol Active</span>
            <button className="bwbtn" aria-pressed={bw} onClick={() => setBw((v) => !v)}>
              {bw ? "● B&W Sleep: ON" : "◐ B&W Sleep Mode"}
            </button>
          </div>
        </div>
      </nav>

      <main className="wrap">
        <div className="page" key={page}>
          {page === "home" && <Home stats={stats} go={go} />}
          {page === "focus" && <Focus onBreakDone={awardBreak} stats={stats} />}
          {page === "vent" && <Vent openEmergency={() => setModal("emerg")} toast={showToast} />}
          {page === "counsel" && <Counsel open={setModal} />}
        </div>

        <div className="safe">
          <h2>✅ Safety-by-Design Verification</h2>
          <ul>
            <li><b>Zero PII collection:</b> no names, student IDs, emails or device identifiers.</li>
            <li><b>No faculty or parent dashboards:</b> nobody can view your usage or posts.</li>
            <li><b>Non-coercive UI:</b> no lockouts, guilt messages or public leaderboards.</li>
          </ul>
        </div>
      </main>

      <footer><div className="wrap">Design Thinking Midterm Project | Fall 2026 | Dr. Rauf Ahmed Shams Malick</div></footer>

      {modal === "direct" && <DirectModal close={() => setModal(null)} />}
      {modal === "emerg" && <EmergModal close={() => setModal(null)} />}
      <div className={"toast" + (toast ? " on" : "")}>{toast}</div>
    </div>
  );
}

/* ---------- Page 1 ---------- */
function Home({ stats, go }) {
  return (
    <section>
      <div className="hero">
        <h1>Your mind has a pulse. <span className="em">Let’s protect it.</span></h1>
        <p style={{ color: "#cbd5e1", maxWidth: 640 }}>A calm, private companion for CS students: gentle focus breaks, a safe place to vent, and a one-tap path to real support.</p>
        <div className="stats">
          <div className="stat"><b>{stats.streak}</b><span>🔥 Focus Streak (days)</span></div>
          <div className="stat"><b>{stats.pts}</b><span>🌱 Total Focus Points</span></div>
          <div className="stat"><b>{stats.sess}</b><span>⏱️ Breaks completed</span></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Why MindPulse exists</h2>
        <p><b className="tx">Late-night doomscrolling</b> steals sleep and GPA. <b className="tx">Counseling stigma</b> keeps students from asking for help. <b className="tx">Burnout and isolation</b> build during exams with no safe outlet.</p>
        <p style={{ margin: 0 }}>Our approach is <b className="em">non-punitive</b>: no lockouts, no scores shared with anyone, no shame. Just nudges you control.</p>
      </div>
      <div className="grid">
        <button className="card short" onClick={() => go("focus")}><div className="ic">🎯</div><h3>Focus Guard</h3><p>Pomodoro timer with rewarding disengagement breaks.</p></button>
        <button className="card short" onClick={() => go("vent")}><div className="ic">💬</div><h3>Anonymous Vent Space</h3><p>Share stress with peers. No names, no IDs.</p></button>
        <button className="card short" onClick={() => go("counsel")}><div className="ic">🤝</div><h3>Campus Counseling</h3><p>One tap to confidential support.</p></button>
      </div>
    </section>
  );
}

/* ---------- Page 2 ---------- */
const CIRC = 2 * Math.PI * 108;
function Focus({ onBreakDone, stats }) {
  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [msg, setMsg] = useState("Ready when you are. No pressure.");
  const [last, setLast] = useState("");
  const doneRef = useRef(false);

  const switchMode = (m, message) => {
    setRunning(false); setStarted(false); setMode(m); setLeft(DURATIONS[m]); doneRef.current = false;
    setMsg(message || (m === "focus" ? "Ready when you are. No pressure." : "Step away from the screen. This break is yours."));
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left > 0 || !running || doneRef.current) return;
    doneRef.current = true;
    if (mode === "focus") {
      switchMode("break", "Great work. Start your break to earn points.");
    } else {
      onBreakDone();
      setLast("🌱 +10 Focus Points earned for taking a real break.");
      switchMode("focus", "Break complete. Nicely done!");
    }
    // eslint-disable-next-line
  }, [left, running]);

  useEffect(() => {
    const m = String(Math.floor(left / 60)).padStart(2, "0"), s = String(left % 60).padStart(2, "0");
    document.title = running ? `${m}:${s} · MindPulse CS` : "MindPulse CS — GUTECH Al-Ghazali University";
    return () => { document.title = "MindPulse CS — GUTECH Al-Ghazali University"; };
  }, [left, running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");

  return (
    <section>
      <h1>Focus Guard</h1>
      <p>Work in focused sprints, then take a real break away from the screen. Finish a break to earn <b className="em">Focus Points 🌱</b>.</p>
      <div className="two">
        <div className="card timer">
          <div className="modes">
            {[["focus", "Focus 25:00"], ["break", "Break 05:00"], ["demo", "Demo break 0:10"]].map(([k, l]) => (
              <button key={k} className={"mode" + (mode === k ? " on" : "")} onClick={() => switchMode(k)}>{l}</button>
            ))}
          </div>
          <div className="ring">
            <svg width="240" height="240" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="108" fill="none" stroke="#334155" strokeWidth="10" />
              <circle cx="120" cy="120" r="108" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - left / DURATIONS[mode])} style={{ transition: "stroke-dashoffset .9s linear" }} />
            </svg>
            <div className="t">{mm}:{ss}</div>
          </div>
          <p style={{ minHeight: "3em" }}>{msg}</p>
          <div className="row">
            <button className="btn" disabled={running} onClick={() => {
              setRunning(true); setStarted(true);
              setMsg(mode === "focus" ? "Deep work. Phone face-down. You’ve got this." : "Stretch, hydrate, look away from screens.");
            }}>{started ? "Resume" : "Start"}</button>
            <button className="btn sky" disabled={!running} onClick={() => { setRunning(false); setMsg("Paused. Come back whenever you’re ready."); }}>Pause</button>
            <button className="btn ghost" onClick={() => switchMode(mode)}>Reset</button>
          </div>
        </div>
        <div className="card">
          <h2>Soft nudges, not lockouts</h2>
          <p>MindPulse never blocks your apps or phone. We suggest; you decide.</p>
          <h3 style={{ marginTop: 14 }}>Try during a break</h3>
          <p>💧 Drink water · 🚶 Walk to the corridor · 👀 Look at something 6 metres away for 20 seconds · 🌬️ Breathe in 4, out 6.</p>
          <h3 style={{ marginTop: 14 }}>After midnight?</h3>
          <p>Switch on <b>B&amp;W Sleep Mode</b> in the top bar. Grey screens are far less tempting than colourful reels.</p>
          <div className="note">{last} {stats.pts > 0 && `Total: ${stats.pts}`}</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page 3 ---------- */
function Vent({ openEmergency, toast }) {
  const [posts, setPosts] = useState(() => load("mp_posts", SEED));
  const [tag, setTag] = useState("CS Senior");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const persist = (p) => { setPosts(p); save("mp_posts", p); };

  const submit = () => {
    const x = text.trim(); setErr("");
    if (x.length < 10) return setErr("Please write at least a short sentence.");
    if (CRISIS.test(x)) { setErr("What you wrote sounds serious. Please reach out for support right now."); return openEmergency(); }
    if (PII.test(x)) return setErr("Looks like personal info (name, ID, email or phone). Please remove it to stay anonymous.");
    if (BAD.test(x)) return setErr("Moderation: please keep this space kind and respectful.");
    persist([{ t: tag, x, h: 0, ago: "just now" }, ...posts].slice(0, 30));
    setText(""); toast("Posted anonymously 🛡️");
  };

  const support = (i) => {
    if (posts[i].done) return;
    persist(posts.map((p, j) => (j === i ? { ...p, h: p.h + 1, done: true } : p)));
  };

  return (
    <section>
      <h1>Anonymous Peer Vent Space</h1>
      <span className="badge">🛡️ 100% Anonymous — Zero Identity &amp; PII Logging</span>
      <div className="two">
        <div className="card">
          <h3>Share what’s weighing on you</h3>
          <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Your year">
            <option>CS Freshman</option><option>CS Sophomore</option><option>CS Junior</option><option>CS Senior</option>
          </select>
          <textarea value={text} maxLength={400} onChange={(e) => setText(e.target.value)} style={{ marginTop: 10 }}
            placeholder="Deadlines, exams, a bug that won’t die… say it here." />
          <div className="note" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Moderated: personal details and abusive text are blocked.</span><span>{text.length}/400</span>
          </div>
          <div className="err">{err}</div>
          <button className="btn" onClick={submit}>Post anonymously</button>
        </div>
        <div className="card">
          <h3>Live peer feed</h3>
          <div style={{ maxHeight: 480, overflow: "auto" }}>
            {posts.map((p, i) => (
              <div className="post" key={i}>
                <div className="m"><span className="tag">{p.t}</span><span>{p.ago}</span></div>
                <div>{p.x}</div>
                <button className={"heart" + (p.done ? " done" : "")} onClick={() => support(i)}>💚 {p.h} support</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page 4 ---------- */
function Counsel({ open }) {
  return (
    <section>
      <h1>1-Tap Confidential Counselor Portal</h1>
      <p>Reaching out is a strength. These triggers keep <b className="tx">no activity logs</b> in this app.</p>
      <div className="grid">
        <div className="card"><div style={{ fontSize: "1.8rem" }}>📞</div><h3>Counselor Direct Line</h3><p>Connect with Al-Ghazali Campus Counseling discreetly.</p>
          <button className="btn" onClick={() => open("direct")}>1-Tap Counselor Direct Line</button></div>
        <div className="card" style={{ borderColor: "var(--danger)" }}><div style={{ fontSize: "1.8rem" }}>🚨</div><h3>Emergency Distress Protocol</h3><p>If you feel unsafe or in crisis, get help now.</p>
          <button className="btn red" onClick={() => open("emerg")}>Emergency Distress Protocol</button></div>
      </div>
    </section>
  );
}

/* ---------- Modals ---------- */
function Modal({ close, danger, children }) {
  return (
    <div className="modal on" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className={"box" + (danger ? " em" : "")}>{children}</div>
    </div>
  );
}
function DirectModal({ close }) {
  const [sent, setSent] = useState(false);
  return (
    <Modal close={close}>
      <h2>📞 Counselor Direct Line</h2>
      <p>Al-Ghazali Campus Counseling · confidential, judgment-free.</p>
      <div className="card" style={{ background: "var(--card2)", marginBottom: 12 }}>
        <b>Direct line:</b> <span style={{ color: "var(--sky)" }}>Demo number — replace with official counseling extension</span><br />
        <span className="note">Prototype note: connect this to the real university contact before deployment.</span>
      </div>
      <p>Tap below to simulate a discreet callback request. Nothing is stored.</p>
      {sent && <div className="err" style={{ color: "var(--em)" }}>✓ Request noted for this session only. No log, name or ID was saved.</div>}
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <button className="btn" onClick={() => setSent(true)}>Request a discreet callback</button>
        <button className="btn ghost" onClick={close}>Close</button>
      </div>
    </Modal>
  );
}
function EmergModal({ close }) {
  return (
    <Modal close={close} danger>
      <h2>🚨 Emergency Distress Protocol</h2>
      <p>You are not alone. If you may harm yourself or are in immediate danger, call now:</p>
      <a className="hot" href="tel:0800-HEAL-NOW">Hotline: 0800-HEAL-NOW</a>
      <p>While you call: sit down, breathe in for 4 and out for 6, and tell someone nearby you trust. If you are in danger, contact campus security or local emergency services.</p>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <a className="btn red" href="tel:0800-HEAL-NOW" style={{ textDecoration: "none" }}>Call now</a>
        <button className="btn ghost" onClick={close}>Close</button>
      </div>
    </Modal>
  );
}

/* ---------- styles ---------- */
const CSS = `
:root{--bg:#0f172a;--card:#1e293b;--card2:#162033;--line:#334155;--text:#e2e8f0;--mute:#94a3b8;--em:#10b981;--sky:#38bdf8;--danger:#f43f5e;color-scheme:dark}
html{transition:filter .4s}html.bw{filter:grayscale(1) contrast(1.05)}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--bg)}
.mp{background:var(--bg);color:var(--text);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;min-height:100vh}
.mp button{font:inherit;cursor:pointer}
.em{color:var(--em)}.tx{color:var(--text)}
.wrap{max-width:1080px;margin:0 auto;padding:0 16px}
nav{position:sticky;top:0;z-index:20;background:rgba(15,23,42,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding:10px 16px}
.brand{font-weight:800;font-size:1.05rem}.brand b{color:var(--em)}.brand small{display:block;font-weight:500;color:var(--mute);font-size:.72rem}
.tabs{display:flex;gap:4px;flex-wrap:wrap;flex:1}
.tab{background:none;border:0;color:var(--mute);padding:8px 12px;border-radius:8px;font-weight:600;font-size:.9rem}
.tab:hover{color:var(--text);background:var(--card)}.tab.on{color:var(--bg);background:var(--sky)}
.tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.pill{font-size:.72rem;padding:4px 10px;border-radius:99px;border:1px solid var(--em);color:var(--em);white-space:nowrap}
.bwbtn{background:#fff;color:#000;border:2px solid #000;border-radius:8px;padding:6px 12px;font-weight:700;font-size:.8rem}
.bwbtn[aria-pressed=true]{background:#000;color:#fff;border-color:#fff}
.page{padding:28px 0 12px;animation:in .35s ease}
@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.mp h1{font-size:clamp(1.6rem,4vw,2.4rem);line-height:1.15;margin:0 0 8px}.mp h2{margin:0 0 6px;font-size:1.4rem}.mp h3{margin:0 0 6px;font-size:1.05rem}
.mp p{margin:0 0 10px;color:var(--mute)}
.hero{background:linear-gradient(135deg,#0b3b3a,#0c4a6e 70%,#1e293b);border:1px solid var(--line);border-radius:18px;padding:28px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:18px}
.stat{background:rgba(15,23,42,.55);border-radius:12px;padding:14px}.stat b{display:block;font-size:2rem;color:var(--em)}.stat span{color:var(--mute);font-size:.85rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.short{text-align:left;color:var(--text);transition:.2s}.short:hover{border-color:var(--sky);transform:translateY(-3px)}.short .ic{font-size:1.6rem}
.btn{background:var(--em);color:#04210f;border:0;border-radius:10px;padding:10px 18px;font-weight:700;display:inline-block}.btn:hover{filter:brightness(1.1)}
.btn.sky{background:var(--sky);color:#06293a}.btn.ghost{background:none;color:var(--text);border:1px solid var(--line)}.btn.red{background:var(--danger);color:#fff}
.btn:disabled{opacity:.5;cursor:not-allowed}
.timer{text-align:center;padding:26px}
.ring{width:240px;height:240px;margin:6px auto 14px;position:relative}
.ring svg{transform:rotate(-90deg)}.ring .t{position:absolute;inset:0;display:grid;place-items:center;font-size:3rem;font-weight:800;font-variant-numeric:tabular-nums}
.modes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}
.mode{background:var(--card2);border:1px solid var(--line);color:var(--mute);border-radius:99px;padding:6px 14px;font-size:.85rem}.mode.on{border-color:var(--em);color:var(--em)}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
textarea,select{width:100%;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit}
textarea{min-height:110px;resize:vertical}
.badge{display:inline-block;background:rgba(16,185,129,.12);border:1px solid var(--em);color:var(--em);padding:6px 12px;border-radius:10px;font-weight:700;font-size:.85rem;margin-bottom:12px}
.post{border-left:3px solid var(--sky);background:var(--card2);padding:12px 14px;border-radius:0 10px 10px 0;margin-bottom:10px}
.post .m{display:flex;justify-content:space-between;gap:8px;font-size:.78rem;color:var(--mute);margin-bottom:4px}
.tag{color:var(--sky);font-weight:700}
.heart{background:none;border:1px solid var(--line);color:var(--text);border-radius:99px;padding:2px 10px;font-size:.8rem;margin-top:6px}.heart.done{border-color:var(--em);color:var(--em)}
.note{font-size:.8rem;color:var(--mute)}.err{color:var(--danger);font-size:.85rem;min-height:1.2em}
.safe{margin:30px 0 0;border:1px dashed var(--em);border-radius:14px;padding:20px;background:rgba(16,185,129,.05)}
.safe ul{margin:8px 0 0;padding-left:20px;color:var(--mute)}.safe li{margin:4px 0}
footer{margin-top:30px;border-top:1px solid var(--line);padding:20px 0 28px;text-align:center;color:var(--mute);font-size:.85rem}
.modal{position:fixed;inset:0;background:rgba(2,6,23,.8);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}
.box{background:var(--card);border:1px solid var(--line);border-radius:16px;max-width:460px;width:100%;padding:24px;animation:in .25s;max-height:90vh;overflow:auto}
.box.em{border-color:var(--danger)}.hot{font-size:1.8rem;font-weight:800;color:var(--danger);margin:8px 0;display:block;text-decoration:none}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(30px);background:var(--em);color:#04210f;padding:10px 18px;border-radius:99px;font-weight:700;opacity:0;transition:.3s;z-index:60;pointer-events:none}
.toast.on{opacity:1;transform:translateX(-50%)}
.sleepbar{background:#111827;color:var(--mute);text-align:center;font-size:.8rem;padding:6px}
`;
