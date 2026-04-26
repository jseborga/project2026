// dashboard.jsx — Project overview / health dashboard

function DashboardView({ tweaks }) {
  const totalSpent = COST_BREAKDOWN.reduce((s, c) => s + c.spent, 0);
  const totalBudget = COST_BREAKDOWN.reduce((s, c) => s + c.budget, 0);
  const tasksDone = TASKS.filter((t) => t.progress >= 100 && !t.milestone).length;
  const tasksTotal = TASKS.filter((t) => !t.milestone).length;
  const milestonesNext = TASKS.filter((t) => t.milestone && t.progress < 100)[0];

  const today = parseDate("2026-04-22");
  const projectEnd = parseDate(PROJECT.end);
  const daysToEnd = daysBetween(today, projectEnd);

  // Latest weekly point with actual data
  const latestActual = [...PROGRESS_WEEKLY].reverse().find((w) => w.actual != null);
  const latestPlanned = PROGRESS_WEEKLY.find((w) => w.week === latestActual.week);
  const drift = latestActual.actual - latestPlanned.planned;

  return (
    <div className="dash-wrap">
      <div className="dash-banner">
        <div>
          <div className="dash-banner-label">Estado general</div>
          <div className="dash-banner-status">
            <span className="dot-amber" />
            En curso · con desviación moderada
          </div>
        </div>
        <div className="dash-banner-stat">
          <div className="dash-banner-label">Avance global</div>
          <div className="big-number">{PROJECT.progress}<span className="big-unit">%</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>vs. {latestPlanned.planned}% planificado</div>
        </div>
        <div className="dash-banner-stat">
          <div className="dash-banner-label">Días al cierre</div>
          <div className="big-number">{daysToEnd}<span className="big-unit">d</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Cierre: {fmtDateLong(projectEnd)}</div>
        </div>
        <div className="dash-banner-stat">
          <div className="dash-banner-label">Presupuesto consumido</div>
          <div className="big-number mono">{Math.round((totalSpent / totalBudget) * 100)}<span className="big-unit">%</span></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{fmtMoney(totalSpent)} / {fmtMoney(totalBudget)}</div>
        </div>
        <div className="dash-banner-stat">
          <div className="dash-banner-label">Próximo hito</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>
            {milestonesNext.name}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {fmtDateLong(parseDate(milestonesNext.start))} · en {daysBetween(today, parseDate(milestonesNext.start))} días
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Burnup chart */}
        <Card title="Avance acumulado · planificado vs. real" subtitle="Curva S — semanas 2 a 14" style={{ gridColumn: "span 8" }}>
          <BurnupChart />
        </Card>

        {/* Drift KPI */}
        <Card title="Desviación" subtitle="Real vs. plan · semana 11" style={{ gridColumn: "span 4" }}>
          <div className="drift-vis">
            <div className="drift-num" style={{ color: drift < 0 ? PHASE_COLORS["Go-live"] : "#3d6437" }}>
              {drift > 0 ? "+" : ""}{drift}<span style={{ fontSize: 18 }}>pp</span>
            </div>
            <div className="drift-bars">
              <div>
                <div className="drift-bar-label">Planificado <span className="mono">{latestPlanned.planned}%</span></div>
                <div className="drift-bar"><div className="drift-bar-fill plan" style={{ width: latestPlanned.planned + "%" }} /></div>
              </div>
              <div>
                <div className="drift-bar-label">Real <span className="mono">{latestActual.actual}%</span></div>
                <div className="drift-bar"><div className="drift-bar-fill real" style={{ width: latestActual.actual + "%" }} /></div>
              </div>
            </div>
            <div className="drift-note">
              <Icon name="warning" size={14} color="var(--accent-fg)" />
              Retraso acumulado de 9 puntos. Causa principal: dependencia con T09 (saldos contables).
            </div>
          </div>
        </Card>

        {/* Phase breakdown */}
        <Card title="Avance por fase" subtitle={`${tasksDone}/${tasksTotal} tareas completadas`} style={{ gridColumn: "span 6" }}>
          <div className="phase-list">
            {Object.keys(PHASE_COLORS).map((phase) => {
              const phaseTasks = TASKS.filter((t) => t.phase === phase && !t.milestone);
              if (phaseTasks.length === 0) return null;
              const avg = Math.round(phaseTasks.reduce((s, t) => s + t.progress, 0) / phaseTasks.length);
              const done = phaseTasks.filter((t) => t.progress >= 100).length;
              return (
                <div key={phase} className="phase-row-d">
                  <div className="phase-row-hd">
                    <span className="phase-dot" style={{ background: PHASE_COLORS[phase] }} />
                    <span className="phase-row-name">{phase}</span>
                    <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>{done}/{phaseTasks.length}</span>
                    <span className="mono phase-row-pct">{avg}%</span>
                  </div>
                  <div className="phase-row-bar">
                    <div className="phase-row-fill" style={{ width: avg + "%", background: PHASE_COLORS[phase] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Risk list */}
        <Card title="Riesgos abiertos" subtitle="3 activos · 1 mitigado" style={{ gridColumn: "span 6" }}>
          <ul className="risk-list">
            <li className="risk-item">
              <span className="risk-sev high">A</span>
              <div>
                <div className="risk-title">Saldos contables sin validar por cliente</div>
                <div className="risk-meta">Probabilidad alta · Impacto alto · Owner: A. Páez</div>
              </div>
              <span className="mono risk-due">02 may</span>
            </li>
            <li className="risk-item">
              <span className="risk-sev med">M</span>
              <div>
                <div className="risk-title">Capacidad limitada de R. Gómez para portal + reportes BI</div>
                <div className="risk-meta">Probabilidad media · Impacto alto · Owner: L. Fernández</div>
              </div>
              <span className="mono risk-due">28 abr</span>
            </li>
            <li className="risk-item">
              <span className="risk-sev med">M</span>
              <div>
                <div className="risk-title">Disponibilidad de key users durante UAT (semana 18)</div>
                <div className="risk-meta">Probabilidad media · Impacto medio · Owner: M. Restrepo</div>
              </div>
              <span className="mono risk-due">10 may</span>
            </li>
            <li className="risk-item closed">
              <span className="risk-sev low">B</span>
              <div>
                <div className="risk-title">Demora en compra de licencias Enterprise</div>
                <div className="risk-meta">Mitigado · OC aprobada el 22 abr</div>
              </div>
              <span className="mono risk-due">cerrado</span>
            </li>
          </ul>
        </Card>

        {/* Activity feed */}
        <Card title="Actividad reciente" subtitle="Últimas 24 horas" style={{ gridColumn: "span 7" }}>
          <ul className="activity">
            <li><Avatar id="LF" size={22} /><div><strong>Lucía F.</strong> aprobó la solicitud <span className="mono">SOL-2037</span> (vacaciones D. Cortés) <span className="act-time">hace 2 h</span></div></li>
            <li><Avatar id="RG" size={22} /><div><strong>Rafael G.</strong> reportó 6.5 h en <span className="mono">T11</span> · facturación electrónica <span className="act-time">hace 3 h</span></div></li>
            <li><Avatar id="AP" size={22} /><div><strong>Andrés P.</strong> marcó <span className="mono">T04</span> al 80% · plan contable casi completo <span className="act-time">hace 5 h</span></div></li>
            <li><Avatar id="JS" size={22} /><div><strong>Julia S.</strong> subió 142 registros validados a <span className="mono">T08</span> proveedores <span className="act-time">ayer</span></div></li>
            <li><Avatar id="MR" size={22} /><div><strong>Mateo R.</strong> creó la solicitud <span className="mono">SOL-2041</span> · ampliación de alcance <span className="act-time">ayer</span></div></li>
          </ul>
        </Card>

        {/* Cost by phase */}
        <Card title="Costo por fase" subtitle="Real vs. presupuesto" style={{ gridColumn: "span 5" }}>
          <ul className="cost-list">
            {COST_BREAKDOWN.map((c) => {
              const ratio = c.budget > 0 ? c.spent / c.budget : 0;
              return (
                <li key={c.phase} className="cost-item">
                  <div className="cost-item-hd">
                    <span className="phase-dot" style={{ background: PHASE_COLORS[c.phase] }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{c.phase}</span>
                    <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>{Math.round(ratio * 100)}%</span>
                  </div>
                  <div className="cost-bar">
                    <div className="cost-bar-fill" style={{ width: Math.min(ratio, 1) * 100 + "%", background: PHASE_COLORS[c.phase] }} />
                    {ratio > 1 && <div className="cost-bar-over" style={{ width: ((ratio - 1) * 100) + "%" }} />}
                  </div>
                  <div className="cost-item-vals mono">
                    <span>{fmtMoney(c.spent)}</span>
                    <span style={{ color: "var(--ink-3)" }}>/ {fmtMoney(c.budget)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function BurnupChart() {
  const W = 720, H = 220, PAD_L = 36, PAD_R = 16, PAD_T = 16, PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const maxY = 100;
  const xs = (i) => PAD_L + (i / (PROGRESS_WEEKLY.length - 1)) * innerW;
  const ys = (v) => PAD_T + innerH - (v / maxY) * innerH;

  const planPath = PROGRESS_WEEKLY.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(p.planned)}`).join(" ");
  const realPts = PROGRESS_WEEKLY.filter((p) => p.actual != null);
  const realPath = realPts.map((p, i) => {
    const idx = PROGRESS_WEEKLY.findIndex((x) => x.week === p.week);
    return `${i === 0 ? "M" : "L"} ${xs(idx)} ${ys(p.actual)}`;
  }).join(" ");
  const realArea = realPath + ` L ${xs(PROGRESS_WEEKLY.findIndex((x) => x.week === realPts[realPts.length - 1].week))} ${ys(0)} L ${xs(0)} ${ys(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="burnup-svg">
      {/* gridlines */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={ys(v)} y2={ys(v)} stroke="var(--border-1)" strokeWidth="0.5" />
          <text x={PAD_L - 6} y={ys(v) + 3} fontSize="10" textAnchor="end" fill="var(--ink-3)" className="mono">{v}%</text>
        </g>
      ))}
      {/* x labels */}
      {PROGRESS_WEEKLY.map((p, i) => i % 2 === 0 && (
        <text key={p.week} x={xs(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--ink-3)" className="mono">{p.week}</text>
      ))}

      {/* Real area fill */}
      <path d={realArea} fill="var(--ink-1)" opacity="0.06" />

      {/* Planned line — dashed */}
      <path d={planPath} fill="none" stroke="var(--ink-3)" strokeWidth="1.4" strokeDasharray="3 3" />

      {/* Real line */}
      <path d={realPath} fill="none" stroke="var(--ink-1)" strokeWidth="2" />

      {/* Real points */}
      {realPts.map((p) => {
        const idx = PROGRESS_WEEKLY.findIndex((x) => x.week === p.week);
        return <circle key={p.week} cx={xs(idx)} cy={ys(p.actual)} r="3" fill="var(--ink-1)" />;
      })}

      {/* Today vertical line */}
      <line x1={xs(realPts.length - 1)} x2={xs(realPts.length - 1)} y1={PAD_T} y2={H - PAD_B} stroke={PHASE_COLORS["Go-live"]} strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Legend */}
      <g transform={`translate(${PAD_L + 6}, ${PAD_T + 6})`}>
        <line x1="0" y1="0" x2="20" y2="0" stroke="var(--ink-1)" strokeWidth="2" />
        <text x="26" y="3" fontSize="11" fill="var(--ink-2)">Real</text>
        <line x1="70" y1="0" x2="90" y2="0" stroke="var(--ink-3)" strokeWidth="1.4" strokeDasharray="3 3" />
        <text x="96" y="3" fontSize="11" fill="var(--ink-2)">Planificado</text>
      </g>
    </svg>
  );
}

Object.assign(window, { DashboardView });
