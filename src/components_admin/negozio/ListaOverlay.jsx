import React from "react";

// Schermata a tutto schermo con freccia "indietro" e titolo.
// La usano gli elenchi del negozio (team, servizi, prodotti): il contenuto della lista arriva come "children".
// NB: va resa FUORI dalla griglia animata di ShopNegozio_ad (l'animazione usa transform e spezzerebbe il position: fixed).
export default function ListaOverlay({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white animate-fade-up">
      <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-line-strong">
        <button onClick={onClose} className="p-2 mr-2 transition rounded-full text-fg-2 hover:bg-tint-2">
          <svg className="w-6 h-6 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-fg font-heading">{title}</h2>
      </div>
      <div className="w-full max-w-3xl flex-1 p-5 mx-auto mt-4">
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
