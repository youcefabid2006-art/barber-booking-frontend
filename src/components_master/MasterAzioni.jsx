import React, { useState } from "react";

// Azioni su un negozio GIÀ ESISTENTE (sotto la scheda): aprire vetrina e admin, reimpostare la password, eliminare.
// - onOpenAdmin(): entra nel gestionale di questo negozio
// - onSetPassword(password): ritorna true se la password è stata cambiata
// - onDelete(): ritorna true se il negozio è stato eliminato
export default function MasterAzioni({ shop, onOpenAdmin, onSetPassword, onDelete }) {
  const [password, setPassword] = useState("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setIsSettingPassword(true);
    const ok = await onSetPassword(password);
    setIsSettingPassword(false);
    if (ok) setPassword("");
  };

  const closeConfirm = () => {
    if (isDeleting) return;
    setShowConfirm(false);
    setConfirmText("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const ok = await onDelete();
    // Se è andata bene il negozio sparisce dall'elenco e questo componente con lui
    if (!ok) setIsDeleting(false);
  };

  const outlineBtn = "px-4 py-2 text-sm font-bold text-center transition-colors border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 active:scale-95";

  return (
    <div className="flex flex-col gap-6 p-6 mt-6 bg-white border shadow-sm rounded-2xl border-line-strong">

      <div>
        <h3 className="mb-3 text-sm font-bold text-fg">Apri</h3>
        <div className="flex flex-wrap gap-2">
          <a href={`/shop/${shop.slug}`} target="_blank" rel="noopener noreferrer" className={outlineBtn}>Vetrina</a>
          <button type="button" onClick={onOpenAdmin} className={outlineBtn}>Admin del negozio</button>
        </div>
        <p className="mt-2 text-xs font-medium text-fg-muted">
          L'admin si apre già autenticato e sostituisce l'eventuale sessione admin aperta in questo browser.
        </p>
      </div>

      <form onSubmit={handlePassword} className="pt-6 border-t border-line">
        <h3 className="mb-1 text-sm font-bold text-fg">Password admin</h3>
        <p className="mb-3 text-xs font-medium text-fg-muted">
          {shop.has_password ? "Impostata. Se ne inserisci una nuova sostituisce quella attuale." : "Non ancora impostata: il negozio non può fare il login."}
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nuova password (almeno 8 caratteri)"
            className="flex-1 min-w-0 px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isSettingPassword}
            className="px-4 py-2 text-sm font-bold text-white transition-all rounded-xl bg-primary hover:bg-primary-hover active:scale-95 disabled:opacity-50"
          >
            {isSettingPassword ? "..." : "Imposta"}
          </button>
        </div>
      </form>

      <div className="pt-6 border-t border-line">
        <h3 className="mb-1 text-sm font-bold text-red-600">Elimina negozio</h3>
        <p className="mb-3 text-xs font-medium text-fg-muted">
          Cancella per sempre il negozio con servizi, collaboratori, turni, prodotti e prenotazioni.
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 text-sm font-bold text-red-600 transition-colors border border-red-200 rounded-xl hover:bg-red-50 active:scale-95"
        >
          Elimina «{shop.name}»
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Conferma eliminazione">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="relative w-full max-w-sm p-6 bg-white border shadow-2xl rounded-2xl border-line-strong">
            <h3 className="mb-2 text-lg font-extrabold text-fg font-heading">Eliminare «{shop.name}»?</h3>
            <p className="mb-4 text-sm font-medium text-fg-muted">
              Verranno cancellati per sempre anche servizi, collaboratori, turni, prodotti e prenotazioni. Non si può annullare.
            </p>
            <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">
              Scrivi «{shop.slug}» per confermare
            </label>
            <input
              type="text"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 font-medium text-fg border rounded-xl border-line-strong focus:outline-none focus:border-primary"
            />
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold transition-colors rounded-xl text-fg-2 bg-tint-2 hover:bg-line-strong active:scale-95 disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText.trim() !== shop.slug || isDeleting}
                className="flex-1 py-3 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 disabled:opacity-40"
              >
                {isDeleting ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}