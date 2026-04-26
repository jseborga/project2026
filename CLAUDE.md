# Tramo PM — Notas para Claude

Cronograma estilo MS Project en web (prototipo React/Babel sin build) que se va a
conectar a **Odoo 18 Community Edition** más adelante. Repo: `jseborga/project2026`,
deploy en EasyPanel via Dockerfile.

## Filosofía rápida

- **El usuario no puede correr nada localmente.** Verifica todo en remoto: el deploy
  vive en EasyPanel; usa el MCP Playwright (configurado en `.mcp.json`) o `WebFetch`
  para confirmar que el sitio responde.
- **Odoo está deferred.** No empujes una decisión de integración con Odoo todavía
  — itera el frontend primero. Cuando se decida, el README ya tiene mapeo a modelos.
- **Documentá el avance.** Toda mejora visible va al `CHANGELOG.md` (sección
  Unreleased) en el mismo commit.

## Flujo de trabajo

```bash
# Editar archivos en web/
git add -A && git commit -m "..."
git push origin main          # EasyPanel redeploya (auto si está activo)
```

Después del push, verificar el deploy:
```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://<subdominio>.easypanel.host/
```
o usar el MCP Playwright para abrir la URL y revisar la consola.

## Estructura

```
project2026/
├── CLAUDE.md            # este archivo
├── README.md            # qué es el proyecto + deploy
├── CHANGELOG.md         # avance, ordenado por release
├── Dockerfile           # nginx:alpine sirviendo web/
├── .dockerignore
├── .mcp.json            # Playwright MCP para verificar deploys
├── .claude/
│   └── settings.json    # permisos del proyecto
├── serve.sh             # python3 http.server para dev local
└── web/                 # frontend (React + Babel desde CDN)
    ├── index.html       # carga los .jsx en orden, NO modificar el orden
    ├── styles.css       # tokens + estilos de todas las vistas
    ├── data.jsx         # mock data — futura puerta de entrada a Odoo
    ├── system.jsx       # Iconos, Sidebar, Topbar
    ├── tweaks-panel.jsx # panel de tema + hooks
    ├── app.jsx          # router de vistas
    ├── gantt.jsx        # vista Cronograma (la más grande)
    ├── construction.jsx # vista Construcción (3 pestañas)
    ├── resources.jsx    # vista Recursos
    ├── dashboard.jsx    # vista Resumen
    ├── reports.jsx      # vista Reportes
    └── requests.jsx     # vista Solicitudes
```

## Convenciones del frontend

- **Sin paso de build.** React/ReactDOM/Babel cargan desde unpkg con SRI; los `.jsx`
  se transpilan en el browser. Si algún día se mete Vite, hay que migrar TODO el repo
  a la vez — no mezclar.
- **Globales, no módulos.** Cada `.jsx` define componentes/datos en el scope global;
  los siguientes los consumen. Por eso el orden en `index.html` importa.
- **Tema vía CSS vars.** Todo el theming es `--accent`, `--bg-0`, etc. Modo oscuro
  con `[data-dark="1"]` en `<html>`. Densidad con `[data-density="..."]`.
- **Cache busting:** `styles.css?v=N` en `index.html` — bumpear `v` cuando se editen
  estilos críticos.

## Cómo aportar avances

Cuando se cierre una pieza notable (feature, bugfix visible, refactor de capa de
datos), agregar línea al `CHANGELOG.md` bajo **Unreleased**, formato:

```
- **<Vista o capa>**: <qué cambió, en una línea>
```

## Cuando se cablee Odoo (recordatorio)

- `data.jsx` se convierte en cliente JSON-RPC contra Odoo. Toda la app ya consume
  desde ahí, así que el cambio es local a un archivo (esa es la apuesta).
- Modelos: `project.project`, `project.task`, `account.analytic.line`,
  `res.users`/`hr.employee`. Paquetes/ítems de obra → módulo custom o cuentas
  analíticas + tags (a decidir).
- Envs esperadas: `ODOO_URL`, `ODOO_DB`, `ODOO_API_KEY` (configurar en EasyPanel).
