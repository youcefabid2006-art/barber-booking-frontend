import React from "react";

// STEP 5: prenotazione confermata
export default function StepConferma({ firstName, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 mt-10 text-center animate-fade-up">
      <div className="flex items-center justify-center w-24 h-24 mb-6 shadow-inner bg-tint-2 rounded-full">
        <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="mb-3 text-3xl font-extrabold text-fg font-heading">Réservé !</h3>
      <p className="mb-10 text-lg font-medium text-fg-muted">
        Merci <span className="text-fg">{firstName}</span>.<br/>Nous vous attendons au salon !
      </p>
      <button onClick={onClose} className="w-full py-4 text-lg font-extrabold text-white transition-colors bg-primary rounded-2xl hover:bg-primary-hover shadow-xl active:scale-95">
        Fermer
      </button>
    </div>
  );
}
