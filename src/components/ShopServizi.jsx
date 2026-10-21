import React, { useState } from "react";

// NUOVO: raggruppa i servizi per categoria (ordine di prima apparizione).
// Il confronto ignora maiuscole e spazi; i servizi senza categoria vanno in "Autres services".
function groupByCategory(services) {
  const groups = [];
  const byKey = new Map();
  services.forEach((service) => {
    const label = (service.category || "").trim() || "Autres services";
    const key = label.toLowerCase();
    if (!byKey.has(key)) {
      const group = { key, label, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    byKey.get(key).items.push(service);
  });
  return groups;
}

// Aggiungiamo 'onServiceClick' per far comunicare questo componente con la pagina principale
export default function ShopServizi({ services, onServiceClick }) {
  // NUOVO: categoria scelta nella barra (null = la prima). Va dichiarato PRIMA del return anticipato (regola degli hook).
  const [activeKey, setActiveKey] = useState(null);

  if (!services || services.length === 0) {
    return (
      <div className="p-8 mt-4 text-center bg-white border shadow-sm border-line-strong rounded-2xl">
        <span className="block mb-2 text-3xl">✂️</span>
        <span className="font-medium text-fg-muted">Aucun service disponible pour le moment.</span>
      </div>
    );
  }

  // Con una sola categoria la lista resta come prima; con più categorie compare la barra e si vede una categoria alla volta
  const groups = groupByCategory(services);
  const showCategories = groups.length > 1;
  // Se la categoria scelta non esiste più (es. servizio eliminato) si torna alla prima
  const activeGroup = groups.find((g) => g.key === activeKey) || groups[0];
  const visibleGroups = showCategories ? [activeGroup] : groups;

  return (
    <div className="overflow-hidden bg-white border shadow-sm border-line-strong rounded-2xl">
      <div className={showCategories ? "px-5 pt-5 bg-white" : "p-5 bg-white border-b border-line"}>
        <h2 className="text-xl font-extrabold tracking-tight text-fg font-heading">Services du salon</h2>
      </div>

      {/* NUOVO: barra delle categorie (solo con più di una categoria), scorrevole in orizzontale.
          Usa solo colori e font del tema della pagina: cambia da sola con il business_type. */}
      {showCategories && (
        <div className="border-b border-line">
          <div
            role="tablist"
            aria-label="Catégories de services"
            className="flex gap-6 px-5 -mb-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map((group) => {
              const isActive = group.key === activeGroup.key;
              return (
                <button
                  key={group.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => {
                    setActiveKey(group.key);
                    // Porta in vista la scheda toccata (utile quando la barra è più larga dello schermo)
                    e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  className={`shrink-0 whitespace-nowrap pt-4 pb-3 text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors ${
                    isActive ? "border-primary text-primary" : "border-transparent text-fg-muted hover:text-fg"
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {visibleGroups.map((group) => (
          <div key={group.key}>
            {group.items.map((service, index) => (
              <div
                key={service.id}
                onClick={() => onServiceClick(service)}
                className={`p-5 flex justify-between items-center hover:bg-tint transition-colors cursor-pointer group ${
                  index !== group.items.length - 1 ? 'border-b border-line' : ''
                }`}
              >
                <div className="flex flex-col flex-1 pr-4 gap-1.5">
                  <h3 className="text-base font-bold text-fg">{service.name}</h3>
                 
                  {/* Se in futuro aggiungi 'description' al Service nel DB, apparirà qui magicamente */}
                  {service.description && (
                    <p className="text-sm font-medium leading-snug text-fg-muted">
                      {service.description}
                    </p>
                  )}
                 
                  <div className="flex items-center gap-1.5 text-sm font-bold text-fg-faint">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{service.duration_minutes} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-fg">
                    {Number(service.price)} DA
                  </span>
                 
                  {/* Bottone elegante "Prenota" al posto della semplice freccetta */}
                  <button className="px-4 py-1.5 text-xs font-bold text-primary transition-colors border-2 rounded-lg border-line-strong group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}