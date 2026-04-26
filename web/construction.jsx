// construction.jsx — Vista Construcción (Ítems / Paquetes / Matriz)
// Inspirada en módulos de construcción de ERP de obra (gestión de partidas,
// paquetes de trabajo / Last Planner, restricciones y matriz ítem × paquete)

/* ─────────────────────────────────────────────────────────────────────────
   DATOS — proyecto residencial: presupuesto por ítem (capítulo + partida),
   paquetes de trabajo (work packages) por sector/zona, matriz de asignación
   ítem × paquete con cantidad, restricciones (Last Planner) y estados.
   ───────────────────────────────────────────────────────────────────────── */

const CN_GROUPS = [
  { id: "g-1", code: "01", name: "Movimiento de tierras",  color: "#a06a3a" },
  { id: "g-2", code: "02", name: "Cimentación",            color: "#7a5a3a" },
  { id: "g-3", code: "03", name: "Estructura H.A.",        color: "#5b7a8c" },
  { id: "g-4", code: "04", name: "Albañilería",            color: "#b85c38" },
  { id: "g-5", code: "05", name: "Instalaciones",          color: "#3a7a8a" },
  { id: "g-6", code: "06", name: "Terminaciones",          color: "#6a8a3a" },
];

// Ítems (partidas del presupuesto)
const CN_ITEMS = [
  // 01 Tierras
  { id: "it-101", grp: "g-1", code: "01.01", name: "Excavación a máquina suelo común", unit: "m³", qty: 480,  unitPrice: 18,    progress: 100 },
  { id: "it-102", grp: "g-1", code: "01.02", name: "Relleno y compactación c/material",   unit: "m³", qty: 320,  unitPrice: 22,    progress: 95 },
  { id: "it-103", grp: "g-1", code: "01.03", name: "Retiro de tierra sobrante",          unit: "m³", qty: 160,  unitPrice: 14,    progress: 100 },
  // 02 Cimentación
  { id: "it-201", grp: "g-2", code: "02.01", name: "H° pobre nivelación e=10cm",         unit: "m³", qty: 24,   unitPrice: 195,   progress: 100 },
  { id: "it-202", grp: "g-2", code: "02.02", name: "Zapatas H°A° H25",                   unit: "m³", qty: 86,   unitPrice: 460,   progress: 100 },
  { id: "it-203", grp: "g-2", code: "02.03", name: "Vigas de fundación H°A° H25",        unit: "m³", qty: 38,   unitPrice: 510,   progress: 90 },
  // 03 Estructura
  { id: "it-301", grp: "g-3", code: "03.01", name: "Columnas H°A° H25 (planta tipo)",    unit: "m³", qty: 64,   unitPrice: 540,   progress: 70 },
  { id: "it-302", grp: "g-3", code: "03.02", name: "Vigas y losas H°A° H25",             unit: "m³", qty: 142,  unitPrice: 480,   progress: 60 },
  { id: "it-303", grp: "g-3", code: "03.03", name: "Acero ADN420 conformado",            unit: "kg", qty: 28500,unitPrice: 1.85,  progress: 65 },
  { id: "it-304", grp: "g-3", code: "03.04", name: "Encofrado metálico p/losas",         unit: "m²", qty: 1240, unitPrice: 22,    progress: 60 },
  // 04 Albañilería
  { id: "it-401", grp: "g-4", code: "04.01", name: "Mampostería ladrillo hueco 18cm",    unit: "m²", qty: 1860, unitPrice: 38,    progress: 35 },
  { id: "it-402", grp: "g-4", code: "04.02", name: "Mampostería tabique 12cm",           unit: "m²", qty: 1120, unitPrice: 32,    progress: 28 },
  { id: "it-403", grp: "g-4", code: "04.03", name: "Revoque grueso interior",            unit: "m²", qty: 2400, unitPrice: 18,    progress: 18 },
  { id: "it-404", grp: "g-4", code: "04.04", name: "Revoque fino c/yeso",                unit: "m²", qty: 2400, unitPrice: 14,    progress: 5  },
  // 05 Instalaciones
  { id: "it-501", grp: "g-5", code: "05.01", name: "Cañerías agua fría/caliente PPR",    unit: "m",  qty: 980,  unitPrice: 11,    progress: 40 },
  { id: "it-502", grp: "g-5", code: "05.02", name: "Cañería desagües cloacales PVC",     unit: "m",  qty: 620,  unitPrice: 9.5,   progress: 45 },
  { id: "it-503", grp: "g-5", code: "05.03", name: "Cañería eléctrica embutida",         unit: "m",  qty: 2180, unitPrice: 6.8,   progress: 30 },
  { id: "it-504", grp: "g-5", code: "05.04", name: "Cableado y tableros",                unit: "u",  qty: 6,    unitPrice: 2400,  progress: 10 },
  // 06 Terminaciones
  { id: "it-601", grp: "g-6", code: "06.01", name: "Piso porcelanato 60×60",             unit: "m²", qty: 980,  unitPrice: 48,    progress: 8  },
  { id: "it-602", grp: "g-6", code: "06.02", name: "Pintura látex int. (3 manos)",       unit: "m²", qty: 2400, unitPrice: 9,     progress: 0  },
  { id: "it-603", grp: "g-6", code: "06.03", name: "Carpinterías de aluminio",           unit: "m²", qty: 186,  unitPrice: 280,   progress: 12 },
  { id: "it-604", grp: "g-6", code: "06.04", name: "Cerámico baños y cocinas",           unit: "m²", qty: 320,  unitPrice: 42,    progress: 0  },
];

// Paquetes de trabajo (Work Packages) — Last Planner
const CN_STATES = [
  { id: "backlog",   name: "Inventario",   color: "#8a8a8a" },
  { id: "lookahead", name: "Lookahead 6s", color: "#3a7a8a" },
  { id: "ready",     name: "Listos",       color: "#6a8a3a" },
  { id: "wip",       name: "En ejecución", color: "#b85c38" },
  { id: "review",    name: "Verificación", color: "#a06a3a" },
  { id: "done",      name: "Cerrados",     color: "#5a8a3a" },
  { id: "blocked",   name: "Bloqueados",   color: "#a8443a" },
];

