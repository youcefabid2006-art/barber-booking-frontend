import React, { useRef } from "react";
import AgendaIcon from "./AgendaIcon.jsx";
import { periodLabel, salonToday, shiftDate } from "./agendaUtils";

// ===== BARRA SUPERIORE DELL'AGENDA =====
// Riga 1: titolo con il numero di appuntamenti + scelta della vista (Jour / Semaine / Mois / Liste) + aggiornamento.
// Riga 2: navigazione tra le date (o, in Liste, il periodo) + filtri per membro del team e per servizio.
// Qui non c'è logica di dati: tutto arriva da useAppuntamentiAdmin tramite ShopAppuntamenti_ad.

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

const COUNT_SUFFIX = { day: "sur la journée", week: "sur la semaine", month: "sur le mois", list: "" };

const iconButton =
  "flex items-center justify-center w-9 h-9 transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 active:scale-95";

// Un filtro attivo si vede subito: bordo e sfondo del colore del tema
const selectClass = (active) =>
  `w-full px-3 py-2 text-sm font-bold border rounded-xl transition-colors focus:outline-none focus:border-primary ${
    active ? "border-primary bg-tint-2 text-fg" : "border-line-strong bg-white text-fg-2"
  }`;

export default function AgendaToolbar({
  view,
  setView,
  selectedDate,
  setSelectedDate,
  count,
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
}) {
  const dateInputRef = useRef(null);
  const today = salonToday();
  const activeFilters = (filterBarber ? 1 : 0) + (filterService ? 1 : 0);

  // Il selettore di date nativo resta nascosto: si apre dal pulsante con il calendario (come "Sélectionner un jour" di prima)
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

  const countText =
    view === "day" && selectedDate === today ? "aujourd'hui" : COUNT_SUFFIX[view];

  return (
    <div className="mb-5 space-y-4">
      {/* Riga 1: titolo e scelta della vista */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-fg font-heading">Agenda</h2>
          <p className="mt-0.5 text-sm font-medium text-fg-muted">
            {count} rendez-vous {countText}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 p-1 md:flex-none bg-tint-2 rounded-xl" role="tablist" aria-label="Affichage">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                  view === v.id ? "bg-white text-primary shadow-sm" : "text-fg-muted hover:text-fg"
                }`}
              >
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
      </div>

      {/* Riga 2: navigazione + filtri */}
      <div className="flex flex-col gap-3 p-3 bg-white border shadow-sm rounded-2xl border-line-strong lg:flex-row lg:items-center lg:justify-between">
        {view === "list" ? (
          <div className="flex p-1 bg-tint-2 rounded-xl w-fit" role="tablist" aria-label="Période">
            {SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={listScope === s.id}
                onClick={() => setListScope(s.id)}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                  listScope === s.id ? "bg-white text-primary shadow-sm" : "text-fg-muted hover:text-fg"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="order-first w-full text-lg font-extrabold text-fg font-heading sm:order-none sm:w-auto sm:min-w-[15rem] sm:mr-1">
              {periodLabel(view, selectedDate)}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="px-3.5 py-2 text-sm font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 active:scale-95"
            >
              Aujourd'hui
            </button>
            <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, view, -1))} aria-label="Précédent" className={iconButton}>
              <AgendaIcon name="prev" />
            </button>
            <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, view, 1))} aria-label="Suivant" className={iconButton}>
              <AgendaIcon name="next" />
            </button>
            <div className="relative">
              <button type="button" onClick={openDatePicker} aria-label="Choisir une date" title="Choisir une date" className={iconButton}>
                <AgendaIcon name="calendar" />
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
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
          <select
            value={filterBarber}
            onChange={(e) => setFilterBarber(e.target.value)}
            aria-label="Membre de l'équipe"
            className={`${selectClass(filterBarber)} sm:w-52`}
          >
            <option value="">Tout le personnel</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.is_active ? "" : " (inactif)"}
              </option>
            ))}
          </select>
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            aria-label="Prestation"
            className={`${selectClass(filterService)} sm:w-56`}
          >
            <option value="">Toutes les prestations</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 text-sm font-bold transition-colors rounded-xl text-fg-2 hover:bg-tint-2 whitespace-nowrap"
            >
              Réinitialiser ({activeFilters})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}