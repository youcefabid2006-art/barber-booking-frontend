import React, { useRef } from "react";
import AgendaIcon from "./AgendaIcon.jsx";
import { AgendaDayStrip } from "./AgendaMobile.jsx";
import { FALLBACK_COLOR, formatDayPhone, periodLabel, salonToday, shiftDate } from "./agendaUtils";

// ===== BARRA DELL'AGENDA SU TELEFONO =====
// Versione compatta di AgendaToolbar (che resta quella del desktop): sul telefono ogni riga in più allontana
// dallo schermo gli appuntamenti, e chi lavora vuole vedere subito chi arriva dopo. Quindi:
//   riga 1: scelta della vista + aggiorna
//   scheda:  Aujourd'hui, frecce, data (un tocco apre il calendario) e, in Jour, la striscia dei giorni
//   filtri:  collaboratori come chip ("Tous" = tutti) + filtro servizio + interruttore Cartes / Grille
//   riga finale: quanti appuntamenti, e Réinitialiser se ci sono filtri attivi
// Usata solo sotto i 768px (vedi useIsPhone); la logica dei dati è sempre quella di useAppuntamentiAdmin.

const VIEWS = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "list", label: "Liste" },
];

const SCOPES = [
  { id: "upcoming", label: "À venir" },
  { id: "past", label: "Passés" },
  { id: "all", label: "Tout" },
];

const LAYOUTS = [
  { id: "cards", label: "Cartes" },
  { id: "grid", label: "Grille" },
];

const COUNT_SUFFIX = { day: "sur la journée", week: "sur la semaine", month: "sur le mois", list: "" };

const iconButton =
  "flex items-center justify-center w-9 h-9 transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 active:scale-95 shrink-0";

const segmented = (active) =>
  `flex-1 px-3 py-1.5 text-sm font-bold rounded-lg transition-all ${active ? "bg-white text-primary shadow-sm" : "text-fg-muted hover:text-fg"}`;

export default function AgendaMobileBar({
  view,
  setView,
  selectedDate,
  setSelectedDate,
  count,
  items,
  barbers,
  services,
  filterBarber,
  setFilterBarber,
  filterService,
  setFilterService,
  resetFilters,
  listScope,
  setListScope,
  onRefresh,
  isRefreshing,
  colors = {},
  phoneLayout,
  setPhoneLayout,
}) {
  const dateInputRef = useRef(null);
  const today = salonToday();
  const isPlanning = view === "day" || view === "week";
  const showStrip = view === "day" && phoneLayout === "cards";
  const activeFilters = (filterBarber ? 1 : 0) + (filterService ? 1 : 0);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    try {
      input.showPicker();
    } catch (err) {
      input.focus();
      input.click();
    }
  };

  // Giorno: "Lun. 2 nov." (con l'anno solo se non è quello in corso); settimana e mese come su desktop
  const label =
    view === "day"
      ? formatDayPhone(selectedDate) + (selectedDate.slice(0, 4) === today.slice(0, 4) ? "" : " " + selectedDate.slice(0, 4))
      : periodLabel(view, selectedDate);
  const countText = view === "day" && selectedDate === today ? "aujourd'hui" : COUNT_SUFFIX[view];
  // In Jour a schede il numero di appuntamenti è già nella striscia dei giorni: la riga di riepilogo serve solo
  // quando ci sono filtri attivi (per vedere l'effetto e poterli azzerare) o nelle viste senza striscia
  const showCaption = !showStrip || activeFilters > 0;
  const members = barbers.filter((b) => b.is_active || String(b.id) === String(filterBarber));

  return (
    <div className="mb-4 space-y-3">
      {/* Vista + aggiorna */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 p-1 bg-tint-2 rounded-xl" role="tablist" aria-label="Affichage">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)} className={segmented(view === v.id)}>
              {v.label}
            </button>
          ))}
        </div>
        {onRefresh && (
          <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Actualiser" title="Actualiser" className={iconButton}>
            <AgendaIcon name="refresh" className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {/* Navigazione (e striscia dei giorni) oppure, in Liste, il periodo */}
      {view === "list" ? (
        <div className="flex p-1 bg-tint-2 rounded-xl" role="tablist" aria-label="Période">
          {SCOPES.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={listScope === s.id} onClick={() => setListScope(s.id)} className={segmented(listScope === s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-2 space-y-2 bg-white border shadow-sm rounded-2xl border-line-strong">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="px-2.5 py-2 text-xs font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 active:scale-95 shrink-0"
            >
              Aujourd'hui
            </button>
            <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, view, -1))} aria-label="Précédent" className={iconButton}>
              <AgendaIcon name="prev" />
            </button>
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={openDatePicker}
                aria-label="Choisir une date"
                className="flex items-center justify-center w-full gap-1.5 px-1 py-2 text-sm font-bold text-fg"
              >
                <AgendaIcon name="calendar" className="w-4 h-4 text-fg-faint shrink-0" />
                <span className="truncate">{label}</span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                className="absolute left-0 w-full h-0 opacity-0 pointer-events-none top-full"
              />
            </div>
            <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, view, 1))} aria-label="Suivant" className={iconButton}>
              <AgendaIcon name="next" />
            </button>
          </div>
          {showStrip && <AgendaDayStrip date={selectedDate} items={items} setSelectedDate={setSelectedDate} />}
        </div>
      )}

      {/* Collaboratori: un tocco per vedere solo la sua agenda */}
      {barbers.length > 1 && (
        <div className="flex gap-2 pb-1 -mb-1 overflow-x-auto" role="group" aria-label="Filtrer par membre">
          {[{ id: "", name: "Tous" }, ...members].map((m) => {
            const active = String(filterBarber) === String(m.id);
            return (
              <button
                key={m.id === "" ? "all" : m.id}
                type="button"
                onClick={() => setFilterBarber(String(m.id))}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors border rounded-full shrink-0 ${
                  active ? "bg-primary border-primary text-white" : "bg-white border-line-strong text-fg-2"
                }`}
              >
                {m.id !== "" && (
                  <span className="w-2.5 h-2.5 rounded-full ring-1 ring-white" style={{ background: (colors[m.id] || FALLBACK_COLOR).border }} />
                )}
                {m.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Servizio + (Jour e Semaine) interruttore Cartes / Grille */}
      <div className="flex items-center gap-2">
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          aria-label="Prestation"
          className={`flex-1 min-w-0 px-3 py-2 text-sm font-bold border rounded-xl transition-colors focus:outline-none focus:border-primary ${
            filterService ? "border-primary bg-tint-2 text-fg" : "border-line-strong bg-white text-fg-2"
          }`}
        >
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {isPlanning && (
          <div className="flex p-1 bg-tint-2 rounded-xl shrink-0" role="tablist" aria-label="Mode d'affichage">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={phoneLayout === l.id}
                onClick={() => setPhoneLayout(l.id)}
                className={`px-3 py-1 text-sm font-bold rounded-lg transition-all ${
                  phoneLayout === l.id ? "bg-white text-primary shadow-sm" : "text-fg-muted hover:text-fg"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quanti appuntamenti + reset filtri */}
      {showCaption && (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-sm font-medium text-fg-muted">
            {count} rendez-vous {countText}
          </p>
          {activeFilters > 0 && (
            <button type="button" onClick={resetFilters} className="text-sm font-bold text-primary whitespace-nowrap">
              Réinitialiser ({activeFilters})
            </button>
          )}
        </div>
      )}
    </div>
  );
}