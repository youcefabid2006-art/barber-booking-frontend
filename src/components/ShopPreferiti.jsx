import React, { useState, useEffect } from "react";
import ShopBottomSheet from "./ShopBottomSheet";
import ShopProdottoImmagine from "./ShopProdottoImmagine";
import { MAX_QTY, formatPrice } from "./shopProdottiUtils";

// Contenuto del pannello. È separato dal componente principale perché riceve `close` dalla scheda:
// quando la lista si svuota (ultimo prodotto tolto, o "Vider") la scheda si chiude da sola con l'animazione.
function PreferitiContenuto({ items, onChangeQty, onClear, close }) {
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (items.length === 0) close();
  }, [items.length, close]);

  const total = items.reduce((sum, { product, qty }) => sum + Number(product.price) * qty, 0);
  // Numero di articoli = somma delle quantità (3 shampoo + 1 olio = 4 articoli)
  const totalUnits = items.reduce((sum, { qty }) => sum + qty, 0);

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 bg-white border-b shrink-0 border-line-strong">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-fg font-heading">Mes favoris</h2>
          <p className="text-[13px] font-medium text-fg-muted">
            {items.length} {items.length > 1 ? "produits" : "produit"}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="flex items-center justify-center w-10 h-10 transition rounded-full text-fg-2 hover:bg-tint-2 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* LISTA */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {items.length === 0 ? (
          // Si vede solo per un attimo, mentre la scheda si sta chiudendo
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <h3 className="mb-1 text-lg font-bold text-fg font-heading">Aucun favori</h3>
            <p className="text-[15px] text-fg-muted">Touchez le cœur d'un produit pour l'ajouter ici.</p>
          </div>
        ) : (
          <div className="flex flex-col max-w-xl gap-3 px-4 py-5 mx-auto">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-white border shadow-sm border-line-strong rounded-2xl"
              >
                <ShopProdottoImmagine
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 shrink-0 rounded-xl"
                />

                <div className="flex flex-col flex-1 min-w-0 gap-1">
                  <h3 className="text-sm font-bold leading-snug text-fg line-clamp-2">{product.name}</h3>
                  <p className="text-[13px] font-medium text-fg-muted">{formatPrice(product.price)} DA</p>

                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    {/* QUANTITÀ: a quantità 1 il "meno" diventa il cestino e toglie il prodotto */}
                    <div className="inline-flex items-center border rounded-full border-line-strong bg-tint">
                      <button
                        type="button"
                        onClick={() => onChangeQty(product.id, -1)}
                        aria-label={qty === 1 ? "Retirer des favoris" : "Diminuer la quantité"}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition active:scale-90 ${
                          qty === 1 ? "text-red-500 hover:bg-red-50" : "text-fg-2 hover:bg-tint-2"
                        }`}
                      >
                        {qty === 1 ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                          </svg>
                        )}
                      </button>
                      <span className="min-w-[28px] text-center text-sm font-bold tabular-nums text-fg">{qty}</span>
                      <button
                        type="button"
                        onClick={() => onChangeQty(product.id, 1)}
                        disabled={qty >= MAX_QTY}
                        aria-label="Augmenter la quantité"
                        className="flex items-center justify-center w-8 h-8 transition rounded-full text-fg-2 hover:bg-tint-2 active:scale-90 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    <span className="text-sm font-extrabold text-fg">{formatPrice(Number(product.price) * qty)} DA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER: totale e svuota */}
      {items.length > 0 && (
        <div className="px-5 pt-4 bg-white border-t shrink-0 border-line-strong pb-[calc(env(safe-area-inset-bottom)_+_1rem)]">
          <div className="max-w-xl mx-auto">
            {/* TOTALE: quanto spenderebbe il cliente per tutto ciò che ha nei preferiti */}
            <div className="relative flex items-center justify-between gap-4 py-4 pl-6 pr-5 overflow-hidden border rounded-2xl border-line-strong bg-tint">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary"></div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-fg">Total</p>
                <p className="text-xs font-medium text-fg-muted">
                  {totalUnits} {totalUnits > 1 ? "articles" : "article"}
                </p>
              </div>
              <p className="text-[28px] font-extrabold leading-none tracking-tight tabular-nums text-fg">
                {formatPrice(total)} <span className="text-sm font-bold text-fg-muted">DA</span>
              </p>
            </div>
            <p className="mt-2.5 mb-4 text-xs leading-snug text-center text-fg-faint">
              Catalogue à titre indicatif : le paiement en ligne n'est pas disponible.
            </p>

            {confirmClear ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-3 text-sm font-bold transition border-2 rounded-xl border-line-strong text-fg-2 hover:bg-tint active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="flex-1 py-3 text-sm font-bold text-white transition bg-red-500 rounded-xl hover:bg-red-600 active:scale-[0.98]"
                >
                  Oui, vider
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="w-full py-3 text-sm font-bold transition border-2 rounded-xl border-line-strong text-fg-2 hover:border-red-200 hover:bg-red-50 hover:text-red-500 active:scale-[0.98]"
              >
                Vider les favoris
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Pannello dei preferiti: scheda a comparsa dal basso (90% dello schermo), poco più piccola dell'overlay
// "Réservations" così si capisce che è una sezione della stessa pagina.
// items = [{ product, qty }]
export default function ShopPreferiti({ items, onChangeQty, onClear, onClose }) {
  return (
    <ShopBottomSheet onClose={onClose} ariaLabel="Mes favoris" sheetClassName="bg-tint h-[90vh]">
      {(close) => (
        <PreferitiContenuto items={items} onChangeQty={onChangeQty} onClear={onClear} close={close} />
      )}
    </ShopBottomSheet>
  );
}