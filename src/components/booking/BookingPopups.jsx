import React, { useEffect } from "react";

// I due popup di ShopBooking.
// - UnavailableTimePopup: "orario non disponibile per questo servizio"
// - NoticePopup: avvisi del backend (codice OTP, limiti, telefono...) al posto degli alert() del browser

// POPUP: ORARIO NON DISPONIBILE PER QUESTO SERVIZIO
export function UnavailableTimePopup({ service, time, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-fg/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm p-6 text-center bg-white shadow-2xl rounded-3xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-inner bg-tint-2">
          <span className="text-3xl">⏱️</span>
        </div>
        <h3 className="mb-2 text-xl font-extrabold text-fg font-heading">Horaire non disponible</h3>
        <p className="mb-6 text-sm font-medium text-fg-muted">
          {service.name} ({service.duration_minutes} min) n'est pas disponible à {time}. Veuillez choisir un autre horaire.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 text-lg font-extrabold text-white transition-all shadow-lg bg-gradient-to-r from-grad-start to-grad-end rounded-2xl active:scale-[0.98]"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}

// NUOVO: POPUP ELEGANTE PER GLI AVVISI DEL BACKEND (OTP, limiti, telefono...) - sostituisce gli alert() del browser
// "notice" ha la forma { icon, title, message, buttonLabel } (la prepara getNoticeContent in ShopBookingUtils.js)
export function NoticePopup({ notice, onClose }) {
  // NUOVO: il popup degli avvisi si chiude anche con il tasto Esc (comodo da PC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-fg/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="notice-title"
        aria-describedby="notice-message"
        className="w-full max-w-sm p-6 text-center bg-white shadow-2xl rounded-3xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full shadow-inner bg-tint-2 ring-[10px] ring-tint-2/50">
          <span className="text-3xl">{notice.icon}</span>
        </div>
        <h3 id="notice-title" className="mb-2 text-xl font-extrabold tracking-tight text-fg font-heading">
          {notice.title}
        </h3>
        <p id="notice-message" className="mb-6 text-sm font-medium leading-relaxed text-fg-muted">
          {notice.message}
        </p>
        <button
          autoFocus
          onClick={onClose}
          className="w-full py-3 text-lg font-extrabold text-white transition-all shadow-lg bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary rounded-2xl active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {notice.buttonLabel}
        </button>
      </div>
    </div>
  );
}
