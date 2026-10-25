import React, { useState } from "react";

const TYPE_LABELS = { barber: "Barbiere", beauty: "Bellezza" };
const getInitials = (name) => name.substring(0, 2).toUpperCase();

// Elenco dei negozi (già in ordine di id dal backend) con ricerca e accessi rapidi a vetrina e admin
export default function MasterNegozi({ shops, isLoading, selectedId, onSelect, onNew, onOpenAdmin }) {
  const [query, setQuery] = useState("");

  // Si cerca per id esatto (es. "3" o "#3") oppure per parte dello slug o del nome
  const q = query.trim().toLowerCase().replace(/^#/, "");
  const filtered = q
    ? shops.filter((s) => String(s.id) === q || s.slug.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : shops;

  const linkBtn = "px-3 py-1.5 text-xs font-bold text-center text-fg-2 transition-colors bg-white border rounded-lg border-line-strong hover:bg-tint-2 active:scale-95";

  return (
    <div className="bg-white border shadow-sm rounded-2xl border-line-strong">
      <div className="flex items-center justify-between p-4 border-b border-line">
        <h2 className="text-lg font-extrabold text-fg font-heading">
          Negozi <span className="text-sm font-bold text-fg-muted">({shops.length})</span>
        </h2>
        <button
          type="button"
          onClick={onNew}
          className="px-4 py-2 text-sm font-bold text-white transition-all rounded-xl bg-primary hover:bg-primary-hover active:scale-95"
        >
          + Nuovo
        </button>
      </div>

      <div className="p-4 border-b border-line">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per id, slug o nome..."
          className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2 p-3">
        {isLoading && shops.length === 0 ? (
          <p className="p-3 text-sm font-medium text-fg-muted">Caricamento...</p>
        ) : filtered.length === 0 ? (
          <p className="p-3 text-sm font-medium text-fg-muted">Nessun negozio trovato.</p>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 p-2 border rounded-xl transition-colors ${s.id === selectedId ? "border-primary bg-tint-2" : "border-line bg-tint hover:bg-tint-2"}`}
            >
              <button type="button" onClick={() => onSelect(s.id)} className="flex items-center flex-1 min-w-0 gap-3 p-1 text-left">
                {/* Iniziali sotto, copertina sopra: se l'immagine non carica restano le iniziali */}
                <div className="relative w-12 h-12 overflow-hidden rounded-xl shrink-0 bg-gradient-to-br from-grad-start to-avatar-end">
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{getInitials(s.name)}</span>
                  {s.images[0] && (
                    <img
                      src={s.images[0]}
                      alt=""
                      className="absolute inset-0 object-cover w-full h-full"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-fg">{s.name}</p>
                  <p className="text-xs font-medium truncate text-fg-muted">#{s.id} · /{s.slug}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-white border rounded-full border-line text-fg-2">
                      {TYPE_LABELS[s.business_type] || s.business_type}
                    </span>
                    {!s.has_password && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600">Senza password</span>
                    )}
                  </div>
                </div>
              </button>

              <div className="flex flex-col gap-1 shrink-0">
                <a href={`/shop/${s.slug}`} target="_blank" rel="noopener noreferrer" className={linkBtn}>Vetrina</a>
                <button type="button" onClick={() => onOpenAdmin(s)} className={linkBtn}>Admin</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}