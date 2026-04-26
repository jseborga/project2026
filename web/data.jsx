// data.jsx — Mock data for ERP project tracker
// Project: "Implementación Odoo CE 18 — Grupo Andina"
// Dates: anchored to 2026-01-05 (Monday)

const PROJECT = {
  code: "PRJ-2026-014",
  name: "Implementación Odoo CE 18 — Grupo Andina",
  client: "Grupo Andina S.A.",
  manager: "Lucía Fernández",
  status: "En curso",
  health: "amarillo",
  start: "2026-01-05",
  end: "2026-06-26",
  budget: 184000,
  spent: 71240,
  progress: 38,
};

// Tasks: id, name, phase, start, end, progress, assignee, deps, milestone, critical
const TASKS = [
  { id: "T01", name: "Levantamiento de procesos", phase: "Discovery", start: "2026-01-05", end: "2026-01-23", progress: 100, assignee: "MR", deps: [], critical: true },
  { id: "T02", name: "Brechas funcionales (GAP analysis)", phase: "Discovery", start: "2026-01-19", end: "2026-02-06", progress: 100, assignee: "LF", deps: ["T01"], critical: true },
  { id: "M01", name: "Cierre de Discovery", phase: "Discovery", start: "2026-02-06", end: "2026-02-06", progress: 100, milestone: true, deps: ["T02"], critical: true },

  { id: "T03", name: "Configuración de compañía y multicompañía", phase: "Configuración", start: "2026-02-09", end: "2026-02-20", progress: 100, assignee: "DC", deps: ["M01"], critical: false },
  { id: "T04", name: "Plan contable y diarios", phase: "Configuración", start: "2026-02-09", end: "2026-03-06", progress: 80, assignee: "AP", deps: ["M01"], critical: true },
  { id: "T05", name: "Catálogo de productos y categorías", phase: "Configuración", start: "2026-02-16", end: "2026-03-13", progress: 65, assignee: "MR", deps: ["M01"], critical: false },
  { id: "T06", name: "Almacenes, ubicaciones y rutas", phase: "Configuración", start: "2026-02-23", end: "2026-03-20", progress: 50, assignee: "DC", deps: ["T03"], critical: true },

  { id: "T07", name: "Migración maestra clientes", phase: "Migración", start: "2026-03-02", end: "2026-03-20", progress: 70, assignee: "JS", deps: ["T05"], critical: false },
  { id: "T08", name: "Migración maestra proveedores", phase: "Migración", start: "2026-03-09", end: "2026-03-27", progress: 35, assignee: "JS", deps: ["T05"], critical: false },
  { id: "T09", name: "Migración saldos contables apertura", phase: "Migración", start: "2026-03-16", end: "2026-04-03", progress: 20, assignee: "AP", deps: ["T04"], critical: true },
  { id: "T10", name: "Migración inventario inicial", phase: "Migración", start: "2026-03-23", end: "2026-04-10", progress: 10, assignee: "DC", deps: ["T06"], critical: true },

  { id: "T11", name: "Desarrollo: integración facturación electrónica", phase: "Desarrollo", start: "2026-03-02", end: "2026-04-17", progress: 40, assignee: "RG", deps: ["T04"], critical: true },
  { id: "T12", name: "Desarrollo: portal autoservicio cliente", phase: "Desarrollo", start: "2026-03-16", end: "2026-04-24", progress: 15, assignee: "RG", deps: ["T07"], critical: false },
  { id: "T13", name: "Desarrollo: reportes a medida (BI)", phase: "Desarrollo", start: "2026-04-06", end: "2026-05-08", progress: 0, assignee: "EL", deps: ["T09"], critical: false },

  { id: "M02", name: "UAT — entornos listos", phase: "Pruebas", start: "2026-04-17", end: "2026-04-17", progress: 0, milestone: true, deps: ["T10","T11"], critical: true },
  { id: "T14", name: "Pruebas integradas (UAT)", phase: "Pruebas", start: "2026-04-20", end: "2026-05-15", progress: 0, assignee: "LF", deps: ["M02"], critical: true },
  { id: "T15", name: "Capacitación key users", phase: "Pruebas", start: "2026-04-27", end: "2026-05-22", progress: 0, assignee: "MR", deps: ["M02"], critical: false },

  { id: "T16", name: "Cutover — congelamiento de datos", phase: "Go-live", start: "2026-05-25", end: "2026-05-29", progress: 0, assignee: "LF", deps: ["T14","T15"], critical: true },
  { id: "T17", name: "Puesta en producción", phase: "Go-live", start: "2026-06-01", end: "2026-06-05", progress: 0, assignee: "DC", deps: ["T16"], critical: true },
  { id: "M03", name: "Go-live", phase: "Go-live", start: "2026-06-05", end: "2026-06-05", progress: 0, milestone: true, deps: ["T17"], critical: true },
  { id: "T18", name: "Hypercare y estabilización", phase: "Go-live", start: "2026-06-08", end: "2026-06-26", progress: 0, assignee: "LF", deps: ["M03"], critical: false },
];

