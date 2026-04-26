// system.jsx — Shared design system, helpers, icons, and chrome (sidebar, topbar)

// ── Date helpers ────────────────────────────────────────────────────────────
const DAY_MS = 86400000;
const parseDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const fmtDate = (d) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};
const fmtDateLong = (d) => {
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
const daysBetween = (a, b) => Math.round((b - a) / DAY_MS);
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
const isoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const startOfWeek = (d) => {
  const r = new Date(d);
  const dow = (r.getDay() + 6) % 7; // Mon=0
  r.setDate(r.getDate() - dow);
  return r;
};

const fmtMoney = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// ── Icons (stroke icons, single-line only) ──────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const paths = {
    gantt: <><rect x="3" y="5" width="9" height="2.5" rx="1" /><rect x="6" y="9" width="11" height="2.5" rx="1" /><rect x="4" y="13" width="7" height="2.5" rx="1" /><rect x="9" y="17" width="9" height="2.5" rx="1" /></>,
    users: <><circle cx="8" cy="8" r="3" fill="none" stroke={color} strokeWidth="1.5" /><path d="M2.5 18c.8-2.7 3-4 5.5-4s4.7 1.3 5.5 4" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><circle cx="15.5" cy="9" r="2.2" fill="none" stroke={color} strokeWidth="1.5" /><path d="M14 14.2c1.5-.2 4 .5 4.5 3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    chart: <><path d="M3 17V5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M3 17h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M6 14V9M10 14V6M14 14v-4" stroke={color} strokeWidth="2" strokeLinecap="round" /></>,
    inbox: <><path d="M3 11l2-6h10l2 6" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M3 11h4l1 2h4l1-2h4v5H3z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></>,
    home: <><path d="M3 9l7-5 7 5v8a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></>,
    search: <><circle cx="9" cy="9" r="5" fill="none" stroke={color} strokeWidth="1.5" /><path d="M13 13l3.5 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    bell: <><path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 17a2 2 0 004 0" fill="none" stroke={color} strokeWidth="1.5" /></>,
    plus: <><path d="M10 4v12M4 10h12" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></>,
    chevronR: <path d="M7 4l5 6-5 6" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
    chevronD: <path d="M4 7l6 5 6-5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
    filter: <><path d="M3 5h14l-5 6v5l-4-2v-3z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></>,
    diamond: <path d="M10 3l6 7-6 7-6-7z" fill={color} />,
    check: <path d="M4 10l4 4 8-8" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    clock: <><circle cx="10" cy="10" r="6.5" fill="none" stroke={color} strokeWidth="1.5" /><path d="M10 6v4l3 2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    warning: <><path d="M10 3l8 14H2z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 8v4M10 14v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    arrowR: <path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
    download: <><path d="M10 3v10M5 9l5 5 5-5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 17h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    settings: <><circle cx="10" cy="10" r="2.5" fill="none" stroke={color} strokeWidth="1.5" /><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.6 5.6l1.4 1.4M13 13l1.4 1.4M5.6 14.4L7 13M13 7l1.4-1.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    dot: <circle cx="10" cy="10" r="3" fill={color} />,
    flag: <><path d="M5 3v14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M5 4h9l-2 3 2 3H5" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></>,
    expand: <><path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
    list: <><path d="M3 5h14M3 10h14M3 15h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    package: <><path d="M10 2L3 6v8l7 4 7-4V6z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M3 6l7 4 7-4M10 10v8" fill="none" stroke={color} strokeWidth="1.5" /></>,
    grid: <><rect x="3" y="3" width="6" height="6" fill="none" stroke={color} strokeWidth="1.5" /><rect x="11" y="3" width="6" height="6" fill="none" stroke={color} strokeWidth="1.5" /><rect x="3" y="11" width="6" height="6" fill="none" stroke={color} strokeWidth="1.5" /><rect x="11" y="11" width="6" height="6" fill="none" stroke={color} strokeWidth="1.5" /></>,
    alert: <><path d="M10 3l8 14H2z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 8v4M10 14v.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></>,
    x: <path d="M5 5l10 10M15 5L5 15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />,
    chevronRight: <path d="M7 4l5 6-5 6" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
    chevronDown: <path d="M4 7l6 5 6-5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: "block", flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

// ── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ id, size = 22 }) {
  const r = (window.RESOURCES || []).find((x) => x.id === id);
  if (!r) return <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--surface-2)" }} />;
  return (
    <div
      title={r.name}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: r.color,
        color: "#fff",
        fontSize: size * 0.42,
        fontWeight: 600,
        letterSpacing: "0.02em",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      {r.id}
    </div>
  );
}

