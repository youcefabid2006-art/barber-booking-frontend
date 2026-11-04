import React, { useState } from "react";
import ShopProdottoImmagine from "../../components/ShopProdottoImmagine"; // NUOVO: stessa immagine con segnaposto della Boutique pubblica
import ListaOverlay from "./ListaOverlay";

// NUOVO: campo "Lien de l'image" dei prodotti, con anteprima.
// L'anteprima si aggiorna quando si esce dal campo (non a ogni lettera, per non fare una richiesta per ogni carattere digitato)
// e sparisce se si modifica il link, finché non si esce di nuovo dal campo.
function ProductImageField({ value, onChange, inputExtraClass = "" }) {
  const current = (value || "").trim();
  const [preview, setPreview] = useState(current);

  return (
    <div>
      <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Lien de l'image (Optionnel)</label>
      {/* min-h-12 = altezza dell'anteprima: quando compare non cambia l'altezza della riga e il pulsante sotto
          non si sposta (altrimenti il click su "Ajouter" subito dopo aver incollato il link andrebbe perso) */}
      <div className="flex items-center gap-3 min-h-[3rem]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setPreview(current)}
          placeholder="https://..."
          className={`flex-1 min-w-0 px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary ${inputExtraClass}`}
        />
        {current !== "" && preview === current && (
          <ShopProdottoImmagine
            key={preview}
            src={preview}
            alt="Aperçu"
            className="w-12 h-12 border shrink-0 rounded-xl border-line-strong"
          />
        )}
      </div>
    </div>
  );
}