const RESOURCES = [
  { id: "LF", name: "Lucía Fernández",  role: "Project Manager",  rate: 75, capacity: 8, color: "#b85c38" },
  { id: "MR", name: "Mateo Restrepo",   role: "Consultor funcional", rate: 60, capacity: 8, color: "#3a7a8a" },
  { id: "DC", name: "Daniela Cortés",   role: "Consultor logística", rate: 60, capacity: 8, color: "#5a6e3a" },
  { id: "AP", name: "Andrés Páez",      role: "Consultor contable",  rate: 65, capacity: 8, color: "#8a5a2e" },
  { id: "JS", name: "Julia Sánchez",    role: "Analista de datos",   rate: 50, capacity: 8, color: "#6a4a7a" },
  { id: "RG", name: "Rafael Gómez",     role: "Desarrollador senior", rate: 70, capacity: 8, color: "#2e6a5a" },
  { id: "EL", name: "Elena Loaiza",     role: "Desarrolladora BI",   rate: 65, capacity: 8, color: "#7a3a5a" },
];

// Phase colors
const PHASE_COLORS = {
  "Discovery":     "#5b7a8c",
  "Configuración": "#8a6e3a",
  "Migración":     "#6a8a3a",
  "Desarrollo":    "#a06a3a",
  "Pruebas":       "#7a4a8a",
  "Go-live":       "#b85c38",
};

// Solicitudes (ERP requests) — pending workflow items
const REQUESTS = [
  { id: "SOL-2041", type: "Cambio de alcance", title: "Añadir módulo de Mantenimiento (MRO)", requester: "Carlos Núñez", role: "Sponsor", date: "2026-04-22", priority: "alta", status: "pendiente", impact: "+18 días · +$14.500", desc: "Solicita incluir módulo de mantenimiento de equipos de planta como parte del alcance original. Justifica por requisito de auditoría externa." },
  { id: "SOL-2040", type: "Aprobación timesheet", title: "Horas Sem-16 · 7 recursos", requester: "Sistema", role: "Automático", date: "2026-04-21", priority: "media", status: "pendiente", impact: "284 h · $18.220", desc: "Consolidación semanal de horas reportadas. Pendiente de aprobación del PM antes del cierre quincenal." },
  { id: "SOL-2039", type: "Reasignación", title: "Mover R. Gómez de Portal a Reportes BI", requester: "Lucía Fernández", role: "PM", date: "2026-04-20", priority: "media", status: "en revisión", impact: "Riesgo en T12", desc: "Por avance crítico de T11, se propone reasignar el desarrollo del portal a un externo y mover a Rafael a apoyar BI." },
  { id: "SOL-2038", type: "Compra", title: "Licencias Odoo Enterprise (5 usuarios)", requester: "A. Páez", role: "Contable", date: "2026-04-18", priority: "alta", status: "pendiente", impact: "$3.250 · CapEx", desc: "Necesario para validar funcionalidades premium durante UAT. Proveedor: Odoo S.A." },
  { id: "SOL-2037", type: "Ausencia", title: "Vacaciones D. Cortés · 04-08 may", requester: "Daniela Cortés", role: "Consultor", date: "2026-04-17", priority: "baja", status: "aprobada", impact: "5 días · cubre M. Restrepo", desc: "Vacaciones programadas. Solapa con T15 (capacitación) — backup asignado." },
  { id: "SOL-2036", type: "Hito", title: "Aprobar M01 · Cierre Discovery", requester: "Lucía Fernández", role: "PM", date: "2026-02-06", priority: "alta", status: "aprobada", impact: "Liberación fase 2", desc: "Hito completado a tiempo. Acta firmada por sponsor." },
  { id: "SOL-2035", type: "Cambio de alcance", title: "Excluir conciliación bancaria automática", requester: "Carlos Núñez", role: "Sponsor", date: "2026-03-30", priority: "media", status: "rechazada", impact: "−6 días · −$3.800", desc: "Rechazada: el sponsor decidió mantener la integración por requisito de tesorería." },
];

