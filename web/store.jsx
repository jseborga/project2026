// store.jsx — Capa de persistencia local
//
// Hoy: lee/escribe en localStorage por slot. Mañana, cuando se cablee Odoo,
// solo cambian las funciones load/save (y ahí hablamos JSON-RPC) — la API
// de los componentes (usePersistedState) no cambia.

const STORAGE_KEY = "tramo-pm-v1";
const SCHEMA_VERSION = 1;

function _read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    // Si el schema cambió, ignoramos lo viejo (futuro: migración real aquí).
    if (data.__v !== SCHEMA_VERSION) return {};
    return data;
  } catch {
    return {};
  }
}

function _write(next) {
  try {
    next.__v = SCHEMA_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch (e) {
    // Quota o modo privado: degradamos silenciosamente, los datos viven en memoria.
    console.warn("[store] no se pudo persistir:", e?.message);
    return false;
  }
}

function loadSlot(key) {
  const data = _read();
  return data[key];
}

function saveSlot(key, value) {
  const data = _read();
  data[key] = value;
  return _write(data);
}

function clearAll() {
  try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}

function exportAll() {
  return JSON.stringify(_read(), null, 2);
}

function importAll(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return _write(parsed);
  } catch {
    return false;
  }
}

// React hook: estado persistido por slot. Mismo contrato que useState.
function usePersistedState(slot, defaultValue) {
  const [value, setValue] = React.useState(() => {
    const stored = loadSlot(slot);
    return stored !== undefined ? stored : (
      typeof defaultValue === "function" ? defaultValue() : defaultValue
    );
  });

  const set = React.useCallback((updater) => {
    setValue((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveSlot(slot, next);
      return next;
    });
  }, [slot]);

  return [value, set];
}

window.tramoStore = { loadSlot, saveSlot, clearAll, exportAll, importAll, usePersistedState, SCHEMA_VERSION };
window.usePersistedState = usePersistedState;
