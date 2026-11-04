import React, { useState, useEffect } from "react";

// ===== ASPETTO DEI POPUP DEL GESTIONALE =====
// La logica (aprire / chiudere, notify, askConfirm, askText) è in hooks/useAdminDialog.js.
// Uso: <AdminDialog dialog={dialog} onClose={closeDialog} />

const DIALOG_ICONS = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  delete: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
};

function DialogCard({ dialog, onClose }) {
  const [text, setText] = useState(dialog.initialValue || "");
  const isPrompt = dialog.kind === "prompt";
  const isConfirm = dialog.kind === "confirm";
  const isMessage = dialog.kind === "message";
  const isSuccess = isMessage && dialog.type === "success";
  const isError = isMessage && dialog.type === "error";
  const danger = isConfirm && dialog.danger !== false;

  const title = dialog.title || (isSuccess ? "Terminé !" : "Une erreur est survenue");
  const iconPath = isSuccess ? DIALOG_ICONS.success : isError ? DIALOG_ICONS.error : isConfirm ? DIALOG_ICONS.delete : DIALOG_ICONS.edit;
  const iconTone = isSuccess ? "bg-green-50 text-green-600" : (isError || danger) ? "bg-red-50 text-red-500" : "bg-tint-2 text-primary";

  const cancel = () => onClose(isPrompt ? null : isConfirm ? false : true);

  // Chiusura con il tasto Esc (utile da computer)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cancelBtn = "flex-1 py-3 text-sm font-bold transition-colors rounded-xl text-fg-2 bg-tint-2 hover:bg-line-strong active:scale-95";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={cancel} />

      <div className="relative w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-line-strong">
        <div className={`flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 ${iconTone}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>

        <h3 className="mb-1 text-lg font-extrabold text-fg font-heading">{title}</h3>
        {dialog.message && <p className="text-sm font-medium break-words text-fg-muted">{dialog.message}</p>}

        {isPrompt ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onClose(text);
            }}
            className="mt-5"
          >
            <input
              autoFocus
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary"
            />
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={cancel} className={cancelBtn}>Annuler</button>
              <button type="submit" className="flex-1 py-3 text-sm font-bold text-white transition-all rounded-xl bg-primary hover:bg-primary-hover active:scale-95">
                {dialog.confirmLabel || "Enregistrer"}
              </button>
            </div>
          </form>
        ) : isConfirm ? (
          <div className="flex gap-3 mt-6">
            <button type="button" autoFocus={danger} onClick={cancel} className={cancelBtn}>{dialog.cancelLabel || "Annuler"}</button>
            <button
              type="button"
              onClick={() => onClose(true)}
              className={`flex-1 py-3 text-sm font-bold text-white transition-all rounded-xl active:scale-95 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary-hover"}`}
            >
              {dialog.confirmLabel || "Confirmer"}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              type="button"
              autoFocus
              onClick={() => onClose(true)}
              className="w-full py-3 text-sm font-bold text-white transition-all rounded-xl bg-primary hover:bg-primary-hover active:scale-95"
            >
              {isSuccess ? "Ok" : "Fermer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDialog({ dialog, onClose }) {
  if (!dialog) return null;
  return <DialogCard key={dialog.id} dialog={dialog} onClose={onClose} />;
}