// Weekly progress for reports — actual vs planned
const PROGRESS_WEEKLY = [
  { week: "S2",  planned: 3,  actual: 4 },
  { week: "S3",  planned: 7,  actual: 8 },
  { week: "S4",  planned: 12, actual: 13 },
  { week: "S5",  planned: 17, actual: 17 },
  { week: "S6",  planned: 22, actual: 21 },
  { week: "S7",  planned: 27, actual: 25 },
  { week: "S8",  planned: 32, actual: 29 },
  { week: "S9",  planned: 37, actual: 33 },
  { week: "S10", planned: 42, actual: 36 },
  { week: "S11", planned: 47, actual: 38 },
  { week: "S12", planned: 52, actual: null },
  { week: "S13", planned: 58, actual: null },
  { week: "S14", planned: 64, actual: null },
];

const COST_BREAKDOWN = [
  { phase: "Discovery",     budget: 18000, spent: 17850 },
  { phase: "Configuración", budget: 42000, spent: 28640 },
  { phase: "Migración",     budget: 36000, spent: 14750 },
  { phase: "Desarrollo",    budget: 48000, spent: 10000 },
  { phase: "Pruebas",       budget: 22000, spent: 0 },
  { phase: "Go-live",       budget: 18000, spent: 0 },
];

// Holidays / non-working days for resource view
const HOLIDAYS = ["2026-03-23","2026-03-24","2026-04-02","2026-04-03","2026-05-01"];

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN — Ítems / Paquetes / Asignaciones (PM4R-aware)
// ─────────────────────────────────────────────────────────────────────────────
//
// Modelo:
//   ITEMS         — partidas del presupuesto (planas, con código, unidad, PU, cantidad total)
//   WORK_PACKAGES — agrupadores físicos de ejecución, con estado y restricciones
//   ALLOCATIONS   — porciones de un ítem asignadas a un paquete (cantidad)
//   ITEMS reciben avance EJECUTADO real desde lo que reportan los paquetes,
//   pero también guardan un "executed" propio para la vista clásica.

const CONSTRUCTION_PROJECT = {
  code: "OBR-2026-007",
  name: "Edificio Mirador — Obra civil y estructural",
  client: "Inversiones del Plata S.A.",
  manager: "Lucía Fernández",
  superintendent: "Iván Quispe",
  status: "En curso",
  start: "2026-01-12",
  end: "2026-09-30",
  dataDate: "2026-04-22",     // PM4R "data date" (fecha de corte)
  budget: 2_840_000,
  spent: 1_018_400,
};

// Categorías PM4R agrupan ítems para reportes de EVM
const ITEM_CATEGORIES = [
  { id: "PRELIM", name: "Trabajos preliminares",  color: "#7a8a9a" },
  { id: "MOV",    name: "Movimiento de suelos",   color: "#8a6e3a" },
  { id: "FUND",   name: "Fundaciones",            color: "#5b7a8c" },
  { id: "EST",    name: "Estructura",             color: "#a06a3a" },
  { id: "MAMP",   name: "Mampostería",            color: "#6a8a3a" },
  { id: "INST",   name: "Instalaciones",          color: "#7a4a8a" },
  { id: "TERM",   name: "Terminaciones",          color: "#b85c38" },
];

