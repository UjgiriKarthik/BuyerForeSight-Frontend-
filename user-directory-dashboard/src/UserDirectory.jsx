import { useState, useEffect, useCallback } from "react";

const SORT_FIELDS = { NAME: "name", COMPANY: "company" };
const SORT_DIRS = { ASC: "asc", DESC: "desc" };

const glassStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(12px)",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #070b14;
    --surface: #0d1626;
    --accent: #00e5ff;
    --accent2: #7b61ff;
    --accent3: #ff6b6b;
    --text: #e8edf5;
    --muted: #64748b;
    --border: rgba(255,255,255,0.08);
    --glow: 0 0 40px rgba(0,229,255,0.15);
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; }

  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(0,229,255,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(123,97,255,0.10) 0%, transparent 60%);
    position: relative;
    overflow-x: hidden;
  }

  .grid-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 1; }

  /* HEADER */
  .header {
    padding: 48px 0 40px;
    border-bottom: 1px solid var(--border);
  }
  .header-inner { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 24px; }
  .header-left {}
  .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--accent); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--accent); }
  .header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 5vw, 52px); font-weight: 800; line-height: 1.05;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #e8edf5 0%, #94a3b8 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .header-stat { text-align: right; }
  .stat-number {
    font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800;
    color: var(--accent); line-height: 1;
  }
  .stat-label { font-size: 11px; letter-spacing: 0.1em; color: var(--muted); margin-top: 4px; }

  /* CONTROLS */
  .controls { padding: 28px 0; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }

  .search-wrap { flex: 1; min-width: 240px; position: relative; }
  .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 14px; pointer-events: none; }
  .search-input {
    width: 100%; padding: 13px 16px 13px 44px;
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text);
    font-family: 'DM Mono', monospace; font-size: 13px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder { color: var(--muted); }
  .search-input:focus { border-color: rgba(0,229,255,0.4); box-shadow: 0 0 0 3px rgba(0,229,255,0.07); }

  .sort-group { display: flex; gap: 8px; align-items: center; }
  .sort-label { font-size: 11px; letter-spacing: 0.1em; color: var(--muted); white-space: nowrap; }
  .sort-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: 8px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    color: var(--muted); font-family: 'DM Mono', monospace; font-size: 12px;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .sort-btn:hover { border-color: rgba(0,229,255,0.3); color: var(--text); }
  .sort-btn.active {
    border-color: var(--accent); color: var(--accent);
    background: rgba(0,229,255,0.06); box-shadow: 0 0 16px rgba(0,229,255,0.1);
  }
  .sort-arrow { font-size: 10px; }

  /* TABLE */
  .table-wrap {
    border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
    background: rgba(255,255,255,0.02);
  }
  .table-header {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 2fr 80px;
    padding: 14px 24px;
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid var(--border);
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted);
  }

  .user-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 2fr 80px;
    padding: 18px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    transition: background 0.18s;
    align-items: center;
    animation: fadeSlideIn 0.4s ease both;
  }
  .user-row:last-child { border-bottom: none; }
  .user-row:hover { background: rgba(0,229,255,0.04); }
  .user-row:hover .row-arrow { opacity: 1; transform: translateX(0); }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .user-name-cell { display: flex; align-items: center; gap: 12px; }
  .avatar {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px;
    flex-shrink: 0;
  }
  .user-name { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; color: var(--text); }
  .cell-email { font-size: 12px; color: var(--muted); }
  .cell-phone { font-size: 12px; color: #94a3b8; }
  .company-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; color: #94a3b8;
  }
  .company-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .row-arrow {
    font-size: 16px; color: var(--accent);
    opacity: 0; transform: translateX(-4px);
    transition: all 0.2s; text-align: right;
  }

  .empty-state {
    padding: 80px 24px; text-align: center; color: var(--muted);
    font-family: 'Syne', sans-serif;
  }
  .empty-state .big { font-size: 48px; margin-bottom: 12px; }
  .empty-state p { font-size: 14px; }

  .loading-state {
    padding: 80px; display: flex; justify-content: center; align-items: center; gap: 12px;
    color: var(--muted); font-size: 13px;
  }
  .loader {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid rgba(0,229,255,0.2); border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DETAIL PAGE ── */
  .detail-page { padding: 48px 0 80px; }
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px;
    border: 1px solid var(--border); background: rgba(255,255,255,0.03);
    color: var(--muted); font-family: 'DM Mono', monospace; font-size: 12px;
    cursor: pointer; transition: all 0.2s; margin-bottom: 40px;
  }
  .back-btn:hover { border-color: var(--accent); color: var(--accent); }

  .detail-hero {
    display: grid; grid-template-columns: auto 1fr; gap: 32px;
    align-items: center; margin-bottom: 48px; flex-wrap: wrap;
  }
  .detail-avatar {
    width: 88px; height: 88px; border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px;
  }
  .detail-name {
    font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 44px);
    font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(135deg, #e8edf5, #94a3b8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .detail-username { font-size: 13px; color: var(--accent); margin-top: 6px; letter-spacing: 0.05em; }

  .detail-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;
  }
  .detail-card {
    border: 1px solid var(--border); border-radius: 14px;
    padding: 24px; background: rgba(255,255,255,0.025);
    transition: border-color 0.2s;
    animation: fadeSlideIn 0.4s ease both;
  }
  .detail-card:hover { border-color: rgba(0,229,255,0.2); }
  .card-section-title {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent);
    margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
  }
  .card-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(0,229,255,0.15); }
  .detail-field { margin-bottom: 16px; }
  .detail-field:last-child { margin-bottom: 0; }
  .field-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
  .field-value { font-size: 14px; color: var(--text); }
  .field-value a { color: var(--accent); text-decoration: none; }
  .field-value a:hover { text-decoration: underline; }

  .tag {
    display: inline-block; padding: 4px 10px; border-radius: 5px;
    font-size: 11px; font-family: 'DM Mono', monospace;
    background: rgba(123,97,255,0.15); border: 1px solid rgba(123,97,255,0.3);
    color: #a78bfa;
  }

  @media (max-width: 700px) {
    .table-header { display: none; }
    .user-row {
      grid-template-columns: 1fr;
      gap: 4px; padding: 16px;
    }
    .row-arrow { display: none; }
    .detail-hero { grid-template-columns: 1fr; }
  }
