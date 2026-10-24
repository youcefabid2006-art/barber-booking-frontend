import React from "react";
import ShopPopup from "./ShopPopup";
import ShopProdottoImmagine from "./ShopProdottoImmagine";
import { formatPrice } from "./shopProdottiUtils";

// Dettaglio di un prodotto: popup fluttuante al centro della pagina, con la Boutique oscurata dietro.
// In alto l'immagine intera (adattata al suo riquadro, senza ritagli); sotto nome, prezzo, cuore e descrizione.
// Se la descrizione è lunga scorre solo la parte di testo, l'immagine resta sempre visibile.
export default function ShopProdottoDettaglio({ product, isFavorite, onToggleFavorite, onClose }) {
  if (!product) return null;

  const description = (product.description || "").trim();
  const category = (product.category || "").trim();

  return (
    <ShopPopup onClose={onClose} ariaLabel={product.name} popupClassName="max-w-sm max-h-[88vh]">
      {(close) => (
        <>
          {/* IMMAGINE: il riquadro ha un'altezza fissa (ma si accorcia sugli schermi bassi) e l'immagine ci sta dentro intera */}
          <div className="relative p-4 pb-0 shrink-0">
            <ShopProdottoImmagine
              key={product.id}
              src={product.image_url}
              alt={product.name}
              fit="contain"
              className="w-full h-[min(16rem,34vh)] border rounded-2xl border-line-strong"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute z-10 flex items-center justify-center transition bg-white border rounded-full shadow-sm top-6 right-6 w-9 h-9 border-line-strong text-fg hover:bg-tint active:scale-95"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* NOME, PREZZO, CUORE E DESCRIZIONE */}
          <div className="flex-1 min-h-0 px-5 pt-4 pb-6 overflow-y-auto overscroll-contain">
            {category && <p className="mb-1 text-[13px] font-medium text-fg-faint">{category}</p>}

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold leading-tight tracking-tight text-fg font-heading">
                  {product.name}
                </h2>
                <p className="mt-1.5 text-lg font-extrabold text-fg">
                  {formatPrice(product.price)} <span className="text-sm font-bold text-fg-muted">DA</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleFavorite(product.id)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all active:scale-90 ${
                  isFavorite
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-line-strong bg-white text-fg-2 hover:border-primary hover:text-primary"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <div className="my-4 border-t border-line-strong"></div>

            {description ? (
              <p className="text-[15px] leading-relaxed text-fg-2 whitespace-pre-wrap">{description}</p>
            ) : (
              <p className="text-[15px] leading-relaxed text-fg-faint">Aucune description disponible pour ce produit.</p>
            )}
          </div>
        </>
      )}
    </ShopPopup>
  );
}