// ITEMS — partida plana con cantidad total contratada
// progress = % físico (calculado), executed = cantidad ejecutada total
const ITEMS = [
  // Preliminares
  { id: "1.1.01", code: "1.1.01", name: "Cerco de obra y obrador",        cat: "PRELIM", unit: "gl",  qty: 1,     pu:  18500,  executed: 1     },
  { id: "1.1.02", code: "1.1.02", name: "Replanteo y nivelación",          cat: "PRELIM", unit: "m²",  qty: 1850,  pu:     12,  executed: 1850  },
  { id: "1.1.03", code: "1.1.03", name: "Limpieza y desmonte",             cat: "PRELIM", unit: "m²",  qty: 2100,  pu:      8,  executed: 2100  },
  // Movimiento de suelos
  { id: "2.1.01", code: "2.1.01", name: "Excavación a máquina",            cat: "MOV",    unit: "m³",  qty: 3200,  pu:     22,  executed: 2880  },
  { id: "2.1.02", code: "2.1.02", name: "Excavación manual de zanjas",     cat: "MOV",    unit: "m³",  qty: 240,   pu:     85,  executed: 168   },
  { id: "2.1.03", code: "2.1.03", name: "Relleno compactado",              cat: "MOV",    unit: "m³",  qty: 980,   pu:     42,  executed: 295   },
  // Fundaciones
  { id: "3.1.01", code: "3.1.01", name: "Hormigón H-21 zapatas",           cat: "FUND",   unit: "m³",  qty: 312,   pu:    285,  executed: 218   },
  { id: "3.1.02", code: "3.1.02", name: "Hormigón H-21 vigas de fundación", cat: "FUND", unit: "m³",   qty: 168,   pu:    295,  executed: 84    },
  { id: "3.1.03", code: "3.1.03", name: "Acero ADN-420 conformado",        cat: "FUND",   unit: "kg",  qty: 38500, pu:      3.2,executed: 18900 },
  { id: "3.1.04", code: "3.1.04", name: "Encofrado fenólico",              cat: "FUND",   unit: "m²",  qty: 1180,  pu:     38,  executed: 612   },
  { id: "3.1.05", code: "3.1.05", name: "Hormigón de limpieza H-8",        cat: "FUND",   unit: "m³",  qty: 48,    pu:    175,  executed: 36    },
  // Estructura
  { id: "4.1.01", code: "4.1.01", name: "Hormigón H-30 columnas",          cat: "EST",    unit: "m³",  qty: 184,   pu:    320,  executed: 42    },
  { id: "4.1.02", code: "4.1.02", name: "Hormigón H-30 vigas y losas",     cat: "EST",    unit: "m³",  qty: 720,   pu:    315,  executed: 0     },
  { id: "4.1.03", code: "4.1.03", name: "Acero ADN-420 estructura",        cat: "EST",    unit: "kg",  qty: 86200, pu:      3.2,executed: 12400 },
  { id: "4.1.04", code: "4.1.04", name: "Encofrado columnas y losas",      cat: "EST",    unit: "m²",  qty: 4280,  pu:     42,  executed: 380   },
  // Mampostería
  { id: "5.1.01", code: "5.1.01", name: "Mampostería de ladrillo común",   cat: "MAMP",   unit: "m²",  qty: 1820,  pu:     58,  executed: 0     },
  { id: "5.1.02", code: "5.1.02", name: "Tabiquería de durlock",           cat: "MAMP",   unit: "m²",  qty: 940,   pu:     42,  executed: 0     },
  // Instalaciones (resumen)
  { id: "6.1.01", code: "6.1.01", name: "Instalación sanitaria — cañería", cat: "INST",   unit: "ml",  qty: 820,   pu:     48,  executed: 0     },
  { id: "6.2.01", code: "6.2.01", name: "Instalación eléctrica — cañería", cat: "INST",   unit: "ml",  qty: 2400,  pu:     22,  executed: 0     },
  // Terminaciones
  { id: "7.1.01", code: "7.1.01", name: "Revoque grueso interior",         cat: "TERM",   unit: "m²",  qty: 3200,  pu:     32,  executed: 0     },
  { id: "7.2.01", code: "7.2.01", name: "Pintura latex sobre revoque",     cat: "TERM",   unit: "m²",  qty: 4180,  pu:     14,  executed: 0     },
];

