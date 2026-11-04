import { useState } from "react";

let dialogSeq = 0;

// ===== POPUP NELLO STILE DELLA PAGINA (al posto di alert / confirm / prompt del browser) =====
// Questo hook è la LOGICA dei popup del gestionale; il loro aspetto è in components_admin/AdminDialog.jsx.
// Le tre funzioni ritornano una Promise, come alert / confirm / prompt:
//   await notify("success", "Fatto!")                -> messaggio
//   const ok = await askConfirm("Titolo", "Testo")   -> true / false
//   const nome = await askText("Titolo", "Testo")    -> testo scritto (o null se annullato)
export default function useAdminDialog() {
  const [dialog, setDialog] = useState(null);

  const openDialog = (config) => new Promise((resolve) => setDialog({ ...config, resolve, id: ++dialogSeq }));
  const closeDialog = (result) => {
    if (dialog) dialog.resolve(result);
    setDialog(null);
  };
  const notify = (type, message, title) => openDialog({ kind: "message", type, message, title });
  const askConfirm = (title, message, confirmLabel = "Confirmer", danger = true, cancelLabel = "Annuler") =>
    openDialog({ kind: "confirm", title, message, confirmLabel, danger, cancelLabel });
  const askText = (title, message, initialValue = "", confirmLabel = "Enregistrer") =>
    openDialog({ kind: "prompt", title, message, initialValue, confirmLabel });

  return { dialog, closeDialog, notify, askConfirm, askText };
}