`;

// Color palette for avatars
const AVATAR_COLORS = [
  ["rgba(0,229,255,0.15)", "#00e5ff"],
  ["rgba(123,97,255,0.15)", "#a78bfa"],
  ["rgba(255,107,107,0.15)", "#ff6b6b"],
  ["rgba(52,211,153,0.15)", "#34d399"],
  ["rgba(251,191,36,0.15)", "#fbbf24"],
  ["rgba(249,115,22,0.15)", "#f97316"],
];
const COMPANY_DOTS = ["#00e5ff","#a78bfa","#ff6b6b","#34d399","#fbbf24","#f97316","#60a5fa","#f472b6","#a3e635","#fb7185"];

function getInitials(name) {
  return name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase();
}

// ─── DETAIL PAGE ───────────────────────────────────────────────────────────
function DetailPage({ user, onBack }) {
  const [bg, fg] = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
  return (
    <div className="detail-page">
      <div className="container">
        <button className="back-btn" onClick={onBack}>← Back to Directory</button>
        <div className="detail-hero">
          <div className="detail-avatar" style={{ background: bg, color: fg }}>
            {getInitials(user.name)}
          </div>
          <div>
            <div className="detail-name">{user.name}</div>
            <div className="detail-username">@{user.username}</div>
          </div>
        </div>

        <div className="detail-grid">
          {/* Contact */}
          <div className="detail-card" style={{ animationDelay: "0ms" }}>
            <div className="card-section-title">Contact</div>
            <div className="detail-field">
              <div className="field-label">Email</div>
              <div className="field-value"><a href={`mailto:${user.email}`}>{user.email}</a></div>
            </div>
            <div className="detail-field">
              <div className="field-label">Phone</div>
              <div className="field-value">{user.phone}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Website</div>
              <div className="field-value"><a href={`https://${user.website}`} target="_blank" rel="noreferrer">{user.website}</a></div>
            </div>
          </div>

          {/* Address */}
          <div className="detail-card" style={{ animationDelay: "60ms" }}>
            <div className="card-section-title">Address</div>
            <div className="detail-field">
              <div className="field-label">Street</div>
              <div className="field-value">{user.address.street}, {user.address.suite}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">City</div>
              <div className="field-value">{user.address.city} {user.address.zipcode}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Coordinates</div>
              <div className="field-value" style={{ fontSize: 12, color: "var(--muted)" }}>
                {user.address.geo.lat}, {user.address.geo.lng}
              </div>
            </div>
          </div>

          {/* Company */}
          <div className="detail-card" style={{ animationDelay: "120ms" }}>
            <div className="card-section-title">Company</div>
            <div className="detail-field">
              <div className="field-label">Name</div>
              <div className="field-value" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{user.company.name}</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Catchphrase</div>
              <div className="field-value" style={{ fontStyle: "italic", color: "var(--muted)", fontSize: 13 }}>"{user.company.catchPhrase}"</div>
            </div>
            <div className="detail-field">
              <div className="field-label">Business</div>
              <div className="field-value"><span className="tag">{user.company.bs}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(SORT_FIELDS.NAME);
  const [sortDir, setSortDir] = useState(SORT_DIRS.ASC);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => { setError("Failed to load users."); setLoading(false); });
  }, []);

  const toggleSort = useCallback((field) => {
    if (sortField === field) setSortDir(d => d === SORT_DIRS.ASC ? SORT_DIRS.DESC : SORT_DIRS.ASC);
    else { setSortField(field); setSortDir(SORT_DIRS.ASC); }
  }, [sortField]);

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const va = sortField === SORT_FIELDS.NAME ? a.name : a.company.name;
      const vb = sortField === SORT_FIELDS.NAME ? b.name : b.company.name;
      return sortDir === SORT_DIRS.ASC ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  if (selected) return (
    <div className="app">
      <style>{styles}</style>
      <div className="grid-overlay" />
      <DetailPage user={selected} onBack={() => setSelected(null)} />
    </div>
  );

  return (
    <div className="app">
      <style>{styles}</style>
      <div className="grid-overlay" />

      {/* HEADER */}
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <div className="header-left">
                       
              <div className="eyebrow">BuyerForeSight User Record</div>
              
            </div>
            <div className="header-stat">
              <div className="stat-label">RECORDS FOUND</div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTROLS */}
      <div className="container">
        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="sort-group">
            <span className="sort-label">SORT</span>
            <button
              className={`sort-btn ${sortField === SORT_FIELDS.NAME ? "active" : ""}`}
              onClick={() => toggleSort(SORT_FIELDS.NAME)}
            >
              Name
              <span className="sort-arrow">
                {sortField === SORT_FIELDS.NAME ? (sortDir === SORT_DIRS.ASC ? "↑" : "↓") : "↕"}
              </span>
            </button>
            <button
              className={`sort-btn ${sortField === SORT_FIELDS.COMPANY ? "active" : ""}`}
              onClick={() => toggleSort(SORT_FIELDS.COMPANY)}
            >
              Company
              <span className="sort-arrow">
                {sortField === SORT_FIELDS.COMPANY ? (sortDir === SORT_DIRS.ASC ? "↑" : "↓") : "↕"}
              </span>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-wrap">
          <div className="table-header">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Company</span>
            <span></span>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loader" />
              Fetching users...
            </div>
          )}

          {error && (
            <div className="empty-state">
              <div className="big">⚠</div>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <div className="big">∅</div>
              <p>No users match your search.</p>
            </div>
          )}

          {!loading && filtered.map((user, i) => {
            const [bg, fg] = AVATAR_COLORS[user.id % AVATAR_COLORS.length];
            const dot = COMPANY_DOTS[user.id % COMPANY_DOTS.length];
            return (
              <div
                key={user.id}
                className="user-row"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => setSelected(user)}
              >
                <div className="user-name-cell">
                  <div className="avatar" style={{ background: bg, color: fg }}>
                    {getInitials(user.name)}
                  </div>
                  <span className="user-name">{user.name}</span>
                </div>
                <span className="cell-email">{user.email}</span>
                <span className="cell-phone">{user.phone}</span>
                <span className="company-badge">
                  <span className="company-dot" style={{ background: dot }} />
                  {user.company.name}
                </span>
                <span className="row-arrow">→</span>
              </div>
            );
          })}
        </div>

        <div style={{ paddingBottom: 64 }} />
      </div>
    </div>
  );
}