// Paquetes de trabajo — agrupadores físicos (sectores, niveles, frentes)
// state: planificado | programado | habilitado | ejecucion | pausado | terminado | recibido
const WORK_PACKAGES = [
  // Fundaciones — sector A y B
  { id: "WP-001", code: "FUND-S1A", name: "Fundaciones Sector A — Bloque 1",  cat: "FUND", state: "terminado",  start: "2026-02-02", end: "2026-02-27", crew: "Cuadrilla 1", foreman: "MR", taskRef: "T03" },
  { id: "WP-002", code: "FUND-S1B", name: "Fundaciones Sector B — Bloque 1",  cat: "FUND", state: "ejecucion",  start: "2026-02-23", end: "2026-03-20", crew: "Cuadrilla 2", foreman: "DC", taskRef: "T04" },
  { id: "WP-003", code: "FUND-S2A", name: "Fundaciones Sector A — Bloque 2",  cat: "FUND", state: "habilitado", start: "2026-03-16", end: "2026-04-10", crew: "Cuadrilla 1", foreman: "MR", taskRef: "T04" },
  { id: "WP-004", code: "FUND-S2B", name: "Fundaciones Sector B — Bloque 2",  cat: "FUND", state: "programado", start: "2026-04-06", end: "2026-04-30", crew: "Cuadrilla 2", foreman: "DC", taskRef: "T05" },
  { id: "WP-005", code: "FUND-NUC", name: "Núcleo de circulación — fundación", cat: "FUND", state: "pausado",   start: "2026-03-23", end: "2026-04-17", crew: "Cuadrilla 3", foreman: "AP", taskRef: "T06" },
  // Estructura — niveles
  { id: "WP-010", code: "EST-PB",   name: "Estructura Planta Baja",            cat: "EST",  state: "ejecucion",  start: "2026-04-06", end: "2026-05-15", crew: "Cuadrilla 4", foreman: "RG", taskRef: "T11" },
  { id: "WP-011", code: "EST-N1",   name: "Estructura Nivel 1",                cat: "EST",  state: "planificado", start: "2026-05-04", end: "2026-06-12", crew: "Cuadrilla 4", foreman: "RG", taskRef: "T11" },
  { id: "WP-012", code: "EST-N2",   name: "Estructura Nivel 2",                cat: "EST",  state: "planificado", start: "2026-06-01", end: "2026-07-10", crew: "Cuadrilla 5", foreman: "EL" },
  // Mov de suelos (todo agrupado)
  { id: "WP-020", code: "MOV-GRAL", name: "Movimiento de suelos general",      cat: "MOV",  state: "terminado",  start: "2026-01-19", end: "2026-02-13", crew: "Subcontrato", foreman: "JS" },
  { id: "WP-021", code: "MOV-RELL", name: "Rellenos perimetrales",             cat: "MOV",  state: "habilitado", start: "2026-04-13", end: "2026-04-30", crew: "Cuadrilla 6", foreman: "JS" },
  // Mampostería
  { id: "WP-030", code: "MAMP-PB",  name: "Mampostería PB",                    cat: "MAMP", state: "planificado", start: "2026-05-25", end: "2026-06-26", crew: "Cuadrilla 7", foreman: "MR" },
  // Recibido
  { id: "WP-040", code: "PREL-OBR", name: "Obrador y cerco — recibido",        cat: "PRELIM", state: "recibido", start: "2026-01-12", end: "2026-01-23", crew: "Subcontrato", foreman: "LF" },
];

