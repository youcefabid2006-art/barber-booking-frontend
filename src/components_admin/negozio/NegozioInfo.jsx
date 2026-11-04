import React from "react";
import { WEEKDAYS, DB_DAYS } from "../../constants";

// SCHEDA "Informations du salon": nome, indirizzo, telefono, descrizione, social e orari di apertura.
export default function NegozioInfo({ shopForm, setShopForm, handleSaveShopInfo, handleOpeningHoursChange }) {
  return (
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
  );
}
