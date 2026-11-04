import React, { useMemo, useState } from "react";
import AgendaToolbar from "./agenda/AgendaToolbar.jsx";
import AgendaGrid from "./agenda/AgendaGrid.jsx";
import AgendaMonth from "./agenda/AgendaMonth.jsx";
import AgendaList from "./agenda/AgendaList.jsx";
import AgendaBookingModal from "./agenda/AgendaBookingModal.jsx";
import { FALLBACK_COLOR, buildMemberColors, listRows, rangeFor, salonToday, toAgendaItem, visibleBarbers } from "./agenda/agendaUtils";

// ===== TAB "Rendez-vous": L'AGENDA =====
// Viste: Jour (colonne per membro del team), Semaine, Mois, Liste. Filtri per membro del team e servizio, combinabili.
// Questo file mette insieme i pezzi (cartella agenda/); lo stato (vista, data, filtri) vive in hooks/useAppuntamentiAdmin.js
// quindi cambiando tab non si perde nulla. Tutti i dati arrivano dalle API già esistenti: nessun dato di prova.

// Legenda dei colori del team (nelle viste Semaine e Mois, dove le colonne non sono i membri)
function Legend({ members, colors }) {
  return (
    <div className="flex flex-wrap items-center mt-4 gap-x-5 gap-y-2">
      {members.map((b) => (
        <span key={b.id} className="inline-flex items-center gap-2 text-xs font-bold text-fg-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: (colors[b.id] || FALLBACK_COLOR).border }} />
          {b.name}
        </span>
      ))}
    </div>
  );
}

export default function ShopAppuntamenti_ad({
  view,
  setView,
  selectedDate,
  setSelectedDate,
  filterBarber,
  setFilterBarber,
  filterService,
  setFilterService,
  search,
  setSearch,
  listScope,
  setListScope,
  resetFilters,
  filteredBookings,
  isDeleting,
  handleDelete,
  barbers = [],
  services = [],
  businessType = "barber",
  onRefresh,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const today = salonToday();
  const hasFilters = Boolean(filterBarber || filterService);
  const colors = useMemo(() => buildMemberColors(barbers, businessType), [barbers, businessType]);

  // Prenotazioni (già filtrate per membro e servizio) -> elementi dell'agenda con nomi e orari nel fuso del salone.
  // Il servizio si cerca come prima: nella prenotazione, altrimenti nell'elenco servizi del negozio.
  const items = useMemo(() => {
    const serviceById = new Map(services.map((s) => [s.id, s]));
    const barberById = new Map(barbers.map((b) => [b.id, b]));
    return filteredBookings
      .map((b) =>
        toAgendaItem(b, {
          serviceName: b.service?.name || serviceById.get(b.service_id)?.name || "-",
          barberName: b.barber?.name || barberById.get(b.barber_id)?.name || null,
        })
      )
      .filter(Boolean);
  }, [filteredBookings, services, barbers]);

  // Appuntamenti del periodo mostrato (giorno / settimana / mese)
  const rangeItems = useMemo(() => {
    if (view === "list") return [];
    const { from, to } = rangeFor(view, selectedDate);
    return items.filter((it) => it.dateKey >= from && it.dateKey <= to);
  }, [items, view, selectedDate]);

  // Righe della vista Liste (periodo + ricerca + ordine)
  const rows = useMemo(() => (view === "list" ? listRows(items, listScope, search, today) : []), [items, view, listScope, search, today]);

  const count = view === "list" ? rows.length : rangeItems.length;
  const selectedItem = items.find((it) => it.id === selectedId) || null; // se la prenotazione viene eliminata sparisce e la finestra si chiude

  const openDay = (day) => {
    setSelectedDate(day);
    setView("day");
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const legendMembers = view === "week" || view === "month" ? visibleBarbers(barbers, filterBarber, rangeItems) : [];

  return (
    <div className="animate-fade-up">
      <AgendaToolbar
        view={view}
        setView={setView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        count={count}
        barbers={barbers}
        services={services}
        filterBarber={filterBarber}
        setFilterBarber={setFilterBarber}
        filterService={filterService}
        setFilterService={setFilterService}
        resetFilters={resetFilters}
        listScope={listScope}
        setListScope={setListScope}
        onRefresh={onRefresh ? handleRefresh : null}
        isRefreshing={isRefreshing}
      />

      {/* Nessun appuntamento nel periodo (la griglia resta sotto: si vedono comunque i turni liberi) */}
      {view !== "list" && rangeItems.length === 0 && (
        <div className="flex flex-col gap-2 px-4 py-3 mb-4 text-sm font-medium rounded-xl bg-tint-2 text-fg-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {hasFilters ? "Aucun rendez-vous ne correspond aux filtres sélectionnés." : "Aucun rendez-vous sur cette période."}
          </span>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="font-bold text-left text-primary hover:underline sm:text-right">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {(view === "day" || view === "week") && (
        <AgendaGrid
          mode={view}
          date={selectedDate}
          items={rangeItems}
          barbers={barbers}
          filterBarber={filterBarber}
          colors={colors}
          onSelect={(it) => setSelectedId(it.id)}
          onOpenDay={openDay}
        />
      )}

      {view === "month" && <AgendaMonth date={selectedDate} items={rangeItems} colors={colors} onOpenDay={openDay} />}

      {view === "list" && (
        <AgendaList
          items={rows}
          colors={colors}
          search={search}
          setSearch={setSearch}
          resetKey={`${listScope}|${search}|${filterBarber}|${filterService}`}
          hasFilters={hasFilters}
          onReset={resetFilters}
          isDeleting={isDeleting}
          handleDelete={handleDelete}
          onSelect={(it) => setSelectedId(it.id)}
        />
      )}

      {legendMembers.length > 1 && <Legend members={legendMembers} colors={colors} />}

      {selectedItem && (
        <AgendaBookingModal
          item={selectedItem}
          color={colors[selectedItem.barberId] || FALLBACK_COLOR}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}