// Asignaciones — qué porción de cada ítem va a cada paquete
// qty = cantidad asignada del ítem, executed = cantidad ya ejecutada en este paquete
const ALLOCATIONS = [
  // WP-040 Obrador
  { wp: "WP-040", item: "1.1.01", qty: 1,    executed: 1   },
  { wp: "WP-040", item: "1.1.02", qty: 1850, executed: 1850 },
  { wp: "WP-040", item: "1.1.03", qty: 2100, executed: 2100 },
  // WP-020 Mov general
  { wp: "WP-020", item: "2.1.01", qty: 2880, executed: 2880 },
  { wp: "WP-020", item: "2.1.02", qty: 96,   executed: 96 },
  // WP-021 Rellenos
  { wp: "WP-021", item: "2.1.03", qty: 580,  executed: 0 },
  { wp: "WP-021", item: "2.1.02", qty: 48,   executed: 0 },
  // WP-001 Fundación S1A — terminado
  { wp: "WP-001", item: "3.1.01", qty: 96,    executed: 96    },
  { wp: "WP-001", item: "3.1.02", qty: 42,    executed: 42    },
  { wp: "WP-001", item: "3.1.03", qty: 9800,  executed: 9800  },
  { wp: "WP-001", item: "3.1.04", qty: 320,   executed: 320   },
  { wp: "WP-001", item: "3.1.05", qty: 14,    executed: 14    },
  // WP-002 Fundación S1B — ejecución 70%
  { wp: "WP-002", item: "3.1.01", qty: 88,    executed: 62    },
  { wp: "WP-002", item: "3.1.02", qty: 38,    executed: 24    },
  { wp: "WP-002", item: "3.1.03", qty: 8900,  executed: 5400  },
  { wp: "WP-002", item: "3.1.04", qty: 295,   executed: 196   },
  { wp: "WP-002", item: "3.1.05", qty: 12,    executed: 12    },
  // WP-003 Fundación S2A — habilitado
  { wp: "WP-003", item: "3.1.01", qty: 72,    executed: 60    },
  { wp: "WP-003", item: "3.1.02", qty: 32,    executed: 18    },
  { wp: "WP-003", item: "3.1.03", qty: 8200,  executed: 3700  },
  { wp: "WP-003", item: "3.1.04", qty: 240,   executed: 96    },
  { wp: "WP-003", item: "3.1.05", qty: 10,    executed: 10    },
  // WP-004 Fundación S2B — programado
  { wp: "WP-004", item: "3.1.01", qty: 56,    executed: 0     },
  { wp: "WP-004", item: "3.1.02", qty: 28,    executed: 0     },
  { wp: "WP-004", item: "3.1.03", qty: 6800,  executed: 0     },
  { wp: "WP-004", item: "3.1.04", qty: 195,   executed: 0     },
  { wp: "WP-004", item: "3.1.05", qty: 8,     executed: 0     },
  // WP-005 Núcleo — pausado
  { wp: "WP-005", item: "3.1.03", qty: 4800,  executed: 0     },
  { wp: "WP-005", item: "3.1.04", qty: 130,   executed: 0     },
  // WP-010 Est PB — ejecución
  { wp: "WP-010", item: "4.1.01", qty: 64,    executed: 42    },
  { wp: "WP-010", item: "4.1.02", qty: 240,   executed: 0     },
  { wp: "WP-010", item: "4.1.03", qty: 28800, executed: 12400 },
  { wp: "WP-010", item: "4.1.04", qty: 1420,  executed: 380   },
  // WP-011 Est N1
  { wp: "WP-011", item: "4.1.01", qty: 60,    executed: 0     },
  { wp: "WP-011", item: "4.1.02", qty: 240,   executed: 0     },
  { wp: "WP-011", item: "4.1.03", qty: 28700, executed: 0     },
  { wp: "WP-011", item: "4.1.04", qty: 1430,  executed: 0     },
  // WP-012 Est N2
  { wp: "WP-012", item: "4.1.01", qty: 60,    executed: 0     },
  { wp: "WP-012", item: "4.1.02", qty: 240,   executed: 0     },
  { wp: "WP-012", item: "4.1.03", qty: 28700, executed: 0     },
  { wp: "WP-012", item: "4.1.04", qty: 1430,  executed: 0     },
  // WP-030 Mamp PB
  { wp: "WP-030", item: "5.1.01", qty: 620,   executed: 0     },
  { wp: "WP-030", item: "5.1.02", qty: 320,   executed: 0     },
];

