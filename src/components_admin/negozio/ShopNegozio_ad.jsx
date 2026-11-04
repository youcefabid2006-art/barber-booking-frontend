import React, { useState } from "react";
import NegozioInfo from "./NegozioInfo";
import { CollaboratoriCard, CollaboratoriLista } from "./NegozioCollaboratori";
import { ServiziCard, ServiziLista } from "./NegozioServizi";
import { ProdottiCard, ProdottiLista } from "./NegozioProdotti";

// ===== TAB "Salon et Services" =====
// Questo file compone la pagina: a sinistra la scheda delle informazioni, a destra le schede
// collaboratori / servizi / prodotti; gli elenchi a tutto schermo si aprono sopra a tutto.
// Il contenuto di ogni scheda è nel suo file (NegozioInfo, NegozioCollaboratori, NegozioServizi, NegozioProdotti).
// Dati e funzioni arrivano da AdminDash (la logica è in hooks/useNegozioAdmin.js).
export default function ShopNegozio_ad({
  shopDetails,
  shopForm,
  setShopForm,
  handleSaveShopInfo,
  handleOpeningHoursChange,
  newBarberForm,
  setNewBarberForm,
  handleAddBarber,
  handleUpdateBarber,
  handleDeleteBarber,
  barbers,
  newServiceForm,
  setNewServiceForm,
  handleAddService,
  handleDeleteService,
  handleUpdateService,
  newProductForm,
  setNewProductForm,
  handleAddProduct,
  handleDeleteProduct,
  handleUpdateProduct
}) {
  const [showTeamList, setShowTeamList] = useState(false);
  const [showServiceList, setShowServiceList] = useState(false);
  const [showProductList, setShowProductList] = useState(false); // NUOVO: elenco prodotti della Boutique

  // Categorie già usate dai servizi del negozio: le suggeriamo nei campi "Catégorie"
  // così si evitano doppioni scritti in modo diverso (es. "Coiffure" e "coiffure")
  const existingCategories = [
    ...new Set(
      (shopDetails.services || []).map((s) => (s.category || "").trim()).filter(Boolean)
    ),
  ];

  // NUOVO: lo stesso per le categorie dei prodotti (elenco separato da quello dei servizi)
  const existingProductCategories = [
    ...new Set(
      (shopDetails.products || []).map((p) => (p.category || "").trim()).filter(Boolean)
    ),
  ];

  return (
    <>
      {/* Suggerimenti per i campi "Catégorie" (non occupa spazio nel layout) */}
      <datalist id="service-categories">
        {existingCategories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      {/* NUOVO: suggerimenti per le categorie dei prodotti */}
      <datalist id="product-categories">
        {existingProductCategories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Contenitore principale della griglia (separato dagli overlay) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-up">

        {/* COLONNA SINISTRA */}
        <div className="flex flex-col gap-8 md:col-span-5">
          <NegozioInfo
            shopForm={shopForm}
            setShopForm={setShopForm}
            handleSaveShopInfo={handleSaveShopInfo}
            handleOpeningHoursChange={handleOpeningHoursChange}
          />
        </div>

        {/* COLONNA DESTRA */}
        <div className="flex flex-col gap-8 md:col-span-7">
          <CollaboratoriCard
            newBarberForm={newBarberForm}
            setNewBarberForm={setNewBarberForm}
            handleAddBarber={handleAddBarber}
            onShowList={() => setShowTeamList(true)}
          />
          <ServiziCard
            newServiceForm={newServiceForm}
            setNewServiceForm={setNewServiceForm}
            handleAddService={handleAddService}
            onShowList={() => setShowServiceList(true)}
          />
          {/* NUOVO: PRODOTTI DELLA BOUTIQUE (stessa struttura della scheda "Nouveau service") */}
          <ProdottiCard
            newProductForm={newProductForm}
            setNewProductForm={setNewProductForm}
            handleAddProduct={handleAddProduct}
            onShowList={() => setShowProductList(true)}
          />
        </div>
      </div>
      {/* FINE GRIGLIA PRINCIPALE */}

      {/* OVERLAY 1: TEAM (fuori dalla griglia animata) */}
      {showTeamList && (
        <CollaboratoriLista
          barbers={barbers}
          handleUpdateBarber={handleUpdateBarber}
          handleDeleteBarber={handleDeleteBarber}
          onClose={() => setShowTeamList(false)}
        />
      )}

      {/* OVERLAY 2: SERVIZI (fuori dalla griglia animata) */}
      {showServiceList && (
        <ServiziLista
          services={shopDetails.services}
          handleUpdateService={handleUpdateService}
          handleDeleteService={handleDeleteService}
          onClose={() => setShowServiceList(false)}
        />
      )}

      {/* NUOVO - OVERLAY 3: PRODOTTI */}
      {showProductList && (
        <ProdottiLista
          products={shopDetails.products}
          handleUpdateProduct={handleUpdateProduct}
          handleDeleteProduct={handleDeleteProduct}
          onClose={() => setShowProductList(false)}
        />
      )}

    </>
  );
}
