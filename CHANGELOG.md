# Changelog

Todos los cambios notables del proyecto se registran aquí. Formato basado en
[Keep a Changelog](https://keepachangelog.com/), versiones según
[SemVer](https://semver.org/lang/es/).

## [Unreleased]

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
