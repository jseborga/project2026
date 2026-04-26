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

function ProjectDetailView({ project, onBack }) {
  const [tab, setTab] = React.useState("catalog");
  const [catalog, setCatalog] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancel = false;
    setLoading(true); setError(null);
    window.tramoApi.getCatalog(project.id)
      .then(c => { if (!cancel) setCatalog(c); })
      .catch(e => { if (!cancel) setError(e.message); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [project.id]);

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
        <button className="proj-tab proj-tab-disabled" disabled title="Próximamente (fase 3)">
          Plan
        </button>
        <button className="proj-tab proj-tab-disabled" disabled title="Próximamente (fase 5)">
          Consumos
        </button>
      </div>

      {error && <div className="proj-error">⚠ {error}</div>}
      {loading && <div className="proj-loading">Cargando catálogo…</div>}
      {!loading && !error && catalog && tab === "catalog" && (
        <CatalogTab project={project} catalog={catalog} />
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
