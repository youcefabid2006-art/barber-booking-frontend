import React from "react";

// STEP 1: scelta del collaboratore (o "qualsiasi collaboratore")
// onSelect riceve "any" oppure l'id del barbiere scelto.
export default function StepBarbiere({ barbers, onSelect }) {
  return (
    <div className="p-6 animate-fade-up">
      <h3 className="mb-5 text-lg font-bold text-fg font-heading">Avec qui souhaitez-vous réserver ?</h3>
      <div className="flex flex-col gap-3">
        {/* Controllo aggiunto qui: visibile solo se barbers > 1 */}
        {barbers && barbers.length > 1 && (
          <button onClick={() => onSelect("any")} className="flex items-center justify-between p-5 text-left transition-all bg-white border-2 border-line rounded-2xl hover:border-primary hover:shadow-md active:scale-[0.98]">
            <span className="text-lg font-bold text-fg">N'importe quel collaborateur</span>
            <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full text-fg bg-tint-2">Première dispo.</span>
          </button>
        )}
        {barbers && barbers.map(barber => (
          <button key={barber.id} onClick={() => onSelect(barber.id)} className="flex items-center justify-between p-5 text-left transition-all bg-white border-2 border-line rounded-2xl hover:border-primary hover:shadow-md active:scale-[0.98]">
             <span className="text-lg font-bold text-fg">{barber.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
