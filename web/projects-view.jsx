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


function ProjectsList({ session, onLogout, switchCompany, loading: authLoading }) {
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
          {projects.map(p => <ProjectCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}


function ProjectCard({ p }) {
  const fmt = (n) => n == null ? "—" : new Intl.NumberFormat("es-BO", { maximumFractionDigits: 0 }).format(n);
  const pct = (n) => n == null ? "—" : `${n.toFixed(1)}%`;
  return (
    <div className="proj-card">
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


function ProjectsView({ tweaks }) {
  const auth = useAuthSession();

  if (!auth.session) {
    return <LoginScreen onLogin={auth.login} loading={auth.loading} error={auth.error} />;
  }

  return (
    <ProjectsList
      session={auth.session}
      onLogout={auth.logout}
      switchCompany={auth.switchCompany}
      loading={auth.loading}
    />
  );
}

window.ProjectsView = ProjectsView;
