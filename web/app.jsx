// app.jsx — Root app + view switcher

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#b85c38",
  "density": "regular",
  "dark": false,
  "showCritical": true,
  "ganttZoom": "week"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = React.useState("gantt");

  // Apply theme & density to <html>
  React.useEffect(() => {
    document.documentElement.dataset.dark = tweaks.dark ? "1" : "0";
    document.documentElement.dataset.density = tweaks.density || "regular";
    // Re-derive accent token tints
    const root = document.documentElement;
    root.style.setProperty("--accent", tweaks.accentColor);
    // Compute a tint for accent-bg from the hex
    const hex = tweaks.accentColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    root.style.setProperty("--accent-bg", `rgba(${r}, ${g}, ${b}, 0.13)`);
    root.style.setProperty("--accent-fg", `rgb(${Math.round(r * 0.75)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`);
  }, [tweaks.dark, tweaks.density, tweaks.accentColor]);

  const titles = {
    dashboard:    { t: "Resumen", s: "Estado general del proyecto" },
    gantt:        { t: "Cronograma", s: "Diagrama de Gantt · 18 tareas · 3 hitos" },
    construction: { t: "Construcción", s: "Ítems, paquetes y matriz de asignación" },
    resources:    { t: "Recursos", s: "Asignación y carga del equipo" },
    reports:      { t: "Reportes", s: "Análisis de avance, costos y horas" },
    requests:     { t: "Solicitudes", s: "Bandeja de aprobaciones del ERP" },
  };

  const isGantt = view === "gantt";
  const isConstruction = view === "construction";
  const isFullscreen = isGantt || isConstruction;

  return (
    <div className="app" data-view={view}>
      <Sidebar view={view} onView={setView} />
      <main className={"app-main" + (isFullscreen ? " app-main-fullscreen" : "")}>
        {!isFullscreen && (
          <Topbar title={titles[view].t} subtitle={titles[view].s}>
            <button className="btn-secondary"><Icon name="download" size={13} /> Exportar</button>
            <button className="btn-primary"><Icon name="plus" size={13} /> Nuevo</button>
          </Topbar>
        )}

        <div className={"view-area" + (isFullscreen ? " view-area-flush" : "")}>
          {view === "dashboard" && <DashboardView tweaks={tweaks} />}
          {view === "gantt" && <GanttView tweaks={tweaks} />}
          {view === "construction" && <ConstructionView tweaks={tweaks} />}
          {view === "resources" && <ResourcesView tweaks={tweaks} />}
          {view === "reports" && <ReportsView tweaks={tweaks} />}
          {view === "requests" && <RequestsView tweaks={tweaks} />}
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakColor label="Color de acento" value={tweaks.accentColor} onChange={(v) => setTweak("accentColor", v)} />
        <TweakToggle label="Modo oscuro" value={tweaks.dark} onChange={(v) => setTweak("dark", v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Densidad" value={tweaks.density}
          options={[{ value: "compact", label: "Compacta" }, { value: "regular", label: "Regular" }, { value: "comfy", label: "Cómoda" }]}
          onChange={(v) => setTweak("density", v)} />

        <TweakSection label="Cronograma" />
        <TweakRadio label="Zoom Gantt" value={tweaks.ganttZoom}
          options={[{ value: "day", label: "Día" }, { value: "week", label: "Sem" }, { value: "month", label: "Mes" }]}
          onChange={(v) => setTweak("ganttZoom", v)} />
        <TweakToggle label="Camino crítico" value={tweaks.showCritical} onChange={(v) => setTweak("showCritical", v)} />

        <TweakSection label="Datos" />
        <TweakButton label="Restablecer datos locales" secondary onClick={() => {
          if (window.confirm("¿Borrar todos los cambios locales? Las tareas, paquetes y tweaks vuelven a sus valores por defecto.")) {
            window.tramoStore.clearAll();
            window.location.reload();
          }
        }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
