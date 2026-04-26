# Tramo PM — Seguimiento de proyectos

Cronograma tipo MS Project en web, pensado para conectarse a **Odoo 18 Community Edition**
e importar/exportar tareas del módulo `project`.

## Estado actual

Prototipo funcional (vista única, datos mock en `web/data.jsx`) con:

- **Cronograma (Gantt)** estilo MS Project: ribbon, status bar, edición inline,
  diálogos arrastrables, menú contextual con submenús, ruta crítica, dependencias,
  ajustar a pantalla, scroll sincronizado entre lista y barras.
- **Construcción**: ítems/partidas, paquetes de trabajo (kanban con 7 estados tipo
  Last Planner) y matriz ítem × paquete.
- **Recursos**: heatmap de carga semanal con detección de sobreasignación.
- **Resumen**: KPIs, curva S real vs. plan, riesgos, costos por fase.
- **Reportes**: avance, horas, costos (EVM con CPI/SPI/EAC), carga.
- **Solicitudes**: bandeja de aprobaciones (cambios de alcance, timesheets, compras, ausencias).

Tweaks: color de acento, modo oscuro, densidad, zoom Gantt, mostrar ruta crítica.

## Cómo correrlo

### Local (dev)

```bash
./serve.sh                  # http://localhost:5173
PORT=8080 ./serve.sh        # otro puerto
```

Necesita solo `python3` (sirve estáticos). React, ReactDOM y Babel se cargan desde
unpkg con SRI; Babel transpila los `*.jsx` en el navegador. Sin paso de build.

### Docker

```bash
docker build -t tramo-pm .
docker run --rm -p 8080:80 tramo-pm   # http://localhost:8080
```

`Dockerfile` usa `nginx:alpine` y copia `web/` a `/usr/share/nginx/html/`.

### Deploy en EasyPanel

1. **Crear el servicio**: en tu proyecto de EasyPanel → **+ Create** → **App**.
2. **Source** → **GitHub** → conecta tu cuenta y selecciona `jseborga/project2026`,
   branch `main`. Carpeta raíz: `/` (no subcarpeta — el `Dockerfile` está en la raíz).
3. **Build** → método **Dockerfile** (EasyPanel lo detecta automáticamente).
   Ruta del Dockerfile: `Dockerfile` (default).
4. **Network** → puerto interno: **80**. Activa "Expose" y EasyPanel asigna un
   subdominio (`*.easypanel.host`) o conecta tu dominio propio.
5. **Deploy**. La primera build tarda ~30 s; luego cada `git push` a `main` puede
   redeployarse manualmente o configurando un webhook en **Source → Auto Deploy**.

Nada de variables de entorno ni volúmenes por ahora — es estático. Cuando se cablee
Odoo añadiremos `ODOO_URL`, `ODOO_DB`, `ODOO_API_KEY` como envs del servicio.

## Estructura

```
project2026/
├── README.md
├── serve.sh
└── web/
    ├── index.html         # Carga React/Babel y monta los .jsx en orden
    ├── styles.css         # Tokens de diseño + estilos de todas las vistas
    ├── data.jsx           # Datos mock (proyecto, tareas, recursos, etc.)
    ├── system.jsx         # Iconos, Sidebar, Topbar, helpers compartidos
    ├── tweaks-panel.jsx   # Panel lateral de tweaks + hooks de tema
    ├── app.jsx            # Root: router de vistas + tema
    ├── gantt.jsx          # Vista Cronograma (la más grande)
    ├── construction.jsx   # Vista Construcción (3 pestañas)
    ├── resources.jsx      # Vista Recursos
    ├── dashboard.jsx      # Vista Resumen
    ├── reports.jsx        # Vista Reportes
    └── requests.jsx       # Vista Solicitudes
```

Los `.jsx` se cargan en orden desde `index.html`; cada uno define globales
(componentes y datos) que los siguientes consumen.

## Próximo paso: integración con Odoo 18 CE

El prototipo está pensado para enchufarse a Odoo via su API estándar
(`xmlrpc/2/object` o `web/dataset/call_kw`). Modelos relevantes:

| Concepto en Tramo PM         | Modelo Odoo                |
|------------------------------|----------------------------|
| Proyecto                     | `project.project`          |
| Tarea / hito                 | `project.task`             |
| Dependencias                 | `project.task.depend_ids`  |
| Recurso (responsable)        | `res.users` / `hr.employee`|
| Timesheet                    | `account.analytic.line`    |
| Paquete de trabajo / ítem    | (módulo custom o `account.analytic.account` + tags) |

### Decisiones pendientes (a resolver antes de cablear)

1. **Modo de integración**: ¿app web independiente hablando a Odoo via JSON-RPC,
   módulo Odoo nativo (vistas OWL), o backend intermedio (FastAPI/Node)?
2. **Sincronización**: ¿pull on-demand, polling, webhooks, o sincronización
   bidireccional con resolución de conflictos?
3. **Paquetes/ítems de obra**: Odoo CE no tiene un modelo nativo equivalente.
   Toca decidir si se construye un módulo custom o se mapea sobre cuentas
   analíticas + tags + product templates.
4. **Auth**: API key de Odoo, OAuth2, o sesión compartida si se sirve desde el
   mismo dominio.

### Esqueleto sugerido cuando se decida

```
project2026/
├── web/                   # frontend (lo que ya existe)
└── server/                # nuevo: capa de integración
    ├── odoo_client.py     # wrapper sobre xmlrpc/jsonrpc
    ├── mappers.py         # task ↔ project.task, resource ↔ res.users, etc.
    └── api.py             # FastAPI: GET/POST tareas, importar, exportar
```

## Notas de diseño

- El diseño viene de `claude.ai/design`; el bundle original (con chats e
  iteraciones) está en `/tmp/design-pkg/` durante esta sesión.
- Los archivos JSX vienen del prototipo tal cual; la mejora a build con
  Vite + TS + bundling se puede hacer cuando se vaya a producción, pero
  no es necesaria para iterar el diseño ni para la integración Odoo.