const CN_CREWS = ["Cuadrilla A", "Cuadrilla B", "Subcontrato Tierras", "Subcontrato H°A°", "Subcontrato MEP", "Cuadrilla C"];

const CN_PACKAGES = [
  { id: "wp-1",  code: "WP-001", name: "Movimiento tierras Sector Norte",  state: "done",      crew: "Subcontrato Tierras", color: "#a06a3a", start: "01/03", end: "12/03", progress: 100, value: 16800 },
  { id: "wp-2",  code: "WP-002", name: "Movimiento tierras Sector Sur",    state: "done",      crew: "Subcontrato Tierras", color: "#a06a3a", start: "08/03", end: "20/03", progress: 100, value: 14200 },
  { id: "wp-3",  code: "WP-003", name: "Cimentación bloque A",             state: "done",      crew: "Subcontrato H°A°",    color: "#7a5a3a", start: "15/03", end: "10/04", progress: 100, value: 48200 },
  { id: "wp-4",  code: "WP-004", name: "Cimentación bloque B",             state: "review",    crew: "Subcontrato H°A°",    color: "#7a5a3a", start: "25/03", end: "22/04", progress: 95,  value: 41800 },
  { id: "wp-5",  code: "WP-005", name: "Estructura PB bloque A",           state: "wip",       crew: "Subcontrato H°A°",    color: "#5b7a8c", start: "12/04", end: "08/05", progress: 78,  value: 62400 },
  { id: "wp-6",  code: "WP-006", name: "Estructura PB bloque B",           state: "wip",       crew: "Subcontrato H°A°",    color: "#5b7a8c", start: "18/04", end: "16/05", progress: 60,  value: 58200 },
  { id: "wp-7",  code: "WP-007", name: "Estructura 1° piso bloque A",      state: "wip",       crew: "Cuadrilla A",         color: "#5b7a8c", start: "02/05", end: "26/05", progress: 35,  value: 56800 },
  { id: "wp-8",  code: "WP-008", name: "Estructura 1° piso bloque B",      state: "ready",     crew: "Cuadrilla A",         color: "#5b7a8c", start: "10/05", end: "02/06", progress: 0,   value: 54200 },
  { id: "wp-9",  code: "WP-009", name: "Mampostería PB bloque A",          state: "wip",       crew: "Cuadrilla B",         color: "#b85c38", start: "08/05", end: "30/05", progress: 45,  value: 38600 },
  { id: "wp-10", code: "WP-010", name: "Mampostería PB bloque B",          state: "ready",     crew: "Cuadrilla B",         color: "#b85c38", start: "16/05", end: "08/06", progress: 0,   value: 36400 },
  { id: "wp-11", code: "WP-011", name: "Instalación sanitaria bloque A",   state: "lookahead", crew: "Subcontrato MEP",     color: "#3a7a8a", start: "20/05", end: "18/06", progress: 0,   value: 28200 },
  { id: "wp-12", code: "WP-012", name: "Instalación eléctrica bloque A",   state: "lookahead", crew: "Subcontrato MEP",     color: "#3a7a8a", start: "22/05", end: "22/06", progress: 0,   value: 31400 },
  { id: "wp-13", code: "WP-013", name: "Mampostería 1° piso bloque A",     state: "blocked",   crew: "Cuadrilla B",         color: "#b85c38", start: "26/05", end: "18/06", progress: 0,   value: 38600 },
  { id: "wp-14", code: "WP-014", name: "Revoques PB bloque A",             state: "lookahead", crew: "Cuadrilla C",         color: "#b85c38", start: "05/06", end: "02/07", progress: 0,   value: 22400 },
  { id: "wp-15", code: "WP-015", name: "Carpinterías bloque A",            state: "backlog",   crew: "Subcontrato MEP",     color: "#6a8a3a", start: "15/06", end: "12/07", progress: 0,   value: 29400 },
  { id: "wp-16", code: "WP-016", name: "Pisos PB bloque A",                state: "backlog",   crew: "Cuadrilla C",         color: "#6a8a3a", start: "25/06", end: "20/07", progress: 0,   value: 24800 },
  { id: "wp-17", code: "WP-017", name: "Pintura PB bloque A",              state: "backlog",   crew: "Cuadrilla C",         color: "#6a8a3a", start: "10/07", end: "05/08", progress: 0,   value: 18600 },
];

