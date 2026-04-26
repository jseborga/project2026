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

// ── PlanTab (Gantt read-only contra apu.project.plan) ───────────────────

const DAY_W = 24;       // px por día generico
const NAME_COL_W = 320; // px columna nombres

function PlanTab({ project, plan: planData }) {
  const { plan, lines, links } = planData;
  const [collapsed, setCollapsed] = React.useState({}); // {parent_id: bool}

  // Visibles según colapso de padres
  const visible = React.useMemo(() => {
    const result = [];
    const isHidden = (line) => {
      let cur = line.parent_id;
      while (cur) {
        if (collapsed[cur]) return true;
        const parent = lines.find(l => l.id === cur);
        cur = parent?.parent_id;
      }
      return false;
    };
    lines.forEach(ln => { if (!isHidden(ln)) result.push(ln); });
    return result;
  }, [lines, collapsed]);

  // Rango horizontal: de día 1 al máximo finish_day
  const maxDay = lines.reduce((m, l) => Math.max(m, l.generic_finish_day || 0), 8);
  const totalDays = Math.max(maxDay, 14);
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
      <PlanHeaderBar plan={plan} />

      <div className="plan-gantt">
        {/* Header timeline */}
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

        {/* Filas */}
        <div className="plan-grid-body">
          {visible.map(ln => {
            const isGroup = (childCount[ln.id] || 0) > 0;
            const isCollapsed = !!collapsed[ln.id];
            const lvl = (ln.level || 1) - 1;
            const barLeft = (Math.max(1, ln.generic_start_day) - 1) * DAY_W;
            const barWidth = Math.max(1, (ln.generic_finish_day - ln.generic_start_day + 1)) * DAY_W;
            const isMilestone = (ln.duration_days || 0) === 0 || ln.milestone_category;
            const preds = linksByTo[ln.id] || [];
            return (
              <div key={ln.id} className="plan-grid plan-grid-row" style={{gridTemplateColumns: `${NAME_COL_W}px 1fr`}}>
                <div className={"plan-name" + (isGroup ? " plan-name-group" : "") + (ln.is_critical ? " plan-name-critical" : "")}
                     style={{paddingLeft: 8 + lvl * 14}}>
                  {isGroup ? (
                    <button className="plan-chevron" onClick={() => setCollapsed(c => ({...c, [ln.id]: !c[ln.id]}))}>
                      <Icon name="chevronR" size={11} style={{transform: isCollapsed ? "none" : "rotate(90deg)", transition:"transform .15s"}} />
                    </button>
                  ) : (
                    <span className="plan-chevron-spacer" />
                  )}
                  <span className="plan-name-text" title={ln.name}>{ln.code && <span className="plan-code">{ln.code}</span>}{ln.name}</span>
                  <span className="plan-name-meta">
                    {ln.duration_days > 0 && <span>{ln.duration_days}d</span>}
                    {ln.is_critical && <span className="plan-pill plan-pill-crit">crítica</span>}
                    {ln.actual_start && <span className="plan-pill plan-pill-real">en curso</span>}
                  </span>
                </div>
                <div className="plan-tl-row" style={{minWidth: totalDays * DAY_W}}>
                  {/* Líneas de grilla semana */}
                  {Array.from({length: totalDays}, (_, i) => i + 1).map(d => (
                    d % 7 === 1 ? <div key={d} className="plan-week-line" style={{left: (d-1)*DAY_W}} /> : null
                  ))}
                  {isMilestone ? (
                    <div className={"plan-milestone" + (ln.is_critical ? " critical" : "")}
                         style={{left: barLeft - 6}}
                         title={`${ln.name} · día ${ln.generic_start_day}`}>◆</div>
                  ) : (
                    <div className={"plan-bar"
                                  + (isGroup ? " plan-bar-group" : "")
                                  + (ln.is_critical ? " plan-bar-critical" : "")}
                         style={{left: barLeft, width: barWidth}}
                         title={`${ln.name}\n${ln.duration_days}d · días ${ln.generic_start_day}-${ln.generic_finish_day}${ln.is_critical?" · CRÍTICA":""}`}>
                      <span className="plan-bar-label">{ln.duration_days}d</span>
                    </div>
                  )}
                  {/* Flechitas de dependencia (FS simple) */}
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
          })}
        </div>
      </div>

      <div className="plan-legend">
        <span><span className="plan-legend-bar" /> Actividad</span>
        <span><span className="plan-legend-bar plan-bar-critical" /> Crítica</span>
        <span><span className="plan-legend-bar plan-bar-group" /> Grupo</span>
        <span><span className="plan-legend-mile">◆</span> Hito</span>
        <span className="plan-legend-meta">{plan.crew_count} cuadrillas · período de control: {plan.control_period_mode || "—"}</span>
      </div>
    </div>
  );
}

function PlanHeaderBar({ plan }) {
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
      {plan.baseline_locked && (
        <div className="plan-lock" title={`Línea base congelada por ${plan.baseline_locked_by?.name || "—"} el ${plan.baseline_locked_at || ""}`}>
          🔒 Línea base congelada
          <button className="plan-lock-btn" onClick={() => alert("La edición y desbloqueo de baseline llegan en fase 4")}>
            Desbloquear
          </button>
        </div>
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
  React.useEffect(() => {
    if (tab !== "plan" || planData || planError) return;
    let cancel = false;
    window.tramoApi.getPlan(project.id)
      .then(p => { if (!cancel) setPlanData(p); })
      .catch(e => { if (!cancel) setPlanError(e); });
    return () => { cancel = true; };
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
        <button className="proj-tab proj-tab-disabled" disabled title="Próximamente (fase 5)">
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
          {planData && <PlanTab project={project} plan={planData} />}
        </>
      )}
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
