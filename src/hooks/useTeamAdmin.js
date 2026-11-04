import { useState } from "react";
import { updateBarberShifts } from "../api";
import { WEEKDAYS } from "../constants";

// ===== LOGICA DELLA TAB "Horaires de l'équipe" (turni) DEL GESTIONALE =====
// Tiene il collaboratore selezionato, i turni in modifica (bozza) e i campi per aggiungerne di nuovi.
// Lo stato vive in AdminDash (qui dentro c'è solo il codice): cambiando tab le modifiche non salvate restano.
// "reload" è loadDashboardData di AdminDash: ricarica tutti i dati dopo il salvataggio.
export default function useTeamAdmin({ notify, reload }) {
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [draftShifts, setDraftShifts] = useState([]);
  const [isSavingShifts, setIsSavingShifts] = useState(false);
  const [newShiftInputs, setNewShiftInputs] = useState(
    WEEKDAYS.reduce((acc, _, i) => ({ ...acc, [i]: { start: "", end: "" } }), {})
  );

  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setDraftShifts(barber.shifts || []);
    setNewShiftInputs(WEEKDAYS.reduce((acc, _, i) => ({ ...acc, [i]: { start: "", end: "" } }), {}));
  };

  const handleAddShift = (weekday) => {
    const { start, end } = newShiftInputs[weekday];
    if (!start || !end) return notify("error", "Veuillez saisir l'heure de début et de fin.", "Horaire manquant");
    if (start >= end) return notify("error", "L'heure de fin doit être postérieure à l'heure de début.", "Horaire invalide");
    const newShift = {
      barber_id: selectedBarber.id,
      weekday: weekday,
      start_time: start.length === 5 ? `${start}:00` : start,
      end_time: end.length === 5 ? `${end}:00` : end,
    };
    setDraftShifts([...draftShifts, newShift]);
    setNewShiftInputs({ ...newShiftInputs, [weekday]: { start: "", end: "" } });
  };

  const handleRemoveShift = (indexToRemove) => {
    setDraftShifts(draftShifts.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveShifts = async () => {
    setIsSavingShifts(true);
    try {
      await updateBarberShifts(selectedBarber.id, draftShifts);
      setIsSavingShifts(false);
      await notify("success", "Horaires mis à jour avec succès !");
      await reload();
    } catch (err) {
      setIsSavingShifts(false);
      await notify("error", "Erreur lors de l'enregistrement des horaires.");
    } finally {
      setIsSavingShifts(false);
    }
  };

  return {
    selectedBarber,
    setSelectedBarber,
    draftShifts,
    setDraftShifts,
    isSavingShifts,
    newShiftInputs,
    setNewShiftInputs,
    handleSelectBarber,
    handleAddShift,
    handleRemoveShift,
    handleSaveShifts
  };
}
