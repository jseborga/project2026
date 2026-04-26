// resources.jsx — Resource allocation heatmap view

function ResourcesView({ tweaks }) {
  const projectStart = parseDate(PROJECT.start);
  const projectEnd = addDays(parseDate(PROJECT.end), 5);
  const totalDays = daysBetween(projectStart, projectEnd);

  // Build a per-day load map per resource based on TASKS (excluding milestones)
  // Assume each task assignee works 6h/day on that task. If a resource has 2 overlapping tasks → 12h/day → overload.
  const loadMap = {};
  RESOURCES.forEach((r) => { loadMap[r.id] = new Array(totalDays).fill(0); });
  TASKS.forEach((t) => {
    if (t.milestone || !t.assignee) return;
    const s = daysBetween(projectStart, parseDate(t.start));
    const e = daysBetween(projectStart, parseDate(t.end));
    for (let i = s; i <= e; i++) {
      const d = addDays(projectStart, i);
      if (isWeekend(d)) continue;
      if (loadMap[t.assignee]) loadMap[t.assignee][i] += 6;
    }
  });

  // Aggregate by week for the heatmap
  const weeks = [];
  let cur = startOfWeek(projectStart);
  while (cur <= projectEnd) {
    const start = cur;
    const end = addDays(cur, 6);
    weeks.push({ start, end, label: getISOWeek(cur) });
    cur = addDays(cur, 7);
  }
  function getISOWeek(d) {
    const t = new Date(d.valueOf());
    t.setDate(t.getDate() + 4 - (t.getDay() || 7));
    const yearStart = new Date(t.getFullYear(), 0, 1);
    return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  }

  const weeklyLoad = {};
  RESOURCES.forEach((r) => {
    weeklyLoad[r.id] = weeks.map((w) => {
      let h = 0;
      const startIdx = Math.max(0, daysBetween(projectStart, w.start));
      const endIdx = Math.min(totalDays - 1, daysBetween(projectStart, w.end));
      for (let i = startIdx; i <= endIdx; i++) h += loadMap[r.id][i] || 0;
      return h; // total hours that week (capacity = 5 days * 8 = 40)
    });
  });

  // Selected week → drilldown
  const [selWeek, setSelWeek] = React.useState(weeks.findIndex((w) => w.start <= parseDate("2026-04-22") && parseDate("2026-04-22") <= w.end));

  const cellW = 26;
  const labelW = 220;

  const loadColor = (h) => {
    const ratio = h / 40;
    if (h === 0) return "var(--surface-1)";
    if (ratio < 0.4) return "rgba(82, 130, 76, 0.35)";
    if (ratio < 0.75) return "rgba(82, 130, 76, 0.7)";
    if (ratio < 1.0) return "rgba(176, 124, 36, 0.75)";
    if (ratio < 1.25) return "rgba(184, 92, 56, 0.75)";
    return "rgba(184, 92, 56, 1)";
  };

  // Resource summary stats
  const totals = RESOURCES.map((r) => {
    const hours = weeklyLoad[r.id].reduce((a, b) => a + b, 0);
    const overloaded = weeklyLoad[r.id].filter((h) => h > 40).length;
    const cost = hours * r.rate;
    return { ...r, hours, overloaded, cost };
  });

  const todayWeek = weeks.findIndex((w) => w.start <= parseDate("2026-04-22") && parseDate("2026-04-22") <= w.end);

  return (
    <div className="resources-wrap">
      <div className="res-summary-grid">
        <div className="kpi">
          <div className="kpi-label">Equipo asignado</div>
          <div className="kpi-value">{RESOURCES.length}<span className="kpi-unit">personas</span></div>
          <div className="kpi-sub">Capacidad: {RESOURCES.length * 40} h/sem</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sobreasignación</div>
          <div className="kpi-value" style={{ color: "var(--accent-fg)" }}>3<span className="kpi-unit">recursos</span></div>
          <div className="kpi-sub">Semana 16 — atención requerida</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Utilización media</div>
          <div className="kpi-value">74<span className="kpi-unit">%</span></div>
          <div className="kpi-sub">Objetivo 80% · margen 6 pp</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Costo de recursos · acumulado</div>
          <div className="kpi-value mono">{fmtMoney(totals.reduce((s,t) => s + t.cost, 0))}</div>
          <div className="kpi-sub">Sobre presupuesto: {fmtMoney(PROJECT.budget)}</div>
        </div>
      </div>

      <div className="card heatmap-card">
        <header className="card-hd">
          <div>
            <h3 className="card-title">Carga semanal del equipo</h3>
            <div className="card-sub">Horas asignadas por semana · capacidad 40h. Click en una celda para ver detalle.</div>
          </div>
          <div className="heatmap-legend">
            <span>Carga</span>
            {[0, 16, 28, 36, 44, 52].map((h) => (
              <span key={h} className="heat-sw" style={{ background: loadColor(h) }} />
            ))}
            <span style={{ color: "var(--ink-3)" }}>0 → 50+ h</span>
          </div>
        </header>

        <div className="heatmap-scroll">
          <div className="heatmap" style={{ minWidth: labelW + weeks.length * cellW }}>
            {/* Header row */}
            <div className="hm-row hm-header">
              <div className="hm-label-cell" style={{ width: labelW }}>Recurso · rol</div>
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className={"hm-cell hm-week-label" + (i === todayWeek ? " today" : "")}
                  style={{ width: cellW }}
                  title={fmtDateLong(w.start)}
                >
                  {w.label}
                </div>
              ))}
            </div>

            {/* Resource rows */}
            {RESOURCES.map((r) => (
              <div key={r.id} className="hm-row">
                <div className="hm-label-cell" style={{ width: labelW }}>
                  <Avatar id={r.id} size={26} />
                  <div style={{ minWidth: 0 }}>
                    <div className="hm-name">{r.name}</div>
                    <div className="hm-role">{r.role}</div>
                  </div>
                </div>
                {weeks.map((w, i) => {
                  const h = weeklyLoad[r.id][i];
                  const isSel = selWeek === i;
                  return (
                    <button
                      key={i}
                      className={"hm-cell" + (isSel ? " selected" : "")}
                      style={{ width: cellW, background: loadColor(h) }}
                      onClick={() => setSelWeek(i)}
                      title={`${r.name} · S${w.label} · ${h}h`}
                    >
                      {h > 0 && cellW >= 26 && <span className="hm-cell-h">{h}</span>}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Total row */}
            <div className="hm-row hm-total">
              <div className="hm-label-cell" style={{ width: labelW }}>
                <strong>Total equipo</strong>
              </div>
              {weeks.map((w, i) => {
                const total = RESOURCES.reduce((s, r) => s + weeklyLoad[r.id][i], 0);
                return (
                  <div key={i} className="hm-cell hm-total-cell mono" style={{ width: cellW }}>
                    {total > 0 ? total : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drilldown */}
      {selWeek != null && selWeek >= 0 && (
        <div className="card week-drilldown">
          <header className="card-hd">
            <div>
              <h3 className="card-title">Detalle semana {weeks[selWeek].label} · {fmtDateLong(weeks[selWeek].start)} — {fmtDateLong(weeks[selWeek].end)}</h3>
              <div className="card-sub">Tareas activas y carga por persona</div>
            </div>
          </header>
          <div className="card-body padded">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th>Tareas activas</th>
                  <th style={{ textAlign: "right" }}>Horas</th>
                  <th style={{ textAlign: "right" }}>Capacidad</th>
                  <th style={{ width: 180 }}>Utilización</th>
                  <th style={{ textAlign: "right" }}>Costo sem.</th>
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((r) => {
                  const h = weeklyLoad[r.id][selWeek];
                  const ratio = h / 40;
                  const activeTasks = TASKS.filter((t) => {
                    if (t.assignee !== r.id || t.milestone) return false;
                    const ts = parseDate(t.start), te = parseDate(t.end);
                    return ts <= weeks[selWeek].end && te >= weeks[selWeek].start;
                  });
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar id={r.id} size={22} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="task-chips">
                          {activeTasks.length === 0 && <span style={{ color: "var(--ink-3)" }}>Sin tareas</span>}
                          {activeTasks.map((t) => (
                            <span key={t.id} className="task-chip" style={{ borderColor: PHASE_COLORS[t.phase] + "55" }}>
                              <span className="mono" style={{ color: "var(--ink-3)" }}>{t.id}</span> {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="mono" style={{ textAlign: "right" }}>{h}h</td>
                      <td className="mono" style={{ textAlign: "right", color: "var(--ink-3)" }}>40h</td>
                      <td>
                        <div className="util-bar">
                          <div
                            className="util-fill"
                            style={{
                              width: Math.min(ratio * 100, 100) + "%",
                              background: ratio > 1 ? PHASE_COLORS["Go-live"] : ratio > 0.9 ? "#b07c24" : "#52824c",
                            }}
                          />
                          {ratio > 1 && (
                            <div className="util-overflow" style={{ width: Math.min((ratio - 1) * 100, 30) + "%" }} />
                          )}
                        </div>
                        <div className="mono" style={{ fontSize: 11, marginTop: 3, color: ratio > 1 ? "var(--accent-fg)" : "var(--ink-3)" }}>
                          {Math.round(ratio * 100)}%
                          {ratio > 1 && " · sobreasignado"}
                        </div>
                      </td>
                      <td className="mono" style={{ textAlign: "right" }}>{fmtMoney(h * r.rate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ResourcesView });
