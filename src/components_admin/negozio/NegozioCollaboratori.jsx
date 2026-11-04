import React from "react";
import ListaOverlay from "./ListaOverlay";

const getInitials = (name) => name.substring(0, 2).toUpperCase();

// SCHEDA "Ajouter un collaborateur" (modulo di inserimento + pulsante per aprire l'elenco)
export function CollaboratoriCard({ newBarberForm, setNewBarberForm, handleAddBarber, onShowList }) {
  return (
    <div className="p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
      <h3 className="mb-4 text-lg font-extrabold text-fg font-heading">Ajouter un collaborateur</h3>
      <form onSubmit={handleAddBarber} className="flex items-end gap-2 mb-4">
        <div className="flex-1">
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Nom</label>
          <input type="text" required value={newBarberForm.name} onChange={(e) => setNewBarberForm({name: e.target.value})} placeholder="Nom du professionel" className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
        </div>
        <button type="submit" className="px-4 py-2 font-bold text-white transition-all bg-primary rounded-xl hover:bg-primary-hover active:scale-95">
          Ajouter
        </button>
      </form>
     
      <div className="flex justify-end pt-2 border-t border-line">
        <button
          type="button"
          onClick={onShowList}
          className="flex items-center gap-1 text-sm font-bold transition-colors text-fg-2 hover:text-fg group"
        >
          Voir l'équipe
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ELENCO A TUTTO SCHERMO "Votre équipe" (con Modifier / Supprimer per ogni collaboratore)
export function CollaboratoriLista({ barbers, handleUpdateBarber, handleDeleteBarber, onClose }) {
  return (
    <ListaOverlay title="Votre équipe" onClose={onClose}>
      {!barbers || barbers.length === 0 ? (
        <p className="text-sm font-medium text-fg-muted">Aucun collaborateur dans l'équipe.</p>
      ) : (
        barbers.map((b) => (
          <div key={b.id} className="flex flex-col gap-4 p-4 border sm:flex-row sm:items-center justify-between rounded-xl border-line bg-tint">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white shadow-sm rounded-full bg-gradient-to-br from-grad-start to-avatar-end">
                {getInitials(b.name)}
              </div>
              <h4 className="font-bold text-fg">{b.name}</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateBarber(b.id, b.name)}
                className="px-3 py-1.5 text-xs font-bold text-fg-2 transition-colors border border-line-strong rounded-lg hover:bg-tint-2 active:scale-95 whitespace-nowrap"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDeleteBarber(b.id)}
                className="px-3 py-1.5 text-xs font-bold text-red-500 transition-colors border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 whitespace-nowrap"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </ListaOverlay>
  );
}
