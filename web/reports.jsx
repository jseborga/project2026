// reports.jsx — Reports view (multiple report cards, exportable look)

function ReportsView({ tweaks }) {
  const [activeReport, setActiveReport] = React.useState("avance");

  const reports = [
    { id: "avance", name: "Avance vs. plan", desc: "Curva S y desviación por fase" },
    { id: "horas", name: "Horas trabajadas", desc: "Reales vs. estimadas por recurso" },
    { id: "costos", name: "Costos por fase", desc: "EVM · CPI · SPI" },
    { id: "carga", name: "Carga del equipo", desc: "Utilización promedio mensual" },
  ];

  return (
    <div className="reports-wrap">
      <div className="reports-side">
        <div className="reports-side-hd">Reportes</div>
        {reports.map((r) => (
          <button
            key={r.id}
            className={"report-btn" + (activeReport === r.id ? " active" : "")}
            onClick={() => setActiveReport(r.id)}
          >
            <div className="report-btn-name">{r.name}</div>
            <div className="report-btn-desc">{r.desc}</div>
          </button>
        ))}
        <div className="reports-side-section">Periodo</div>
        <div className="report-period">
          <button className="period-btn active">Acumulado</button>
          <button className="period-btn">Mensual</button>
          <button className="period-btn">Semanal</button>
        </div>
        <div className="reports-side-section">Comparar con</div>
        <div className="report-compare">
          <label><input type="checkbox" defaultChecked /> Línea base v1</label>
          <label><input type="checkbox" /> Estimación inicial</label>
          <label><input type="checkbox" /> Proyectos similares</label>
        </div>
      </div>

      <div className="reports-main">
        {activeReport === "avance" && <AvanceReport />}
        {activeReport === "horas" && <HorasReport />}
        {activeReport === "costos" && <CostosReport />}
        {activeReport === "carga" && <CargaReport />}
      </div>
    </div>
  );
}

function ReportHeader({ title, subtitle }) {
  return (
    <header className="report-hd">
      <div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
          REP-{Date.now().toString().slice(-6)} · GENERADO 22 ABR 2026
        </div>
        <h2 className="report-title">{title}</h2>
        <div className="report-subtitle">{subtitle}</div>
      </div>
      <div className="report-actions">
        <button className="btn-secondary"><Icon name="download" size={13} /> PDF</button>
        <button className="btn-secondary"><Icon name="download" size={13} /> Excel</button>
        <button className="btn-primary">Compartir</button>
      </div>
    </header>
  );
}

