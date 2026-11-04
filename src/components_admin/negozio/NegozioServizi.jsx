import React, { useState } from "react";
import ListaOverlay from "./ListaOverlay";

// SCHEDA "Nouveau service" (modulo di inserimento + pulsante per aprire l'elenco)
export function ServiziCard({ newServiceForm, setNewServiceForm, handleAddService, onShowList }) {
  return (
    <div className="p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
      <h3 className="mb-6 text-lg font-extrabold text-fg font-heading">Nouveau service</h3>
      <form onSubmit={handleAddService} className="flex flex-col gap-4 mb-4">
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Nom du service</label>
          <input type="text" required value={newServiceForm.name} onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})} placeholder="Ex. Prestation complète" className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Catégorie (Optionnel)</label>
          <input type="text" list="service-categories" value={newServiceForm.category || ""} onChange={(e) => setNewServiceForm({...newServiceForm, category: e.target.value})} placeholder="Ex. Services, soins..." className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Description (Optionnel)</label>
          <textarea rows="2" value={newServiceForm.description} onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})} placeholder="Détails du service..." className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary resize-none"></textarea>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Durée (Minutes)</label>
            <input type="number" required min="5" step="5" value={newServiceForm.duration_minutes} onChange={(e) => setNewServiceForm({...newServiceForm, duration_minutes: parseInt(e.target.value)})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Prix (DA)</label>
            <input type="number" required min="0" step="0.5" value={newServiceForm.price} onChange={(e) => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
          </div>
        </div>
        <button type="submit" className="w-full py-3 mt-2 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-95">
          Ajouter à la liste
        </button>
      </form>

      <div className="flex justify-end pt-4 border-t border-line">
        <button
          type="button"
          onClick={onShowList}
          className="flex items-center gap-1 text-sm font-bold transition-colors text-fg-2 hover:text-fg group"
        >
          Voir la liste des services
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ELENCO A TUTTO SCHERMO "Liste des services", con modifica direttamente nella riga.
// Gli stati della modifica (quale servizio, campi, salvataggio) vivono qui: chiudendo l'elenco si azzerano da soli.
export function ServiziLista({ services, handleUpdateService, handleDeleteService, onClose }) {
  // Stati per la modifica di un servizio direttamente nella lista
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editServiceForm, setEditServiceForm] = useState({ name: "", description: "", duration_minutes: 30, price: 0, category: "" });
  const [isSavingService, setIsSavingService] = useState(false);

  const startEditService = (serv) => {
    setEditingServiceId(serv.id);
    setEditServiceForm({
      name: serv.name || "",
      description: serv.description || "",
      duration_minutes: serv.duration_minutes,
      price: serv.price,
      category: serv.category || ""
    });
  };

  const submitEditService = async (e) => {
    e.preventDefault();
    setIsSavingService(true);
    const ok = await handleUpdateService(editingServiceId, {
      name: editServiceForm.name.trim(),
      description: editServiceForm.description.trim(),
      duration_minutes: parseInt(editServiceForm.duration_minutes, 10),
      price: parseFloat(editServiceForm.price),
      category: editServiceForm.category.trim() || null
    });
    setIsSavingService(false);
    if (ok) setEditingServiceId(null);
  };

  return (
    <ListaOverlay title="Liste des services" onClose={onClose}>
      {!services || services.length === 0 ? (
        <p className="text-sm font-medium text-fg-muted">Aucun service présent.</p>
      ) : (
        services.map((serv) => (
          <div key={serv.id} className="flex flex-col gap-4 p-4 border sm:flex-row sm:items-center justify-between rounded-xl border-line bg-tint">
            {editingServiceId === serv.id ? (
              <form onSubmit={submitEditService} className="flex flex-col flex-1 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Nom du service</label>
                  <input type="text" required value={editServiceForm.name} onChange={(e) => setEditServiceForm({...editServiceForm, name: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Catégorie (Optionnel)</label>
                  <input type="text" list="service-categories" value={editServiceForm.category} onChange={(e) => setEditServiceForm({...editServiceForm, category: e.target.value})} placeholder="Ex. Coiffure" className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Description (Optionnel)</label>
                  <textarea rows="2" value={editServiceForm.description} onChange={(e) => setEditServiceForm({...editServiceForm, description: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary resize-none"></textarea>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Durée (Minutes)</label>
                    <input type="number" required min="5" step="5" value={editServiceForm.duration_minutes} onChange={(e) => setEditServiceForm({...editServiceForm, duration_minutes: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Prix (DA)</label>
                    <input type="number" required min="0" step="0.01" value={editServiceForm.price} onChange={(e) => setEditServiceForm({...editServiceForm, price: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingServiceId(null)}
                    className="px-3 py-1.5 text-xs font-bold text-fg-2 transition-colors border border-line-strong rounded-lg hover:bg-tint-2 active:scale-95 whitespace-nowrap"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingService}
                    className="px-3 py-1.5 text-xs font-bold text-white transition-all rounded-lg bg-primary hover:bg-primary-hover active:scale-95 whitespace-nowrap disabled:opacity-50"
                  >
                    {isSavingService ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1">
                  <h4 className="font-bold text-fg">{serv.name}</h4>
                  <p className="text-xs font-medium text-fg-muted line-clamp-1">{serv.description || "Aucune description"}</p>
                  <div className="flex gap-3 mt-1 text-sm font-bold text-fg-2">
                    <span>{serv.duration_minutes} min</span>
                    <span>•</span>
                    <span>{Number(serv.price)} DA</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditService(serv)}
                    className="px-3 py-1.5 text-xs font-bold text-fg-2 transition-colors border border-line-strong rounded-lg hover:bg-tint-2 active:scale-95 whitespace-nowrap"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteService(serv.id)}
                    className="px-3 py-1.5 text-xs font-bold text-red-500 transition-colors border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 whitespace-nowrap"
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </ListaOverlay>
  );
}
