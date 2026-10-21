import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const getInitials = (name) => name.substring(0, 2).toUpperCase();

// ===== SELETTORE ORARIO (sostituisce <input type="time">) =====
// Restituisce sempre una stringa "HH:MM", esattamente come faceva l'input nativo.
// Per cambiare la precisione dei minuti modifica MINUTE_STEP (es. 15 per 00/15/30/45).
const MINUTE_STEP = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => String(i * MINUTE_STEP).padStart(2, "0"));

function TimeField({ value, onChange, title }) {
  const [open, setOpen] = useState(false);
  const [hh, setHh] = useState("09");
  const [mm, setMm] = useState("00");
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);

  const openPicker = () => {
    const [h, m] = value ? value.split(":") : ["09", "00"];
    setHh(h);
    setMm(m);
    setOpen(true);
  };

  const confirm = () => {
    onChange(`${hh}:${mm}`);
    setOpen(false);
  };

  // All'apertura porta l'ora e i minuti selezionati al centro delle liste
  useEffect(() => {
    if (!open) return;
    [hoursRef, minutesRef].forEach((ref) => {
      const box = ref.current;
      const active = box && box.querySelector('[data-active="true"]');
      if (box && active) {
        box.scrollTop = active.offsetTop - box.clientHeight / 2 + active.clientHeight / 2;
      }
    });
  }, [open]);

  // Chiusura con il tasto Esc (utile da computer)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sheet = (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

      <div className="relative w-full max-w-sm p-5 pb-6 bg-white shadow-2xl rounded-t-3xl md:rounded-3xl">
        <p className="text-sm font-bold text-center text-fg-muted">{title}</p>
        <p className="mt-1 text-5xl font-extrabold tracking-tight text-center tabular-nums text-fg">
          {hh}:{mm}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div>
            <div className="mb-2 text-xs font-bold tracking-wide text-center uppercase text-fg-faint">Heures</div>
            <div ref={hoursRef} className="relative h-64 p-1.5 space-y-1 overflow-y-auto overscroll-contain rounded-2xl bg-tint">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  data-active={hh === h}
                  onClick={() => setHh(h)}
                  className={`block w-full py-2.5 text-lg font-bold tabular-nums rounded-xl transition-colors ${hh === h ? "bg-primary text-white" : "text-fg-2 hover:bg-line-strong"}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

<div>
            <div className="mb-2 text-xs font-bold tracking-wide text-center uppercase text-fg-faint">Minutes</div>
            <div ref={minutesRef} className="relative h-64 p-1.5 space-y-1 overflow-y-auto overscroll-contain rounded-2xl bg-tint">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-active={mm === m}
                  onClick={() => setMm(m)}
                  className={`block w-full py-2.5 text-lg font-bold tabular-nums rounded-xl transition-colors ${mm === m ? "bg-primary text-white" : "text-fg-2 hover:bg-line-strong"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-3 text-base font-bold transition-colors rounded-xl text-fg-2 bg-tint-2 hover:bg-line-strong"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 py-3 text-base font-bold text-white transition-all rounded-xl bg-primary hover:bg-primary-hover active:scale-95"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        aria-label={title}
        className="flex items-center gap-2 px-2 py-1.5 text-sm font-bold text-fg-2 bg-white border border-fg-ghost rounded-lg focus:outline-none focus:border-primary"
      >
        <span className={`tabular-nums ${value ? "" : "text-fg-faint"}`}>{value || "--:--"}</span>
        <svg className="w-4 h-4 text-fg-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      {/* Portal su body: il contenitore ha un'animazione con transform che altrimenti spezzerebbe il position: fixed */}
      {open && createPortal(sheet, document.body)}
    </>
  );
}

export default function ShopTeam_ad({
  barbers,
  selectedBarber,
  handleSelectBarber,
  draftShifts,
  handleRemoveShift,
  newShiftInputs,
  setNewShiftInputs,
  handleAddShift,
  handleSaveShifts,
  isSavingShifts
}) {
  if (!selectedBarber) return null;

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap gap-6 py-2 mb-8">
        {barbers.map((b) => (
          <div
            key={b.id}
            onClick={() => handleSelectBarber(b)}
            className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${selectedBarber.id === b.id ? '' : 'opacity-45 hover:opacity-80'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md transition-all
              ${selectedBarber.id === b.id ? 'bg-primary ring-4 ring-glow' : 'bg-grad-end'}`}>
              {getInitials(b.name)}
            </div>
            <span className={`text-base font-bold ${selectedBarber.id === b.id ? 'text-fg' : 'text-fg-muted'}`}>{b.name}</span>
          </div>
        ))}
      </div>

<div className="p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
        <h3 className="mb-6 text-lg font-extrabold text-fg font-heading">Calendrier de {selectedBarber.name}</h3>
       
        <div className="flex flex-col">
          {WEEKDAYS.map((dayName, dayIndex) => {
            const dayShifts = draftShifts.filter(s => s.weekday === dayIndex);
           
            return (
              <div key={dayIndex} className="flex flex-col py-5 border-b border-line last:border-0 md:flex-row md:items-center gap-4">
                <div className="w-32 font-bold text-fg">{dayName}</div>
               
                <div className="flex flex-wrap flex-1 gap-2">
                  {dayShifts.length === 0 ? (
                    <span className="px-3 py-1.5 text-sm font-bold text-fg-faint bg-tint rounded-lg">Repos</span>
                  ) : (
                    dayShifts.map((shift) => {
                      const realIndex = draftShifts.findIndex(s => s === shift);
                      return (
                        <div key={realIndex} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-fg bg-tint-2 border border-line-strong rounded-lg shadow-sm">
                          <span>{shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}</span>
                          <button onClick={() => handleRemoveShift(realIndex)} className="flex items-center justify-center w-5 h-5 ml-1 transition-colors rounded-full text-fg-faint hover:bg-line-strong hover:text-red-500">
                            &times;
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>

<div className="flex items-center gap-2">
                  <TimeField
                    title="Heure de début"
                    value={newShiftInputs[dayIndex].start}
                    onChange={(v) => setNewShiftInputs({...newShiftInputs, [dayIndex]: {...newShiftInputs[dayIndex], start: v}})}
                  />
                  <span className="font-bold text-fg-faint">-</span>
                  <TimeField
                    title="Heure de fin"
                    value={newShiftInputs[dayIndex].end}
                    onChange={(v) => setNewShiftInputs({...newShiftInputs, [dayIndex]: {...newShiftInputs[dayIndex], end: v}})}
                  />
                  <button
                    onClick={() => handleAddShift(dayIndex)}
                    className="px-3 py-1.5 text-sm font-bold text-white transition-all bg-grad-end rounded-lg hover:bg-primary-hover active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
       
        <div className="pt-8 mt-4 border-t border-line">
          <button
            onClick={handleSaveShifts}
            disabled={isSavingShifts}
            className={`w-full py-4 text-lg font-extrabold text-white transition-all shadow-xl rounded-xl
              ${isSavingShifts
                ? 'bg-primary-soft cursor-not-allowed'
                : 'bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-[0.98]'}`}
          >
            {isSavingShifts ? 'Enregistrement en cours...' : "Enregistrer les horaires de l'équipe"}
          </button>
        </div>
      </div>
    </div>
  );
}