import React from "react";

const WEEKDAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const getInitials = (name) => name.substring(0, 2).toUpperCase();

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
              ${selectedBarber.id === b.id ? 'bg-neutral-900 ring-4 ring-neutral-200' : 'bg-neutral-800'}`}>
              {getInitials(b.name)}
            </div>
            <span className={`text-base font-bold ${selectedBarber.id === b.id ? 'text-neutral-900' : 'text-neutral-500'}`}>{b.name}</span>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border shadow-sm rounded-2xl border-neutral-200">
        <h3 className="mb-6 text-lg font-extrabold text-neutral-900">Calendario di {selectedBarber.name}</h3>
       
        <div className="flex flex-col">
          {WEEKDAYS.map((dayName, dayIndex) => {
            const dayShifts = draftShifts.filter(s => s.weekday === dayIndex);
           
            return (
              <div key={dayIndex} className="flex flex-col py-5 border-b border-neutral-100 last:border-0 md:flex-row md:items-center gap-4">
                <div className="w-32 font-bold text-neutral-800">{dayName}</div>
               
                <div className="flex flex-wrap flex-1 gap-2">
                  {dayShifts.length === 0 ? (
                    <span className="px-3 py-1.5 text-sm font-bold text-neutral-400 bg-neutral-50 rounded-lg">Riposo</span>
                  ) : (
                    dayShifts.map((shift) => {
                      const realIndex = draftShifts.findIndex(s => s === shift);
                      return (
                        <div key={realIndex} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 rounded-lg shadow-sm">
                          <span>{shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}</span>
                          <button onClick={() => handleRemoveShift(realIndex)} className="flex items-center justify-center w-5 h-5 ml-1 transition-colors rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-red-500">
                            &times;
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newShiftInputs[dayIndex].start}
                    onChange={(e) => setNewShiftInputs({...newShiftInputs, [dayIndex]: {...newShiftInputs[dayIndex], start: e.target.value}})}
                    className="px-2 py-1.5 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                  <span className="font-bold text-neutral-400">-</span>
                  <input
                    type="time"
                    value={newShiftInputs[dayIndex].end}
                    onChange={(e) => setNewShiftInputs({...newShiftInputs, [dayIndex]: {...newShiftInputs[dayIndex], end: e.target.value}})}
                    className="px-2 py-1.5 text-sm font-bold text-neutral-700 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                  <button
                    onClick={() => handleAddShift(dayIndex)}
                    className="px-3 py-1.5 text-sm font-bold text-white transition-all bg-neutral-800 rounded-lg hover:bg-neutral-900 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
       
        <div className="pt-8 mt-4 border-t border-neutral-100">
          <button
            onClick={handleSaveShifts}
            disabled={isSavingShifts}
            className={`w-full py-4 text-lg font-extrabold text-white transition-all shadow-xl rounded-xl
              ${isSavingShifts
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-[0.98]'}`}
          >
            {isSavingShifts ? 'Salvataggio in corso...' : 'Salva Orari Team'}
          </button>
        </div>
      </div>
    </div>
  );
}