import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import AgendaIcon from "./AgendaIcon.jsx";
import { FALLBACK_COLOR, formatDayLong, formatTime } from "./agendaUtils";

// ===== DETTAGLI DI UN APPUNTAMENTO =====
// Su telefono sale dal basso (come il selettore dell'orario in ShopTeam_ad), su computer è al centro.
// L'unica azione è quella che già esisteva: annullare la prenotazione (handleDelete, con la sua conferma).
// Quando la prenotazione viene eliminata sparisce dall'elenco e ShopAppuntamenti_ad chiude da solo questa finestra.

function statusOf(item) {
  const now = Date.now();
  if (item.endMs < now) return { label: "Terminé", tone: "bg-tint-2 text-fg-muted" };
  if (item.startMs <= now) return { label: "En cours", tone: "bg-green-50 text-green-700" };
  return { label: "À venir", tone: "bg-tint-2 text-primary" };
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-0">
      <dt className="text-sm font-medium text-fg-muted">{label}</dt>
      <dd className="text-sm font-bold text-right text-fg">{children}</dd>
    </div>
  );
}

export default function AgendaBookingModal({ item, color = FALLBACK_COLOR, isDeleting, onDelete, onClose }) {
  // Chiusura con Esc. Se sopra c'è un altro popup (la conferma di annullamento) Esc spetta a lui, non a questa finestra
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (document.querySelectorAll('[aria-modal="true"]').length > 1) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const status = statusOf(item);
  const busy = isDeleting === item.id;

  const sheet = (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label="Détails du rendez-vous">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-t-3xl md:rounded-3xl">
        <div className="h-1.5" style={{ background: color.border }} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-2xl font-extrabold break-words text-fg font-heading">{item.clientName}</h3>
              <span className={`inline-block px-2.5 py-0.5 mt-2 text-xs font-bold rounded-full ${status.tone}`}>{status.label}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex items-center justify-center w-9 h-9 transition-colors rounded-full shrink-0 text-fg-faint hover:bg-tint-2 hover:text-fg"
            >
              <AgendaIcon name="close" className="w-5 h-5" />
            </button>
          </div>

          <dl className="mt-4">
            <Row label="Date">{formatDayLong(item.dateKey)}</Row>
            <Row label="Horaire">
              <span className="tabular-nums">
                {formatTime(item.startMin)} – {formatTime(item.endMin)}
              </span>{" "}
              <span className="font-medium text-fg-muted">({item.durMin} min)</span>
            </Row>
            <Row label="Service">{item.serviceName}</Row>
            <Row label="Équipe">
              {item.barberName ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color.border }} />
                  {item.barberName}
                </span>
              ) : (
                "Indifférent"
              )}
            </Row>
            <Row label="Téléphone">
              {item.phone ? (
                <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 font-mono text-primary hover:underline">
                  <AgendaIcon name="phone" />
                  {item.phone}
                </a>
              ) : (
                "-"
              )}
            </Row>
          </dl>

          <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-sm font-bold transition-colors rounded-xl sm:flex-1 text-fg-2 bg-tint-2 hover:bg-line-strong active:scale-95"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              disabled={busy}
              className={`w-full sm:flex-1 py-3 text-sm font-bold transition-all border-2 rounded-xl
                ${busy
                  ? "border-line-strong text-fg-faint bg-tint-2 cursor-not-allowed"
                  : "border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 active:scale-95"}`}
            >
              {busy ? "Annulation..." : "Annuler le rendez-vous"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal su body: il contenitore dell'agenda ha un'animazione con transform che altrimenti spezzerebbe il position: fixed
  // (stessa soluzione di TimeField in ShopTeam_ad). Resta sotto ad AdminDialog (z-[60]): la conferma di annullamento ci passa sopra.
  return createPortal(sheet, document.body);
}