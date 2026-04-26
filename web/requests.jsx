// requests.jsx — ERP requests inbox

function RequestsView({ tweaks }) {
  const [filter, setFilter] = React.useState("todas");
  const [selected, setSelected] = React.useState(REQUESTS[0].id);

  const filtered = REQUESTS.filter((r) => {
    if (filter === "todas") return true;
    if (filter === "pendientes") return r.status === "pendiente" || r.status === "en revisión";
    if (filter === "aprobadas") return r.status === "aprobada";
    if (filter === "rechazadas") return r.status === "rechazada";
    return true;
  });

  const sel = REQUESTS.find((r) => r.id === selected);

  const counts = {
    todas: REQUESTS.length,
    pendientes: REQUESTS.filter((r) => r.status === "pendiente" || r.status === "en revisión").length,
    aprobadas: REQUESTS.filter((r) => r.status === "aprobada").length,
    rechazadas: REQUESTS.filter((r) => r.status === "rechazada").length,
  };

  const statusTone = (s) => s === "pendiente" ? "amber" : s === "en revisión" ? "blue" : s === "aprobada" ? "green" : "red";
  const priorityTone = (p) => p === "alta" ? "red" : p === "media" ? "amber" : "neutral";
  const typeIcon = (t) => {
    if (t === "Cambio de alcance") return "warning";
    if (t === "Aprobación timesheet") return "clock";
    if (t === "Reasignación") return "users";
    if (t === "Compra") return "download";
    if (t === "Ausencia") return "flag";
    if (t === "Hito") return "diamond";
    return "inbox";
  };

  return (
    <div className="requests-wrap">
      <div className="req-toolbar">
        <div className="seg">
          {["todas", "pendientes", "aprobadas", "rechazadas"].map((f) => (
            <button key={f} className={"seg-btn" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="seg-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="spacer" />
        <button className="btn-secondary"><Icon name="filter" size={13} /> Filtrar</button>
        <button className="btn-primary"><Icon name="plus" size={13} /> Nueva solicitud</button>
      </div>

      <div className="req-grid">
        <div className="req-list">
          {filtered.map((r) => (
            <button
              key={r.id}
              className={"req-item" + (selected === r.id ? " selected" : "")}
              onClick={() => setSelected(r.id)}
            >
              <div className="req-item-icon">
                <Icon name={typeIcon(r.type)} size={14} color="var(--ink-2)" />
              </div>
              <div className="req-item-body">
                <div className="req-item-row1">
                  <span className="mono req-item-id">{r.id}</span>
                  <span className="req-item-type">{r.type}</span>
                  <span className="spacer" />
                  <Pill tone={priorityTone(r.priority)} size="xs">{r.priority}</Pill>
                </div>
                <div className="req-item-title">{r.title}</div>
                <div className="req-item-meta">
                  <span>{r.requester} · {r.role}</span>
                  <span className="dot-sep" />
                  <span className="mono">{r.date}</span>
                  <span className="spacer" />
                  <Pill tone={statusTone(r.status)} size="xs">{r.status}</Pill>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="req-detail">
          {sel && <RequestDetail r={sel} />}
        </div>
      </div>
    </div>
  );
}

function RequestDetail({ r }) {
  const statusTone = r.status === "pendiente" ? "amber" : r.status === "en revisión" ? "blue" : r.status === "aprobada" ? "green" : "red";
  const isResolved = r.status === "aprobada" || r.status === "rechazada";

  return (
    <div className="rd-doc">
      <header className="rd-hd">
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
            {r.id} · {r.type.toUpperCase()}
          </div>
          <h2 className="rd-title">{r.title}</h2>
          <div className="rd-meta">
            <Avatar id={(r.requester.split(" ")[0][0] || "?")} size={20} />
            <span><strong>{r.requester}</strong> · {r.role}</span>
            <span className="dot-sep" />
            <span className="mono">{r.date}</span>
            <Pill tone={statusTone}>{r.status}</Pill>
            <Pill tone={r.priority === "alta" ? "red" : r.priority === "media" ? "amber" : "neutral"}>prioridad {r.priority}</Pill>
          </div>
        </div>
      </header>

      <div className="rd-impact">
        <div>
          <div className="rd-label">Impacto estimado</div>
          <div className="rd-impact-val">{r.impact}</div>
        </div>
        <div>
          <div className="rd-label">Aprobador</div>
          <div className="rd-asg"><Avatar id="LF" size={20} /> Lucía Fernández · PM</div>
        </div>
        <div>
          <div className="rd-label">Tiempo abierta</div>
          <div className="mono rd-val">3 días</div>
        </div>
      </div>

      <section className="rd-section">
        <h4 className="rd-section-title">Descripción</h4>
        <p className="rd-desc">{r.desc}</p>
      </section>

      <section className="rd-section">
        <h4 className="rd-section-title">Análisis automático</h4>
        <ul className="rd-checks">
          <li><Icon name="check" size={14} color="#3d6437" /> Solicitante autorizado para este tipo de cambio.</li>
          <li><Icon name="check" size={14} color="#3d6437" /> Documentación adjunta completa (3 archivos).</li>
          <li>{r.priority === "alta" ? <Icon name="warning" size={14} color={PHASE_COLORS["Go-live"]} /> : <Icon name="check" size={14} color="#3d6437" />} Impacto en ruta crítica: {r.priority === "alta" ? "alto" : "controlado"}.</li>
          <li><Icon name="clock" size={14} color="#7a541a" /> Requiere validación adicional de Sponsor.</li>
        </ul>
      </section>

      <section className="rd-section">
        <h4 className="rd-section-title">Línea de tiempo</h4>
        <ol className="rd-timeline">
          <li><span className="rd-tl-dot" /><div><strong>Solicitud creada</strong><br /><span style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.requester} · {r.date}</span></div></li>
          <li><span className="rd-tl-dot" /><div><strong>Asignada a aprobador</strong><br /><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Lucía Fernández · auto</span></div></li>
          <li><span className="rd-tl-dot" /><div><strong>En revisión</strong><br /><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Análisis de impacto en curso</span></div></li>
          {isResolved && <li><span className="rd-tl-dot done" /><div><strong>{r.status === "aprobada" ? "Aprobada" : "Rechazada"}</strong><br /><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Lucía Fernández</span></div></li>}
        </ol>
      </section>

      {!isResolved && (
        <footer className="rd-actions-bar">
          <textarea className="rd-comment" placeholder="Añade un comentario antes de decidir…" />
          <div className="rd-buttons">
            <button className="btn-secondary">Solicitar info</button>
            <button className="btn-danger">Rechazar</button>
            <button className="btn-primary">Aprobar</button>
          </div>
        </footer>
      )}
    </div>
  );
}

Object.assign(window, { RequestsView });
