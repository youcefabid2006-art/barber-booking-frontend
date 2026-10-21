import React, { useState } from "react";

const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DB_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const getInitials = (name) => name.substring(0, 2).toUpperCase();

export default function ShopNegozio_ad({
  shopDetails,
  shopForm,
  setShopForm,
  handleSaveShopInfo,
  handleOpeningHoursChange,
  newBarberForm,
  setNewBarberForm,
  handleAddBarber,
  handleUpdateBarber,
  handleDeleteBarber,
  barbers,
  newServiceForm,
  setNewServiceForm,
  handleAddService,
  handleDeleteService,
  handleUpdateService
}) {
  const [showTeamList, setShowTeamList] = useState(false);
  const [showServiceList, setShowServiceList] = useState(false);

    // Stati per la modifica di un servizio direttamente nella lista
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editServiceForm, setEditServiceForm] = useState({ name: "", description: "", duration_minutes: 30, price: 0, category: "" });
    const [isSavingService, setIsSavingService] = useState(false);
  
    // Categorie già usate dai servizi del negozio: le suggeriamo nei campi "Catégorie"
    // così si evitano doppioni scritti in modo diverso (es. "Coiffure" e "coiffure")
    const existingCategories = [
      ...new Set(
        (shopDetails.services || []).map((s) => (s.category || "").trim()).filter(Boolean)
      ),
    ];
  
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
      <>
        {/* Suggerimenti per i campi "Catégorie" (non occupa spazio nel layout) */}
        <datalist id="service-categories">
          {existingCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      {/* Contenitore principale della griglia (separato dagli overlay) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-up">
       
        {/* COLONNA SINISTRA */}
        <div className="flex flex-col gap-8 md:col-span-5">
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
            <h3 className="mb-6 text-lg font-extrabold text-fg font-heading">Informations du salon</h3>
            <form onSubmit={handleSaveShopInfo} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Nom du salon</label>
                <input type="text" value={shopForm.name} onChange={(e) => setShopForm({...shopForm, name: e.target.value})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Adresse</label>
                <input type="text" value={shopForm.address} onChange={(e) => setShopForm({...shopForm, address: e.target.value})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Téléphone</label>
                <input type="text" value={shopForm.phone} onChange={(e) => setShopForm({...shopForm, phone: e.target.value})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Description publique</label>
                <textarea rows="4" value={shopForm.description} onChange={(e) => setShopForm({...shopForm, description: e.target.value})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary resize-none"></textarea>
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">URL Instagram</label>
                <input type="text" value={shopForm.instagram_url || ""} onChange={(e) => setShopForm({...shopForm, instagram_url: e.target.value})} placeholder="https://instagram.com/..." className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">URL Facebook</label>
                <input type="text" value={shopForm.facebook_url || ""} onChange={(e) => setShopForm({...shopForm, facebook_url: e.target.value})} placeholder="https://facebook.com/..." className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Numéro WhatsApp</label>
                <input type="text" value={shopForm.whatsapp_number || ""} onChange={(e) => setShopForm({...shopForm, whatsapp_number: e.target.value})} placeholder="Ex. 213550123456" className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
              </div>

              <div className="mt-4">
                <h4 className="mb-3 text-sm font-bold text-fg">Texte des horaires (ex. 08:30 - 19:00 ou Closed)</h4>
                {WEEKDAYS.map((dayName, idx) => {
                  const dbDay = DB_DAYS[idx];
                  return (
                    <div key={dbDay} className="flex items-center justify-between mb-2">
                      <span className="w-24 text-sm font-medium text-fg">{dayName}</span>
                      <input
                        type="text"
                        value={shopForm.opening_hours[dbDay] || ""}
                        onChange={(e) => handleOpeningHoursChange(dbDay, e.target.value)}
                        placeholder="Closed"
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-fg placeholder-fg-faint border rounded-lg border-line-strong focus:outline-none focus:border-primary"
                      />
                    </div>
                  )
                })}
              </div>

              <button type="submit" className="w-full py-3 mt-4 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-95">
                Enregistrer les informations
              </button>
            </form>
          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div className="flex flex-col gap-8 md:col-span-7">
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
                onClick={() => setShowTeamList(true)}
                className="flex items-center gap-1 text-sm font-bold transition-colors text-fg-2 hover:text-fg group"
              >
                Voir l'équipe
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

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
                onClick={() => setShowServiceList(true)}
                className="flex items-center gap-1 text-sm font-bold transition-colors text-fg-2 hover:text-fg group"
              >
                Voir la liste des services
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* FINE GRIGLIA PRINCIPALE */}

      {/* OVERLAY 1: TEAM (Spostato fuori dalla griglia animata) */}
      {showTeamList && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white animate-fade-up">
          <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-line-strong">
            <button onClick={() => setShowTeamList(false)} className="p-2 mr-2 transition rounded-full text-fg-2 hover:bg-tint-2">
              <svg className="w-6 h-6 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-lg font-bold tracking-tight text-fg font-heading">Votre équipe</h2>
          </div>
          <div className="w-full max-w-3xl flex-1 p-5 mx-auto mt-4">
            <div className="flex flex-col gap-3">
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
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY 2: SERVIZI (Spostato fuori dalla griglia animata) */}
      {showServiceList && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white animate-fade-up">
          <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-line-strong">
            <button onClick={() => { setShowServiceList(false); setEditingServiceId(null); }} className="p-2 mr-2 transition rounded-full text-fg-2 hover:bg-tint-2">
              <svg className="w-6 h-6 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-lg font-bold tracking-tight text-fg font-heading">Liste des services</h2>
          </div>
          <div className="w-full max-w-3xl flex-1 p-5 mx-auto mt-4">
            <div className="flex flex-col gap-3">
              {!shopDetails.services || shopDetails.services.length === 0 ? (
                <p className="text-sm font-medium text-fg-muted">Aucun service présent.</p>
              ) : (
                shopDetails.services.map((serv) => (
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
            </div>
          </div>
        </div>
      )}

    </>
  );
}