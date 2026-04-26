// gantt.jsx — Microsoft Project–style interactive Gantt
// - Ribbon toolbar with tabs (Inicio · Vista · Tarea · Recurso)
// - Status bar at bottom
// - Right-click context menu
// - Floating, draggable property dialogs (Propiedades de tarea, Información de proyecto)
// - Quick info popover on hover
// - Drag/resize/dependency creation
// - Day/week/month zoom + critical path

const ROW_H = 28;
const HEADER_H = 52;

// ── Floating window (modeless dialog) ───────────────────────────────────────
function FloatingWindow({ title, icon, onClose, initial = { x: 360, y: 120 }, w = 460, children }) {
  const [pos, setPos] = React.useState(initial);
  const [maxd, setMaxd] = React.useState(false);
  const onDragStart = (e) => {
    if (maxd) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ox = pos.x, oy = pos.y;
    const move = (ev) => setPos({ x: Math.max(0, ox + ev.clientX - sx), y: Math.max(0, oy + ev.clientY - sy) });
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  return (
    <div className="ofw" style={maxd ? { inset: "60px 16px 40px 16px", width: "auto", height: "auto" } : { left: pos.x, top: pos.y, width: w }}>
      <div className="ofw-tb" onMouseDown={onDragStart}>
        <div className="ofw-title">
          {icon && <Icon name={icon} size={13} color="var(--ink-2)" />}
          <span>{title}</span>
        </div>
        <div className="ofw-buttons">
          <button className="ofw-btn" title="Minimizar">—</button>
          <button className="ofw-btn" title="Maximizar" onClick={() => setMaxd((m) => !m)}>▢</button>
          <button className="ofw-btn ofw-x" title="Cerrar" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="ofw-body">{children}</div>
    </div>
  );
}

// ── Ribbon ──────────────────────────────────────────────────────────────────
function Ribbon({ tab, setTab, ribbonProps }) {
  const tabs = [
    { id: "inicio", label: "Inicio" },
    { id: "tarea", label: "Tarea" },
    { id: "recurso", label: "Recurso" },
    { id: "vista", label: "Vista" },
    { id: "informe", label: "Informe" },
  ];
  return (
    <div className="ribbon">
      <div className="ribbon-tabs">
        <div className="ribbon-app">
          <span className="ribbon-app-mark">P</span>
          <span>Cronograma</span>
        </div>
        {tabs.map((t) => (
          <button key={t.id} className={"ribbon-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div className="ribbon-spacer" />
        <div className="ribbon-quick">
          <button className="rq-btn" title="Guardar"><Icon name="download" size={13} /></button>
          <button className="rq-btn" title="Deshacer">↶</button>
          <button className="rq-btn" title="Rehacer">↷</button>
        </div>
      </div>
      <div className="ribbon-body">
        {tab === "inicio" && <RibbonInicio {...ribbonProps} />}
        {tab === "tarea" && <RibbonTarea {...ribbonProps} />}
        {tab === "recurso" && <RibbonRecurso {...ribbonProps} />}
        {tab === "vista" && <RibbonVista {...ribbonProps} />}
        {tab === "informe" && <RibbonInforme {...ribbonProps} />}
      </div>
    </div>
  );
}

function RGroup({ label, children }) {
  return (
    <div className="r-group">
      <div className="r-group-body">{children}</div>
      <div className="r-group-label">{label}</div>
    </div>
  );
}
function RBig({ icon, label, onClick, active }) {
  return (
    <button className={"r-big" + (active ? " active" : "")} onClick={onClick}>
      <span className="r-big-icon"><Icon name={icon} size={20} /></span>
      <span className="r-big-label">{label}</span>
    </button>
  );
}
function RSm({ icon, label, onClick, active }) {
  return (
    <button className={"r-sm" + (active ? " active" : "")} onClick={onClick}>
      <Icon name={icon} size={13} />
      <span>{label}</span>
    </button>
  );
}

function RibbonInicio({ onNewTask, onProperties, onZoom, zoom, onShowCritical, showCritical, onLink, onFitToScreen, fitActive }) {
  return (
    <>
      <RGroup label="Tarea">
        <RBig icon="plus" label="Nueva tarea" onClick={onNewTask} />
        <div className="r-stack">
          <RSm icon="diamond" label="Hito" />
          <RSm icon="users" label="Resumen" />
          <RSm icon="check" label="Marcar 100%" />
        </div>
      </RGroup>
      <RGroup label="Vínculos">
        <RBig icon="arrowR" label="Vincular" onClick={onLink} />
        <div className="r-stack">
          <RSm icon="filter" label="Sangría" />
          <RSm icon="chevronD" label="Subir" />
          <RSm icon="chevronR" label="Bajar" />
        </div>
      </RGroup>
      <RGroup label="Programación">
        <div className="r-stack">
          <RSm icon="warning" label="Camino crítico" active={showCritical} onClick={onShowCritical} />
          <RSm icon="clock" label="Línea base" />
          <RSm icon="dot" label="Auto" />
        </div>
      </RGroup>
      <RGroup label="Zoom">
        <div className="r-stack">
          <RSm icon="dot" label="Día" active={zoom === "day" && !fitActive} onClick={() => onZoom("day")} />
          <RSm icon="dot" label="Semana" active={zoom === "week" && !fitActive} onClick={() => onZoom("week")} />
          <RSm icon="dot" label="Mes" active={zoom === "month" && !fitActive} onClick={() => onZoom("month")} />
        </div>
        <RBig icon="expand" label="Ajustar a pantalla" active={fitActive} onClick={onFitToScreen} />
      </RGroup>
      <RGroup label="Propiedades">
        <RBig icon="settings" label="Información" onClick={onProperties} />
      </RGroup>
    </>
  );
}
function RibbonTarea({ onProperties }) {
  return (
    <>
      <RGroup label="Editar">
        <RBig icon="settings" label="Propiedades" onClick={onProperties} />
        <div className="r-stack">
          <RSm icon="users" label="Asignar recurso" />
          <RSm icon="arrowR" label="Predecesoras" />
          <RSm icon="check" label="Estado" />
        </div>
      </RGroup>
      <RGroup label="Avance">
        <div className="r-stack">
          <RSm icon="dot" label="0%" />
          <RSm icon="dot" label="25%" />
          <RSm icon="dot" label="50%" />
          <RSm icon="dot" label="75%" />
          <RSm icon="check" label="100%" />
        </div>
      </RGroup>
      <RGroup label="Notas">
        <RBig icon="inbox" label="Nota / archivo" />
      </RGroup>
    </>
  );
}
function RibbonRecurso() {
  return (
    <>
      <RGroup label="Equipo">
        <RBig icon="users" label="Asignar" />
        <div className="r-stack">
          <RSm icon="plus" label="Nuevo recurso" />
          <RSm icon="settings" label="Calendario" />
          <RSm icon="warning" label="Conflictos" />
        </div>
      </RGroup>
      <RGroup label="Capacidad">
        <div className="r-stack">
          <RSm icon="chart" label="Nivelar" />
          <RSm icon="clock" label="Sobreasignación" />
        </div>
      </RGroup>
    </>
  );
}
function RibbonVista({ onZoom, zoom, onTogglePanel, panels, onFitToScreen, fitActive }) {
  return (
    <>
      <RGroup label="Diseño">
        <RBig icon="gantt" label="Gantt" active />
        <div className="r-stack">
          <RSm icon="chart" label="Diagrama" />
          <RSm icon="users" label="Recursos" />
          <RSm icon="inbox" label="Tablero" />
        </div>
      </RGroup>
      <RGroup label="Zoom">
        <div className="r-stack">
          <RSm icon="dot" label="Día" active={zoom === "day" && !fitActive} onClick={() => onZoom("day")} />
          <RSm icon="dot" label="Semana" active={zoom === "week" && !fitActive} onClick={() => onZoom("week")} />
          <RSm icon="dot" label="Mes" active={zoom === "month" && !fitActive} onClick={() => onZoom("month")} />
        </div>
        <RBig icon="expand" label="Ajustar a pantalla" active={fitActive} onClick={onFitToScreen} />
      </RGroup>
      <RGroup label="Paneles">
        <div className="r-stack">
          <RSm icon="filter" label="Detalles" active={panels.detail} onClick={() => onTogglePanel("detail")} />
          <RSm icon="search" label="Buscar" />
          <RSm icon="settings" label="Cuadrícula" />
        </div>
      </RGroup>
    </>
  );
}
function RibbonInforme() {
  return (
    <>
      <RGroup label="Reportes rápidos">
        <RBig icon="chart" label="Avance" />
        <RBig icon="users" label="Recursos" />
        <RBig icon="warning" label="Riesgos" />
      </RGroup>
      <RGroup label="Compartir">
        <div className="r-stack">
          <RSm icon="download" label="Exportar PDF" />
          <RSm icon="download" label="Exportar Excel" />
          <RSm icon="arrowR" label="Enviar a Odoo" />
        </div>
      </RGroup>
    </>
  );
}

// ── Context menu ────────────────────────────────────────────────────────────
function ContextMenu({ x, y, items, onClose, level = 0 }) {
  const [openSub, setOpenSub] = React.useState(null); // { idx, x, y }
  React.useEffect(() => {
    if (level > 0) return;
    const close = (e) => {
      if (e && e.target && e.target.closest && e.target.closest(".ctx-menu")) return;
      onClose();
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
    };
  }, []);
  return (
    <div className="ctx-menu" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
      {items.map((it, i) => {
        if (it.divider) return <div key={i} className="ctx-divider" />;
        if (it.header) return <div key={i} className="ctx-header">{it.header}</div>;
        const hasSub = Array.isArray(it.submenu);
        return (
          <button key={i}
            className={"ctx-item" + (it.disabled ? " disabled" : "") + (it.checked ? " checked" : "") + (hasSub ? " has-sub" : "")}
            onClick={(e) => {
              if (it.disabled) return;
              if (hasSub) return;
              if (it.onClick) it.onClick();
              onClose();
            }}
            onMouseEnter={(e) => {
              if (hasSub) {
                const r = e.currentTarget.getBoundingClientRect();
                setOpenSub({ idx: i, x: r.right - 4, y: r.top });
              } else {
                setOpenSub(null);
              }
            }}>
            <span className="ctx-check">{it.checked ? "✓" : ""}</span>
            {it.icon && <Icon name={it.icon} size={13} color="var(--ink-2)" />}
            <span className="ctx-lbl">{it.label}</span>
            {it.shortcut && <span className="ctx-sh mono">{it.shortcut}</span>}
            {hasSub && <span className="ctx-arrow">›</span>}
          </button>
        );
      })}
      {openSub && items[openSub.idx]?.submenu && (
        <ContextMenu x={openSub.x} y={openSub.y} items={items[openSub.idx].submenu} onClose={onClose} level={level + 1} />
      )}
    </div>
  );
}

// ── Quick info popover ──────────────────────────────────────────────────────
function QuickPopover({ task, x, y }) {
  if (!task) return null;
  const days = daysBetween(parseDate(task.start), parseDate(task.end)) + 1;
  const r = (window.RESOURCES || []).find((x) => x.id === task.assignee);
  return (
    <div className="qp" style={{ left: x, top: y }}>
      <div className="qp-head" style={{ background: PHASE_COLORS[task.phase] }}>
        <span className="qp-id mono">{task.id}</span>
        <span className="qp-phase">{task.phase}</span>
      </div>
      <div className="qp-body">
        <div className="qp-title">{task.name}</div>
        <div className="qp-grid">
          <div><div className="qp-lbl">Inicio</div><div className="mono">{fmtDate(parseDate(task.start))}</div></div>
          <div><div className="qp-lbl">Fin</div><div className="mono">{fmtDate(parseDate(task.end))}</div></div>
          <div><div className="qp-lbl">Duración</div><div className="mono">{task.milestone ? "Hito" : days + " d"}</div></div>
          <div><div className="qp-lbl">Avance</div><div className="mono">{task.progress}%</div></div>
        </div>
        {r && (
          <div className="qp-asg">
            <Avatar id={r.id} size={20} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 12 }}>{r.name}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{r.role}</div>
            </div>
          </div>
        )}
        {task.critical && <div className="qp-crit"><Icon name="warning" size={12} color="#fff" /> Tarea en ruta crítica</div>}
        <div className="qp-hint">Doble clic para ver propiedades · clic derecho para más</div>
      </div>
    </div>
  );
}

// ── Properties dialog (Microsoft Project–style tabs) ────────────────────────
function TaskPropertiesDialog({ task, tasks, onClose, onChange }) {
  const [tab, setTab] = React.useState("general");
  const r = (window.RESOURCES || []).find((x) => x.id === task.assignee);
  const days = daysBetween(parseDate(task.start), parseDate(task.end)) + 1;
  const tabs = [
    { id: "general", label: "General" },
    { id: "predecesoras", label: "Predecesoras" },
    { id: "recursos", label: "Recursos" },
    { id: "avanzado", label: "Avanzado" },
    { id: "notas", label: "Notas" },
  ];
  return (
    <FloatingWindow title={`Información de tarea — ${task.name}`} icon="settings" onClose={onClose} initial={{ x: 320, y: 110 }} w={560}>
      <div className="dlg-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={"dlg-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="dlg-content">
        {tab === "general" && (
          <>
            <div className="dlg-row">
              <label>Nombre</label>
              <input className="dlg-field" value={task.name} onChange={(e) => onChange({ ...task, name: e.target.value })} />
            </div>
            <div className="dlg-grid">
              <div>
                <label>Inicio</label>
                <input className="dlg-field mono" value={fmtDateLong(parseDate(task.start))} readOnly />
              </div>
              <div>
                <label>Fin</label>
                <input className="dlg-field mono" value={fmtDateLong(parseDate(task.end))} readOnly />
              </div>
              <div>
                <label>Duración</label>
                <input className="dlg-field mono" value={task.milestone ? "0d (hito)" : days + " días"} readOnly />
              </div>
              <div>
                <label>Tipo</label>
                <select className="dlg-field" defaultValue={task.milestone ? "milestone" : "fixed"}>
                  <option value="fixed">Duración fija</option>
                  <option value="effort">Trabajo fijo</option>
                  <option value="units">Unidades fijas</option>
                  <option value="milestone">Hito</option>
                </select>
              </div>
            </div>
            <div className="dlg-row">
              <label>Avance · %</label>
              <div className="dlg-progress-row">
                <input type="range" className="dlg-slider" min="0" max="100" step="5" value={task.progress}
                       onChange={(e) => onChange({ ...task, progress: Number(e.target.value) })} />
                <input type="number" className="dlg-field dlg-num mono" min="0" max="100" value={task.progress}
                       onChange={(e) => onChange({ ...task, progress: Math.min(100, Math.max(0, Number(e.target.value))) })} />
                <span className="mono">%</span>
              </div>
            </div>
            <div className="dlg-grid">
              <div>
                <label>Prioridad</label>
                <select className="dlg-field" defaultValue="500">
                  <option value="100">Muy baja</option>
                  <option value="300">Baja</option>
                  <option value="500">Media</option>
                  <option value="700">Alta</option>
                  <option value="900">Muy alta</option>
                </select>
              </div>
              <div>
                <label>Fase</label>
                <input className="dlg-field" value={task.phase} readOnly />
              </div>
            </div>
            <div className="dlg-row">
              <label className="checkbox-lbl">
                <input type="checkbox" checked={!!task.critical} onChange={(e) => onChange({ ...task, critical: e.target.checked })} />
                Marcar como ruta crítica
              </label>
              <label className="checkbox-lbl">
                <input type="checkbox" />
                Hito
              </label>
              <label className="checkbox-lbl">
                <input type="checkbox" defaultChecked />
                Programación automática
              </label>
            </div>
          </>
        )}
        {tab === "predecesoras" && (
          <>
            <table className="dlg-table">
              <thead><tr><th>Id</th><th>Nombre</th><th>Tipo</th><th>Posposición</th></tr></thead>
              <tbody>
                {(task.deps || []).map((d) => {
                  const dep = tasks.find((x) => x.id === d);
                  return (
                    <tr key={d}>
                      <td className="mono">{d}</td>
                      <td>{dep ? dep.name : "—"}</td>
                      <td>FC (fin a comienzo)</td>
                      <td className="mono">0d</td>
                    </tr>
                  );
                })}
                {(!task.deps || task.deps.length === 0) && (
                  <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--ink-3)", padding: 20 }}>Sin predecesoras</td></tr>
                )}
              </tbody>
            </table>
            <button className="btn-secondary" style={{ marginTop: 10 }}><Icon name="plus" size={12} /> Agregar predecesora</button>
          </>
        )}
        {tab === "recursos" && (
          <>
            <table className="dlg-table">
              <thead><tr><th>Recurso</th><th>Rol</th><th>Unidades</th><th>Horas asignadas</th></tr></thead>
              <tbody>
                {r && (
                  <tr>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar id={r.id} size={18} /> {r.name}</div></td>
                    <td>{r.role}</td>
                    <td className="mono">100%</td>
                    <td className="mono">{(days * 6).toFixed(0)} h</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button className="btn-secondary" style={{ marginTop: 10 }}><Icon name="plus" size={12} /> Asignar recurso</button>
          </>
        )}
        {tab === "avanzado" && (
          <div className="dlg-grid">
            <div><label>Restricción</label><select className="dlg-field"><option>Lo antes posible</option><option>No comenzar antes de</option><option>Debe finalizar el</option></select></div>
            <div><label>Fecha de restricción</label><input className="dlg-field mono" placeholder="—" /></div>
            <div><label>Calendario</label><select className="dlg-field"><option>Estándar (8h/día)</option><option>24 horas</option><option>Turno noche</option></select></div>
            <div><label>Tipo de trabajo</label><select className="dlg-field"><option>Trabajo</option><option>Material</option></select></div>
            <div><label>Código WBS</label><input className="dlg-field mono" defaultValue={`1.${task.id.replace("T","").replace("M","M")}`} /></div>
            <div><label>Costo fijo</label><input className="dlg-field mono" defaultValue="$0" /></div>
          </div>
        )}
        {tab === "notas" && (
          <textarea className="dlg-field" rows="10" placeholder="Notas sobre la tarea, decisiones, riesgos relevantes…" defaultValue="" />
        )}
      </div>
      <div className="dlg-footer">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" onClick={onClose}>Aceptar</button>
      </div>
    </FloatingWindow>
  );
}

function ProjectInfoDialog({ onClose }) {
  return (
    <FloatingWindow title="Información del proyecto" icon="settings" onClose={onClose} initial={{ x: 380, y: 140 }} w={520}>
      <div className="dlg-content">
        <div className="dlg-grid">
          <div><label>Nombre</label><input className="dlg-field" defaultValue={PROJECT.name} /></div>
          <div><label>Código</label><input className="dlg-field mono" defaultValue={PROJECT.code} /></div>
          <div><label>Inicio</label><input className="dlg-field mono" defaultValue={fmtDateLong(parseDate(PROJECT.start))} /></div>
          <div><label>Cierre</label><input className="dlg-field mono" defaultValue={fmtDateLong(parseDate(PROJECT.end))} /></div>
          <div><label>Cliente</label><input className="dlg-field" defaultValue={PROJECT.client} /></div>
          <div><label>Director</label><input className="dlg-field" defaultValue={PROJECT.manager} /></div>
          <div><label>Calendario</label><select className="dlg-field"><option>Estándar (Lun-Vie 8h)</option></select></div>
          <div><label>Moneda</label><select className="dlg-field"><option>USD</option><option>EUR</option><option>COP</option></select></div>
          <div><label>Presupuesto BAC</label><input className="dlg-field mono" defaultValue={fmtMoney(PROJECT.budget)} /></div>
          <div><label>Estado</label><select className="dlg-field"><option>En curso</option><option>Pausado</option><option>Cerrado</option></select></div>
        </div>
      </div>
      <div className="dlg-footer">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn-primary" onClick={onClose}>Aceptar</button>
      </div>
    </FloatingWindow>
  );
}

// ── Main view ───────────────────────────────────────────────────────────────
function InlineText({ value, onCommit, mono, placeholder }) {
  const [v, setV] = React.useState(value);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) { ref.current.focus(); ref.current.select(); } }, []);
  const commit = () => { onCommit(v); };
  const cancel = () => { onCommit(value); };
  return (
    <input
      ref={ref}
      className={"inline-edit" + (mono ? " mono" : "")}
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { e.preventDefault(); cancel(); }
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function InlineProgress({ value, onCommit }) {
  const [v, setV] = React.useState(String(value));
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) { ref.current.focus(); ref.current.select(); } }, []);
  const commit = () => {
    const n = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
    onCommit(n);
  };
  return (
    <div className="prog-edit" onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        type="number"
        min="0" max="100" step="5"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { e.preventDefault(); onCommit(value); }
        }}
      />
      <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>%</span>
    </div>
  );
}

