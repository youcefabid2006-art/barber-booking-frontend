import React, { useEffect, useState } from "react";
import AgendaIcon from "./AgendaIcon.jsx";
import { FALLBACK_COLOR, formatDayShort, formatTime } from "./agendaUtils";

// ===== VISTA LISTE =====
// La tabella di prima, migliorata: ricerca per cliente o telefono, durata, righe cliccabili (aprono i dettagli)
// e "Voir plus" per non disegnare centinaia di righe in una volta.
// "items" arriva già filtrato (periodo, membro, servizio, ricerca) e ordinato da ShopAppuntamenti_ad.

const PAGE_SIZE = 25;

// Stesso pulsante e stessi testi di prima ("Annuler" / "Annulation..."); stopPropagation: non deve aprire anche i dettagli
function CancelButton({ id, isDeleting, onDelete }) {
  const busy = isDeleting === id;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(id);
      }}
      disabled={busy}
      className={`px-4 py-1.5 text-xs font-bold transition-all border-2 rounded-lg
        ${busy
          ? "border-line-strong text-fg-faint bg-tint-2 cursor-not-allowed"
          : "border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 active:scale-95"}`}
    >
      {busy ? "Annulation..." : "Annuler"}
    </button>
  );
}

export default function AgendaList({
  items,
  colors,
  search,
  setSearch,
  resetKey,
  hasFilters,
  onReset,
  isDeleting,
  handleDelete,
  onSelect,
}) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const now = Date.now();

  // Cambiando ricerca, periodo o filtri si riparte dalla prima pagina (annullando un appuntamento no)
  useEffect(() => setLimit(PAGE_SIZE), [resetKey]);

  const shown = items.slice(0, limit);
  const remaining = items.length - shown.length;

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-line-strong">
      {/* Ricerca */}
      <div className="p-3 border-b border-line">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 flex items-center pointer-events-none left-3 text-fg-faint">
            <AgendaIcon name="search" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou un téléphone"
            aria-label="Rechercher un client ou un téléphone"
            className="w-full py-2 pr-9 text-sm font-medium bg-white border pl-9 border-line-strong rounded-xl text-fg placeholder-fg-faint focus:outline-none focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Effacer la recherche"
              className="absolute inset-y-0 flex items-center right-3 text-fg-faint hover:text-fg"
            >
              <AgendaIcon name="close" />
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center">
          <span className="block mb-2 text-3xl">📅</span>
          <span className="block font-medium text-fg-muted">
            {search || hasFilters ? "Aucun rendez-vous ne correspond à votre recherche." : "Aucun rendez-vous dans cette liste."}
          </span>
          {(search || hasFilters) && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 mt-4 text-sm font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2"
            >
              Réinitialiser
            </button>
          )}
        </div>
      ) : (
        <>
          {/* VISTA TELEFONO: schede, senza scorrimento orizzontale */}
          <div className="p-3 space-y-3 bg-tint/70 md:hidden">
            {shown.map((it) => {
              const color = colors[it.barberId] || FALLBACK_COLOR;
              return (
                <div
                  key={it.id}
                  onClick={() => onSelect(it)}
                  className={`relative flex flex-col gap-3 p-4 overflow-hidden transition-colors bg-white border shadow-sm cursor-pointer border-line-strong rounded-xl ${it.endMs < now ? "opacity-70" : ""}`}
                >
                  <div className="absolute top-0 bottom-0 left-0 w-1" style={{ background: color.border }} />

                  <div className="flex items-center justify-between pb-2.5 ml-1 border-b border-line">
                    <div className="font-medium capitalize text-fg">
                      {formatDayShort(it.dateKey)}{" "}
                      <span className="ml-1.5 font-extrabold text-fg">{formatTime(it.startMin)}</span>
                    </div>
                    <CancelButton id={it.id} isDeleting={isDeleting} onDelete={handleDelete} />
                  </div>

                  <div className="flex items-start justify-between ml-1 text-sm">
                    <div>
                      <p className="font-bold capitalize text-fg">{it.clientName}</p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-fg-muted">{it.phone}</p>
                      <p className="mt-2 text-xs font-bold text-fg-2">
                        <span className="mr-1.5 text-[10px] font-bold tracking-wider uppercase text-fg-faint">Service :</span>
                        {it.serviceName}
                        <span className="ml-1.5 font-medium text-fg-muted">({it.durMin} min)</span>
                      </p>
                    </div>
                    <div className="font-bold text-right text-fg">
                      <span className="block text-[10px] font-bold tracking-wider uppercase text-fg-faint">Équipe</span>
                      {it.barberName ? (
                        <span>{it.barberName}</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs tracking-wider uppercase rounded-md bg-tint-2 text-fg-2">Indifférent</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISTA PC / DESKTOP: tabella */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-tint border-line-strong">
                  {["Date et heure", "Client", "Téléphone", "Service", "Équipe", "Durée"].map((h) => (
                    <th key={h} className="p-4 text-xs font-bold tracking-wider uppercase text-fg whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                  <th className="p-4 text-xs font-bold tracking-wider text-right uppercase text-fg whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((it) => {
                  const color = colors[it.barberId] || FALLBACK_COLOR;
                  return (
                    <tr
                      key={it.id}
                      onClick={() => onSelect(it)}
                      onKeyDown={(e) => e.key === "Enter" && onSelect(it)}
                      tabIndex={0}
                      className={`transition-colors border-b cursor-pointer border-line hover:bg-tint ${it.endMs < now ? "opacity-70" : ""}`}
                    >
                      <td className="p-4 font-medium text-fg whitespace-nowrap">
                        <span className="capitalize">{formatDayShort(it.dateKey)}</span>
                        <span className="ml-2 font-bold text-fg-2 tabular-nums">{formatTime(it.startMin)}</span>
                      </td>
                      <td className="p-4 font-bold capitalize text-fg whitespace-nowrap">{it.clientName}</td>
                      <td className="p-4 font-mono font-medium text-fg-muted whitespace-nowrap">{it.phone}</td>
                      <td className="p-4 font-bold text-fg whitespace-nowrap">{it.serviceName}</td>
                      <td className="p-4 font-bold text-fg whitespace-nowrap">
                        {it.barberName ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color.border }} />
                            {it.barberName}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs tracking-wider uppercase rounded-md bg-tint-2 text-fg-2">Indifférent</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-fg-muted whitespace-nowrap tabular-nums">{it.durMin} min</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <CancelButton id={it.id} isDeleting={isDeleting} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {remaining > 0 && (
            <div className="p-4 text-center border-t border-line">
              <button
                type="button"
                onClick={() => setLimit((n) => n + PAGE_SIZE)}
                className="px-5 py-2 text-sm font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2"
              >
                Voir plus ({remaining})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}