// Matriz ítem × paquete: cantidad asignada (debe sumar ≤ qty del ítem; si excede → alerta)
// Formato: { itemId, wpId, qty, executed }
const CN_ASSIGN = [
  // WP-001 / WP-002 — tierras
  { it: "it-101", wp: "wp-1", qty: 240, ex: 240 }, { it: "it-101", wp: "wp-2", qty: 240, ex: 240 },
  { it: "it-102", wp: "wp-1", qty: 160, ex: 160 }, { it: "it-102", wp: "wp-2", qty: 160, ex: 144 },
  { it: "it-103", wp: "wp-1", qty: 80,  ex: 80  }, { it: "it-103", wp: "wp-2", qty: 80,  ex: 80  },
  // WP-003 / WP-004 — cimentación
  { it: "it-201", wp: "wp-3", qty: 12, ex: 12 },   { it: "it-201", wp: "wp-4", qty: 12, ex: 12 },
  { it: "it-202", wp: "wp-3", qty: 44, ex: 44 },   { it: "it-202", wp: "wp-4", qty: 42, ex: 42 },
  { it: "it-203", wp: "wp-3", qty: 19, ex: 19 },   { it: "it-203", wp: "wp-4", qty: 19, ex: 15.4 },
  // WP-005 / WP-006 / WP-007 / WP-008 — estructura
  { it: "it-301", wp: "wp-5", qty: 18, ex: 18 },   { it: "it-301", wp: "wp-6", qty: 16, ex: 12.8 }, { it: "it-301", wp: "wp-7", qty: 16, ex: 5.4 },  { it: "it-301", wp: "wp-8", qty: 14, ex: 0 },
  { it: "it-302", wp: "wp-5", qty: 38, ex: 32.4 }, { it: "it-302", wp: "wp-6", qty: 36, ex: 21.6 }, { it: "it-302", wp: "wp-7", qty: 36, ex: 12.8 }, { it: "it-302", wp: "wp-8", qty: 32, ex: 0 },
  { it: "it-303", wp: "wp-5", qty: 7600, ex: 7000 }, { it: "it-303", wp: "wp-6", qty: 7200, ex: 5400 }, { it: "it-303", wp: "wp-7", qty: 7200, ex: 4100 }, { it: "it-303", wp: "wp-8", qty: 6500, ex: 0 },
  { it: "it-304", wp: "wp-5", qty: 320, ex: 320 }, { it: "it-304", wp: "wp-6", qty: 310, ex: 240 },  { it: "it-304", wp: "wp-7", qty: 310, ex: 184 },  { it: "it-304", wp: "wp-8", qty: 300, ex: 0 },
  // WP-009 / WP-010 / WP-013 — mampostería
  { it: "it-401", wp: "wp-9", qty: 480, ex: 320 }, { it: "it-401", wp: "wp-10", qty: 460, ex: 0 }, { it: "it-401", wp: "wp-13", qty: 460, ex: 0 }, { it: "it-401", wp: "wp-15", qty: 480, ex: 0 },
  { it: "it-402", wp: "wp-9", qty: 290, ex: 180 }, { it: "it-402", wp: "wp-10", qty: 280, ex: 0 }, { it: "it-402", wp: "wp-13", qty: 280, ex: 0 }, { it: "it-402", wp: "wp-15", qty: 290, ex: 0 },
  { it: "it-403", wp: "wp-9", qty: 620, ex: 220 }, { it: "it-403", wp: "wp-10", qty: 600, ex: 0 }, { it: "it-403", wp: "wp-13", qty: 600, ex: 0 }, { it: "it-403", wp: "wp-14", qty: 600, ex: 0 },
  { it: "it-404", wp: "wp-14", qty: 1200, ex: 120 }, { it: "it-404", wp: "wp-17", qty: 1200, ex: 0 },
  // WP-011 / WP-012 — instalaciones
  { it: "it-501", wp: "wp-11", qty: 980, ex: 0 },
  { it: "it-502", wp: "wp-11", qty: 620, ex: 0 },
  { it: "it-503", wp: "wp-12", qty: 2180, ex: 0 },
  { it: "it-504", wp: "wp-12", qty: 6, ex: 0 },
  // Terminaciones
  { it: "it-601", wp: "wp-16", qty: 980, ex: 78 },
  { it: "it-602", wp: "wp-17", qty: 2400, ex: 0 },
  { it: "it-603", wp: "wp-15", qty: 186, ex: 22 },
  { it: "it-604", wp: "wp-16", qty: 320, ex: 0 },
];

// Restricciones (Last Planner)
const CN_RESTR = [
  { wp: "wp-5",  kind: "mat",     text: "Acero ADN420 — entrega parcial",       due: "—",     done: true  },
  { wp: "wp-6",  kind: "mat",     text: "Hormigón H25 — pedido programado",     due: "16/05", done: false },
  { wp: "wp-7",  kind: "frente",  text: "Liberación de losa P1 bloque A",       due: "20/05", done: false },
  { wp: "wp-8",  kind: "wp",      text: "Finalización WP-005 (predecesor)",     due: "08/05", done: false },
  { wp: "wp-9",  kind: "mat",     text: "Ladrillo hueco 18cm — stock OK",        due: "—",     done: true  },
  { wp: "wp-10", kind: "frente",  text: "Estructura PB bloque B liberada",      due: "16/05", done: false },
  { wp: "wp-11", kind: "externo", text: "Aprobación municipal cloacal",         due: "18/05", done: false },
  { wp: "wp-11", kind: "mat",     text: "Cañerías PPR — pedido a proveedor",    due: "12/05", done: false },
  { wp: "wp-12", kind: "rrhh",    text: "Cuadrilla MEP confirmada",             due: "20/05", done: true  },
  { wp: "wp-12", kind: "inf",     text: "Planos eléctricos rev. C aprobados",   due: "15/05", done: false },
  { wp: "wp-13", kind: "wp",      text: "WP-007 estructura P1 — bloqueante",    due: "26/05", done: false },
  { wp: "wp-13", kind: "mat",     text: "Pedido de ladrillos lote 2",            due: "20/05", done: false },
  { wp: "wp-14", kind: "wp",      text: "Mampostería PB completada",            due: "30/05", done: false },
  { wp: "wp-15", kind: "externo", text: "Confirmación medidas c/proveedor",     due: "05/06", done: false },
  { wp: "wp-16", kind: "mat",     text: "Porcelanato — orden de compra",        due: "20/06", done: false },
  { wp: "wp-17", kind: "rrhh",    text: "Asignar Cuadrilla C",                   due: "05/07", done: false },
];

const CN_MILESTONES = [
  { wp: "wp-5", date: "20/04", label: "Inicio HºAº PB", done: true },
  { wp: "wp-5", date: "30/04", label: "Llenado losa nivel 0", done: true },
  { wp: "wp-5", date: "08/05", label: "Cierre estructura PB", done: false },
  { wp: "wp-7", date: "10/05", label: "Replanteo P1", done: true },
  { wp: "wp-7", date: "26/05", label: "Llenado losa P1", done: false },
];

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────── */

