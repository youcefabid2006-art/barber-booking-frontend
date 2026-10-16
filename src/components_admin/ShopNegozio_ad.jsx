import React, { useState } from "react";

const WEEKDAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
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
  const [editServiceForm, setEditServiceForm] = useState({ name: "", description: "", duration_minutes: 30, price: 0 });
  const [isSavingService, setIsSavingService] = useState(false);

  const startEditService = (serv) => {
    setEditingServiceId(serv.id);
    setEditServiceForm({
      name: serv.name || "",
      description: serv.description || "",
      duration_minutes: serv.duration_minutes,
      price: serv.price
    });
  };

  const submitEditService = async (e) => {
    e.preventDefault();
    setIsSavingService(true);
    const ok = await handleUpdateService(editingServiceId, {
      name: editServiceForm.name.trim(),
      description: editServiceForm.description.trim(),
      duration_minutes: parseInt(editServiceForm.duration_minutes, 10),
      price: parseFloat(editServiceForm.price)
    });
    setIsSavingService(false);
    if (ok) setEditingServiceId(null);
  };

  return (
    <>
      {/* Contenitore principale della griglia (separato dagli overlay) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-up">
       
        {/* COLONNA SINISTRA */}
        <div className="flex flex-col gap-8 md:col-span-5">
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-neutral-200">
            <h3 className="mb-6 text-lg font-extrabold text-neutral-900">Informazioni Salone</h3>
            <form onSubmit={handleSaveShopInfo} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Nome Salone</label>
                <input type="text" value={shopForm.name} onChange={(e) => setShopForm({...shopForm, name: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Indirizzo</label>
                <input type="text" value={shopForm.address} onChange={(e) => setShopForm({...shopForm, address: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Telefono</label>
                <input type="text" value={shopForm.phone} onChange={(e) => setShopForm({...shopForm, phone: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Descrizione Pubblica</label>
                <textarea rows="4" value={shopForm.description} onChange={(e) => setShopForm({...shopForm, description: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900 resize-none"></textarea>
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Instagram URL</label>
                <input type="text" value={shopForm.instagram_url || ""} onChange={(e) => setShopForm({...shopForm, instagram_url: e.target.value})} placeholder="https://instagram.com/..." className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Facebook URL</label>
                <input type="text" value={shopForm.facebook_url || ""} onChange={(e) => setShopForm({...shopForm, facebook_url: e.target.value})} placeholder="https://facebook.com/..." className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">WhatsApp Numero</label>
                <input type="text" value={shopForm.whatsapp_number || ""} onChange={(e) => setShopForm({...shopForm, whatsapp_number: e.target.value})} placeholder="Es. 393331234567" className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>

              <div className="mt-4">
                <h4 className="mb-3 text-sm font-bold text-neutral-800">Testo Orari (es. 08:30 - 19:00 o Closed)</h4>
                {WEEKDAYS.map((dayName, idx) => {
                  const dbDay = DB_DAYS[idx];
                  return (
                    <div key={dbDay} className="flex items-center justify-between mb-2">
                      <span className="w-24 text-sm font-medium text-neutral-800">{dayName}</span>
                      <input
                        type="text"
                        value={shopForm.opening_hours[dbDay] || ""}
                        onChange={(e) => handleOpeningHoursChange(dbDay, e.target.value)}
                        placeholder="Closed"
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-neutral-900 placeholder-neutral-400 border rounded-lg border-neutral-200 focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                  )
                })}
              </div>

              <button type="submit" className="w-full py-3 mt-4 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-95">
                Salva Informazioni
              </button>
            </form>
          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div className="flex flex-col gap-8 md:col-span-7">
          <div className="p-6 bg-white border shadow-sm rounded-2xl border-neutral-200">
            <h3 className="mb-4 text-lg font-extrabold text-neutral-900">Aggiungi Collaboratore</h3>
            <form onSubmit={handleAddBarber} className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Nome</label>
                <input type="text" required value={newBarberForm.name} onChange={(e) => setNewBarberForm({name: e.target.value})} placeholder="Es. Mario" className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <button type="submit" className="px-4 py-2 font-bold text-white transition-all bg-neutral-900 rounded-xl hover:bg-black active:scale-95">
                Aggiungi
              </button>
            </form>
           
            <div className="flex justify-end pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowTeamList(true)}
                className="flex items-center gap-1 text-sm font-bold transition-colors text-neutral-600 hover:text-neutral-900 group"
              >
                Visualizza team
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 bg-white border shadow-sm rounded-2xl border-neutral-200">
            <h3 className="mb-6 text-lg font-extrabold text-neutral-900">Nuovo Servizio</h3>
            <form onSubmit={handleAddService} className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Nome Servizio</label>
                <input type="text" required value={newServiceForm.name} onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})} placeholder="Es. Taglio + Barba" className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
              </div>
              <div>
                <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Descrizione (Opzionale)</label>
                <textarea rows="2" value={newServiceForm.description} onChange={(e) => setNewServiceForm({...newServiceForm, description: e.target.value})} placeholder="Dettagli del servizio..." className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900 resize-none"></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Durata (Minuti)</label>
                  <input type="number" required min="5" step="5" value={newServiceForm.duration_minutes} onChange={(e) => setNewServiceForm({...newServiceForm, duration_minutes: parseInt(e.target.value)})} className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Prezzo (€)</label>
                  <input type="number" required min="0" step="0.5" value={newServiceForm.price} onChange={(e) => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-2 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-95">
                Aggiungi a Listino
              </button>
            </form>

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowServiceList(true)}
                className="flex items-center gap-1 text-sm font-bold transition-colors text-neutral-600 hover:text-neutral-900 group"
              >
                Visualizza lista servizi
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
          <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-neutral-200">
            <button onClick={() => setShowTeamList(false)} className="p-2 mr-2 transition rounded-full text-neutral-600 hover:bg-neutral-100">
              <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">Il tuo team</h2>
          </div>
          <div className="w-full max-w-3xl flex-1 p-5 mx-auto mt-4">
            <div className="flex flex-col gap-3">
              {!barbers || barbers.length === 0 ? (
                <p className="text-sm font-medium text-neutral-500">Nessun collaboratore presente nel team.</p>
              ) : (
                barbers.map((b) => (
                  <div key={b.id} className="flex flex-col gap-4 p-4 border sm:flex-row sm:items-center justify-between rounded-xl border-neutral-100 bg-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white shadow-sm rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700">
                        {getInitials(b.name)}
                      </div>
                      <h4 className="font-bold text-neutral-900">{b.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateBarber(b.id, b.name)}
                        className="px-3 py-1.5 text-xs font-bold text-neutral-700 transition-colors border border-neutral-200 rounded-lg hover:bg-neutral-100 active:scale-95 whitespace-nowrap"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => handleDeleteBarber(b.id)}
                        className="px-3 py-1.5 text-xs font-bold text-red-500 transition-colors border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 whitespace-nowrap"
                      >
                        Elimina
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
          <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-neutral-200">
            <button onClick={() => { setShowServiceList(false); setEditingServiceId(null); }} className="p-2 mr-2 transition rounded-full text-neutral-600 hover:bg-neutral-100">
              <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">Listino Servizi</h2>
          </div>
          <div className="w-full max-w-3xl flex-1 p-5 mx-auto mt-4">
            <div className="flex flex-col gap-3">
              {!shopDetails.services || shopDetails.services.length === 0 ? (
                <p className="text-sm font-medium text-neutral-500">Nessun servizio presente.</p>
              ) : (
                shopDetails.services.map((serv) => (
                  <div key={serv.id} className="flex flex-col gap-4 p-4 border sm:flex-row sm:items-center justify-between rounded-xl border-neutral-100 bg-neutral-50">
                    {editingServiceId === serv.id ? (
                      <form onSubmit={submitEditService} className="flex flex-col flex-1 gap-3">
                        <div>
                          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Nome Servizio</label>
                          <input type="text" required value={editServiceForm.name} onChange={(e) => setEditServiceForm({...editServiceForm, name: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 bg-white border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Descrizione (Opzionale)</label>
                          <textarea rows="2" value={editServiceForm.description} onChange={(e) => setEditServiceForm({...editServiceForm, description: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 bg-white border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900 resize-none"></textarea>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Durata (Minuti)</label>
                            <input type="number" required min="5" step="5" value={editServiceForm.duration_minutes} onChange={(e) => setEditServiceForm({...editServiceForm, duration_minutes: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 bg-white border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
                          </div>
                          <div className="flex-1">
                            <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-neutral-800">Prezzo (€)</label>
                            <input type="number" required min="0" step="0.01" value={editServiceForm.price} onChange={(e) => setEditServiceForm({...editServiceForm, price: e.target.value})} className="w-full px-4 py-2 font-medium text-neutral-900 bg-white border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingServiceId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-neutral-700 transition-colors border border-neutral-200 rounded-lg hover:bg-neutral-100 active:scale-95 whitespace-nowrap"
                          >
                            Annulla
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingService}
                            className="px-3 py-1.5 text-xs font-bold text-white transition-all rounded-lg bg-neutral-900 hover:bg-black active:scale-95 whitespace-nowrap disabled:opacity-50"
                          >
                            {isSavingService ? "Salvataggio..." : "Salva"}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex-1">
                          <h4 className="font-bold text-neutral-900">{serv.name}</h4>
                          <p className="text-xs font-medium text-neutral-500 line-clamp-1">{serv.description || "Nessuna descrizione"}</p>
                          <div className="flex gap-3 mt-1 text-sm font-bold text-neutral-700">
                            <span>{serv.duration_minutes} min</span>
                            <span>•</span>
                            <span>€ {Number(serv.price).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditService(serv)}
                            className="px-3 py-1.5 text-xs font-bold text-neutral-700 transition-colors border border-neutral-200 rounded-lg hover:bg-neutral-100 active:scale-95 whitespace-nowrap"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDeleteService(serv.id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-500 transition-colors border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 whitespace-nowrap"
                          >
                            Elimina
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