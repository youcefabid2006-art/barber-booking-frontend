import React, { useRef, useState } from "react";

// Immagini della vetrina: la PRIMA è la copertina mostrata in cima alla pagina del negozio.
// - images: lista di link
// - onUpdate(fn): cambia la lista, fn riceve la lista attuale e ritorna quella nuova
// - onUpload(file): carica il file e ritorna il link pubblico (o null se non è riuscito)
// Le modifiche si salvano con il pulsante del modulo che contiene questo componente.
export default function MasterImmagini({ images, onUpdate, onUpload }) {
  const fileInput = useRef(null);
  const [linkText, setLinkText] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // permette di scegliere di nuovo lo stesso file
    if (files.length === 0) return;

    setIsUploading(true);
    for (const file of files) {
      const url = await onUpload(file);
      if (url) onUpdate((list) => [...list, url]);
    }
    setIsUploading(false);
  };

  const handleAddLink = () => {
    const url = linkText.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      setLinkError("Il link deve iniziare con http:// o https://");
      return;
    }
    onUpdate((list) => [...list, url]);
    setLinkText("");
    setLinkError("");
  };

  const makeCover = (index) => onUpdate((list) => [list[index], ...list.filter((_, i) => i !== index)]);
  const remove = (index) => onUpdate((list) => list.filter((_, i) => i !== index));

  return (
    <div>
      {images.length === 0 ? (
        <p className="mb-3 text-sm font-medium text-fg-muted">Nessuna immagine: la pagina mostrerà quella di default.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <div key={`${index}-${url}`} className="overflow-hidden bg-white border rounded-xl border-line-strong">
              <div className="relative aspect-square bg-tint-2">
                <img src={url} alt="" className="object-cover w-full h-full" />
                {index === 0 && (
                  <span className="absolute px-2 py-0.5 text-[10px] font-bold text-white rounded-full top-2 left-2 bg-primary">Copertina</span>
                )}
              </div>
              <div className="flex border-t border-line">
                {index > 0 ? (
                  <button type="button" onClick={() => makeCover(index)} className="flex-1 py-1.5 text-xs font-bold transition-colors text-fg-2 hover:bg-tint-2">
                    Copertina
                  </button>
                ) : (
                  <span className="flex-1" />
                )}
                <button type="button" onClick={() => remove(index)} className="flex-1 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50">
                  Rimuovi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInput.current?.click()}
        className="w-full py-2 mb-3 text-sm font-bold transition-colors border border-dashed rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 disabled:opacity-50"
      >
        {isUploading ? "Caricamento in corso..." : "Carica immagini dal computer"}
      </button>

      <div className="flex gap-2">
        <input
          type="text"
          value={linkText}
          onChange={(e) => { setLinkText(e.target.value); setLinkError(""); }}
          // Invio qui aggiunge il link: senza questo invierebbe l'intero modulo
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddLink();
            }
          }}
          placeholder="Oppure incolla un link https://..."
          className="flex-1 min-w-0 px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleAddLink}
          className="px-4 py-2 text-sm font-bold transition-colors border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2 active:scale-95"
        >
          Aggiungi
        </button>
      </div>
      {linkError && <p className="mt-1 text-xs font-bold text-red-500">{linkError}</p>}
    </div>
  );
}