// Restricciones — tipo Last Planner
// kind: 'mat' (material) | 'inf' (información/plano) | 'frente' | 'rrhh' | 'externo' | 'wp' (otro paquete)
const RESTRICTIONS = [
  { wp: "WP-003", kind: "mat",    text: "Acero ADN-420 (4.5 t) — pendiente entrega proveedor",    due: "2026-04-12", responsible: "AP", done: true },
  { wp: "WP-003", kind: "frente", text: "Liberar frente B — terminar excavación complementaria", due: "2026-04-15", responsible: "DC", done: true },
  { wp: "WP-003", kind: "inf",    text: "Plano de armado revisión C aprobado",                    due: "2026-04-10", responsible: "RG", done: true },
  { wp: "WP-004", kind: "mat",    text: "Hormigón H-21 — confirmar bombeo con planta",            due: "2026-04-30", responsible: "AP", done: false },
  { wp: "WP-004", kind: "wp",     text: "Depende de finalización de WP-002",                       due: "—",          responsible: "MR", done: false },
  { wp: "WP-004", kind: "rrhh",   text: "Cuadrilla 2 disponible (libera de WP-002)",               due: "2026-04-30", responsible: "DC", done: false },
  { wp: "WP-005", kind: "externo", text: "Inspección municipal de excavación profunda",            due: "2026-04-08", responsible: "LF", done: false },
  { wp: "WP-005", kind: "mat",    text: "Tablestacado de seguridad — aún no en obra",              due: "—",          responsible: "AP", done: false },
  { wp: "WP-011", kind: "wp",     text: "Depende de finalización de WP-010 (PB)",                  due: "—",          responsible: "RG", done: false },
  { wp: "WP-011", kind: "inf",    text: "Plano losa N1 — pendiente revisión cálculo",              due: "2026-05-02", responsible: "EL", done: false },
  { wp: "WP-012", kind: "wp",     text: "Depende de WP-011",                                        due: "—",          responsible: "RG", done: false },
  { wp: "WP-030", kind: "mat",    text: "Ladrillo cerámico hueco 18x18x33 — orden de compra",      due: "2026-05-15", responsible: "AP", done: false },
];

// Hitos del paquete (excavado / armado / hormigonado / curado / etc.)
// Estos son sub-checkpoints opcionales por paquete
const WP_MILESTONES = [
  { wp: "WP-002", key: "excavado",     label: "Excavación completa",   done: true },
  { wp: "WP-002", key: "armado",       label: "Armadura colocada",     done: true },
  { wp: "WP-002", key: "encofrado",    label: "Encofrado verificado",  done: true },
  { wp: "WP-002", key: "hormigonado",  label: "Hormigonado",           done: false },
  { wp: "WP-002", key: "curado",       label: "Curado 7 días",         done: false },
  { wp: "WP-002", key: "desencofrado", label: "Desencofrado",          done: false },

  { wp: "WP-010", key: "armado_col",   label: "Armadura columnas",     done: true },
  { wp: "WP-010", key: "horm_col",     label: "Hormigonado columnas",  done: true },
  { wp: "WP-010", key: "armado_losa",  label: "Armadura losa+vigas",   done: false },
  { wp: "WP-010", key: "horm_losa",    label: "Hormigonado losa",      done: false },
];

// Estados de paquete con metadatos visuales
const WP_STATES = [
  { id: "planificado", label: "Planificado", color: "#9aa1a8", description: "Existe en el plan, sin fecha firme" },
  { id: "programado",  label: "Programado",  color: "#5b7a8c", description: "Con ventana de ejecución asignada" },
  { id: "habilitado",  label: "Habilitado",  color: "#6a8a3a", description: "Frente liberado, materiales OK" },
  { id: "ejecucion",   label: "En ejecución", color: "#b85c38", description: "Cuadrilla trabajando" },
  { id: "pausado",     label: "Pausado",     color: "#a06a3a", description: "Con restricción activa" },
  { id: "terminado",   label: "Terminado",   color: "#3a7a8a", description: "Trabajo físico completo" },
  { id: "recibido",    label: "Recibido",    color: "#5a3a8a", description: "Aprobado por inspección" },
];

Object.assign(window, {
  PROJECT, TASKS, RESOURCES, PHASE_COLORS, REQUESTS,
  PROGRESS_WEEKLY, COST_BREAKDOWN, HOLIDAYS,
  // Construcción
  CONSTRUCTION_PROJECT, ITEM_CATEGORIES, ITEMS,
  WORK_PACKAGES, ALLOCATIONS, RESTRICTIONS, WP_MILESTONES, WP_STATES,
});