function AvanceReport() {
  return (
    <div className="report-doc">
      <ReportHeader title="Avance vs. planificación" subtitle="Implementación Odoo CE 18 · Grupo Andina · semanas 2–14" />

      <div className="report-kpi-row">
        <div className="report-kpi"><div className="report-kpi-label">SPI</div><div className="report-kpi-value">0.81</div><div className="report-kpi-trend down">−0.04 vs. mes anterior</div></div>
        <div className="report-kpi"><div className="report-kpi-label">% completado</div><div className="report-kpi-value">38%</div><div className="report-kpi-trend down">vs. 47% planificado</div></div>
        <div className="report-kpi"><div className="report-kpi-label">Tareas a tiempo</div><div className="report-kpi-value">11<span className="kpi-unit">/18</span></div><div className="report-kpi-trend">61% del total activo</div></div>
        <div className="report-kpi"><div className="report-kpi-label">Días de atraso</div><div className="report-kpi-value">7d</div><div className="report-kpi-trend down">recuperables con re-plan</div></div>
      </div>

      <Card title="Curva S — avance acumulado" subtitle="Comparativa real vs. plan">
        <BurnupChart />
      </Card>

      <Card title="Desviación por fase" subtitle="Diferencia % real vs. % planificado">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fase</th>
              <th style={{ textAlign: "right" }}>Plan</th>
              <th style={{ textAlign: "right" }}>Real</th>
              <th style={{ textAlign: "right" }}>Δ</th>
              <th style={{ width: 240 }}>Visual</th>
              <th>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {[
              { p: "Discovery",    plan: 100, real: 100, note: "Cerrada según plan" },
              { p: "Configuración", plan: 95,  real: 74,  note: "T04 plan contable al 80%" },
              { p: "Migración",    plan: 70,  real: 34,  note: "Bloqueo en saldos contables" },
              { p: "Desarrollo",   plan: 45,  real: 18,  note: "Atraso por dependencia con T09" },
              { p: "Pruebas",      plan: 0,   real: 0,   note: "No iniciada" },
              { p: "Go-live",      plan: 0,   real: 0,   note: "No iniciada" },
            ].map((row) => {
              const delta = row.real - row.plan;
              return (
                <tr key={row.p}>
                  <td><span className="phase-dot" style={{ background: PHASE_COLORS[row.p] }} /> {row.p}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{row.plan}%</td>
                  <td className="mono" style={{ textAlign: "right" }}>{row.real}%</td>
                  <td className="mono" style={{ textAlign: "right", color: delta < -10 ? PHASE_COLORS["Go-live"] : delta < 0 ? "#b07c24" : "#3d6437" }}>
                    {delta > 0 ? "+" : ""}{delta} pp
                  </td>
                  <td>
                    <div className="dual-bar">
                      <div className="dual-bar-track">
                        <div className="dual-bar-plan" style={{ width: row.plan + "%" }} />
                        <div className="dual-bar-real" style={{ width: row.real + "%", background: PHASE_COLORS[row.p] }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--ink-2)" }}>{row.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function HorasReport() {
  // Made-up actual vs estimated hours per resource
  const data = [
    { id: "LF", est: 280, real: 264 },
    { id: "MR", est: 320, real: 298 },
    { id: "DC", est: 340, real: 352 },
    { id: "AP", est: 260, real: 312 },
    { id: "JS", est: 240, real: 188 },
    { id: "RG", est: 380, real: 304 },
    { id: "EL", est: 200, real: 86 },
  ];
  const max = Math.max(...data.flatMap((d) => [d.est, d.real]));

  return (
    <div className="report-doc">
      <ReportHeader title="Horas reales vs. estimadas" subtitle="Por recurso · acumulado a la fecha de corte" />

      <div className="report-kpi-row">
        <div className="report-kpi"><div className="report-kpi-label">Horas reportadas</div><div className="report-kpi-value mono">1.804</div><div className="report-kpi-trend">de 2.020 estimadas</div></div>
        <div className="report-kpi"><div className="report-kpi-label">Eficiencia</div><div className="report-kpi-value">89%</div><div className="report-kpi-trend">−2 pp vs. mes anterior</div></div>
        <div className="report-kpi"><div className="report-kpi-label">Sobreesfuerzo</div><div className="report-kpi-value">2<span className="kpi-unit">recursos</span></div><div className="report-kpi-trend down">D. Cortés y A. Páez</div></div>
        <div className="report-kpi"><div className="report-kpi-label">Aprobación pendiente</div><div className="report-kpi-value mono">284 h</div><div className="report-kpi-trend">SOL-2040</div></div>
      </div>

      <Card title="Comparativa por recurso" subtitle="Horas estimadas vs. horas reportadas">
        <table className="data-table">
          <thead>
            <tr>
              <th>Recurso</th>
              <th style={{ textAlign: "right" }}>Estimado</th>
              <th style={{ textAlign: "right" }}>Real</th>
              <th style={{ textAlign: "right" }}>Δ</th>
              <th style={{ width: "40%" }}>Comparativa</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const r = RESOURCES.find((x) => x.id === d.id);
              const delta = d.real - d.est;
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar id={d.id} size={22} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>{d.est} h</td>
                  <td className="mono" style={{ textAlign: "right" }}>{d.real} h</td>
                  <td className="mono" style={{ textAlign: "right", color: delta > 0 ? PHASE_COLORS["Go-live"] : "#3d6437" }}>
                    {delta > 0 ? "+" : ""}{delta} h
                  </td>
                  <td>
                    <div className="hrs-bars">
                      <div className="hrs-bar-row"><span className="hrs-bar-lbl">est</span><div className="hrs-bar-track"><div className="hrs-bar-fill est" style={{ width: (d.est / max) * 100 + "%" }} /></div></div>
                      <div className="hrs-bar-row"><span className="hrs-bar-lbl">real</span><div className="hrs-bar-track"><div className="hrs-bar-fill real" style={{ width: (d.real / max) * 100 + "%", background: r.color }} /></div></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CostosReport() {
  const totalSpent = COST_BREAKDOWN.reduce((s, c) => s + c.spent, 0);
  const totalBudget = COST_BREAKDOWN.reduce((s, c) => s + c.budget, 0);
  const ev = totalBudget * 0.38; // earned value (38% completion)
  const pv = totalBudget * 0.47; // planned value
  const ac = totalSpent;
  const cpi = ev / ac;
  const spi = ev / pv;

  return (
    <div className="report-doc">
      <ReportHeader title="Análisis de costos · EVM" subtitle="Earned Value Management — corte semana 11" />

      <div className="report-kpi-row">
        <div className="report-kpi"><div className="report-kpi-label">CPI · cost performance</div><div className="report-kpi-value">{cpi.toFixed(2)}</div><div className="report-kpi-trend">{cpi >= 1 ? "Bajo presupuesto" : "Sobre presupuesto"}</div></div>
        <div className="report-kpi"><div className="report-kpi-label">SPI · schedule</div><div className="report-kpi-value">{spi.toFixed(2)}</div><div className="report-kpi-trend down">Atrasado</div></div>
        <div className="report-kpi"><div className="report-kpi-label">EAC · estimación final</div><div className="report-kpi-value mono">{fmtMoney(Math.round(totalBudget / cpi))}</div><div className="report-kpi-trend">vs. {fmtMoney(totalBudget)} BAC</div></div>
        <div className="report-kpi"><div className="report-kpi-label">VAC · variance at completion</div><div className="report-kpi-value mono" style={{ color: cpi >= 1 ? "#3d6437" : PHASE_COLORS["Go-live"] }}>{fmtMoney(Math.round(totalBudget - totalBudget / cpi))}</div><div className="report-kpi-trend">{cpi >= 1 ? "favorable" : "desfavorable"}</div></div>
      </div>

      <Card title="EVM — valores acumulados" subtitle="PV (planificado) · EV (ganado) · AC (real)">
        <div className="evm-bars">
          {[
            { label: "PV · Planned Value",  val: pv, color: "var(--ink-3)" },
            { label: "EV · Earned Value",   val: ev, color: PHASE_COLORS["Configuración"] },
            { label: "AC · Actual Cost",    val: ac, color: PHASE_COLORS["Go-live"] },
          ].map((row) => (
            <div key={row.label} className="evm-row">
              <div className="evm-label">{row.label}</div>
              <div className="evm-track">
                <div className="evm-fill" style={{ width: (row.val / totalBudget) * 100 + "%", background: row.color }} />
              </div>
              <div className="mono evm-val">{fmtMoney(Math.round(row.val))}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Costos por fase" subtitle="Gastado vs. presupuesto">
        <table className="data-table">
          <thead>
            <tr><th>Fase</th><th style={{ textAlign: "right" }}>Presupuesto</th><th style={{ textAlign: "right" }}>Gastado</th><th style={{ textAlign: "right" }}>Disponible</th><th style={{ width: 220 }}>Ejecución</th></tr>
          </thead>
          <tbody>
            {COST_BREAKDOWN.map((c) => {
              const ratio = c.budget > 0 ? c.spent / c.budget : 0;
              return (
                <tr key={c.phase}>
                  <td><span className="phase-dot" style={{ background: PHASE_COLORS[c.phase] }} /> {c.phase}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{fmtMoney(c.budget)}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{fmtMoney(c.spent)}</td>
                  <td className="mono" style={{ textAlign: "right", color: "var(--ink-3)" }}>{fmtMoney(c.budget - c.spent)}</td>
                  <td>
                    <div className="cost-bar"><div className="cost-bar-fill" style={{ width: Math.min(ratio, 1) * 100 + "%", background: PHASE_COLORS[c.phase] }} /></div>
                    <div className="mono" style={{ fontSize: 11, marginTop: 2, color: "var(--ink-3)" }}>{Math.round(ratio * 100)}%</div>
                  </td>
                </tr>
              );
            })}
            <tr style={{ borderTop: "1px solid var(--border-1)", fontWeight: 600 }}>
              <td>Total</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtMoney(totalBudget)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtMoney(totalSpent)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--ink-3)" }}>{fmtMoney(totalBudget - totalSpent)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CargaReport() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  // Per resource × month utilization (%)
  const data = RESOURCES.map((r, ri) => ({
    ...r,
    util: months.map((_, mi) => {
      const seed = (ri * 7 + mi * 11) % 60;
      return Math.max(20, Math.min(120, 50 + seed + (mi === 3 ? 25 : 0)));
    }),
  }));

  return (
    <div className="report-doc">
      <ReportHeader title="Utilización del equipo" subtitle="Promedio mensual por recurso · enero – junio 2026" />

      <Card title="Utilización mensual" subtitle="Verde 60–90% · ámbar 90–100% · rojo > 100%">
        <table className="data-table">
          <thead>
            <tr>
              <th>Recurso</th>
              {months.map((m) => <th key={m} style={{ textAlign: "center" }}>{m}</th>)}
              <th style={{ textAlign: "right" }}>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const avg = Math.round(r.util.reduce((s, v) => s + v, 0) / r.util.length);
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar id={r.id} size={20} />
                      <span style={{ fontWeight: 500 }}>{r.name}</span>
                    </div>
                  </td>
                  {r.util.map((v, i) => {
                    const tone = v > 100 ? "rgba(184, 92, 56, 0.85)" : v > 90 ? "rgba(176, 124, 36, 0.7)" : "rgba(82, 130, 76, 0.55)";
                    return (
                      <td key={i} style={{ textAlign: "center" }}>
                        <span className="util-pill mono" style={{ background: tone, color: "#fff" }}>
                          {v}%
                        </span>
                      </td>
                    );
                  })}
                  <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>{avg}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

Object.assign(window, { ReportsView });
