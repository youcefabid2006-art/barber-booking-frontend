import React, { useState, useEffect, useRef, useCallback } from "react";

// Durata della transizione (deve coincidere con duration-300 qui sotto)
const TRANSITION_MS = 300;

// Popup al centro della pagina, fluttuante sopra l'overlay Boutique (che resta visibile, oscurato, dietro).
// Stessa meccanica di ShopBottomSheet (transizioni CSS, nessun @keyframes in index.css) ma al centro:
// compare con una dissolvenza e un leggero ingrandimento, e si chiude con l'animazione inversa.
// - Si chiude toccando lo sfondo scuro, con il tasto Esc o con la funzione `close` che riceve chi lo usa.
// - Larghezza, altezza massima e il resto dello stile le decide chi lo usa tramite popupClassName.
// `children` può essere un normale contenuto oppure una funzione (close) => contenuto.
export default function ShopPopup({ onClose, ariaLabel, popupClassName = "", children }) {
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);
  const timerRef = useRef(null);

  // Entrata: aspettiamo due frame, altrimenti il browser non vede mai lo stato iniziale e salta la transizione
  useEffect(() => {
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
      clearTimeout(timerRef.current);
    };
  }, []);

  // Uscita: prima parte l'animazione, poi (a fine transizione) si avvisa il genitore che può smontarlo.
  // Si può chiamare più volte senza effetti collaterali.
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    timerRef.current = setTimeout(onClose, TRANSITION_MS);
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {/* SFONDO OSCURATO */}
      <div
        onClick={requestClose}
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* POPUP */}
      <div
        className={`relative flex flex-col w-full overflow-hidden bg-white rounded-3xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out motion-reduce:transition-none ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3"
        } ${popupClassName}`}
      >
        {typeof children === "function" ? children(requestClose) : children}
      </div>
    </div>
  );
}