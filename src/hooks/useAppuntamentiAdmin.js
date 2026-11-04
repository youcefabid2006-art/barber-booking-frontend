import { useMemo, useState } from "react";
import { deleteAdminBooking } from "../api";
import { matchesFilters, salonToday } from "../components_admin/agenda/agendaUtils";

// ===== LOGICA DELLA TAB "Rendez-vous" (agenda) DEL GESTIONALE =====
// Tiene l'elenco delle prenotazioni, la vista scelta (Jour / Semaine / Mois / Liste), la data mostrata,
// i filtri (membro del team + servizio), la ricerca della vista Liste e l'annullamento di una prenotazione.
// Lo stato vive in AdminDash (qui dentro c'è solo il codice): cambiando tab non si perde nulla.
// L'elenco delle prenotazioni lo riempie loadDashboardData di AdminDash tramite setBookings.
// Il backend restituisce TUTTE le prenotazioni del negozio (passate e future): è l'agenda che sceglie cosa mostrare.
export default function useAppuntamentiAdmin({ notify, askConfirm }) {
  const [bookings, setBookings] = useState([]);
  const [isDeleting, setIsDeleting] = useState(null);

  // Vista e data: si parte dalla giornata di oggi (nel fuso del salone)
  const [view, setView] = useState("day"); // "day" | "week" | "month" | "list"
  const [selectedDate, setSelectedDate] = useState(salonToday); // "YYYY-MM-DD"

  // Filtri: stringhe con l'id scelto, "" = nessun filtro. Si applicano insieme (AND).
  const [filterBarber, setFilterBarber] = useState("");
  const [filterService, setFilterService] = useState("");

  // Solo vista Liste: testo cercato e periodo ("upcoming" = oggi e giorni successivi, "past" = passati, "all" = tutto)
  const [search, setSearch] = useState("");
  const [listScope, setListScope] = useState("upcoming");

  const resetFilters = () => {
    setFilterBarber("");
    setFilterService("");
    setSearch("");
  };

  const handleDelete = async (appointmentId) => {
    const conferma = await askConfirm("Annuler la réservation", "Êtes-vous sûr de vouloir annuler cette réservation ?", "Oui, annuler", true, "Retour");
    if (!conferma) return;
    setIsDeleting(appointmentId);
    try {
      await deleteAdminBooking(appointmentId);
      setBookings(prev => prev.filter(b => b.id !== appointmentId));
    } catch (err) {
      await notify("error", "Erreur lors de l'annulation.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Prenotazioni dopo i filtri membro + servizio. Il giorno / periodo lo sceglie poi ogni vista dell'agenda.
  const filteredBookings = useMemo(
    () => bookings.filter(b => matchesFilters(b, filterBarber, filterService)),
    [bookings, filterBarber, filterService]
  );

  return {
    bookings,
    setBookings,
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
    isDeleting,
    filteredBookings,
    handleDelete
  };
}