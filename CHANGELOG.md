# Changelog

Todos los cambios notables del proyecto se registran aquí. Formato basado en
[Keep a Changelog](https://keepachangelog.com/), versiones según
[SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Architecture
- **Hallazgo 2026-04-26 (introspección Odoo)**: el módulo `construction_apu`
  + `seguimiento_proyecto` instalados en el Odoo del usuario son un mini-PM
  completo (CPM, EVM, baseline, cuadrillas, cómputos, BIM bridge). Esto
  cambia la propuesta: **no se necesita ningún módulo Odoo custom**, el
  gateway pasa a ser mayormente proxy + cache + auth. Schema de 81 modelos
  guardado en `project2026-api/schema.md` (gitignored). Mapping definitivo
  app↔Odoo en memoria del proyecto.
- Plan de fases revisado: 1 (`/projects`) ✅ → 2 (catálogo APU) → 3 (plan
  con `apu.project.plan.line`) → 4 (edición) → 5 (consumo via
  `apu.cost.entry`) → 6 (vincular contratos PO/SO).

### Gateway (project2026-api)
- **Fase 1 ✅**: `GET /projects` y `GET /projects/{id}` con filtro
  multi-empresa, búsqueda por nombre, paginación. 8 tests verdes,
  verificado end-to-end contra Odoo real (4 empresas, multi-tenancy ok).
- **Fase 1.5 ✅**: `POST /auth/switch_company` para cambiar empresa activa
  sin pedir credenciales. `cookie_samesite=none` (con secure) — necesario
  para que la cookie viaje cross-subdomain frontend ↔ gateway.
- **Fase 2 ✅**: `GET /projects/{id}/catalog` (combinado: rubros + items +
  insumos en una call). 11 tests verdes; verificado contra proyecto real
  (3 rubros, 10 items APU, 33 insumos en mat/mo/eq/sub).

### Frontend
- **Auth + multi-empresa ✅**: vista "Proyectos (Odoo)" con login
  (email + API key), selector de empresa con switch en vivo, listado de
  proyectos reales con datos APU (plan activo, costo real, margen, readiness).
  Sesión persiste entre refreshes via localStorage + validación con /auth/me.
- **Project detail + catálogo ✅**: click en card abre vista de detalle con
  tabs (Catálogo activo; Plan y Consumos placeholders). Catálogo muestra:
  KPIs (presupuesto, costo real, # rubros/items/insumos), tabla de items
  agrupada por rubro con cantidad/PU/subtotal/incidencia, panel de insumos
  con tipo (mat/mo/eq/sub), PU, cantidad, monto y producto Odoo vinculado.
- **Catálogo refinado ✅**: items APU expandibles (chevron) que muestran su
  composición de costo (apu.line con insumo/rendimiento/PU/subtotal,
  ordenado por tipo). Insumos del proyecto separados en 4 secciones por
  tipo (Materiales/Mano de obra/Equipo/Subcontratos) con subtotal por
  sección, como agrupa Odoo nativamente.

### Fase 3 ✅ — Plan real (Gantt read-only)
- Gateway: `GET /projects/{id}/plan` devuelve `apu.project.plan` activo +
  todas las `apu.project.plan.line` (jerárquicas, con generic_start/finish_day,
  early/late, critical, milestone) + `apu.project.plan.link` (dependencias
  fs/ss/ff/sf con lag). 4 tests verdes.
- Frontend: tab "Plan" ahora habilitado, hace lazy-load del endpoint.
  - PlanHeaderBar: KPIs (críticas, cuadrillas, readiness%, earned amount)
    + badge "Línea base congelada" con botón Desbloquear (placeholder fase 4).
  - PlanTab: Gantt con columna nombres jerárquica (chevrons para grupos
    colapsables) + timeline en días genéricos (24px/día, líneas semanales).
    Barras de actividades, rombos para hitos, sumario fino para grupos.
    Críticas en color acento. Dependencias FS dibujadas como flechitas.
  - 404 manejado: mensaje claro cuando un proyecto no tiene plan activo.
- Verificado contra Plan V1 real del proyecto "Analisis Patologico BCP":
  13 líneas (3 grupos + 10 actividades), 9 dependencias, 2 críticas,
  baseline lockeada el 2026-04-14.

### Fase 6 ✅ — Contratos (purchase orders)
- Hallazgo: el módulo `sale_management` NO está instalado en este Odoo,
  así que esta fase cubre solo `purchase.order`. Si se instala ventas,
  agregamos sale.order en una sub-sección.
- Gateway:
  - `GET /projects/{id}/contracts`: lee POs del proyecto + sus líneas en
    batch. Devuelve header (vendor, partner_ref, state, invoice_status,
    fechas, totales) + lines (descripción, producto, uom, qty, qty_received,
    qty_invoiced, PU, subtotal, total). Detecta presencia del módulo sale
    y expone `sale_orders_supported: bool`.
  - 4 tests nuevos (33 totales). Verificado: 0 POs en sistema (esperado).
- Frontend:
  - Tab "Contratos" en ProjectDetailView con lazy-load.
  - ContractsTab: KPIs (POs activas, total comprometido, facturado
    estimado, % facturado, # líneas), aviso si sale_management no está
    instalado, empty state explicativo cuando no hay POs.
  - POCard expandible: header con nombre, vendor, badges (state +
    invoice_status), total. Barras de progreso en vivo (% recibido y
    % facturado). Click despliega tabla de líneas con qty, qty_received,
    qty_invoiced, PU, subtotal.
- Cache buster styles.css?v=13.

### Fase 5 ✅ — Registro de consumos (apu.cost.entry)
- Gateway:
  - `GET /projects/{id}/cost-entries`: lista con paginación + filtro
    `only_manual`. Devuelve fecha, item APU, insumo, partner, employee,
    cantidad, PU, monto, cost_stage (manual/purchase/bill/cash),
    resource_type (mat/mo/eq/sub/oh).
  - `POST /projects/{id}/cost-entries`: crea con cost_stage='manual'.
    Valida que apu_item_id pertenezca al proyecto. resource_type se deduce
    del insumo si no se manda. amount lo computa Odoo (qty * unit_cost).
  - `DELETE /projects/{id}/cost-entries/{entry_id}`: solo entries
    manuales no autogenerados; los originados en PO/bill/cash devuelven 409.
  - 6 tests nuevos (29 totales). Verificado contra Odoo real (create →
    counts_as_actual=true → unlink OK).
- Frontend:
  - Tab "Consumos" habilitado en ProjectDetailView con lazy-load.
  - ConsumosTab: KPIs (costo total + por tipo), tabla de entries con
    fecha/concepto/item/insumo/tipo/origen/cantidad/PU/monto. Notas debajo
    del concepto. Botón ✕ para eliminar (solo manuales).
  - NewCostEntryDialog: form modal con concepto, fecha (default hoy),
    selector de item APU agrupado por rubro, selector de insumo filtrado
    por las líneas del item (autocompleta PU), cantidad, costo unitario,
    subtotal en vivo, notas. Submit → POST → refresh.
- Cache buster styles.css?v=12.

### Fase 4 ✅ — Edición del plan (state-aware)
- Gateway:
  - `PATCH /projects/{id}/plan/lines/{line_id}` — actualiza name, code,
    duration_days, generic_start/finish_day, progress_pct, actual_start,
    actual_finish. Filtra según state-machine de `apu.project.plan`:
    state=draft permite todo; baseline/approved/execution permiten solo
    "actuals" (progress_pct, actual_start, actual_finish); closed → 409.
  - `POST /projects/{id}/plan/unlock` — escape hatch que escribe
    `state='draft'` (Odoo no expone botón estándar para esto).
  - `GET /plan` ahora incluye `state` y `progress_pct`.
  - 8 tests nuevos (23 totales en gateway).
- Frontend:
  - PlanHeaderBar reemplaza el badge de "lock" con un **state badge**
    (Borrador / Línea base / Aprobado / En ejecución / Cerrado) con icono
    y tooltip. Botón Desbloquear (con confirmación) cuando state ≠ draft.
  - Drag horizontal de barras → mueve `generic_start_day`. Solo en draft.
  - Drag del borde derecho → cambia `duration_days`. Solo en draft.
  - Doble click en nombre → input editable inline. Solo en draft.
  - Click derecho en barra/fila → menú contextual con Información,
    Renombrar, Marcar inicio real (hoy), Marcar terminada, Limpiar fechas.
  - Doble click en barra → dialog modal con tabs General + Ejecución.
    Ejecución permite editar avance + fechas reales incluso con baseline.
  - Updates optimistas con revert si la API falla.
  - Pills nuevos: "{N}%" (progreso), "en curso", "terminada".
  - Overlay de progreso visual sobre cada barra.

### Architecture
- **Decisión 2026-04-26**: integración con Odoo via gateway FastAPI separado
  (repo paralelo `project2026-api`), no más deferred. Modelo de eventos hacia
  Odoo: materiales → `stock.move`, mano de obra propia → `account.analytic.line`,
  servicios subcontratados → `account.move` ligado a `purchase.order.line`,
  cierre de paquete con cliente → hito de `sale.order`. Contratos (PO/SO)
  se vinculan a paquetes en la app. Scaffold del gateway listo (commit local
  pendiente de push al nuevo repo); tests base pasan; falta introspección del
  schema de `construction_apu` contra Odoo real.

### Added
- Configuración Claude Code: `CLAUDE.md`, `.claude/settings.json`, `.mcp.json`
  con Playwright MCP para verificar deploys desde el navegador.
- `CHANGELOG.md` para llevar registro de avances.

### Verified
- 2026-04-26: deploy en EasyPanel funcional —
  https://base-project2026.q8waob.easypanel.host/ responde HTTP 200, React monta,
  Gantt renderiza 18 barras, las 6 vistas del sidebar cargan. Sin errores en
  consola (solo warning estándar de Babel-in-browser, esperado).

### Changed
- **Capa de datos**: nueva `web/store.jsx` con `usePersistedState(slot, default)`
  que lee/escribe en localStorage por slot (`tasks`, `cn_packages`, `tweaks`).
  Mismo contrato que `useState`, así que cuando se cablee Odoo solo cambian las
  funciones internas del store — las vistas no.
- **Gantt**: `tasks` ahora persiste — todo lo que edites (nombres, %, fechas,
  responsables, dependencias) sobrevive al refresh.
- **Construcción**: el estado de los paquetes (drag&drop entre columnas del
  kanban) persiste.
- **Tweaks**: color de acento, modo oscuro, densidad, zoom Gantt y ruta crítica
  ahora persisten (antes se perdían al recargar fuera del entorno de diseño).
- **Panel de tweaks**: nueva sección "Datos" con botón "Restablecer datos
  locales" que limpia localStorage y recarga.

## [0.1.0] — 2026-04-26

### Added
- Prototipo inicial del cronograma estilo MS Project (vistas Cronograma,
  Construcción, Recursos, Resumen, Reportes, Solicitudes).
- Diseño visual completo en `web/styles.css` con tokens, modo oscuro y densidades.
- `Dockerfile` (nginx:alpine) listo para desplegar en EasyPanel.
- `serve.sh` para desarrollo local con `python3 -m http.server`.
- `README.md` con arquitectura, deploy y mapeo a modelos de Odoo 18 CE.

### Decidido
- **Integración Odoo deferred**: se itera el frontend primero; modo de integración
  (JSON-RPC vs módulo nativo vs backend intermedio) se decide cuando el UX madure.