function InlineDate({ value, onCommit }) {
  const [v, setV] = React.useState(value);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) { ref.current.focus(); ref.current.select(); } }, []);
  return (
    <input
      ref={ref}
      type="date"
      className="date-edit"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); onCommit(v); }
        if (e.key === "Escape") { e.preventDefault(); onCommit(value); }
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

function AssigneePicker({ current, onPick, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => window.addEventListener("mousedown", handler), 0);
    return () => window.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div className="asg-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      {RESOURCES.map((r) => (
        <button key={r.id}
          className={"asg-picker-item" + (current === r.id ? " selected" : "")}
          onClick={() => { onPick(r.id); onClose(); }}>
          <Avatar id={r.id} size={20} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12 }}>{r.name}</span>
            <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{r.role}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function GanttView({ tweaks }) {
  const [tasks, setTasks] = usePersistedState("tasks", TASKS);
  const [zoom, setZoom] = React.useState(tweaks.ganttZoom || "week");
  const [collapsed, setCollapsed] = React.useState({});
  const [selected, setSelected] = React.useState("T11");
  const [tab, setTab] = React.useState("inicio");
  const [showCritical, setShowCritical] = React.useState(tweaks.showCritical);
  const [hover, setHover] = React.useState(null); // { task, x, y }
  const [ctx, setCtx] = React.useState(null);     // { x, y, items }
  const [dialog, setDialog] = React.useState(null); // { kind: 'task'|'project', taskId? }
  const [panels, setPanels] = React.useState({ detail: true });
  const [editing, setEditing] = React.useState(null); // { taskId, field }
  const [pickerFor, setPickerFor] = React.useState(null); // taskId for assignee picker
  const [customDayW, setCustomDayW] = React.useState(null); // overrides zoom when fit is active

  React.useEffect(() => setZoom(tweaks.ganttZoom || "week"), [tweaks.ganttZoom]);
  React.useEffect(() => setShowCritical(tweaks.showCritical), [tweaks.showCritical]);

  const projectStart = parseDate(PROJECT.start);
  const projectEnd = addDays(parseDate(PROJECT.end), 5);
  const totalDays = daysBetween(projectStart, projectEnd);
  const baseDayW = zoom === "day" ? 28 : zoom === "week" ? 12 : 5;
  const dayW = customDayW ?? baseDayW;
  const chartW = totalDays * dayW;

  // Group rows
  const phases = [];
  const seen = new Set();
  tasks.forEach((t) => { if (!seen.has(t.phase)) { phases.push(t.phase); seen.add(t.phase); } });
  const rows = [];
  phases.forEach((phase) => {
    const phaseTasks = tasks.filter((t) => t.phase === phase);
    const phaseStart = phaseTasks.reduce((min, t) => t.start < min ? t.start : min, phaseTasks[0].start);
    const phaseEnd = phaseTasks.reduce((max, t) => t.end > max ? t.end : max, phaseTasks[0].end);
    const phaseProgress = Math.round(phaseTasks.reduce((s, t) => s + t.progress, 0) / phaseTasks.length);
    rows.push({ kind: "phase", phase, start: phaseStart, end: phaseEnd, progress: phaseProgress, count: phaseTasks.length });
    if (!collapsed[phase]) phaseTasks.forEach((t) => rows.push({ kind: "task", task: t }));
  });

  const onBarMouseDown = (e, task, mode) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setSelected(task.id);
    setHover(null);
    const startX = e.clientX;
    const origStart = parseDate(task.start);
    const origEnd = parseDate(task.end);
    let dragged = false;
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 3) dragged = true;
      const dDays = Math.round(dx / dayW);
      if (!dragged) return;
      setTasks((prev) => prev.map((t) => {
        if (t.id !== task.id) return t;
        let ns = origStart, ne = origEnd;
        if (mode === "move") { ns = addDays(origStart, dDays); ne = addDays(origEnd, dDays); }
        if (mode === "left") { ns = addDays(origStart, dDays); if (ns >= ne) ns = addDays(ne, -1); }
        if (mode === "right") { ne = addDays(origEnd, dDays); if (ne <= ns) ne = addDays(ns, 1); }
        return { ...t, start: isoDate(ns), end: isoDate(ne) };
      }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      // Click without drag → open task properties dialog
      if (!dragged && mode === "move") {
        setDialog({ kind: "task", taskId: task.id });
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const updateTask = (newT) => setTasks((prev) => prev.map((t) => t.id === newT.id ? newT : t));

  const onContextMenu = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(task.id);
    const resources = window.RESOURCES || [];
    const phases = ["Discovery", "Configuración", "Migración", "Pruebas", "Go-live"];
    const setProgress = (p) => updateTask({ ...task, progress: p });

    setCtx({
      x: e.clientX, y: e.clientY,
      items: [
        { header: `${task.id} · ${task.name}` },
        { icon: "settings", label: "Información de tarea…", shortcut: "Shift+F2", onClick: () => setDialog({ kind: "task", taskId: task.id }) },
        { icon: "filter", label: "Renombrar", shortcut: "F2", onClick: () => setEditing({ taskId: task.id, field: "name" }) },
        { divider: true },
        { icon: "users", label: "Asignar a", submenu: [
          ...resources.map((r) => ({
            icon: "dot", label: `${r.name} · ${r.role}`,
            checked: task.assignee === r.id,
            onClick: () => updateTask({ ...task, assignee: r.id }),
          })),
          { divider: true },
          { icon: "filter", label: "Quitar responsable", disabled: !task.assignee, onClick: () => updateTask({ ...task, assignee: null }) },
        ]},
        { icon: "diamond", label: "Cambiar fase", submenu: phases.map((ph) => ({
          icon: "dot", label: ph, checked: task.phase === ph,
          onClick: () => updateTask({ ...task, phase: ph }),
        }))},
        { icon: "check", label: "Marcar avance", submenu: [
          { icon: "dot", label: "0%",   checked: task.progress === 0,   onClick: () => setProgress(0) },
          { icon: "dot", label: "25%",  checked: task.progress === 25,  onClick: () => setProgress(25) },
          { icon: "dot", label: "50%",  checked: task.progress === 50,  onClick: () => setProgress(50) },
          { icon: "dot", label: "75%",  checked: task.progress === 75,  onClick: () => setProgress(75) },
          { icon: "check", label: "100% (completada)", checked: task.progress === 100, onClick: () => setProgress(100) },
        ]},
        { icon: "arrowR", label: "Editar predecesoras…", onClick: () => setDialog({ kind: "task", taskId: task.id }) },
        { divider: true },
        { icon: "warning", label: task.critical ? "Quitar de ruta crítica" : "Marcar como crítica",
          checked: !!task.critical,
          onClick: () => updateTask({ ...task, critical: !task.critical }) },
        { icon: "diamond", label: task.milestone ? "Convertir en tarea" : "Convertir en hito",
          onClick: () => {
            if (task.milestone) {
              updateTask({ ...task, milestone: false, end: isoDate(addDays(parseDate(task.start), 5)) });
            } else {
              updateTask({ ...task, milestone: true, end: task.start });
            }
          } },
        { divider: true },
        { icon: "inbox", label: "Agregar nota…", onClick: () => setDialog({ kind: "task", taskId: task.id }) },
        { icon: "plus", label: "Insertar tarea encima" },
        { icon: "plus", label: "Insertar tarea debajo" },
        { icon: "download", label: "Duplicar tarea", onClick: () => {
          const copy = { ...task, id: task.id + "·copia", name: task.name + " (copia)" };
          setTasks((prev) => {
            const idx = prev.findIndex((t) => t.id === task.id);
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
          });
        }},
        { divider: true },
        { icon: "filter", label: "Copiar ID", onClick: () => navigator.clipboard?.writeText?.(task.id) },
        { icon: "filter", label: "Eliminar tarea", shortcut: "Supr",
          onClick: () => setTasks((prev) => prev.filter((t) => t.id !== task.id)) },
      ],
    });
  };

  // Headers
  const months = [];
  const subs = [];
  let cur = new Date(projectStart);
  let curMonth = -1;
  while (cur <= projectEnd) {
    if (cur.getMonth() !== curMonth) {
      curMonth = cur.getMonth();
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const days = Math.min(daysBetween(cur, monthEnd), daysBetween(cur, projectEnd));
      months.push({ label: cur.toLocaleDateString("es-ES", { month: "long", year: "numeric" }), days, x: daysBetween(projectStart, cur) * dayW, w: days * dayW });
    }
    cur = addDays(cur, 1);
  }
  function getISOWeek(d) {
    const t = new Date(d.valueOf());
    t.setDate(t.getDate() + 4 - (t.getDay() || 7));
    const yearStart = new Date(t.getFullYear(), 0, 1);
    return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  }
  if (zoom === "day") {
    let d = new Date(projectStart);
    while (d <= projectEnd) {
      subs.push({ label: d.getDate(), x: daysBetween(projectStart, d) * dayW, w: dayW, weekend: isWeekend(d) });
      d = addDays(d, 1);
    }
  } else {
    let d = startOfWeek(projectStart);
    while (d <= projectEnd) {
      const x = daysBetween(projectStart, d) * dayW;
      subs.push({ label: "S" + getISOWeek(d), x, w: 7 * dayW });
      d = addDays(d, 7);
    }
  }
  const today = parseDate("2026-04-22");
  const todayX = daysBetween(projectStart, today) * dayW;

  const taskRowIndex = {};
  rows.forEach((r, i) => { if (r.kind === "task") taskRowIndex[r.task.id] = i; });
  const arrows = [];
  tasks.forEach((t) => {
    if (!t.deps || taskRowIndex[t.id] == null) return;
    t.deps.forEach((depId) => {
      const dep = tasks.find((x) => x.id === depId);
      if (!dep || taskRowIndex[depId] == null) return;
      const fromX = daysBetween(projectStart, parseDate(dep.end)) * dayW;
      const fromY = taskRowIndex[depId] * ROW_H + ROW_H / 2;
      const toX = daysBetween(projectStart, parseDate(t.start)) * dayW;
      const toY = taskRowIndex[t.id] * ROW_H + ROW_H / 2;
      arrows.push({ id: `${depId}-${t.id}`, fromX, fromY, toX, toY, critical: t.critical && dep.critical });
    });
  });

  const chartHeight = rows.length * ROW_H;
  const headerScrollRef = React.useRef(null);
  const bodyScrollRef = React.useRef(null);
  const listScrollRef = React.useRef(null);

  React.useEffect(() => {
    const list = listScrollRef.current;
    const body = bodyScrollRef.current;
    const header = headerScrollRef.current;
    window.__ganttScrollSetup = { hasList: !!list, hasBody: !!body, hasHeader: !!header };
    if (!list || !body) return;
    // Track which element is the "source" of the current scroll burst.
    // Only the source's scroll event mirrors to the other; the mirrored
    // element's scroll event is ignored (its scrollTop already matches).
    let source = null;
    let clearTimer = null;
    const setSource = (el) => {
      source = el;
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => { source = null; }, 120);
    };
    const onList = () => {
      if (source && source !== list) return;
      setSource(list);
      if (body.scrollTop !== list.scrollTop) body.scrollTop = list.scrollTop;
    };
    const onBody = () => {
      if (header && header.scrollLeft !== body.scrollLeft) header.scrollLeft = body.scrollLeft;
      if (source && source !== body) return;
      setSource(body);
      if (list.scrollTop !== body.scrollTop) list.scrollTop = body.scrollTop;
    };
    list.addEventListener("scroll", onList, { passive: true });
    body.addEventListener("scroll", onBody, { passive: true });
    // Wheel handler on the list so users can horizontally scroll the chart
    // even when the cursor is over the (overflow-x:hidden) task list.
    const onListWheel = (e) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        body.scrollLeft += e.deltaX || e.deltaY;
        e.preventDefault();
      }
    };
    list.addEventListener("wheel", onListWheel, { passive: false });
    return () => {
      list.removeEventListener("scroll", onList);
      body.removeEventListener("scroll", onBody);
      list.removeEventListener("wheel", onListWheel);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  React.useEffect(() => {
    if (bodyScrollRef.current) {
      const containerW = bodyScrollRef.current.clientWidth;
      bodyScrollRef.current.scrollLeft = Math.max(0, todayX - containerW / 3);
    }
  }, []);

  const onBarHover = (e, t) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHover({ task: t, x: rect.left + rect.width / 2, y: rect.top });
  };

  const dialogTask = dialog?.kind === "task" ? tasks.find((t) => t.id === dialog.taskId) : null;
  const sel = tasks.find((t) => t.id === selected);

  // Computed status bar metrics
  const totalTasks = tasks.filter((t) => !t.milestone).length;
  const completedTasks = tasks.filter((t) => !t.milestone && t.progress >= 100).length;
  const avgProgress = Math.round(tasks.filter((t) => !t.milestone).reduce((s, t) => s + t.progress, 0) / totalTasks);

  return (
    <div className="msp-wrap" onClick={() => setHover(null)}>
      {/* Project banner */}
      <div className="msp-banner">
        <div className="msp-banner-mark">P</div>
        <div className="msp-banner-titles">
          <div className="msp-banner-name">{PROJECT.name}</div>
          <div className="msp-banner-code">{PROJECT.code} · {PROJECT.client}</div>
        </div>
        <div className="msp-banner-stat">
          <span className="lbl">Inicio</span>
          <span className="val">{fmtDate(parseDate(PROJECT.start))}</span>
        </div>
        <div className="msp-banner-stat">
          <span className="lbl">Cierre</span>
          <span className="val">{fmtDate(parseDate(PROJECT.end))}</span>
        </div>
        <div className="msp-banner-stat">
          <span className="lbl">Avance</span>
          <span className="val">{avgProgress}%</span>
        </div>
        <div className="msp-banner-stat">
          <span className="lbl">Tareas</span>
          <span className="val">{completedTasks}/{totalTasks}</span>
        </div>
        <div className="msp-banner-stat">
          <span className="lbl">Director</span>
          <span className="val">{PROJECT.manager}</span>
        </div>
        <div className="msp-banner-actions">
          <button className="msp-banner-btn" onClick={() => setDialog({ kind: "project" })}>
            <Icon name="settings" size={12} color="#fff" /> Información
          </button>
          <button className="msp-banner-btn">
            <Icon name="download" size={12} color="#fff" /> Exportar
          </button>
        </div>
      </div>

      <Ribbon
        tab={tab} setTab={setTab}
        ribbonProps={{
          onNewTask: () => setDialog({ kind: "newtask" }),
          onProperties: () => sel && setDialog({ kind: "task", taskId: sel.id }),
          onZoom: (z) => { setCustomDayW(null); setZoom(z); },
          zoom,
          fitActive: customDayW != null,
          onFitToScreen: () => {
            if (!bodyScrollRef.current) return;
            const w = bodyScrollRef.current.clientWidth;
            const dw = Math.max(2, Math.min(40, w / totalDays));
            setCustomDayW(dw);
          },
          onZoomReset: () => setCustomDayW(null),
          onShowCritical: () => setShowCritical((s) => !s),
          showCritical,
          onLink: () => {},
          onTogglePanel: (k) => setPanels((p) => ({ ...p, [k]: !p[k] })),
          panels,
        }}
      />

      <div className="msp-grid">
        {/* Left task list */}
        <div className="gantt-list">
          <div className="gantt-list-header">
            <div className="col-id">ID</div>
            <div className="col-name">Nombre de tarea</div>
            <div className="col-asg">Resp.</div>
            <div className="col-prog">%</div>
            <div className="col-dates">Inicio · Fin</div>
          </div>
          <div className="gantt-list-body" ref={listScrollRef}>
            {rows.map((r, i) => {
              if (r.kind === "phase") {
                return (
                  <div key={"p" + r.phase} className="row phase-row" style={{ height: ROW_H }}>
                    <div className="col-id">
                      <button className="caret" onClick={() => setCollapsed((c) => ({ ...c, [r.phase]: !c[r.phase] }))}>
                        <Icon name={collapsed[r.phase] ? "chevronR" : "chevronD"} size={11} color="var(--ink-2)" />
                      </button>
                    </div>
                    <div className="col-name">
                      <span className="phase-dot" style={{ background: PHASE_COLORS[r.phase] }} />
                      <strong>{r.phase}</strong>
                      <span className="phase-count">{r.count} tareas</span>
                    </div>
                    <div className="col-asg" />
                    <div className="col-prog">{r.progress}%</div>
                    <div className="col-dates">{fmtDate(parseDate(r.start))} → {fmtDate(parseDate(r.end))}</div>
                  </div>
                );
              }
              const t = r.task;
              const isEditing = (field) => editing && editing.taskId === t.id && editing.field === field;
              const startEdit = (field) => (e) => {
                e.stopPropagation();
                setSelected(t.id);
                setEditing({ taskId: t.id, field });
              };
              const commitField = (field, value) => {
                if (field === "name") updateTask({ ...t, name: value });
                else if (field === "progress") updateTask({ ...t, progress: value });
                else if (field === "start") {
                  // Keep duration if fits; else extend end
                  const oldStart = parseDate(t.start);
                  const oldEnd = parseDate(t.end);
                  const newStart = parseDate(value);
                  const dur = daysBetween(oldStart, oldEnd);
                  const newEnd = addDays(newStart, dur);
                  updateTask({ ...t, start: value, end: isoDate(newEnd) });
                } else if (field === "end") {
                  updateTask({ ...t, end: value });
                }
                setEditing(null);
              };
              return (
                <div key={t.id}
                  className={"row task-row" + (selected === t.id ? " selected" : "")}
                  style={{ height: ROW_H }}
                  onClick={() => setSelected(t.id)}
                  onContextMenu={(e) => onContextMenu(e, t)}
                >
                  <div className="col-id mono">{t.id}</div>
                  <div className="col-name">
                    {t.milestone && <Icon name="diamond" size={10} color={PHASE_COLORS[t.phase]} />}
                    {isEditing("name") ? (
                      <InlineText value={t.name} onCommit={(v) => commitField("name", v)} />
                    ) : (
                      <span
                        className={"editable" + (t.milestone ? " milestone-name" : "")}
                        onClick={selected === t.id ? startEdit("name") : undefined}
                        onDoubleClick={startEdit("name")}
                        title="Clic para editar"
                      >{t.name}</span>
                    )}
                    {t.critical && showCritical && <span className="crit-badge">CR</span>}
                  </div>
                  <div className="col-asg asg-cell-wrap">
                    {t.assignee && (
                      <button
                        style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); setSelected(t.id); setPickerFor(pickerFor === t.id ? null : t.id); }}
                        title="Cambiar responsable"
                      ><Avatar id={t.assignee} size={20} /></button>
                    )}
                    {!t.assignee && (
                      <button className="btn-secondary" style={{ padding: "1px 6px", fontSize: 10.5 }}
                        onClick={(e) => { e.stopPropagation(); setPickerFor(t.id); }}>+</button>
                    )}
                    {pickerFor === t.id && (
                      <AssigneePicker current={t.assignee}
                        onPick={(rid) => updateTask({ ...t, assignee: rid })}
                        onClose={() => setPickerFor(null)} />
                    )}
                  </div>
                  <div className="col-prog mono" onClick={selected === t.id && !t.milestone ? startEdit("progress") : undefined} onDoubleClick={!t.milestone ? startEdit("progress") : undefined}>
                    {isEditing("progress") ? (
                      <InlineProgress value={t.progress} onCommit={(v) => commitField("progress", v)} />
                    ) : (
                      <span className={t.milestone ? "" : "editable"} title={t.milestone ? "" : "Clic para editar"}>{t.milestone ? "—" : t.progress + "%"}</span>
                    )}
                  </div>
                  <div className="col-dates mono" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {isEditing("start") ? (
                      <InlineDate value={t.start} onCommit={(v) => commitField("start", v)} />
                    ) : (
                      <span className="editable"
                        onClick={selected === t.id ? startEdit("start") : undefined}
                        onDoubleClick={startEdit("start")}
                        title="Clic para editar inicio">{fmtDate(parseDate(t.start))}</span>
                    )}
                    {!t.milestone && <>
                      <span style={{ color: "var(--ink-3)" }}>→</span>
                      {isEditing("end") ? (
                        <InlineDate value={t.end} onCommit={(v) => commitField("end", v)} />
                      ) : (
                        <span className="editable"
                          onClick={selected === t.id ? startEdit("end") : undefined}
                          onDoubleClick={startEdit("end")}
                          title="Clic para editar fin">{fmtDate(parseDate(t.end))}</span>
                      )}
                    </>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right chart */}
        <div className="gantt-chart">
          <div className="gantt-chart-header" ref={headerScrollRef}>
            <div className="header-inner" style={{ width: chartW, height: HEADER_H }}>
              {months.map((m, i) => <div key={i} className="month-cell" style={{ left: m.x, width: m.w }}>{m.label}</div>)}
              {subs.map((s, i) => <div key={i} className={"sub-cell" + (s.weekend ? " weekend" : "")} style={{ left: s.x, width: s.w }}>{s.label}</div>)}
            </div>
          </div>
          <div className="gantt-chart-body" ref={bodyScrollRef}>
            <div className="chart-inner" style={{ width: chartW, height: chartHeight }}>
              {zoom !== "month" && Array.from({ length: totalDays }).map((_, i) => {
                const d = addDays(projectStart, i);
                if (!isWeekend(d)) return null;
                return <div key={"w" + i} className="weekend-strip" style={{ left: i * dayW, width: dayW }} />;
              })}
              {subs.map((s, i) => <div key={"v" + i} className="vline" style={{ left: s.x }} />)}
              {rows.map((r, i) => (
                <div key={"rb" + i}
                  className={"row-bg" + (r.kind === "phase" ? " phase" : "") + (r.kind === "task" && selected === r.task.id ? " selected" : "")}
                  style={{ top: i * ROW_H, height: ROW_H }}
                />
              ))}
              <div className="today-line" style={{ left: todayX, height: chartHeight }}>
                <div className="today-label">HOY · {fmtDate(today)}</div>
              </div>
              <svg className="dep-svg" width={chartW} height={chartHeight}>
                <defs>
                  <marker id="arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M0 0L8 4L0 8z" fill="var(--ink-3)" />
                  </marker>
                  <marker id="arrowCrit" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M0 0L8 4L0 8z" fill={PHASE_COLORS["Go-live"]} />
                  </marker>
                </defs>
                {arrows.map((a) => {
                  const isCrit = a.critical && showCritical;
                  const stroke = isCrit ? PHASE_COLORS["Go-live"] : "var(--ink-3)";
                  const path = `M ${a.fromX} ${a.fromY} L ${a.fromX + 4} ${a.fromY} L ${a.fromX + 4} ${a.toY} L ${a.toX - 2} ${a.toY}`;
                  return <path key={a.id} d={path} fill="none" stroke={stroke} strokeWidth={isCrit ? 1.4 : 1} opacity={isCrit ? 0.85 : 0.55} markerEnd={isCrit ? "url(#arrowCrit)" : "url(#arrow)"} />;
                })}
              </svg>
              {rows.map((r, i) => {
                if (r.kind === "phase") {
                  const x = daysBetween(projectStart, parseDate(r.start)) * dayW;
                  const w = (daysBetween(parseDate(r.start), parseDate(r.end)) + 1) * dayW;
                  return (
                    <div key={"pb" + r.phase} className="phase-bar" style={{ top: i * ROW_H + 9, left: x, width: w, height: 10, background: PHASE_COLORS[r.phase] }}>
                      <div className="phase-bar-progress" style={{ width: r.progress + "%" }} />
                    </div>
                  );
                }
                const t = r.task;
                const x = daysBetween(projectStart, parseDate(t.start)) * dayW;
                if (t.milestone) {
                  return (
                    <div key={"mb" + t.id}
                      className={"milestone" + (selected === t.id ? " selected" : "")}
                      style={{ top: i * ROW_H + ROW_H / 2 - 8, left: x - 8 }}
                      onClick={() => setSelected(t.id)}
                      onDoubleClick={() => setDialog({ kind: "task", taskId: t.id })}
                      onContextMenu={(e) => onContextMenu(e, t)}
                      onMouseEnter={(e) => onBarHover(e, t)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20">
                        <path d="M10 2l7 8-7 8-7-8z" fill={t.progress >= 100 ? PHASE_COLORS[t.phase] : "var(--surface-1)"} stroke={PHASE_COLORS[t.phase]} strokeWidth="1.5" />
                      </svg>
                    </div>
                  );
                }
                const w = (daysBetween(parseDate(t.start), parseDate(t.end)) + 1) * dayW;
                const isCrit = t.critical && showCritical;
                return (
                  <div key={"tb" + t.id}
                    className={"task-bar" + (isCrit ? " critical" : "") + (selected === t.id ? " selected" : "")}
                    style={{
                      top: i * ROW_H + 5, left: x, width: Math.max(w, 6), height: 18,
                      background: isCrit ? "rgba(184, 92, 56, 0.18)" : "var(--surface-2)",
                      borderColor: isCrit ? "rgba(184, 92, 56, 0.5)" : "var(--border-1)",
                    }}
                    onMouseDown={(e) => onBarMouseDown(e, t, "move")}
                    onMouseEnter={(e) => onBarHover(e, t)}
                    onMouseLeave={() => setHover(null)}
                    onDoubleClick={() => setDialog({ kind: "task", taskId: t.id })}
                    onContextMenu={(e) => onContextMenu(e, t)}
                  >
                    <div className="bar-handle left" onMouseDown={(e) => onBarMouseDown(e, t, "left")} />
                    <div className="bar-progress" style={{ width: t.progress + "%", background: isCrit ? PHASE_COLORS["Go-live"] : "var(--ink-1)" }} />
                    {w > 60 && <span className="bar-label" style={{ color: t.progress > 50 ? "#fff" : "var(--ink-1)" }}>{t.assignee} · {t.progress}%</span>}
                    <div className="bar-handle right" onMouseDown={(e) => onBarMouseDown(e, t, "right")} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="sb-cell">
          <Icon name="check" size={12} color="#3d6437" />
          <span>{completedTasks}/{totalTasks} tareas</span>
        </div>
        <div className="sb-cell"><span className="mono">{avgProgress}%</span> avance</div>
        <div className="sb-cell">
          <span className="phase-dot" style={{ background: PHASE_COLORS[sel?.phase || "Discovery"] }} />
          <span>Selección: <strong>{sel?.id}</strong> · {sel?.name}</span>
        </div>
        <div className="spacer" />
        <div className="sb-cell">Programación automática</div>
        <div className="sb-cell sb-zoom">
          <button onClick={() => { setCustomDayW(null); setZoom("day"); }} title="Acercar">−</button>
          <span className="mono">{customDayW != null ? "fit" : zoom}</span>
          <button onClick={() => { setCustomDayW(null); setZoom("month"); }} title="Alejar">+</button>
          <button onClick={() => {
            if (!bodyScrollRef.current) return;
            const w = bodyScrollRef.current.clientWidth;
            const dw = Math.max(2, Math.min(40, w / totalDays));
            setCustomDayW(dw);
          }} title="Ajustar a pantalla" style={{ marginLeft: 4 }}>⤢</button>
        </div>
        <div className="sb-cell">100%</div>
      </div>

      {/* Floating: hover popover */}
      {hover && hover.task && <QuickPopover task={hover.task} x={hover.x} y={hover.y - 8} />}

      {/* Floating: context menu */}
      {ctx && <ContextMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={() => setCtx(null)} />}

      {/* Floating: properties dialog */}
      {dialog?.kind === "task" && dialogTask && (
        <TaskPropertiesDialog task={dialogTask} tasks={tasks} onChange={updateTask} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "project" && <ProjectInfoDialog onClose={() => setDialog(null)} />}
      {dialog?.kind === "newtask" && (
        <FloatingWindow title="Nueva tarea" icon="plus" onClose={() => setDialog(null)} initial={{ x: 400, y: 160 }} w={460}>
          <div className="dlg-content">
            <div className="dlg-row"><label>Nombre</label><input className="dlg-field" autoFocus placeholder="Ej. Validación con sponsor" /></div>
            <div className="dlg-grid">
              <div><label>Inicio</label><input className="dlg-field mono" defaultValue="22/04/2026" /></div>
              <div><label>Duración</label><input className="dlg-field mono" defaultValue="5 días" /></div>
              <div>
                <label>Fase</label>
                <select className="dlg-field">{Object.keys(PHASE_COLORS).map((p) => <option key={p}>{p}</option>)}</select>
              </div>
              <div>
                <label>Responsable</label>
                <select className="dlg-field">{RESOURCES.map((r) => <option key={r.id}>{r.name}</option>)}</select>
              </div>
            </div>
            <label className="checkbox-lbl"><input type="checkbox" /> Hito</label>
          </div>
          <div className="dlg-footer">
            <button className="btn-secondary" onClick={() => setDialog(null)}>Cancelar</button>
            <button className="btn-primary" onClick={() => setDialog(null)}>Crear tarea</button>
          </div>
        </FloatingWindow>
      )}
    </div>
  );
}

Object.assign(window, { GanttView });