function cnFmt(n) {
  if (n == null) return "—";
  if (n >= 1000) return n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return String(n);
  return n.toLocaleString("es-AR", { maximumFractionDigits: 1 });
}
function cnMoney(n) {
  return "$ " + (n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function cnAssignedFor(itemId) {
  return CN_ASSIGN.filter(a => a.it === itemId);
}
function cnAssignsForWp(wpId) {
  return CN_ASSIGN.filter(a => a.wp === wpId);
}
function cnRestrFor(wpId) {
  return CN_RESTR.filter(r => r.wp === wpId);
}
function cnMsFor(wpId) {
  return CN_MILESTONES.filter(m => m.wp === wpId);
}
function cnState(id) {
  return CN_STATES.find(s => s.id === id);
}
function cnGroup(id) {
  return CN_GROUPS.find(g => g.id === id);
}
function cnItem(id) {
  return CN_ITEMS.find(i => i.id === id);
}
function cnPkg(id) {
  return CN_PACKAGES.find(p => p.id === id);
}

const CN_RESTR_KIND_LBL = { mat: "Mat", inf: "Inf", frente: "Frente", rrhh: "RRHH", externo: "Ext", wp: "WP" };
const CN_RESTR_KIND_NAME = { mat: "Material", inf: "Información", frente: "Frente de trabajo", rrhh: "Recursos humanos", externo: "Externo", wp: "Predecesor" };

/* ─────────────────────────────────────────────────────────────────────────
   VISTA PRINCIPAL — pestañas + drawer
   ───────────────────────────────────────────────────────────────────────── */

function ConstructionView({ tweaks }) {
  const [tab, setTab] = React.useState("items"); // items | wp | matrix
  const [sel, setSel] = React.useState(null);    // {kind:'item'|'wp', id}
  // Estado mutable para drag&drop de paquetes
  const [pkgs, setPkgs] = React.useState(() => CN_PACKAGES.map(p => ({...p})));

  // Indicadores PM4R / EVM
  const totals = React.useMemo(() => {
    let bac = 0, ev = 0, ac = 0;
    CN_ITEMS.forEach(it => {
      const v = it.qty * it.unitPrice;
      bac += v;
      ev += v * (it.progress / 100);
      ac += v * (it.progress / 100) * (1 + (it.id === "it-303" || it.id === "it-203" ? 0.08 : it.id === "it-302" ? 0.04 : 0));
    });
    // PV simulado (planificado a la fecha): asume 52% del proyecto ejecutado al día de hoy
    const pv = bac * 0.62;
    const cpi = ev / ac;
    const spi = ev / pv;
    return { bac, ev, ac, pv, cpi, spi, pctEv: ev / bac * 100, pctAc: ac / bac * 100 };
  }, []);

  const closeDrawer = () => setSel(null);

  return (
    <div className="msp-wrap" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Banner de proyecto + indicadores */}
      <CnBanner totals={totals} />

      {/* Pestañas */}
      <div className="cn-tabs">
        <button className={"cn-tab" + (tab === "items" ? " active" : "")} onClick={() => setTab("items")}>
          <Icon name="grid" size={13} /> Ítems / Partidas <span className="cn-tab-count">{CN_ITEMS.length}</span>
        </button>
        <button className={"cn-tab" + (tab === "wp" ? " active" : "")} onClick={() => setTab("wp")}>
          <Icon name="package" size={13} /> Paquetes (Last Planner) <span className="cn-tab-count">{pkgs.length}</span>
        </button>
        <button className={"cn-tab" + (tab === "matrix" ? " active" : "")} onClick={() => setTab("matrix")}>
          <Icon name="grid" size={13} /> Matriz Ítem × Paquete
        </button>
        <div className="cn-tabs-spacer" />
        <div className="cn-tabs-tools">
          <button className="ribbon-btn" title="Importar presupuesto"><Icon name="upload" size={13} /></button>
          <button className="ribbon-btn" title="Exportar"><Icon name="download" size={13} /></button>
          <button className="ribbon-btn" title="Filtros"><Icon name="filter" size={13} /></button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="cn-content">
        <div className={"cn-main" + (sel ? " with-drawer" : "")}>
          {tab === "items" && <CnItemsView sel={sel} onSelect={(id) => setSel({ kind: "item", id })} />}
          {tab === "wp" && <CnPackagesView pkgs={pkgs} setPkgs={setPkgs} sel={sel} onSelect={(id) => setSel({ kind: "wp", id })} />}
          {tab === "matrix" && <CnMatrixView pkgs={pkgs} sel={sel} onSelectItem={(id) => setSel({ kind: "item", id })} onSelectWp={(id) => setSel({ kind: "wp", id })} />}
        </div>
        {sel && <CnDrawer sel={sel} pkgs={pkgs} onClose={closeDrawer} />}
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <span><strong>BAC</strong> {cnMoney(totals.bac)}</span>
        <span><strong>EV</strong> {cnMoney(totals.ev)}</span>
        <span><strong>AC</strong> {cnMoney(totals.ac)}</span>
        <span><strong>CPI</strong> <span style={{ color: totals.cpi >= 1 ? "var(--ok)" : "var(--accent)" }}>{totals.cpi.toFixed(2)}</span></span>
        <span><strong>SPI</strong> <span style={{ color: totals.spi >= 1 ? "var(--ok)" : "var(--accent)" }}>{totals.spi.toFixed(2)}</span></span>
        <span style={{ flex: 1 }}></span>
        <span>{CN_ITEMS.length} ítems · {pkgs.length} paquetes · {CN_RESTR.filter(r => !r.done).length} restricciones abiertas</span>
      </div>
    </div>
  );
}

/* ── Banner ─────────────────────────────────────────────────────────── */

function CnBanner({ totals }) {
  return (
    <div className="proj-banner" style={{ flexShrink: 0 }}>
      <div className="pb-main">
        <div className="pb-id">
          <span className="pb-code">RES-2025-014</span>
          <span className="pb-status pb-status-active">● En obra</span>
        </div>
        <div className="pb-name">Edificio Residencial Almagro · Bloques A + B</div>
        <div className="pb-sub">Construcción · 18 paquetes activos · Etapa: Estructura + Albañilería</div>
      </div>
      <div className="pb-stats">
        <div className="pb-stat">
          <span className="pb-stat-l">Avance físico</span>
          <span className="pb-stat-v">{totals.pctEv.toFixed(0)}%</span>
          <span className="pb-stat-bar"><span className="pb-stat-bar-fill" style={{ width: totals.pctEv + "%" }}></span></span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-l">CPI · costo</span>
          <span className="pb-stat-v" style={{ color: totals.cpi >= 1 ? "var(--ok)" : "var(--accent)" }}>{totals.cpi.toFixed(2)}</span>
          <span className="pb-stat-sub">{totals.cpi >= 1 ? "Bajo presupuesto" : "Sobrecosto " + ((1 - totals.cpi) * 100).toFixed(1) + "%"}</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-l">SPI · plazo</span>
          <span className="pb-stat-v" style={{ color: totals.spi >= 1 ? "var(--ok)" : "var(--accent)" }}>{totals.spi.toFixed(2)}</span>
          <span className="pb-stat-sub">{totals.spi >= 1 ? "Adelantado" : "Atrasado " + ((1 - totals.spi) * 100).toFixed(1) + "%"}</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-l">Costo real</span>
          <span className="pb-stat-v" style={{ fontFamily: "var(--font-mono)" }}>{cnMoney(totals.ac)}</span>
          <span className="pb-stat-sub">de {cnMoney(totals.bac)}</span>
        </div>
        <div className="pb-stat">
          <span className="pb-stat-l">Restricciones</span>
          <span className="pb-stat-v">{CN_RESTR.filter(r => !r.done).length}</span>
          <span className="pb-stat-sub">abiertas / {CN_RESTR.length} total</span>
        </div>
      </div>
      <div className="pb-actions">
        <button className="btn-secondary"><Icon name="download" size={13} /> Certificación</button>
        <button className="btn-primary"><Icon name="plus" size={13} /> Paquete</button>
      </div>
    </div>
  );
}

/* ── Vista 1: Ítems / Partidas ─────────────────────────────────────── */

function CnItemsView({ sel, onSelect }) {
  const [open, setOpen] = React.useState(() => {
    const o = {};
    CN_GROUPS.forEach(g => { o[g.id] = true; });
    return o;
  });
  const toggle = (gid) => setOpen(o => ({ ...o, [gid]: !o[gid] }));

  // Totales por capítulo
  const grpTotals = React.useMemo(() => {
    const t = {};
    CN_GROUPS.forEach(g => {
      const items = CN_ITEMS.filter(i => i.grp === g.id);
      let bac = 0, ev = 0;
      items.forEach(it => {
        const v = it.qty * it.unitPrice;
        bac += v;
        ev += v * (it.progress / 100);
      });
      t[g.id] = { bac, ev, count: items.length, pct: bac ? (ev / bac) * 100 : 0 };
    });
    return t;
  }, []);

  return (
    <div className="cn-items">
      <div className="cn-items-toolbar">
        <div className="cn-items-summary">
          <strong>{CN_ITEMS.length}</strong> partidas · <strong>{CN_GROUPS.length}</strong> capítulos · saldo crítico en <strong style={{ color: "var(--accent)" }}>2</strong> ítems
        </div>
        <div className="cn-items-controls">
          <button className="ribbon-btn" title="Buscar"><Icon name="search" size={13} /></button>
          <button className="ribbon-btn" title="Vista compacta"><Icon name="rows" size={13} /></button>
          <button className="ribbon-btn" title="Más"><Icon name="more" size={13} /></button>
        </div>
      </div>

      <div className="cn-items-table">
        <div className="cn-items-head">
          <div>Código</div>
          <div>Descripción</div>
          <div>Un.</div>
          <div className="num">Cant.</div>
          <div className="num">P. Unit.</div>
          <div className="num">Importe</div>
          <div className="num">Asignado</div>
          <div className="num">Saldo</div>
          <div className="num">Ejecutado</div>
          <div>Avance</div>
          <div>EVM</div>
          <div>Estado</div>
        </div>
        <div className="cn-items-body">
          {CN_GROUPS.map(g => {
            const items = CN_ITEMS.filter(i => i.grp === g.id);
            const tot = grpTotals[g.id];
            const isOpen = open[g.id];
            return (
              <React.Fragment key={g.id}>
                <div className="cn-items-row group" onClick={() => toggle(g.id)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button className="cn-caret" onClick={(e) => { e.stopPropagation(); toggle(g.id); }}>
                      <Icon name={isOpen ? "caret-down" : "caret-right"} size={11} />
                    </button>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>{g.code}</span>
                  </div>
                  <div className="cn-grp-name">
                    <span className="cn-grp-dot" style={{ background: g.color }}></span>
                    <strong>{g.name}</strong>
                    <span className="cn-grp-count">({tot.count})</span>
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{cnMoney(tot.bac)}</div>
                  <div></div>
                  <div></div>
                  <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{cnMoney(tot.ev)}</div>
                  <div className="cn-grp-bar">
                    <div className="cn-bar-track tiny"><div className="cn-bar-fill" style={{ width: tot.pct + "%", background: g.color }} /></div>
                    <span className="cn-bar-pct">{tot.pct.toFixed(0)}%</span>
                  </div>
                  <div></div>
                  <div></div>
                </div>
                {isOpen && items.map(it => <CnItemRow key={it.id} item={it} grp={g} selected={sel?.kind === "item" && sel.id === it.id} onSelect={onSelect} />)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CnItemRow({ item, grp, selected, onSelect }) {
  const ass = cnAssignedFor(item.id);
  const assignedQty = ass.reduce((a, b) => a + b.qty, 0);
  const executedQty = ass.reduce((a, b) => a + b.ex, 0);
  const balance = item.qty - assignedQty;
  const overAssigned = balance < -0.01;
  const fullyAssigned = Math.abs(balance) < 0.01;
  const importe = item.qty * item.unitPrice;
  const evm = importe * (item.progress / 100);

  let stateTag, stateClass;
  if (overAssigned) { stateTag = "Sobre-asignado"; stateClass = "warn"; }
  else if (fullyAssigned) { stateTag = "Completo"; stateClass = "full"; }
  else if (assignedQty === 0) { stateTag = "Sin asignar"; stateClass = "rest"; }
  else { stateTag = "Saldo " + ((balance / item.qty) * 100).toFixed(0) + "%"; stateClass = "rest"; }

  return (
    <div
      className={"cn-items-row item" + (selected ? " selected" : "") + (overAssigned ? " warn" : "")}
      onClick={() => onSelect(item.id)}
    >
      <div className="cn-code">{item.code}</div>
      <div className="cn-desc">{item.name}</div>
      <div><span className="cn-unit">{item.unit}</span></div>
      <div className="num">{cnFmt(item.qty)}</div>
      <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>${cnFmt(item.unitPrice)}</div>
      <div className="num" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{cnMoney(importe)}</div>
      <div className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{cnFmt(assignedQty)}</div>
      <div className={"cn-balance" + (overAssigned ? " over" : fullyAssigned ? " full" : "")}>
        {overAssigned && <Icon name="alert" size={11} />}
        {cnFmt(balance)}
      </div>
      <div className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{cnFmt(executedQty)}</div>
      <div className="cn-prog">
        <div className="cn-bar-track"><div className="cn-bar-fill" style={{ width: item.progress + "%", background: grp.color }} /></div>
        <span className="cn-bar-pct">{item.progress}%</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-2)" }}>{cnMoney(evm)}</div>
      <div><span className={"cn-tag " + stateClass}>{stateTag}</span></div>
    </div>
  );
}

/* ── Vista 2: Kanban paquetes ───────────────────────────────────────── */

function CnPackagesView({ pkgs, setPkgs, sel, onSelect }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [hoverCol, setHoverCol] = React.useState(null);
  const [ctx, setCtx] = React.useState(null); // {x, y, wp}

  const moveTo = (wpId, stateId) => {
    setPkgs(ps => ps.map(p => p.id === wpId ? { ...p, state: stateId } : p));
    setCtx(null);
  };

  React.useEffect(() => {
    if (!ctx) return;
    const close = () => setCtx(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [ctx]);

  const handleCtx = (e, wp) => {
    e.preventDefault();
    setCtx({ x: e.clientX, y: e.clientY, wp });
  };

  return (
    <React.Fragment>
      <div className="cn-kanban">
        {CN_STATES.map(st => {
          const inCol = pkgs.filter(p => p.state === st.id);
          return (
            <div
              key={st.id}
              className={"cn-col" + (hoverCol === st.id && draggingId ? " drop" : "")}
              onDragOver={(e) => { e.preventDefault(); setHoverCol(st.id); }}
              onDragLeave={() => setHoverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) moveTo(id, st.id);
                setHoverCol(null); setDraggingId(null);
              }}
            >
              <div className="cn-col-head" style={{ borderTopColor: st.color }}>
                <span className="cn-col-dot" style={{ background: st.color }}></span>
                <span className="cn-col-name">{st.name}</span>
                <span className="cn-col-count">{inCol.length}</span>
              </div>
              <div className="cn-col-body">
                {inCol.length === 0 && <div className="cn-col-empty">Sin paquetes</div>}
                {inCol.map(p => (
                  <CnPkgCard
                    key={p.id} pkg={p}
                    selected={sel?.kind === "wp" && sel.id === p.id}
                    dragging={draggingId === p.id}
                    onClick={() => onSelect(p.id)}
                    onDragStart={(e) => { e.dataTransfer.setData("text/plain", p.id); setDraggingId(p.id); }}
                    onDragEnd={() => setDraggingId(null)}
                    onContextMenu={(e) => handleCtx(e, p)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {ctx && (
        <div className="cn-ctx" style={{ left: ctx.x, top: ctx.y }} onClick={(e) => e.stopPropagation()}>
          <div className="cn-ctx-title">{ctx.wp.code}</div>
          <button className="cn-ctx-item" onClick={() => { onSelect(ctx.wp.id); setCtx(null); }}>
            <Icon name="open" size={12} /> Abrir detalle
          </button>
          <div className="cn-ctx-sep" />
          <div className="cn-ctx-title">Mover a estado</div>
          {CN_STATES.map(s => (
            <button key={s.id} className={"cn-ctx-item" + (s.id === ctx.wp.state ? " current" : "")} onClick={() => moveTo(ctx.wp.id, s.id)}>
              <span className="cn-col-dot" style={{ background: s.color, width: 10, height: 10 }}></span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

function CnPkgCard({ pkg, selected, dragging, onClick, onDragStart, onDragEnd, onContextMenu }) {
  const restr = cnRestrFor(pkg.id);
  const openR = restr.filter(r => !r.done).length;
  const ass = cnAssignsForWp(pkg.id);
  return (
    <div
      className={"cn-card" + (selected ? " selected" : "") + (dragging ? " dragging" : "")}
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
    >
      <div className="cn-card-hd">
        <span className="cn-card-code" style={{ background: pkg.color }}>{pkg.code}</span>
        <span className="cn-card-prog">{pkg.progress}%</span>
      </div>
      <div className="cn-card-name">{pkg.name}</div>
      <div className="cn-card-bar">
        <div className="cn-bar-track tiny"><div className="cn-bar-fill" style={{ width: pkg.progress + "%", background: pkg.color }} /></div>
      </div>
      <div className="cn-card-meta">
        <span className="cn-card-dates">{pkg.start} → {pkg.end}</span>
        <span className="cn-card-val">{cnMoney(pkg.value)}</span>
      </div>
      <div className="cn-card-foot">
        <span className="cn-card-crew">
          <Icon name="users" size={11} /> {pkg.crew}
        </span>
        <span className="cn-card-tags">
          <span className="cn-mini-tag"><Icon name="grid" size={9} /> {ass.length}</span>
          {openR > 0 && <span className="cn-mini-tag warn"><Icon name="alert" size={9} /> {openR}</span>}
        </span>
      </div>
    </div>
  );
}

/* ── Vista 3: Matriz Ítem × Paquete ─────────────────────────────────── */

function CnMatrixView({ pkgs, sel, onSelectItem, onSelectWp }) {
  // Agrupar paquetes por capítulo "asociado" — usaremos un mapa simple: el primer ítem que toca define el grupo
  // Para mantener orden estable, los recorremos por código.
  const sortedPkgs = [...pkgs].sort((a, b) => a.code.localeCompare(b.code));

  // Agrupar columnas por capítulo dominante
  const pkgGroup = (wpId) => {
    const ass = CN_ASSIGN.filter(a => a.wp === wpId);
    if (!ass.length) return CN_GROUPS[0].id;
    const counts = {};
    ass.forEach(a => {
      const it = cnItem(a.it); if (!it) return;
      counts[it.grp] = (counts[it.grp] || 0) + a.qty * (cnItem(a.it)?.unitPrice || 0);
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const colsByGroup = React.useMemo(() => {
    const out = CN_GROUPS.map(g => ({ grp: g, pkgs: [] }));
    sortedPkgs.forEach(p => {
      const gid = pkgGroup(p.id);
      const bucket = out.find(o => o.grp.id === gid);
      if (bucket) bucket.pkgs.push(p);
    });
    return out.filter(o => o.pkgs.length > 0);
  }, [sortedPkgs]);

  // Total assigned por ítem
  const itemTotals = React.useMemo(() => {
    const t = {};
    CN_ITEMS.forEach(it => {
      const ass = cnAssignedFor(it.id);
      const q = ass.reduce((a, b) => a + b.qty, 0);
      const ex = ass.reduce((a, b) => a + b.ex, 0);
      t[it.id] = { qty: q, ex, balance: it.qty - q };
    });
    return t;
  }, []);

  return (
    <div className="cn-matrix-wrap">
      <div className="cn-matrix-scroll">
        <table className="cn-matrix">
          <thead>
            <tr>
              <th rowSpan="2" className="cn-matrix-corner">
                <div className="cn-matrix-corner-1">Ítem ↓ / Paquete →</div>
                <div className="cn-matrix-corner-2">{CN_ITEMS.length} ítems × {pkgs.length} paquetes</div>
              </th>
              {colsByGroup.map(({ grp, pkgs: ps }) => (
                <th key={grp.id} className="cn-matrix-grp" colSpan={ps.length} style={{ color: grp.color }}>
                  <div className="cn-matrix-grp-h">{grp.code} · {grp.name}</div>
                </th>
              ))}
              <th rowSpan="2" className="cn-matrix-totals">
                Asignado<div className="sub">/ Saldo</div>
              </th>
            </tr>
            <tr>
              {colsByGroup.map(({ pkgs: ps }) => ps.map(p => (
                <th
                  key={p.id}
                  className="cn-matrix-wp-h"
                  onClick={() => onSelectWp(p.id)}
                  style={{ cursor: "pointer", background: sel?.kind === "wp" && sel.id === p.id ? "var(--accent-bg)" : "var(--surface-0)" }}
                  title={p.name}
                >
                  <div className="cn-matrix-wp-code" style={{ background: p.color }}>{p.code}</div>
                  <div className="cn-matrix-wp-state">
                    <span className="cn-col-dot" style={{ background: cnState(p.state).color, width: 6, height: 6 }}></span>
                    {cnState(p.state).name}
                  </div>
                </th>
              )))}
            </tr>
          </thead>
          <tbody>
            {CN_GROUPS.map(grp => {
              const items = CN_ITEMS.filter(i => i.grp === grp.id);
              return items.map(it => {
                const tot = itemTotals[it.id];
                const over = tot.balance < -0.01;
                return (
                  <tr key={it.id}>
                    <th
                      className="cn-matrix-row-h"
                      onClick={() => onSelectItem(it.id)}
                      style={{ cursor: "pointer", background: sel?.kind === "item" && sel.id === it.id ? "var(--accent-bg)" : "var(--surface-0)" }}
                    >
                      <div className="cn-matrix-row-code" style={{ color: grp.color }}>{it.code}</div>
                      <div className="cn-matrix-row-name">{it.name}</div>
                      <div className="cn-matrix-row-qty">{cnFmt(it.qty)} {it.unit} · {cnMoney(it.qty * it.unitPrice)}</div>
                    </th>
                    {colsByGroup.map(({ pkgs: ps }) => ps.map(p => {
                      const a = CN_ASSIGN.find(x => x.it === it.id && x.wp === p.id);
                      if (!a) {
                        return <td key={p.id} className="cn-matrix-cell empty" title="Sin asignar — clic para asignar"></td>;
                      }
                      const pct = a.qty > 0 ? (a.ex / a.qty) * 100 : 0;
                      return (
                        <td key={p.id} className="cn-matrix-cell" title={`${cnFmt(a.ex)}/${cnFmt(a.qty)} ${it.unit} · ${pct.toFixed(0)}%`}>
                          <div className="cn-cell-qty">{cnFmt(a.qty)}</div>
                          <div className="cn-cell-bar"><div className="cn-cell-bar-fill" style={{ width: pct + "%", background: p.color }} /></div>
                        </td>
                      );
                    }))}
                    <td className={"cn-matrix-totals-cell" + (over ? " over" : "")}>
                      {cnFmt(tot.qty)} / {cnFmt(it.qty)}
                      <div className={"sub " + (over ? "over" : Math.abs(tot.balance) < 0.01 ? "full" : "rest")}>
                        {over ? "+" + cnFmt(-tot.balance) : "saldo " + cnFmt(tot.balance)} {it.unit}
                      </div>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Drawer de detalle ──────────────────────────────────────────────── */

function CnDrawer({ sel, pkgs, onClose }) {
  if (sel.kind === "item") {
    return <CnItemDrawer item={cnItem(sel.id)} pkgs={pkgs} onClose={onClose} />;
  }
  return <CnWpDrawer wp={pkgs.find(p => p.id === sel.id)} onClose={onClose} />;
}

function CnItemDrawer({ item, pkgs, onClose }) {
  if (!item) return null;
  const grp = cnGroup(item.grp);
  const ass = cnAssignedFor(item.id);
  const assignedQty = ass.reduce((a, b) => a + b.qty, 0);
  const executedQty = ass.reduce((a, b) => a + b.ex, 0);
  const balance = item.qty - assignedQty;
  const importe = item.qty * item.unitPrice;
  const evm = importe * (item.progress / 100);

  return (
    <aside className="cn-drawer">
      <div className="cn-drawer-hd">
        <div className="cn-drawer-titles">
          <span className="cn-drawer-code" style={{ background: grp.color }}>{item.code}</span>
          <div className="cn-drawer-name">{item.name}</div>
          <div className="cn-drawer-meta">
            <span className="cn-grp-dot" style={{ background: grp.color }}></span>
            <strong>{grp.name}</strong>
          </div>
        </div>
        <button className="ribbon-btn" onClick={onClose} title="Cerrar"><Icon name="x" size={14} /></button>
      </div>

      <div className="cn-drawer-stats">
        <div className="cn-drawer-stat"><span className="lbl">Cantidad</span><span className="val">{cnFmt(item.qty)} <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{item.unit}</span></span></div>
        <div className="cn-drawer-stat"><span className="lbl">Precio unitario</span><span className="val">${cnFmt(item.unitPrice)}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Importe (BAC)</span><span className="val">{cnMoney(importe)}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Ejecutado (EV)</span><span className="val">{cnMoney(evm)}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Asignado</span><span className="val" style={{ color: balance < 0 ? "var(--accent)" : "var(--ink-1)" }}>{cnFmt(assignedQty)}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Saldo</span><span className="val" style={{ color: balance < 0 ? "var(--accent)" : "var(--ink-1)" }}>{cnFmt(balance)}</span></div>
      </div>

      <div className="cn-drawer-section">
        <div className="cn-drawer-section-hd"><Icon name="package" size={11} /> Paquetes que consumen este ítem ({ass.length})</div>
        {ass.length === 0 && <div className="cn-empty">Sin asignaciones — el ítem no está distribuido en paquetes de trabajo.</div>}
        {ass.length > 0 && (
          <table className="cn-drawer-table">
            <thead>
              <tr>
                <th>Paquete</th>
                <th className="num">Asig.</th>
                <th className="num">Ejec.</th>
                <th className="num">%</th>
              </tr>
            </thead>
            <tbody>
              {ass.map(a => {
                const p = pkgs.find(x => x.id === a.wp);
                if (!p) return null;
                const pct = a.qty > 0 ? (a.ex / a.qty) * 100 : 0;
                return (
                  <tr key={a.wp}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 3, background: p.color }}></span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{p.code}</span>
                        <span className="cn-trunc">{p.name}</span>
                      </div>
                    </td>
                    <td className="num">{cnFmt(a.qty)}</td>
                    <td className="num">{cnFmt(a.ex)}</td>
                    <td className="num" style={{ color: pct === 100 ? "var(--ok)" : "var(--ink-2)" }}>{pct.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="cn-drawer-section">
        <div className="cn-drawer-section-hd"><Icon name="check" size={11} /> Avance físico</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="cn-bar-track" style={{ flex: 1, height: 10 }}>
            <div className="cn-bar-fill" style={{ width: item.progress + "%", background: grp.color }} />
          </div>
          <strong style={{ fontSize: 16, fontFamily: "var(--font-mono)" }}>{item.progress}%</strong>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-3)" }}>
          {cnFmt(executedQty)} {item.unit} ejecutados · {cnFmt(item.qty - executedQty)} {item.unit} pendientes
        </div>
      </div>
    </aside>
  );
}

function CnWpDrawer({ wp, onClose }) {
  if (!wp) return null;
  const restr = cnRestrFor(wp.id);
  const ms = cnMsFor(wp.id);
  const ass = cnAssignsForWp(wp.id);
  const state = cnState(wp.state);
  const valEx = ass.reduce((acc, a) => {
    const it = cnItem(a.it); if (!it) return acc;
    return acc + a.ex * it.unitPrice;
  }, 0);

  return (
    <aside className="cn-drawer">
      <div className="cn-drawer-hd">
        <div className="cn-drawer-titles">
          <span className="cn-drawer-code" style={{ background: wp.color }}>{wp.code}</span>
          <div className="cn-drawer-name">{wp.name}</div>
          <div className="cn-drawer-meta">
            <span className="cn-col-dot" style={{ background: state.color }}></span>
            <strong>{state.name}</strong>
            <span>·</span>
            <span><Icon name="users" size={10} /> {wp.crew}</span>
          </div>
        </div>
        <button className="ribbon-btn" onClick={onClose} title="Cerrar"><Icon name="x" size={14} /></button>
      </div>

      <div className="cn-drawer-stats">
        <div className="cn-drawer-stat"><span className="lbl">Inicio</span><span className="val" style={{ fontSize: 13 }}>{wp.start}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Fin previsto</span><span className="val" style={{ fontSize: 13 }}>{wp.end}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Avance</span><span className="val">{wp.progress}%</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Valor ganado</span><span className="val">{cnMoney(valEx)}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Valor planificado</span><span className="val">{cnMoney(wp.value)}</span></div>
        <div className="cn-drawer-stat"><span className="lbl">Restricciones</span><span className="val" style={{ color: restr.filter(r => !r.done).length ? "var(--accent)" : "var(--ok)" }}>{restr.filter(r => !r.done).length} / {restr.length}</span></div>
      </div>

      <div className="cn-drawer-section">
        <div className="cn-drawer-section-hd"><Icon name="alert" size={11} /> Restricciones (Last Planner)</div>
        {restr.length === 0 && <div className="cn-empty">Sin restricciones registradas.</div>}
        <div className="cn-drawer-restr">
          {restr.map((r, i) => (
            <div key={i} className={"cn-restr" + (r.done ? " done" : "")}>
              <input type="checkbox" defaultChecked={r.done} onClick={(e) => e.stopPropagation()} />
              <span className={"cn-restr-kind kind-" + r.kind}>{CN_RESTR_KIND_LBL[r.kind]}</span>
              <span className="cn-restr-text">{r.text}</span>
              <span className="cn-restr-meta">{r.due}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cn-drawer-section">
        <div className="cn-drawer-section-hd"><Icon name="flag" size={11} /> Hitos del paquete</div>
        {ms.length === 0 && <div className="cn-empty">Sin hitos definidos.</div>}
        <div className="cn-drawer-ms">
          {ms.map((m, i) => (
            <div key={i} className={"cn-ms" + (m.done ? " done" : "")}>
              <span className="cn-ms-dot"></span>
              <span className="cn-ms-label">{m.label}</span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>{m.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cn-drawer-section">
        <div className="cn-drawer-section-hd"><Icon name="grid" size={11} /> Ítems consumidos ({ass.length})</div>
        <table className="cn-drawer-table">
          <thead>
            <tr>
              <th>Ítem</th>
              <th className="num">Asig.</th>
              <th className="num">Ejec.</th>
              <th className="num">Un.</th>
            </tr>
          </thead>
          <tbody>
            {ass.map(a => {
              const it = cnItem(a.it); if (!it) return null;
              const grp = cnGroup(it.grp);
              return (
                <tr key={a.it}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: grp.color }}></span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{it.code}</span>
                      <span className="cn-trunc">{it.name}</span>
                    </div>
                  </td>
                  <td className="num">{cnFmt(a.qty)}</td>
                  <td className="num">{cnFmt(a.ex)}</td>
                  <td className="num" style={{ color: "var(--ink-3)", fontSize: 10 }}>{it.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cn-drawer-section">
        <div className="cn-drawer-section-hd"><Icon name="settings" size={11} /> Cambiar estado</div>
        <div className="cn-drawer-states">
          {CN_STATES.map(s => (
            <button key={s.id} className={"cn-state-btn" + (s.id === wp.state ? " active" : "")} style={{ borderColor: s.id === wp.state ? s.color : "var(--border-1)", color: s.id === wp.state ? s.color : "var(--ink-2)" }}>
              <span className="cn-col-dot" style={{ background: s.color, width: 8, height: 8 }}></span>
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

window.ConstructionView = ConstructionView;