// NUOVO: SCHEDA "Nouveau produit" (PRODOTTI DELLA BOUTIQUE: stessa struttura della scheda "Nouveau service")
export function ProdottiCard({ newProductForm, setNewProductForm, handleAddProduct, onShowList }) {
  return (
    <div className="p-6 bg-white border shadow-sm rounded-2xl border-line-strong">
      <h3 className="mb-2 text-lg font-extrabold text-fg font-heading">Nouveau produit</h3>
      <p className="mb-6 text-xs font-medium leading-snug text-fg-muted">
        Les produits apparaissent dans la section « Boutique » de votre page. L'onglet s'affiche dès le premier produit ajouté.
      </p>
      <form onSubmit={handleAddProduct} className="flex flex-col gap-4 mb-4">
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Nom du produit</label>
          <input type="text" required value={newProductForm.name} onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})} placeholder="Ex. Shampooing réparateur" className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Catégorie (Optionnel)</label>
          <input type="text" list="product-categories" value={newProductForm.category} onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})} placeholder="Ex. Cheveux, soins du visage..." className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Description (Optionnel)</label>
          <textarea rows="3" value={newProductForm.description} onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})} placeholder="Détails du produit, conseils d'utilisation..." className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary resize-none"></textarea>
        </div>
        <div>
          <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Prix (DA)</label>
          <input type="number" required min="0" step="0.5" value={newProductForm.price} onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})} className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
        </div>
        <ProductImageField
          value={newProductForm.image_url}
          onChange={(v) => setNewProductForm({...newProductForm, image_url: v})}
        />
        <button type="submit" className="w-full py-3 mt-2 text-sm font-bold text-white transition-all shadow-md rounded-xl bg-gradient-to-r from-grad-start to-grad-end hover:from-primary-hover hover:to-primary active:scale-95">
          Ajouter à la boutique
        </button>
      </form>

      <div className="flex justify-end pt-4 border-t border-line">
        <button
          type="button"
          onClick={onShowList}
          className="flex items-center gap-1 text-sm font-bold transition-colors text-fg-2 hover:text-fg group"
        >
          Voir la liste des produits
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// NUOVO - ELENCO A TUTTO SCHERMO "Liste des produits" (stessa struttura dell'elenco servizi, con modifica direttamente nella riga).
// Gli stati della modifica vivono qui: chiudendo l'elenco si azzerano da soli.
export function ProdottiLista({ products, handleUpdateProduct, handleDeleteProduct, onClose }) {
  // NUOVO: stati per la modifica di un prodotto direttamente nella lista (stessa logica dei servizi)
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductForm, setEditProductForm] = useState({ name: "", description: "", price: "", category: "", image_url: "" });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // NUOVO: modifica di un prodotto
  const startEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setEditProductForm({
      name: prod.name || "",
      description: prod.description || "",
      price: prod.price,
      category: prod.category || "",
      image_url: prod.image_url || ""
    });
  };

  const submitEditProduct = async (e) => {
    e.preventDefault();
    setIsSavingProduct(true);
    const ok = await handleUpdateProduct(editingProductId, {
      name: editProductForm.name.trim(),
      description: editProductForm.description.trim(),
      price: parseFloat(editProductForm.price),
      category: editProductForm.category.trim() || null,
      image_url: editProductForm.image_url.trim()
    });
    setIsSavingProduct(false);
    if (ok) setEditingProductId(null);
  };

  return (
    <ListaOverlay title="Liste des produits" onClose={onClose}>
      {!products || products.length === 0 ? (
        <p className="text-sm font-medium text-fg-muted">Aucun produit présent.</p>
      ) : (
        products.map((prod) => (
          <div key={prod.id} className="flex flex-col gap-4 p-4 border sm:flex-row sm:items-center justify-between rounded-xl border-line bg-tint">
            {editingProductId === prod.id ? (
              <form onSubmit={submitEditProduct} className="flex flex-col flex-1 gap-3">
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Nom du produit</label>
                  <input type="text" required value={editProductForm.name} onChange={(e) => setEditProductForm({...editProductForm, name: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Catégorie (Optionnel)</label>
                  <input type="text" list="product-categories" value={editProductForm.category} onChange={(e) => setEditProductForm({...editProductForm, category: e.target.value})} placeholder="Ex. Cheveux" className="w-full px-4 py-2 font-medium text-fg placeholder-fg-faint bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Description (Optionnel)</label>
                  <textarea rows="3" value={editProductForm.description} onChange={(e) => setEditProductForm({...editProductForm, description: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary resize-none"></textarea>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-bold tracking-wide uppercase text-fg">Prix (DA)</label>
                  <input type="number" required min="0" step="0.01" value={editProductForm.price} onChange={(e) => setEditProductForm({...editProductForm, price: e.target.value})} className="w-full px-4 py-2 font-medium text-fg bg-white border rounded-xl border-line-strong focus:outline-none focus:border-primary" />
                </div>
                <ProductImageField
                  value={editProductForm.image_url}
                  onChange={(v) => setEditProductForm({...editProductForm, image_url: v})}
                  inputExtraClass="bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProductId(null)}
                    className="px-3 py-1.5 text-xs font-bold text-fg-2 transition-colors border border-line-strong rounded-lg hover:bg-tint-2 active:scale-95 whitespace-nowrap"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-3 py-1.5 text-xs font-bold text-white transition-all rounded-lg bg-primary hover:bg-primary-hover active:scale-95 whitespace-nowrap disabled:opacity-50"
                  >
                    {isSavingProduct ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center flex-1 min-w-0 gap-4">
                  <ShopProdottoImmagine
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-14 h-14 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-fg">{prod.name}</h4>
                    <p className="text-xs font-medium text-fg-muted line-clamp-1">{prod.description || "Aucune description"}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1 text-sm font-bold text-fg-2">
                      <span>{Number(prod.price)} DA</span>
                      {prod.category && (
                        <>
                          <span>•</span>
                          <span>{prod.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditProduct(prod)}
                    className="px-3 py-1.5 text-xs font-bold text-fg-2 transition-colors border border-line-strong rounded-lg hover:bg-tint-2 active:scale-95 whitespace-nowrap"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="px-3 py-1.5 text-xs font-bold text-red-500 transition-colors border border-red-200 rounded-lg hover:bg-red-50 active:scale-95 whitespace-nowrap"
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </ListaOverlay>
  );
}
