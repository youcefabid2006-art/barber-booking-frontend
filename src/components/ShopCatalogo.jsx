import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ShopProdottoDettaglio from "./ShopProdottoDettaglio";
import ShopPreferiti from "./ShopPreferiti";
import ShopProdottoImmagine from "./ShopProdottoImmagine";
import {
  MAX_QTY,
  formatPrice,
  normalizeText,
  groupProductsByCategory,
  readFavorites,
  writeFavorites,
} from "./shopProdottiUtils";

// Costante fuori dal componente: un array nuovo ad ogni render romperebbe i useMemo qui sotto
const NO_PRODUCTS = [];

// Card di un prodotto: immagine, nome e prezzo (la descrizione si vede solo aprendo il dettaglio).
// Il cuore è un pulsante separato sopra la card (non annidato nel pulsante principale).
function ProductCard({ product, isFavorite, onOpen, onToggleFavorite }) {
  return (
    <div className="relative flex flex-col overflow-hidden transition-shadow duration-200 bg-white border shadow-[0_2px_12px_rgba(15,23,42,0.05)] border-line-strong rounded-2xl hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="flex flex-col flex-1 w-full text-left transition-transform active:scale-[0.98]"
      >
        <ShopProdottoImmagine src={product.image_url} alt={product.name} className="w-full aspect-square" />
        <div className="flex flex-col flex-1 w-full gap-2 p-3">
          <h3 className="text-[13px] font-semibold leading-snug text-fg line-clamp-2">{product.name}</h3>
          <p className="mt-auto text-[15px] font-extrabold text-fg">
            {formatPrice(product.price)} <span className="text-[11px] font-bold text-fg-muted">DA</span>
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(product.id)}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={`absolute top-2 right-2 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all active:scale-90 ${
          isFavorite ? "text-red-500" : "text-fg-2 hover:text-fg"
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
  );
}

// Sezione "Boutique": overlay a tutto schermo come ShopPrenotazioni (stessa nav bar fissa).
// Catalogo vetrina, nessun pagamento online. I preferiti vivono qui dentro (servono solo in questa sezione)
// e si salvano nel localStorage del cliente, una chiave per negozio.
export default function ShopCatalogo({ shopId, products = NO_PRODUCTS, isAdminAuth, onHome, onOpenPrenotazioni }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  // Preferiti: { "<id prodotto>": quantità }
  const [favorites, setFavorites] = useState(() => readFavorites(shopId, products));

  useEffect(() => {
    writeFavorites(shopId, favorites);
  }, [shopId, favorites]);

  // Categorie: stessa logica di ShopServizi (barra solo con più di una categoria, prima categoria di default)
  const groups = useMemo(() => groupProductsByCategory(products), [products]);
  const showCategories = groups.length > 1;
  const activeGroup = groups.find((g) => g.key === activeKey) || groups[0];

  // Ricerca per nome: mentre si cerca si guardano TUTTI i prodotti (non solo la categoria aperta) e la barra categorie si nasconde
  const normalizedQuery = normalizeText(query);
  const isSearching = normalizedQuery !== "";
  const searchResults = useMemo(
    () => (normalizedQuery === "" ? [] : products.filter((p) => normalizeText(p.name).includes(normalizedQuery))),
    [products, normalizedQuery]
  );
  const visibleProducts = isSearching ? searchResults : activeGroup ? activeGroup.items : [];

  const favoriteItems = useMemo(
    () => products.filter((p) => favorites[p.id] > 0).map((p) => ({ product: p, qty: favorites[p.id] })),
    [products, favorites]
  );

  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[productId]) delete next[productId];
      else next[productId] = 1;
      return next;
    });
  }, []);

  // delta = +1 / -1; a quantità 0 il prodotto esce dai preferiti
  const changeQty = useCallback((productId, delta) => {
    setFavorites((prev) => {
      const qty = (prev[productId] || 0) + delta;
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = Math.min(qty, MAX_QTY);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => setFavorites({}), []);
  const closeProduct = useCallback(() => setSelectedProduct(null), []);
  const closeFavorites = useCallback(() => setShowFavorites(false), []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-page">

      {/* HEADER: titolo, ricerca e categorie */}
      <div className="z-10 bg-white shadow-sm shrink-0">
        <div className="max-w-3xl px-4 pt-5 pb-4 mx-auto md:px-8">
          <h2 className="text-xl font-extrabold tracking-tight text-center text-fg font-heading">Boutique</h2>

          <div className="relative mt-4">
            <svg
              className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-fg-faint"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {/* text-[16px]: sotto i 16px iOS ingrandisce la pagina quando si tocca il campo */}
            <input
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit"
              className="w-full h-12 pl-12 pr-11 text-[16px] font-medium transition border rounded-2xl outline-none border-line-strong bg-tint text-fg placeholder:text-fg-faint focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {query !== "" && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="absolute flex items-center justify-center w-7 h-7 transition -translate-y-1/2 rounded-full right-3 top-1/2 bg-tint-2 text-fg-muted hover:text-fg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Barra delle categorie: stessa grafica di ShopServizi (si vede solo con più di una categoria e non mentre si cerca) */}
        {showCategories && !isSearching ? (
          <div className="border-b border-line-strong">
            <div className="max-w-3xl px-4 mx-auto md:px-8">
              <div
                role="tablist"
                aria-label="Catégories de produits"
                className="flex gap-6 -mb-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {groups.map((group) => {
                  const isActive = group.key === activeGroup.key;
                  return (
                    <button
                      key={group.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={(e) => {
                        setActiveKey(group.key);
                        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
                        // Porta in vista la scheda toccata (utile quando la barra è più larga dello schermo)
                        e.currentTarget.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                      }}
                      className={`shrink-0 whitespace-nowrap pt-3 pb-3 text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors ${
                        isActive ? "border-primary text-primary" : "border-transparent text-fg-muted hover:text-fg"
                      }`}
                    >
                      {group.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-b border-line-strong"></div>
        )}
      </div>

      {/* GRIGLIA PRODOTTI (pb-40: spazio per la nav bar e per il pulsante flottante) */}
      <div ref={scrollRef} className="flex-1 w-full overflow-y-auto overscroll-contain pb-40">
        <div className="max-w-3xl px-4 py-5 mx-auto md:px-8">
          {isSearching && (
            <p className="mb-4 text-[13px] font-medium text-fg-muted">
              {searchResults.length} {searchResults.length > 1 ? "résultats" : "résultat"}
            </p>
          )}

          {visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 mb-5 bg-white border rounded-full border-line">
                <svg className="w-9 h-9 text-fg-ghost" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-fg font-heading">Aucun produit trouvé</h3>
              <p className="max-w-xs text-[15px] leading-relaxed text-fg-muted">
                {isSearching ? "Essayez avec un autre mot-clé." : "Ce catalogue est vide pour le moment."}
              </p>
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="px-5 py-2 mt-5 text-sm font-bold transition-colors border-2 rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            // key: cambiando categoria la griglia riparte con la stessa entrata dolce delle altre schermate
            <div
              key={isSearching ? "search" : activeGroup.key}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 animate-fade-up"
            >
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={Boolean(favorites[product.id])}
                  onOpen={setSelectedProduct}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PULSANTE FLOTTANTE: compare solo se c'è almeno un preferito, sopra la nav bar a destra */}
      {favoriteItems.length > 0 && (
        <button
          type="button"
          onClick={() => setShowFavorites(true)}
          className="fixed z-[55] right-4 bottom-[calc(6rem_+_env(safe-area-inset-bottom))] flex items-center gap-2.5 py-3 pl-4 pr-3 text-white rounded-full shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary transition-all active:scale-95 animate-fade-up"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-[14px] font-bold">Voir les favoris</span>
          <span className="flex items-center justify-center min-w-[26px] h-[26px] px-1.5 text-xs font-extrabold rounded-full bg-white/20">
            {favoriteItems.length}
          </span>
        </button>
      )}

      {/* BOTTOM NAVIGATION BAR (identica a quella di ShopPrenotazioni, con Boutique attiva) */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-line shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe pt-2">
        <div className={`${isAdminAuth ? "grid grid-cols-4 items-center justify-items-center" : "flex items-center justify-around"} max-w-md px-6 pb-2 mx-auto`}>

          <button
            onClick={onHome}
            className="flex flex-col items-center justify-center p-2 transition-colors text-fg-faint hover:text-primary group"
          >
            <svg className="w-6 h-6 mb-1 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Accueil</span>
          </button>

          <button
            onClick={onOpenPrenotazioni}
            className="flex flex-col items-center justify-center p-2 transition-colors text-fg-faint hover:text-primary group"
          >
            <svg className="w-6 h-6 mb-1 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Réservations</span>
          </button>

          <button
            className="flex flex-col items-center justify-center p-2 transition-colors text-primary"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Boutique</span>
          </button>

          {/* Tasto IMPOSTAZIONI (Visibile SOLO all'Admin) */}
          {isAdminAuth && (
            <button
              onClick={() => navigate('/admin')}
              className="flex flex-col items-center justify-center p-2 transition-colors text-fg-faint hover:text-primary group"
            >
              <svg className="w-6 h-6 mb-1 transition-transform group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-bold tracking-wide uppercase">Paramètres</span>
            </button>
          )}

        </div>
      </div>

      {/* SCHEDE A COMPARSA (sopra tutto, dentro la stessa pagina) */}
      {selectedProduct && (
        <ShopProdottoDettaglio
          product={selectedProduct}
          isFavorite={Boolean(favorites[selectedProduct.id])}
          onToggleFavorite={toggleFavorite}
          onClose={closeProduct}
        />
      )}

      {showFavorites && (
        <ShopPreferiti
          items={favoriteItems}
          onChangeQty={changeQty}
          onClear={clearFavorites}
          onClose={closeFavorites}
        />
      )}
    </div>
  );
}