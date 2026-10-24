import React, { useState, useEffect, useRef, useCallback } from "react";

// Durata della transizione (deve coincidere con duration-300 qui sotto)
const TRANSITION_MS = 300;

// Scheda a comparsa dal basso (bottom sheet) usata dalla Boutique per il dettaglio prodotto e per i preferiti.
// - Resta dentro la stessa pagina: dietro si vede l'overlay Boutique oscurato, quindi si capisce che non è una nuova route.
// - Entrata e uscita sono transizioni CSS (nessun @keyframes in index.css da aggiungere).
// - Si chiude toccando lo sfondo scuro, con il tasto Esc o con la funzione `close` che riceve chi la usa.
// - L'altezza, lo sfondo e il resto dello stile della scheda li decide chi la usa tramite sheetClassName.
// `children` può essere un normale contenuto oppure una funzione (close) => contenuto.
export default function ShopBottomSheet({ onClose, ariaLabel, sheetClassName = "", children }) {
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

  // Uscita: prima si fa partire l'animazione, poi (a fine transizione) si avvisa il genitore che può smontarla.
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
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      {/* SFONDO OSCURATO */}
      <div
        onClick={requestClose}
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* SCHEDA */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col w-full max-w-xl mx-auto overflow-hidden rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0" : "translate-y-full"
        } ${sheetClassName}`}
      >
        {typeof children === "function" ? children(requestClose) : children}
      </div>
    </div>
  );
}