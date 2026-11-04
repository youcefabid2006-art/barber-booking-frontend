import React from "react";

// STEP 4: inserimento del codice OTP a 6 cifre.
// onOtpChange riceve il nuovo testo (solo cifre); onSubmit verifica il codice e salva la prenotazione (lo gestisce ShopBooking).
export default function StepOtp({ otpCode, onOtpChange, onSubmit, isSubmitting }) {
  return (
    <div className="p-6 text-center animate-fade-up">
      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 shadow-inner bg-tint-2 rounded-full">
        <span className="text-3xl">📱</span>
      </div>
      <h3 className="mb-2 text-2xl font-extrabold text-fg font-heading">Vérification du téléphone</h3>
      <p className="mb-8 text-sm font-medium text-fg-muted">
        Nous vous avons envoyé un SMS. Saisissez le code à 6 chiffres pour confirmer.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div>
          <input
            type="text"
            maxLength="6"
            required
            value={otpCode}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ''))} // Accetta solo numeri
            className="w-full text-center tracking-[0.5em] text-3xl px-5 py-4 font-bold transition-all bg-white border-2 border-line-strong rounded-2xl focus:bg-white focus:outline-none focus:border-primary placeholder:text-fg-ghost"
            placeholder="------"
          />
        </div>
        <button type="submit" disabled={isSubmitting || otpCode.length < 6} className={`w-full py-4 text-lg font-extrabold text-white transition-all shadow-lg rounded-2xl shadow-glow ${isSubmitting || otpCode.length < 6 ? 'bg-primary-soft/60 cursor-not-allowed' : 'bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-[0.98]'}`}>
          {isSubmitting ? 'Vérification en cours...' : 'Confirmer la réservation'}
        </button>
      </form>
    </div>
  );
}