// ── Status pill ─────────────────────────────────────────────────────────────
function Pill({ children, tone = "neutral", size = "sm" }) {
  const tones = {
    neutral: { bg: "var(--surface-2)", fg: "var(--ink-2)" },
    green:   { bg: "rgba(82, 130, 76, 0.14)", fg: "#3d6437" },
    amber:   { bg: "rgba(176, 124, 36, 0.16)", fg: "#7a541a" },
    red:     { bg: "rgba(176, 60, 60, 0.14)", fg: "#7c3030" },
    blue:    { bg: "rgba(58, 102, 138, 0.14)", fg: "#2c4f6b" },
    purple:  { bg: "rgba(106, 74, 122, 0.14)", fg: "#523a5e" },
    accent:  { bg: "var(--accent-bg)", fg: "var(--accent-fg)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: size === "xs" ? "1px 6px" : "2px 8px",
        borderRadius: 999,
        fontSize: size === "xs" ? 10 : 11,
        fontWeight: 500,
        background: t.bg,
        color: t.fg,
        whiteSpace: "nowrap",
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ view, onView }) {
  const items = [
    { id: "projects",  label: "Proyectos (Odoo)", icon: "package" },
    { id: "dashboard", label: "Resumen",   icon: "home" },
    { id: "gantt",     label: "Cronograma", icon: "gantt" },
    { id: "construction", label: "Construcción", icon: "package" },
    { id: "resources", label: "Recursos",   icon: "users" },
    { id: "reports",   label: "Reportes",   icon: "chart" },
    { id: "requests",  label: "Solicitudes", icon: "inbox", badge: 4 },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-mark">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="3" width="9" height="2" rx="1" fill="currentColor" />
            <rect x="4" y="7" width="11" height="2" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="2" y="11" width="7" height="2" rx="1" fill="currentColor" opacity="0.45" />
          </svg>
        </div>
        <div>
          <div className="sb-brand-name">Tramo</div>
          <div className="sb-brand-sub">PM · Odoo CE 18</div>
        </div>
      </div>

      <div className="sb-project">
        <div className="sb-project-code">{PROJECT.code}</div>
        <div className="sb-project-name">{PROJECT.name}</div>
        <div className="sb-project-meta">
          <Pill tone="amber" size="xs">● {PROJECT.status}</Pill>
          <span style={{ color: "var(--ink-3)", fontSize: 11 }}>{PROJECT.progress}%</span>
        </div>
      </div>

      <nav className="sb-nav">
        {items.map((it) => (
          <button
            key={it.id}
            className={"sb-link" + (view === it.id ? " active" : "")}
            onClick={() => onView(it.id)}
          >
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
            {it.badge ? <span className="sb-badge">{it.badge}</span> : null}
          </button>
        ))}
      </nav>

      <div className="sb-section-label">Mis proyectos</div>
      <nav className="sb-nav sb-nav-sub">
        <button className="sb-link sub">
          <span className="sb-dot" style={{ background: "#b85c38" }} />
          <span>Implementación Andina</span>
        </button>
        <button className="sb-link sub">
          <span className="sb-dot" style={{ background: "#3a7a8a" }} />
          <span>Migración Odoo · Tovar</span>
        </button>
        <button className="sb-link sub">
          <span className="sb-dot" style={{ background: "#5a6e3a" }} />
          <span>Soporte L2 · Mar del Plata</span>
        </button>
      </nav>

      <div className="sb-bottom">
        <div className="sb-user">
          <Avatar id="LF" size={28} />
          <div style={{ minWidth: 0 }}>
            <div className="sb-user-name">Lucía Fernández</div>
            <div className="sb-user-role">PM · Grupo Andina</div>
          </div>
          <button className="sb-icon-btn" title="Ajustes"><Icon name="settings" size={14} /></button>
        </div>
      </div>
    </aside>
  );
}

// ── Topbar ──────────────────────────────────────────────────────────────────
function Topbar({ title, subtitle, children }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="crumbs">
          <span>Proyectos</span>
          <Icon name="chevronR" size={11} color="var(--ink-3)" />
          <span>{PROJECT.client}</span>
          <Icon name="chevronR" size={11} color="var(--ink-3)" />
          <span style={{ color: "var(--ink-1)" }}>{title}</span>
        </div>
        <h1 className="page-title">{subtitle || title}</h1>
      </div>
      <div className="topbar-right">
        <div className="search-input">
          <Icon name="search" size={14} color="var(--ink-3)" />
          <input placeholder="Buscar tarea, recurso o solicitud…" />
          <kbd>⌘K</kbd>
        </div>
        <button className="icon-btn" title="Notificaciones">
          <Icon name="bell" size={15} />
          <span className="dot-badge" />
        </button>
        {children}
      </div>
    </header>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────
function Card({ title, subtitle, action, children, padded = true, style }) {
  return (
    <section className="card" style={style}>
      {(title || action) && (
        <header className="card-hd">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <div className="card-sub">{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "card-body padded" : "card-body"}>{children}</div>
    </section>
  );
}

Object.assign(window, {
  // helpers
  parseDate, fmtDate, fmtDateLong, daysBetween, addDays, isWeekend, isoDate, startOfWeek,
  fmtMoney, DAY_MS,
  // components
  Icon, Avatar, Pill, Sidebar, Topbar, Card,
});
