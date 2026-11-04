import React, { useState, useEffect } from "react";
import { getAvailability } from "../../api";

// STEP 2: scroller dei giorni + griglia degli orari.
// Questo componente carica da solo gli orari (getAvailability) ogni volta che cambia giorno o collaboratore.
// Esiste solo mentre si è allo step 2: quando si lascia lo step sparisce e, tornandoci, ricarica gli orari.
//
// Props:
//  - availableDays: giorni da mostrare (li calcola ShopBooking con getNext14Days)
//  - selectedDate / onSelectDate: giorno scelto e funzione per cambiarlo
//  - onSelectTime: chiamata quando si tocca un orario prenotabile
//  - onUnavailableClick: chiamata quando si tocca un orario sbiadito (ShopBooking mostra il popup)
//  - onRetry: chiamata dal tasto "Réessayer" quando il caricamento è fallito
export default function StepOrario({
  shopId,
  service,
  selectedBarber,
  availableDays,
  selectedDate,
  onSelectDate,
  onSelectTime,
  onUnavailableClick,
  onRetry
}) {
  // Ogni elemento è { time: "09:00", available: true/false } (false = orario sbiadito)
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // EFFETTO: Carica gli orari quando arrivi allo Step 2 o cambi data
  useEffect(() => {
    let isMounted = true;
    setFetchError(false);

    async function fetchSlots() {
      setIsLoadingSlots(true);
      try {
        const slots = await getAvailability(shopId, service.id, selectedDate, selectedBarber);
        if (isMounted) {
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error("Errore nel caricamento orari:", error);
        if (isMounted) {
          setAvailableSlots([]);
          setFetchError(true);
        }
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    }
   
    fetchSlots();
    return () => { isMounted = false; };
  }, [selectedDate, selectedBarber, shopId, service.id]);

  return (
    <div className="flex flex-col h-full animate-fade-up">
     
      <div className="sticky top-0 z-10 pt-2 pb-1 bg-white border-b shadow-sm border-line">
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
          {availableDays.length === 0 ? (
            <div className="p-3 text-sm font-bold text-fg-muted">Aucun jour de travail défini.</div>
          ) : (
            availableDays.map((day) => {
              const isSelected = day.fullDate === selectedDate;
              return (
                <button
                  key={day.fullDate}
                  onClick={() => onSelectDate(day.fullDate)}
                  className={`flex-none w-[4.5rem] flex flex-col items-center justify-center p-3 rounded-2xl snap-center transition-all duration-200
                    ${isSelected
                      ? 'bg-gradient-to-br from-grad-start to-grad-end text-white shadow-lg shadow-glow scale-105'
                      : 'bg-tint text-fg-muted hover:bg-tint-2'
                    }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wide mb-1 ${isSelected ? 'text-white/80' : 'text-fg-faint'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-xl font-extrabold leading-none">
                    {day.dayNumber}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Griglia Orari */}
      <div className="p-6">
        <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-fg-muted">Horaires disponibles</h3>
       
        {isLoadingSlots ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-line-strong rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center border-2 border-dashed bg-red-50 rounded-3xl border-red-200">
            <span className="mb-2 text-3xl">⚠️</span>
            <span className="mb-1 font-bold text-red-600">Erreur de connexion</span>
            <span className="mb-4 text-sm font-medium text-red-400">Impossible de charger les horaires.</span>
            <button
              onClick={onRetry}
              className="px-6 py-2 font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 active:scale-95"
            >
              Réessayer
            </button>
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {availableSlots.map(slot => (
              slot.available ? (
                <button
                  key={slot.time}
                  onClick={() => onSelectTime(slot.time)}
                  className="py-4 text-lg font-bold transition-all bg-white border-2 text-fg-2 border-line rounded-2xl hover:border-primary hover:text-primary hover:shadow-md active:scale-[0.97]"
                >
                  {slot.time}
                </button>
              ) : (
                // Orario non prenotabile con questo servizio: più chiaro, e al click compare il popup
                <button
                  key={slot.time}
                  onClick={() => onUnavailableClick(slot.time)}
                  aria-disabled="true"
                  className="py-4 text-lg font-bold transition-all border-2 cursor-not-allowed bg-tint-2 text-fg-ghost border-line rounded-2xl active:scale-[0.97]"
                >
                  {slot.time}
                </button>
              )
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white border-2 border-dashed rounded-3xl border-line-strong">
            <span className="mb-3 text-4xl">😴</span>
            <span className="px-6 font-medium text-center text-fg-muted">Aucun horaire disponible pour cette date. Essayez un autre jour !</span>
          </div>
        )}
      </div>
    </div>
  );
}
