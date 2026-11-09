import { useEffect, useState } from "react";

// ===== PICCOLI HOOK DELL'AGENDA =====

// Ora attuale, aggiornata ogni minuto (serve per "Prochain", "En cours" e la linea dell'ora su telefono)
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

// true su telefono. La soglia è la stessa del breakpoint "md" di Tailwind (768px) che il resto del gestionale
// usa già per scegliere tra schede e tabella (md:hidden / hidden md:block): sotto i 768px = telefono.
// Si aggiorna da solo se si ruota lo schermo o si ridimensiona la finestra.
const PHONE_QUERY = "(max-width: 767.98px)";

export function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    // Browser molto vecchi (Safari < 14)
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);
  return isPhone;
}