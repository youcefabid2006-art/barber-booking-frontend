import React from "react";

// STEP 3: dati del cliente (nome, cognome, telefono).
// onSubmit è la funzione che chiede il codice OTP (la gestisce ShopBooking).
export default function StepDatiCliente({ selectedDate, selectedTime, clientData, onInputChange, onSubmit, isSubmitting }) {
  return (
    <div className="p-6 animate-fade-up">
      <div className="flex items-center justify-between p-4 mb-6 border bg-tint border-line-strong rounded-2xl">
        <div>
          <p className="mb-1 text-xs font-bold tracking-wide uppercase text-fg-muted">Vous réservez pour le</p>
          <p className="text-lg font-extrabold text-fg">
            {new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {selectedTime}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block mb-2 ml-1 text-sm font-bold text-fg-2">Prénom</label>
          <input type="text" name="firstName" required value={clientData.firstName} onChange={onInputChange} className="w-full px-5 py-4 font-medium transition-all bg-white border-2 border-line rounded-2xl focus:bg-white focus:outline-none focus:border-primary placeholder:text-fg-ghost" placeholder="Votre prénom" />
        </div>
        <div>
          <label className="block mb-2 ml-1 text-sm font-bold text-fg-2">Nom</label>
          <input type="text" name="lastName" required value={clientData.lastName} onChange={onInputChange} className="w-full px-5 py-4 font-medium transition-all bg-white border-2 border-line rounded-2xl focus:bg-white focus:outline-none focus:border-primary placeholder:text-fg-ghost" placeholder="Votre nom" />
        </div>
        <div>
          <label className="block mb-2 ml-1 text-sm font-bold text-fg-2">Téléphone</label>
          <input type="tel" name="phone" required value={clientData.phone} onChange={onInputChange} className="w-full px-5 py-4 font-medium transition-all bg-white border-2 border-line rounded-2xl focus:bg-white focus:outline-none focus:border-primary placeholder:text-fg-ghost" placeholder="+213" />
        </div>
       
        <div className="pt-2">
          <button type="submit" disabled={isSubmitting} className={`w-full py-4 text-lg font-extrabold text-white transition-all shadow-lg rounded-2xl shadow-glow ${isSubmitting ? 'bg-primary-soft cursor-not-allowed' : 'bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-[0.98]'}`}>
            {isSubmitting ? 'Génération...' : 'Continuer'}
          </button>
        </div>
      </form>
    </div>
  );
}
