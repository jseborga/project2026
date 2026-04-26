// api.jsx — Cliente HTTP para el gateway Tramo PM API
//
// Maneja credentials:'include' (cookies cross-subdomain), errores normalizados
// y dispara un evento global cuando la sesión caduca para que el AuthGate
// muestre el login.

const API_BASE = "https://base-project2026-api.q8waob.easypanel.host";

async function apiFetch(path, options = {}) {
  const r = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (r.status === 204) return null;

  let body = null;
  try { body = await r.json(); } catch {}

  if (!r.ok) {
    const msg = (body && body.detail) || `HTTP ${r.status}`;
    if (r.status === 401) {
      window.dispatchEvent(new CustomEvent("api:unauthorized"));
    }
    const err = new Error(msg);
    err.status = r.status;
    err.body = body;
    throw err;
  }
  return body;
}

const api = {
  base: API_BASE,
  health: () => apiFetch("/health"),
  login: (login, api_key, company_id) => apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, api_key, ...(company_id ? { company_id } : {}) }),
  }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  me: () => apiFetch("/auth/me"),
  switchCompany: (company_id) => apiFetch("/auth/switch_company", {
    method: "POST",
    body: JSON.stringify({ company_id }),
  }),
  listProjects: ({ search, only_active = true, limit = 100, offset = 0 } = {}) => {
    const qs = new URLSearchParams({ only_active: String(only_active), limit: String(limit), offset: String(offset) });
    if (search) qs.set("search", search);
    return apiFetch(`/projects?${qs}`);
  },
  getProject: (id) => apiFetch(`/projects/${id}`),
  getCatalog: (id) => apiFetch(`/projects/${id}/catalog`),
  getPlan: (id) => apiFetch(`/projects/${id}/plan`),
};

window.tramoApi = api;
