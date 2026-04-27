// projects-view.jsx — Lista de proyectos REALES desde el gateway Odoo
//
// Si no hay sesión, muestra LoginScreen. Si hay sesión, muestra:
// - Topbar con usuario + selector de empresa + logout
// - Búsqueda + lista de proyectos con datos APU (plan activo, costo real,
//   margen %, readiness %)

function useAuthSession() {
  const [session, setSession] = usePersistedState("session", null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Verificar al montar si la cookie del browser sigue válida
  React.useEffect(() => {
    if (!session) return;
    let cancel = false;
    window.tramoApi.me()
      .then((s) => { if (!cancel) setSession(s); })
      .catch((e) => {
        if (!cancel && e.status === 401) setSession(null);
      });
    return () => { cancel = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si otro endpoint devuelve 401, limpiamos la sesión
  React.useEffect(() => {
    const onUnauth = () => setSession(null);
    window.addEventListener("api:unauthorized", onUnauth);
    return () => window.removeEventListener("api:unauthorized", onUnauth);
  }, [setSession]);

  const login = React.useCallback(async (loginEmail, apiKey) => {
    setLoading(true); setError(null);
    try {
      const s = await window.tramoApi.login(loginEmail, apiKey);
      setSession(s);
      return s;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  const logout = React.useCallback(async () => {
    try { await window.tramoApi.logout(); } catch {}
    setSession(null);
  }, [setSession]);

  const switchCompany = React.useCallback(async (companyId) => {
    setLoading(true); setError(null);
    try {
      const s = await window.tramoApi.switchCompany(companyId);
      setSession(s);
    } catch (e) {
      setError(e.message); throw e;
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  return { session, login, logout, switchCompany, loading, error };
}


function LoginScreen({ onLogin, loading, error }) {
  const [loginEmail, setLoginEmail] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!loginEmail || !apiKey) return;
    onLogin(loginEmail, apiKey).catch(() => {});
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">Tramo PM</div>
        <div className="login-sub">Conectar a Odoo</div>

        <label className="login-field">
          <span>Email Odoo</span>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="tu@empresa.com"
            autoFocus
            required
          />
        </label>

        <label className="login-field">
          <span>API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Generada en Odoo → Preferences → Account Security"
            required
          />
          <small>No usamos password — solo API key (más seguro y revocable).</small>
        </label>

        {error && <div className="login-err">{error}</div>}

        <button className="btn-primary" disabled={loading || !loginEmail || !apiKey}>
          {loading ? "Verificando…" : "Entrar"}
        </button>

        <div className="login-help">
          ¿Cómo generar API key? En Odoo top-right → <strong>Preferences</strong> →
          pestaña <strong>Account Security</strong> → <strong>New API Key</strong>.
        </div>
      </form>
    </div>
  );
}


function CompanySelector({ session, onSwitch, loading }) {
  const [open, setOpen] = React.useState(false);
  if (!session) return null;
  const others = session.allowed_companies.filter(c => c.id !== session.company_id);
  return (
    <div className="company-selector">
      <button
        className="company-current"
        onClick={() => setOpen(o => !o)}
        disabled={others.length === 0}
        title={others.length === 0 ? "Solo una empresa permitida" : "Cambiar empresa"}
      >
        <span className="company-label">Empresa</span>
        <span className="company-name">{session.company_name}</span>
        {others.length > 0 && <Icon name="chevronD" size={11} />}
      </button>
      {open && (
        <div className="company-menu" onMouseLeave={() => setOpen(false)}>
          {session.allowed_companies.map(c => (
            <button
              key={c.id}
              className={"company-opt" + (c.id === session.company_id ? " active" : "")}
              onClick={() => {
                setOpen(false);
                if (c.id !== session.company_id && !loading) onSwitch(c.id);
              }}
            >
              {c.id === session.company_id && <Icon name="check" size={11} />}
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function ProjectsList({ session, onLogout, switchCompany, loading: authLoading, onSelect }) {
  const [projects, setProjects] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const list = await window.tramoApi.listProjects({ search: search.trim() || undefined });
      setProjects(list);
    } catch (e) {
      setError(e.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => { load(); }, [session?.company_id]);

  const onSearchSubmit = (e) => { e.preventDefault(); load(); };

  return (
    <div className="proj-view">
      <div className="proj-toolbar">
        <CompanySelector session={session} onSwitch={switchCompany} loading={authLoading} />

        <form className="proj-search" onSubmit={onSearchSubmit}>
          <Icon name="search" size={13} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyecto…"
          />
        </form>

        <div className="proj-spacer" />

        <div className="proj-user">
          <span className="proj-user-name">{session.user_name}</span>
          <button className="btn-secondary" onClick={onLogout} title="Cerrar sesión">
            Salir
          </button>
        </div>
      </div>

      {error && <div className="proj-error">⚠ {error}</div>}

      {loading && !projects && <div className="proj-loading">Cargando proyectos…</div>}

      {projects && projects.length === 0 && !loading && (
        <div className="proj-empty">
          No hay proyectos {search ? `para "${search}"` : "activos"} en esta empresa.
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="proj-grid">
          {projects.map(p => <ProjectCard key={p.id} p={p} onClick={() => onSelect(p)} />)}
        </div>
      )}
    </div>
  );
}


function ProjectCard({ p, onClick }) {
  const fmt = (n) => n == null ? "—" : new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 }).format(n);
  const pct = (n) => n == null ? "—" : `${n.toFixed(1)}%`;
  return (
    <div className="proj-card proj-card-clickable" onClick={onClick}>
      <div className="proj-card-head">
        <div className="proj-card-name">{p.name}</div>
        {p.active_plan && (
          <div className="proj-card-badge" title={`Plan APU: ${p.active_plan.name}`}>
            <Icon name="gantt" size={11} /> Plan
          </div>
        )}
      </div>
      <div className="proj-card-meta">
        {p.partner && <span><Icon name="users" size={11} /> {p.partner.name}</span>}
        {p.manager && <span title="Responsable"><Icon name="users" size={11} /> {p.manager.name}</span>}
      </div>
      <div className="proj-card-stats">
        <div>
          <span className="proj-stat-l">Costo real</span>
          <span className="proj-stat-v mono">{fmt(p.actual_total_cost)} {p.currency?.name || ""}</span>
        </div>
        <div>
          <span className="proj-stat-l">Margen</span>
          <span className="proj-stat-v mono">{pct(p.actual_margin_pct)}</span>
        </div>
        <div>
          <span className="proj-stat-l">Readiness</span>
          <span className="proj-stat-v mono">{pct(p.execution_readiness_pct)}</span>
        </div>
      </div>
    </div>
  );
}


// ── ProjectDetailView ───────────────────────────────────────────────────────

const _fmtN = (n, dec = 0) => n == null ? "—" :
  new Intl.NumberFormat("es-BO", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n);
const _fmtPct = (n) => n == null ? "—" : `${n.toFixed(1)}%`;

const TYPE_LBL = { mat: "Materiales", mo: "Mano de obra", eq: "Equipo / Maquinaria", sub: "Subcontratos" };
const TYPE_ORDER = ["mat", "mo", "eq", "sub"];

function ItemRow({ it, currency, expanded, onToggle }) {
  const subtotal = (it.qty || 0) * (it.unit_cost || 0);
  // Composición por tipo (suma de líneas por tipo)
  const compByType = {};
  it.lines.forEach(ln => {
    compByType[ln.type] = (compByType[ln.type] || 0) + (ln.subtotal || 0);
  });
  return (
    <>
      <tr className={(it.is_complementary ? "cat-row-complementary " : "") + (expanded ? "cat-row-open" : "") + (it.lines.length > 0 ? " cat-row-expandable" : "")}
          onClick={it.lines.length > 0 ? onToggle : undefined}>
        <td className="cat-expand-cell">
          {it.lines.length > 0 ? (
            <Icon name="chevronR" size={11} style={{transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s", color: "var(--ink-3)"}} />
          ) : <span style={{display:"inline-block", width:11}} />}
        </td>
        <td>{it.name}{it.is_complementary && <span className="cat-tag">complementaria</span>}</td>
        <td className="cat-uom">{it.uom || "—"}</td>
        <td className="num mono">{_fmtN(it.qty, 2)}</td>
        <td className="num mono">{_fmtN(it.unit_cost, 2)}</td>
        <td className="num mono cat-ref">{_fmtN(it.ref_price, 2)}</td>
        <td className="num mono"><strong>{_fmtN(subtotal)}</strong></td>
        <td className="num mono cat-incid">{_fmtPct(it.incidence_pct)}</td>
      </tr>
      {expanded && (
        <tr className="cat-lines-row">
          <td></td>
          <td colSpan={7}>
            <div className="cat-lines-wrap">
              <div className="cat-lines-summary">
                <span className="cat-lines-title">Composición del PU directo ({_fmtN(it.unit_cost, 2)} {currency || ""}/{it.uom || "u"})</span>
                <div className="cat-lines-sum">
                  {TYPE_ORDER.map(t => compByType[t] ? (
                    <span key={t} className={`cat-type cat-type-${t}`}>{TYPE_LBL[t]}: <strong>{_fmtN(compByType[t], 2)}</strong></span>
                  ) : null)}
                </div>
              </div>
              <table className="cat-lines-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Tipo</th>
                    <th>Unidad</th>
                    <th className="num">Rendimiento</th>
                    <th className="num">PU insumo</th>
                    <th className="num">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {[...it.lines].sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)).map(ln => (
                    <tr key={ln.id}>
                      <td>{ln.insumo?.name || "—"}</td>
                      <td><span className={`cat-type cat-type-${ln.type}`}>{ln.type.toUpperCase()}</span></td>
                      <td className="cat-uom">{ln.uom || "—"}</td>
                      <td className="num mono">{_fmtN(ln.quantity, 4)}</td>
                      <td className="num mono">{_fmtN(ln.price_unit, 2)}</td>
                      <td className="num mono">{_fmtN(ln.subtotal, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CatalogTab({ project, catalog }) {
  const [expanded, setExpanded] = React.useState({}); // {itemId: bool}
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  // KPIs
  const totalBudget = catalog.rubros.reduce((s, r) => s + (r.total_amount || 0), 0);
  const totalActual = catalog.items.reduce((s, it) => s + (it.actual_cost || 0), 0);
  const currency = project.currency?.name || "";

  // Items por rubro
  const itemsByRubro = {};
  catalog.items.forEach(it => {
    const rid = it.rubro?.id ?? 0;
    (itemsByRubro[rid] = itemsByRubro[rid] || []).push(it);
  });

  // Insumos por tipo + totales
  const insumosByType = { mat: [], mo: [], eq: [], sub: [] };
  catalog.insumos.forEach(i => {
    if (insumosByType[i.type]) insumosByType[i.type].push(i);
    else (insumosByType.mat).push(i); // fallback
  });
  const totalsByType = {};
  TYPE_ORDER.forEach(t => {
    totalsByType[t] = insumosByType[t].reduce((s, i) => s + (i.total_amount || 0), 0);
  });

  return (
    <div className="cat-tab">
      <div className="cat-kpis">
        <div className="cat-kpi"><span>Presupuesto</span><strong className="mono">{_fmtN(totalBudget)} {currency}</strong></div>
        <div className="cat-kpi"><span>Costo real</span><strong className="mono">{_fmtN(totalActual)} {currency}</strong></div>
        <div className="cat-kpi"><span>Rubros</span><strong className="mono">{catalog.rubros.length}</strong></div>
        <div className="cat-kpi"><span>Items APU</span><strong className="mono">{catalog.items.length}</strong></div>
        <div className="cat-kpi"><span>Insumos</span><strong className="mono">{catalog.insumos.length}</strong></div>
      </div>

      {catalog.rubros.length === 0 && catalog.items.length === 0 && (
        <div className="proj-empty">Este proyecto aún no tiene rubros ni ítems APU cargados en Odoo.</div>
      )}

      {catalog.rubros.map(rubro => {
        const items = itemsByRubro[rubro.id] || [];
        return (
          <div key={rubro.id} className="cat-rubro">
            <div className="cat-rubro-head">
              <div className="cat-rubro-name">{rubro.name}</div>
              <div className="cat-rubro-stats">
                <span className="mono">{_fmtN(rubro.total_amount)} {currency}</span>
                <span className="cat-rubro-incid mono">{_fmtPct(rubro.incidence_pct)}</span>
                <span className="cat-rubro-count">{items.length} ítems</span>
              </div>
            </div>
            {items.length === 0 ? (
              <div className="cat-empty-row">Sin ítems en este rubro.</div>
            ) : (
              <table className="cat-table">
                <thead>
                  <tr>
                    <th style={{width:"24px"}}></th>
                    <th style={{width:"40%"}}>Item APU</th>
                    <th>Unidad</th>
                    <th className="num">Cantidad</th>
                    <th className="num">PU directo</th>
                    <th className="num">PU referencia</th>
                    <th className="num">Subtotal</th>
                    <th className="num">Incidencia</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <ItemRow key={it.id} it={it} currency={currency}
                             expanded={!!expanded[it.id]}
                             onToggle={() => toggle(it.id)} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      <div className="cat-insumos-sections">
        <div className="cat-insumos-head-main">
          <strong>Insumos del proyecto</strong>
          <span className="cat-insumos-meta">{catalog.insumos.length} en total</span>
        </div>
        {TYPE_ORDER.map(t => {
          const list = insumosByType[t];
          if (list.length === 0) return null;
          return (
            <div key={t} className="cat-insumos-section">
              <div className={`cat-insumos-section-head cat-insumos-section-${t}`}>
                <span className={`cat-type cat-type-${t}`}>{TYPE_LBL[t]}</span>
                <span className="cat-insumos-section-count">{list.length} insumos</span>
                <span className="cat-insumos-section-total mono">Total: {_fmtN(totalsByType[t])} {currency}</span>
              </div>
              <table className="cat-table cat-insumos-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Unidad</th>
                    <th className="num">PU</th>
                    <th className="num">Cant. total</th>
                    <th className="num">Monto total</th>
                    <th>Producto Odoo</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(i => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td className="cat-uom">{i.uom || "—"}</td>
                      <td className="num mono">{_fmtN(i.price_unit, 2)}</td>
                      <td className="num mono">{_fmtN(i.total_qty, 2)}</td>
                      <td className="num mono">{_fmtN(i.total_amount)}</td>
                      <td className="cat-product">{i.odoo_product?.name || (i.linked_item ? <em>desde APU</em> : "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PlanTab (Gantt editable contra apu.project.plan) ───────────────────

const DAY_W = 24;       // px por día generico
const NAME_COL_W = 360; // px columna nombres

const STATE_META = {
  draft:     { label: "Borrador",      icon: "✏️", cls: "plan-state-draft",     desc: "Editable por completo" },
  baseline:  { label: "Línea base",    icon: "🔒", cls: "plan-state-baseline",  desc: "Solo se reportan avance y fechas reales" },
  approved:  { label: "Aprobado",      icon: "✓",  cls: "plan-state-approved",  desc: "Solo se reportan avance y fechas reales" },
  execution: { label: "En ejecución",  icon: "▶",  cls: "plan-state-execution", desc: "Solo se reportan avance y fechas reales" },
  closed:    { label: "Cerrado",       icon: "⛔", cls: "plan-state-closed",    desc: "Solo lectura" },
};

function canEditStructure(state) { return state === "draft"; }
function canEditActuals(state) { return state !== "closed"; }


function PlanTab({ project, plan: planData, onReload }) {
  const { plan, links } = planData;
  const [lines, setLines] = React.useState(planData.lines);
  const [collapsed, setCollapsed] = React.useState({});
  const [editing, setEditing] = React.useState(null); // {lineId, field}
  const [ctxMenu, setCtxMenu] = React.useState(null); // {x, y, line}
  const [dialogLine, setDialogLine] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => { setLines(planData.lines); }, [planData.lines]);

  const editStructure = canEditStructure(plan.state);

  // Optimistic update + sync
  const updateLine = React.useCallback(async (lineId, patch) => {
    const before = lines.find(l => l.id === lineId);
    setLines(curr => curr.map(l => l.id === lineId ? { ...l, ...patch } : l));
    setBusy(true); setError(null);
    try {
      await window.tramoApi.updatePlanLine(project.id, lineId, patch);
    } catch (e) {
      setError(e.message);
      setLines(curr => curr.map(l => l.id === lineId ? before : l));
    } finally {
      setBusy(false);
    }
  }, [lines, project.id]);

  const visible = React.useMemo(() => {
    const isHidden = (line) => {
      let cur = line.parent_id;
      while (cur) {
        if (collapsed[cur]) return true;
        const parent = lines.find(l => l.id === cur);
        cur = parent?.parent_id;
      }
      return false;
    };
    return lines.filter(ln => !isHidden(ln));
  }, [lines, collapsed]);

  const maxDay = lines.reduce((m, l) => Math.max(m, l.generic_finish_day || 0), 8);
  const totalDays = Math.max(maxDay + 2, 14);
  const linksByTo = React.useMemo(() => {
    const m = {};
    links.forEach(l => { (m[l.to_line] = m[l.to_line] || []).push(l); });
    return m;
  }, [links]);
  const childCount = React.useMemo(() => {
    const m = {};
    lines.forEach(l => { if (l.parent_id) m[l.parent_id] = (m[l.parent_id] || 0) + 1; });
    return m;
  }, [lines]);

  return (
    <div className="plan-tab">
      <PlanHeaderBar plan={plan} project={project} onReload={onReload} busy={busy} />

      {error && <div className="proj-error">⚠ {error}</div>}

      <div className="plan-gantt">
        <div className="plan-grid plan-grid-head" style={{gridTemplateColumns: `${NAME_COL_W}px 1fr`}}>
          <div className="plan-name-head">Actividad / agrupador</div>
          <div className="plan-tl-head" style={{minWidth: totalDays * DAY_W}}>
            {Array.from({length: totalDays}, (_, i) => i + 1).map(d => (
              <div key={d} className={"plan-tl-day" + (d % 7 === 1 ? " plan-tl-week" : "")} style={{left: (d-1)*DAY_W, width: DAY_W}}>
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="plan-grid-body">
          {visible.map(ln => (
            <PlanRow
              key={ln.id}
              line={ln}
              isGroup={(childCount[ln.id] || 0) > 0}
              collapsed={!!collapsed[ln.id]}
              onToggleCollapse={() => setCollapsed(c => ({...c, [ln.id]: !c[ln.id]}))}
              totalDays={totalDays}
              lines={lines}
              linksByTo={linksByTo}
              editStructure={editStructure}
              editing={editing}
              onStartEdit={(field) => editStructure && setEditing({ lineId: ln.id, field })}
              onCancelEdit={() => setEditing(null)}
              onCommitEdit={async (patch) => {
                setEditing(null);
                await updateLine(ln.id, patch);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setCtxMenu({ x: e.clientX, y: e.clientY, line: ln });
              }}
              onOpenDialog={() => setDialogLine(ln)}
              onDragCommit={async (patch) => updateLine(ln.id, patch)}
            />
          ))}
        </div>
      </div>

      <div className="plan-legend">
        <span><span className="plan-legend-bar" /> Actividad</span>
        <span><span className="plan-legend-bar plan-bar-critical" /> Crítica</span>
        <span><span className="plan-legend-bar plan-bar-group" /> Grupo</span>
        <span><span className="plan-legend-mile">◆</span> Hito</span>
        <span className="plan-legend-meta">
          {editStructure
            ? "✏️ Editable: doble click en nombre o arrastra las barras. Click derecho para más opciones."
            : "🔒 Estructura bloqueada — solo se editan avance y fechas reales (click derecho o doble click)."}
        </span>
      </div>

      {ctxMenu && (
        <PlanContextMenu
          x={ctxMenu.x} y={ctxMenu.y} line={ctxMenu.line}
          editStructure={editStructure}
          canActuals={canEditActuals(plan.state)}
          onClose={() => setCtxMenu(null)}
          onAction={(action) => {
            const ln = ctxMenu.line;
            setCtxMenu(null);
            if (action === "props") setDialogLine(ln);
            else if (action === "rename") setEditing({ lineId: ln.id, field: "name" });
            else if (action === "today_start") updateLine(ln.id, { actual_start: new Date().toISOString().slice(0,10) });
            else if (action === "today_finish") updateLine(ln.id, { actual_finish: new Date().toISOString().slice(0,10), progress_pct: 100 });
            else if (action === "clear_actuals") updateLine(ln.id, { actual_start: "", actual_finish: "", progress_pct: 0 });
          }}
        />
      )}

      {dialogLine && (
        <PlanPropsDialog
          line={dialogLine}
          plan={plan}
          editStructure={editStructure}
          canActuals={canEditActuals(plan.state)}
          onClose={() => setDialogLine(null)}
          onSave={async (patch) => {
            await updateLine(dialogLine.id, patch);
            setDialogLine(null);
          }}
        />
      )}
    </div>
  );
}


function PlanRow({ line: ln, isGroup, collapsed, onToggleCollapse, totalDays, lines, linksByTo, editStructure, editing, onStartEdit, onCancelEdit, onCommitEdit, onContextMenu, onOpenDialog, onDragCommit }) {
  const lvl = (ln.level || 1) - 1;
  const isMilestone = (ln.duration_days || 0) === 0 || ln.milestone_category;
  const preds = linksByTo[ln.id] || [];
  const isEditingName = editing?.lineId === ln.id && editing?.field === "name";

  // Drag/resize state
  const [drag, setDrag] = React.useState(null); // { mode:'move'|'resize', startX, origStart, origDur }
  const liveStart = drag?.previewStart ?? ln.generic_start_day;
  const liveDur = drag?.previewDur ?? ln.duration_days;
  const barLeft = (Math.max(1, liveStart) - 1) * DAY_W;
  const barWidth = Math.max(1, liveDur || (ln.generic_finish_day - liveStart + 1)) * DAY_W;

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      const dxDays = Math.round((e.clientX - drag.startX) / DAY_W);
      if (drag.mode === "move") {
        const newStart = Math.max(1, drag.origStart + dxDays);
        setDrag(d => ({ ...d, previewStart: newStart }));
      } else if (drag.mode === "resize") {
        const newDur = Math.max(1, drag.origDur + dxDays);
        setDrag(d => ({ ...d, previewDur: newDur }));
      }
    };
    const onUp = async () => {
      const moved = (drag.previewStart != null && drag.previewStart !== drag.origStart) ||
                    (drag.previewDur != null && drag.previewDur !== drag.origDur);
      if (moved) {
        if (drag.mode === "move") {
          const ns = drag.previewStart;
          await onDragCommit({ generic_start_day: ns, generic_finish_day: ns + ln.duration_days - 1 });
        } else {
          const nd = drag.previewDur;
          await onDragCommit({ duration_days: nd, generic_finish_day: ln.generic_start_day + nd - 1 });
        }
      }
      setDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [drag, ln, onDragCommit]);

  const startDrag = (mode, e) => {
    if (!editStructure || isGroup || isMilestone) return;
    e.stopPropagation();
    setDrag({
      mode,
      startX: e.clientX,
      origStart: ln.generic_start_day,
      origDur: ln.duration_days,
    });
  };

  return (
    <div className="plan-grid plan-grid-row" style={{gridTemplateColumns: `${NAME_COL_W}px 1fr`}} onContextMenu={onContextMenu}>
      <div className={"plan-name" + (isGroup ? " plan-name-group" : "") + (ln.is_critical ? " plan-name-critical" : "")}
           style={{paddingLeft: 8 + lvl * 14}}>
        {isGroup ? (
          <button className="plan-chevron" onClick={onToggleCollapse}>
            <Icon name="chevronR" size={11} style={{transform: collapsed ? "none" : "rotate(90deg)", transition:"transform .15s"}} />
          </button>
        ) : (
          <span className="plan-chevron-spacer" />
        )}
        {isEditingName ? (
          <InlineNameEdit value={ln.name} onCommit={(v) => onCommitEdit({ name: v })} onCancel={onCancelEdit} />
        ) : (
          <span
            className="plan-name-text"
            onDoubleClick={() => editStructure && onStartEdit("name")}
            title={editStructure ? "Doble click para renombrar" : ln.name}
          >
            {ln.code && <span className="plan-code">{ln.code}</span>}{ln.name}
          </span>
        )}
        <span className="plan-name-meta">
          {ln.progress_pct > 0 && <span className="plan-progress mono">{ln.progress_pct.toFixed(0)}%</span>}
          {ln.duration_days > 0 && <span>{ln.duration_days}d</span>}
          {ln.is_critical && <span className="plan-pill plan-pill-crit">crítica</span>}
          {ln.actual_start && !ln.actual_finish && <span className="plan-pill plan-pill-real">en curso</span>}
          {ln.actual_finish && <span className="plan-pill plan-pill-done">terminada</span>}
        </span>
      </div>
      <div className="plan-tl-row" style={{minWidth: totalDays * DAY_W}}>
        {Array.from({length: totalDays}, (_, i) => i + 1).map(d => (
          d % 7 === 1 ? <div key={d} className="plan-week-line" style={{left: (d-1)*DAY_W}} /> : null
        ))}
        {isMilestone ? (
          <div className={"plan-milestone" + (ln.is_critical ? " critical" : "")}
               style={{left: barLeft - 6}}
               onContextMenu={onContextMenu}
               onDoubleClick={onOpenDialog}
               title={`${ln.name} · día ${ln.generic_start_day}`}>◆</div>
        ) : (
          <div className={"plan-bar"
                        + (isGroup ? " plan-bar-group" : "")
                        + (ln.is_critical ? " plan-bar-critical" : "")
                        + (drag ? " plan-bar-dragging" : "")
                        + (editStructure && !isGroup ? " plan-bar-editable" : "")}
               style={{left: barLeft, width: barWidth}}
               onMouseDown={(e) => startDrag("move", e)}
               onContextMenu={onContextMenu}
               onDoubleClick={onOpenDialog}
               title={`${ln.name}\n${ln.duration_days}d · días ${ln.generic_start_day}-${ln.generic_finish_day}${editStructure?"\nArrastra para mover · Doble click para propiedades":""}`}>
            {/* Progress overlay */}
            {ln.progress_pct > 0 && (
              <div className="plan-bar-progress" style={{width: `${Math.min(100, ln.progress_pct)}%`}} />
            )}
            <span className="plan-bar-label">{liveDur}d</span>
            {editStructure && !isGroup && (
              <div className="plan-bar-resize" onMouseDown={(e) => startDrag("resize", e)} title="Arrastra para redimensionar" />
            )}
          </div>
        )}
        {preds.map(link => {
          const from = lines.find(l => l.id === link.from_line);
          if (!from) return null;
          const fromX = (from.generic_finish_day) * DAY_W;
          const toX = barLeft;
          if (toX < fromX) return null;
          return (
            <div key={link.id} className="plan-arrow"
                 style={{left: Math.min(fromX, toX), width: Math.abs(toX - fromX)}}
                 title={`${link.type.toUpperCase()} lag ${link.lag_days}d`} />
          );
        })}
      </div>
    </div>
  );
}


function InlineNameEdit({ value, onCommit, onCancel }) {
  const [v, setV] = React.useState(value);
  const ref = React.useRef(null);
  React.useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  const submit = () => v !== value ? onCommit(v) : onCancel();
  return (
    <input
      ref={ref}
      className="plan-name-input"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
        else if (e.key === "Escape") onCancel();
      }}
    />
  );
}


function PlanContextMenu({ x, y, line, editStructure, canActuals, onClose, onAction }) {
  React.useEffect(() => {
    const close = () => onClose();
    setTimeout(() => {
      window.addEventListener("click", close);
      window.addEventListener("contextmenu", close);
    }, 0);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
    };
  }, [onClose]);

  const items = [
    { label: "Información…", icon: "📋", action: "props" },
    { type: "sep" },
    ...(editStructure ? [{ label: "Renombrar", icon: "✏️", action: "rename" }] : []),
    ...(canActuals ? [
      { label: "Marcar inicio real (hoy)", icon: "▶", action: "today_start" },
      { label: "Marcar terminada (hoy)", icon: "✓", action: "today_finish" },
      { type: "sep" },
      { label: "Limpiar fechas reales", icon: "↺", action: "clear_actuals" },
    ] : []),
  ];

  // Posición evitando salir de viewport
  const menuW = 220, menuH = items.length * 28 + 16;
  const left = Math.min(x, window.innerWidth - menuW - 8);
  const top = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div className="plan-ctx-menu" style={{left, top}} onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
      <div className="plan-ctx-header">{line.name}</div>
      {items.map((it, i) => it.type === "sep" ? (
        <div key={i} className="plan-ctx-sep" />
      ) : (
        <button key={i} className="plan-ctx-item" onClick={() => onAction(it.action)}>
          <span className="plan-ctx-icon">{it.icon}</span> {it.label}
        </button>
      ))}
    </div>
  );
}


function PlanPropsDialog({ line, plan, editStructure, canActuals, onClose, onSave }) {
  const [tab, setTab] = React.useState(editStructure ? "general" : "exec");
  const [form, setForm] = React.useState({
    name: line.name,
    code: line.code || "",
    duration_days: line.duration_days,
    generic_start_day: line.generic_start_day,
    progress_pct: line.progress_pct,
    actual_start: line.actual_start || "",
    actual_finish: line.actual_finish || "",
  });
  const [saving, setSaving] = React.useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value === "" ? "" : Number(e.target.value) }));

  const save = async () => {
    setSaving(true);
    const patch = {};
    if (editStructure) {
      if (form.name !== line.name) patch.name = form.name;
      if (form.code !== (line.code || "")) patch.code = form.code;
      if (Number(form.duration_days) !== line.duration_days) patch.duration_days = Number(form.duration_days);
      if (Number(form.generic_start_day) !== line.generic_start_day) {
        patch.generic_start_day = Number(form.generic_start_day);
        patch.generic_finish_day = Number(form.generic_start_day) + Number(form.duration_days) - 1;
      }
    }
    if (canActuals) {
      if (Number(form.progress_pct) !== line.progress_pct) patch.progress_pct = Number(form.progress_pct);
      if (form.actual_start !== (line.actual_start || "")) patch.actual_start = form.actual_start;
      if (form.actual_finish !== (line.actual_finish || "")) patch.actual_finish = form.actual_finish;
    }
    if (Object.keys(patch).length === 0) { onClose(); return; }
    try { await onSave(patch); }
    finally { setSaving(false); }
  };

  return (
    <div className="plan-dialog-backdrop" onClick={onClose}>
      <div className="plan-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="plan-dialog-head">
          <div>
            <div className="plan-dialog-title">{line.name}</div>
            <div className="plan-dialog-sub">Línea #{line.id} · {plan.name}</div>
          </div>
          <button className="plan-dialog-close" onClick={onClose}>✕</button>
        </div>
        <div className="plan-dialog-tabs">
          <button className={"plan-dialog-tab" + (tab === "general" ? " active" : "")} onClick={() => setTab("general")}>General</button>
          <button className={"plan-dialog-tab" + (tab === "exec" ? " active" : "")} onClick={() => setTab("exec")}>Ejecución</button>
        </div>

        {tab === "general" && (
          <div className="plan-dialog-body">
            {!editStructure && <div className="plan-dialog-note">Plan en estado <strong>{STATE_META[plan.state]?.label}</strong> — solo lectura. Desbloqueá para editar.</div>}
            <Field label="Nombre">
              <input value={form.name} onChange={set("name")} disabled={!editStructure} />
            </Field>
            <Field label="Código">
              <input value={form.code} onChange={set("code")} disabled={!editStructure} />
            </Field>
            <Field label="Duración (días)">
              <input type="number" min="0" value={form.duration_days} onChange={setNum("duration_days")} disabled={!editStructure} />
            </Field>
            <Field label="Día de inicio (relativo)">
              <input type="number" min="1" value={form.generic_start_day} onChange={setNum("generic_start_day")} disabled={!editStructure} />
            </Field>
            <Field label="Crítica">
              <input type="checkbox" checked={!!line.is_critical} disabled readOnly />
              <small>Calculado por Odoo según CPM</small>
            </Field>
          </div>
        )}

        {tab === "exec" && (
          <div className="plan-dialog-body">
            <Field label="Avance (%)">
              <input type="number" min="0" max="100" step="1" value={form.progress_pct} onChange={setNum("progress_pct")} disabled={!canActuals} />
            </Field>
            <Field label="Inicio real">
              <input type="date" value={form.actual_start} onChange={set("actual_start")} disabled={!canActuals} />
            </Field>
            <Field label="Fin real">
              <input type="date" value={form.actual_finish} onChange={set("actual_finish")} disabled={!canActuals} />
            </Field>
            {!canActuals && <div className="plan-dialog-note">Plan cerrado — solo lectura.</div>}
          </div>
        )}

        <div className="plan-dialog-foot">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="plan-field">
      <span>{label}</span>
      <div className="plan-field-input">{children}</div>
    </label>
  );
}


function PlanHeaderBar({ plan, project, onReload, busy }) {
  const meta = STATE_META[plan.state] || STATE_META.draft;
  const canUnlock = plan.state !== "draft" && plan.state !== "closed";
  const [unlocking, setUnlocking] = React.useState(false);

  const unlock = async () => {
    if (!window.confirm(`Esto vuelve el plan a estado Borrador (state='draft') en Odoo, permitiendo editar dates/duración. La baseline sigue registrada pero queda destrabada.\n\n¿Continuar?`)) return;
    setUnlocking(true);
    try {
      await window.tramoApi.unlockPlan(project.id);
      onReload?.();
    } catch (e) {
      alert(`No se pudo desbloquear: ${e.message}`);
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="plan-header">
      <div className="plan-header-main">
        <strong>{plan.name}</strong>
        {plan.baseline_date && <span className="plan-header-meta">Línea base: {plan.baseline_date}</span>}
      </div>
      <div className="plan-header-stats">
        <div><span>Críticas</span><strong className="mono">{plan.critical_count}</strong></div>
        <div><span>Cuadrillas</span><strong className="mono">{plan.crew_count}</strong></div>
        <div><span>Readiness</span><strong className="mono">{plan.execution_readiness_pct.toFixed(1)}%</strong></div>
        <div><span>Earned</span><strong className="mono">{_fmtN(plan.earned_amount)} {plan.currency?.name||""}</strong></div>
      </div>
      <div className={"plan-state-badge " + meta.cls} title={meta.desc}>
        <span>{meta.icon}</span> {meta.label}
      </div>
      {canUnlock && (
        <button className="plan-unlock-btn" onClick={unlock} disabled={unlocking || busy} title="Volver a borrador para editar la estructura">
          {unlocking ? "…" : "Desbloquear"}
        </button>
      )}
    </div>
  );
}


function ProjectDetailView({ project, onBack }) {
  const [tab, setTab] = React.useState("catalog");
  const [catalog, setCatalog] = React.useState(null);
  const [planData, setPlanData] = React.useState(null);
  const [planError, setPlanError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [costEntries, setCostEntries] = React.useState(null);
  const [costError, setCostError] = React.useState(null);

  // Catálogo: siempre lo precargamos (la otra tab puede cargarse on-demand)
  React.useEffect(() => {
    let cancel = false;
    setLoading(true); setError(null);
    window.tramoApi.getCatalog(project.id)
      .then(c => { if (!cancel) setCatalog(c); })
      .catch(e => { if (!cancel) setError(e.message); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [project.id]);

  // Plan: lazy cuando se entra al tab Plan
  const loadPlan = React.useCallback(() => {
    setPlanError(null);
    setPlanData(null);
    window.tramoApi.getPlan(project.id)
      .then(p => setPlanData(p))
      .catch(e => setPlanError(e));
  }, [project.id]);

  React.useEffect(() => {
    if (tab !== "plan" || planData || planError) return;
    loadPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, project.id]);

  // Consumos: lazy
  const loadCostEntries = React.useCallback(() => {
    setCostError(null);
    return window.tramoApi.listCostEntries(project.id)
      .then(list => setCostEntries(list))
      .catch(e => { setCostError(e.message); setCostEntries([]); });
  }, [project.id]);

  React.useEffect(() => {
    if (tab !== "consumos" || costEntries) return;
    loadCostEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, project.id]);

  return (
    <div className="proj-detail">
      <div className="proj-detail-head">
        <button className="proj-back" onClick={onBack}>
          <Icon name="chevronR" size={11} style={{transform:"rotate(180deg)"}} /> Proyectos
        </button>
        <div className="proj-detail-title">
          <h2>{project.name}</h2>
          <div className="proj-detail-meta">
            {project.partner && <span>{project.partner.name}</span>}
            {project.company && <span> · {project.company.name}</span>}
            {project.active_plan && <span> · plan: {project.active_plan.name}</span>}
          </div>
        </div>
      </div>

      <div className="proj-tabs">
        <button className={"proj-tab" + (tab === "catalog" ? " active" : "")} onClick={() => setTab("catalog")}>
          Catálogo APU
        </button>
        <button className={"proj-tab" + (tab === "plan" ? " active" : "")} onClick={() => setTab("plan")}>
          Plan
        </button>
        <button className={"proj-tab" + (tab === "consumos" ? " active" : "")} onClick={() => setTab("consumos")}>
          Consumos
        </button>
      </div>

      {tab === "catalog" && (
        <>
          {error && <div className="proj-error">⚠ {error}</div>}
          {loading && <div className="proj-loading">Cargando catálogo…</div>}
          {!loading && !error && catalog && <CatalogTab project={project} catalog={catalog} />}
        </>
      )}

      {tab === "plan" && (
        <>
          {planError && (
            <div className="proj-error">
              ⚠ {planError.status === 404
                  ? "Este proyecto no tiene plan APU activo en Odoo. Creá uno en construction_apu y volvés."
                  : planError.message}
            </div>
          )}
          {!planData && !planError && <div className="proj-loading">Cargando plan…</div>}
          {planData && <PlanTab project={project} plan={planData} onReload={loadPlan} />}
        </>
      )}

      {tab === "consumos" && (
        <>
          {costError && <div className="proj-error">⚠ {costError}</div>}
          {!costEntries && !costError && <div className="proj-loading">Cargando consumos…</div>}
          {costEntries && (
            <ConsumosTab
              project={project}
              catalog={catalog}
              entries={costEntries}
              onReload={loadCostEntries}
            />
          )}
        </>
      )}
    </div>
  );
}


// ── ConsumosTab ─────────────────────────────────────────────────────────

function ConsumosTab({ project, catalog, entries, onReload }) {
  const [showForm, setShowForm] = React.useState(false);
  const [busy, setBusy] = React.useState(null); // entry id being deleted

  const currency = project.currency?.name || "";
  const total = entries.reduce((s, e) => s + (e.amount || 0), 0);
  const totalsByType = {};
  ["mat", "mo", "eq", "sub", "oh"].forEach(t => totalsByType[t] = 0);
  entries.forEach(e => { totalsByType[e.resource_type] = (totalsByType[e.resource_type] || 0) + (e.amount || 0); });
  const stageCount = entries.reduce((acc, e) => { acc[e.cost_stage] = (acc[e.cost_stage] || 0) + 1; return acc; }, {});

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar este consumo? Esta acción no se puede deshacer.")) return;
    setBusy(id);
    try {
      await window.tramoApi.deleteCostEntry(project.id, id);
      await onReload();
    } catch (e) {
      alert(`No se pudo eliminar: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="cons-tab">
      <div className="cons-toolbar">
        <div className="cons-kpis">
          <div className="cons-kpi"><span>Costo total real</span><strong className="mono">{_fmtN(total)} {currency}</strong></div>
          {Object.entries(totalsByType).filter(([_, v]) => v > 0).map(([t, v]) => (
            <div className="cons-kpi" key={t}><span className={`cat-type cat-type-${t}`}>{TYPE_LBL[t] || t}</span><strong className="mono">{_fmtN(v)}</strong></div>
          ))}
          <div className="cons-kpi"><span>Entries totales</span><strong className="mono">{entries.length}</strong></div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo consumo</button>
      </div>

      {entries.length === 0 ? (
        <div className="proj-empty">
          Sin consumos registrados. Click en <strong>+ Nuevo consumo</strong> para registrar el primero.
        </div>
      ) : (
        <table className="cat-table cons-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Concepto</th>
              <th>Item APU</th>
              <th>Insumo</th>
              <th>Tipo</th>
              <th>Origen</th>
              <th className="num">Cantidad</th>
              <th className="num">PU</th>
              <th className="num">Monto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td className="mono">{e.date}</td>
                <td>{e.name}{e.notes && <div className="cons-notes">{e.notes}</div>}</td>
                <td>{e.apu_item?.name || "—"}</td>
                <td>{e.insumo?.name || "—"}</td>
                <td><span className={`cat-type cat-type-${e.resource_type}`}>{e.resource_type.toUpperCase()}</span></td>
                <td><span className={`cons-stage cons-stage-${e.cost_stage}`}>{e.cost_stage}</span></td>
                <td className="num mono">{_fmtN(e.quantity, 2)}</td>
                <td className="num mono">{_fmtN(e.unit_cost, 2)}</td>
                <td className="num mono"><strong>{_fmtN(e.amount)}</strong></td>
                <td>
                  {e.cost_stage === "manual" && !e.auto_generated && (
                    <button className="cons-del" onClick={() => onDelete(e.id)} disabled={busy === e.id} title="Eliminar">
                      {busy === e.id ? "…" : "✕"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <NewCostEntryDialog
          project={project}
          catalog={catalog}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await onReload();
          }}
        />
      )}
    </div>
  );
}


function NewCostEntryDialog({ project, catalog, onClose, onSaved }) {
  // Si todavía no cargó el catálogo (raro, pero posible) lo pedimos al vuelo
  const [cat, setCat] = React.useState(catalog);
  React.useEffect(() => {
    if (!cat) {
      window.tramoApi.getCatalog(project.id).then(setCat).catch(() => {});
    }
  }, [cat, project.id]);

  const [form, setForm] = React.useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    apu_item_id: "",
    insumo_id: "",
    quantity: "",
    unit_cost: "",
    notes: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Items del proyecto (no grupos)
  const items = React.useMemo(() => (cat?.items || []).filter(it => !it.is_complementary), [cat]);
  const selectedItem = React.useMemo(() => items.find(it => it.id === Number(form.apu_item_id)), [items, form.apu_item_id]);
  const insumosForItem = selectedItem?.lines || [];
  const selectedLine = insumosForItem.find(ln => ln.insumo?.id === Number(form.insumo_id));

  // Cuando cambia el insumo, autocompletamos PU si no había uno
  React.useEffect(() => {
    if (selectedLine && !form.unit_cost) {
      setForm(f => ({ ...f, unit_cost: String(selectedLine.price_unit) }));
    }
  }, [selectedLine?.id]);  // eslint-disable-line

  const subtotal = (Number(form.quantity) || 0) * (Number(form.unit_cost) || 0);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.name || !form.apu_item_id || !form.quantity || !form.unit_cost) return;
    setSaving(true); setError(null);
    try {
      await window.tramoApi.createCostEntry(project.id, {
        name: form.name,
        date: form.date,
        apu_item_id: Number(form.apu_item_id),
        insumo_id: form.insumo_id ? Number(form.insumo_id) : undefined,
        quantity: Number(form.quantity),
        unit_cost: Number(form.unit_cost),
        notes: form.notes || undefined,
      });
      onSaved();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="plan-dialog-backdrop" onClick={onClose}>
      <form className="plan-dialog" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="plan-dialog-head">
          <div>
            <div className="plan-dialog-title">Registrar consumo</div>
            <div className="plan-dialog-sub">Crea un apu.cost.entry manual en {project.name}</div>
          </div>
          <button type="button" className="plan-dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="plan-dialog-body">
          {!cat && <div className="proj-loading">Cargando catálogo…</div>}
          {cat && (
            <>
              <Field label="Concepto *">
                <input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} placeholder="Ej: Cemento usado en zapata Z-12" autoFocus required />
              </Field>
              <Field label="Fecha">
                <input type="date" value={form.date} onChange={(e) => setForm(f => ({...f, date: e.target.value}))} />
              </Field>
              <Field label="Item APU *">
                <select value={form.apu_item_id} onChange={(e) => setForm(f => ({...f, apu_item_id: e.target.value, insumo_id: "", unit_cost: ""}))} required>
                  <option value="">— Elegir item —</option>
                  {(cat.rubros || []).map(r => (
                    <optgroup key={r.id} label={r.name}>
                      {items.filter(it => it.rubro?.id === r.id).map(it => (
                        <option key={it.id} value={it.id}>{it.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Insumo (opcional)">
                <select value={form.insumo_id} onChange={(e) => setForm(f => ({...f, insumo_id: e.target.value, unit_cost: ""}))} disabled={!selectedItem || insumosForItem.length === 0}>
                  <option value="">— Sin insumo específico —</option>
                  {insumosForItem.map(ln => (
                    <option key={ln.id} value={ln.insumo?.id || ""}>
                      [{ln.type.toUpperCase()}] {ln.insumo?.name} (PU {_fmtN(ln.price_unit, 2)})
                    </option>
                  ))}
                </select>
                {selectedItem && insumosForItem.length === 0 && <small>Este item no tiene insumos definidos.</small>}
              </Field>
              <div className="cons-form-row">
                <Field label="Cantidad *">
                  <input type="number" step="0.01" min="0" value={form.quantity} onChange={(e) => setForm(f => ({...f, quantity: e.target.value}))} required />
                </Field>
                <Field label="Costo unitario *">
                  <input type="number" step="0.01" min="0" value={form.unit_cost} onChange={(e) => setForm(f => ({...f, unit_cost: e.target.value}))} required />
                </Field>
                <Field label="Subtotal">
                  <input type="text" value={`${_fmtN(subtotal, 2)} ${project.currency?.name || ""}`} disabled />
                </Field>
              </div>
              <Field label="Notas">
                <input value={form.notes} onChange={(e) => setForm(f => ({...f, notes: e.target.value}))} placeholder="Observaciones (opcional)" />
              </Field>
              {error && <div className="proj-error">⚠ {error}</div>}
            </>
          )}
        </div>

        <div className="plan-dialog-foot">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving || !cat || !form.name || !form.apu_item_id || !form.quantity || !form.unit_cost}>
            {saving ? "Guardando…" : "Registrar consumo"}
          </button>
        </div>
      </form>
    </div>
  );
}


function ProjectsView({ tweaks }) {
  const auth = useAuthSession();
  const [selected, setSelected] = usePersistedState("selected_project", null);

  if (!auth.session) {
    return <LoginScreen onLogin={auth.login} loading={auth.loading} error={auth.error} />;
  }

  if (selected) {
    return <ProjectDetailView project={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <ProjectsList
      session={auth.session}
      onLogout={auth.logout}
      switchCompany={auth.switchCompany}
      loading={auth.loading}
      onSelect={setSelected}
    />
  );
}

window.ProjectsView = ProjectsView;
