import React, { useState, useEffect } from "react";
import { getAdminBookings, getAdminBarbers, getShopBySlug } from "../api";

import useAdminDialog from "../hooks/useAdminDialog";
import useShopTheme from "../hooks/useShopTheme";
import useAppuntamentiAdmin from "../hooks/useAppuntamentiAdmin";
import useTeamAdmin from "../hooks/useTeamAdmin";
import useNegozioAdmin from "../hooks/useNegozioAdmin";

import AdminDialog from "../components_admin/AdminDialog.jsx";
import ShopAppuntamenti_ad from "../components_admin/ShopAppuntamenti_ad.jsx";
import ShopTeam_ad from "../components_admin/ShopTeam_ad.jsx";
import ShopNegozio_ad from "../components_admin/negozio/ShopNegozio_ad.jsx";
// IMPORTIAMO LA NUOVA PAGINA DI LOGIN
import ShopLogin_ad from "../components_admin/ShopLogin_ad.jsx";

// Il tipo di negozio si ricorda in localStorage solo per dare i colori giusti anche alla schermata di caricamento
// (il valore vero arriva comunque dal negozio, appena caricato)
const THEME_CACHE_KEY = "admin_business_type";

// ===== IL GESTIONALE: AUTENTICAZIONE, CARICAMENTO DATI E LAYOUT =====
// Qui restano: il login, il caricamento dei dati del negozio (loadDashboardData), l'intestazione con le tab.
// La logica di ogni tab è in un hook dedicato (cartella hooks/):
//   - Rendez-vous            -> useAppuntamentiAdmin
//   - Horaires de l'équipe   -> useTeamAdmin
//   - Salon et Services      -> useNegozioAdmin
// Lo stato di tutte le tab vive qui dentro, quindi cambiare tab non fa perdere nulla.
export default function AdminDashboard() {
  // ===== NUOVO STATO DI AUTENTICAZIONE =====
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Slug del negozio che ha fatto il login (= username): arriva dal Login e resta in localStorage insieme al token
  const [shopSlug, setShopSlug] = useState(null);

  const [activeTab, setActiveTab] = useState("bookings");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup nello stile della pagina: ritornano una Promise, come alert / confirm / prompt
  const { dialog, closeDialog, notify, askConfirm, askText } = useAdminDialog();

  // Collaboratori del negozio (servono sia alla tab dei turni sia alla tab del negozio)
  const [barbers, setBarbers] = useState([]);

  // Dati e azioni di ogni tab.
  // "reload: loadDashboardData" funziona anche se la funzione è scritta più sotto: le funzioni dichiarate con "function" sono già disponibili.
  // AGENDA (tab Rendez-vous): vista, data, filtri e ricerca vivono nell'hook insieme all'elenco delle prenotazioni.
  const {
    bookings, setBookings,
    view, setView, selectedDate, setSelectedDate,
    filterBarber, setFilterBarber, filterService, setFilterService,
    search, setSearch, listScope, setListScope, resetFilters,
    isDeleting, filteredBookings, handleDelete
  } = useAppuntamentiAdmin({ notify, askConfirm });

  const {
    selectedBarber, setSelectedBarber, draftShifts, setDraftShifts, isSavingShifts,
    newShiftInputs, setNewShiftInputs,
    handleSelectBarber, handleAddShift, handleRemoveShift, handleSaveShifts
  } = useTeamAdmin({ notify, reload: loadDashboardData });

  const {
    shopDetails, setShopDetails, shopForm, setShopForm,
    newServiceForm, setNewServiceForm, newProductForm, setNewProductForm, newBarberForm, setNewBarberForm,
    handleSaveShopInfo, handleAddService, handleDeleteService, handleUpdateService,
    handleAddProduct, handleDeleteProduct, handleUpdateProduct,
    handleAddBarber, handleUpdateBarber, handleDeleteBarber, handleOpeningHoursChange
  } = useNegozioAdmin({ notify, askConfirm, askText, reload: loadDashboardData });

  // ===== TEMA GRAFICO =====
  // Tipo di negozio: parte dalla cache locale (vedi THEME_CACHE_KEY) e viene confermato dai dati del negozio
  const [businessType, setBusinessType] = useState(() => localStorage.getItem(THEME_CACHE_KEY) || "barber");

  // Appena il negozio è caricato, il suo business_type è quello vero: lo usiamo e lo ricordiamo
  useEffect(() => {
    if (!shopDetails) return;
    const type = shopDetails.business_type || "barber";
    setBusinessType(type);
    localStorage.setItem(THEME_CACHE_KEY, type);
  }, [shopDetails]);

  // Applica il tema su <html> (come ShopPage, così vale anche per popup e overlay).
  // Al logout o quando si lascia il gestionale l'attributo viene tolto e tornano i colori di default.
  useShopTheme(isAuthenticated ? businessType : null);

  // Controllo del Token all'avvio
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const savedSlug = localStorage.getItem("admin_shop_slug");
    // Servono sia il token sia lo slug: senza slug non sappiamo quale negozio caricare
    if (token && savedSlug) {
      setShopSlug(savedSlug);
      setIsAuthenticated(true);
    } else {
      setIsLoading(false); // Se non c'è token o slug, smetti di caricare e mostra il Login
    }
  }, []);

  // Carica i dati SOLO se siamo autenticati
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [shopSlug, isAuthenticated]);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      const shopData = await getShopBySlug(shopSlug);
      setShopDetails(shopData);
     
      setShopForm({
        name: shopData.name || "",
        slug: shopData.slug || "",
        description: shopData.description || "",
        address: shopData.address || "",
        phone: shopData.phone || "",
        instagram_url: shopData.instagram_url || "",
        facebook_url: shopData.facebook_url || "",
        whatsapp_number: shopData.whatsapp_number || "",
        opening_hours: shopData.opening_hours || {}
      });

      const [bookingsData, barbersData] = await Promise.all([
        getAdminBookings(shopData.id),
        getAdminBarbers(shopData.id)
      ]);
      setBookings(bookingsData);
      setBarbers(barbersData);
     
      if (barbersData.length > 0) {
        setSelectedBarber(barbersData[0]);
        setDraftShifts(barbersData[0].shifts || []);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  }

  // AGENDA: ricarica SOLO le prenotazioni (pulsante "Actualiser" dell'agenda).
  // Non tocca turni, collaboratori né dati del negozio, quindi le modifiche non salvate nelle altre tab restano.
  async function refreshBookings() {
    if (!shopDetails) return;
    try {
      setBookings(await getAdminBookings(shopDetails.id));
    } catch (err) {
      await notify("error", "Erreur de connexion au serveur.");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_shop_slug");
    localStorage.removeItem(THEME_CACHE_KEY);
    // Svuota i dati del negozio: se poi entra un altro negozio non deve vedere quelli del precedente
    setShopSlug(null);
    setShopDetails(null);
    setBookings([]);
    setBarbers([]);
    setSelectedBarber(null);
    setDraftShifts([]);
    setBusinessType("barber");
    setIsAuthenticated(false);
  };

  // ===============================================
  // GESTIONE DEI RENDER (Routing Interno)
  // ===============================================

  // 1. Se non siamo loggati, mostra il Login
  if (!isAuthenticated) {
    return (
      <ShopLogin_ad
        onLoginSuccess={(slug) => {
          setShopSlug(slug);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // 2. Se siamo loggati ma i dati stanno caricando
  if (isLoading && bookings.length === 0) {
    return <div className="flex items-center justify-center min-h-screen font-medium bg-page text-fg-muted">Chargement du panneau d'administration...</div>;
  }

  // 3. Se c'è un errore fatale nel caricamento dati
  if (error) {
    return <div className="flex items-center justify-center min-h-screen font-bold bg-page text-red-500">{error}</div>;
  }

  // 4. Renderizzazione normale della Dashboard
  return (
    <div className="min-h-screen p-4 md:p-8 bg-page font-sans">
      <div className="max-w-6xl mx-auto">
       
        {/* Intestazione e Tasto Logout */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg font-heading">Tableau de bord du salon</h1>
            <p className="mt-1 font-medium text-fg-muted">Gérez les rendez-vous, votre équipe et les informations publiques.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-red-600 transition-colors border border-red-200 rounded-xl hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </div>

        <div className="flex gap-6 mb-8 overflow-x-auto border-b border-line-strong hide-scrollbar">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'bookings' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'}`}
          >
            Rendez-vous
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'shifts' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'}`}
          >
            Horaires de l'équipe
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'shop' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'}`}
          >
            Salon et Services
          </button>
        </div>
       
        {activeTab === "bookings" && (
          <ShopAppuntamenti_ad
            view={view}
            setView={setView}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            filterBarber={filterBarber}
            setFilterBarber={setFilterBarber}
            filterService={filterService}
            setFilterService={setFilterService}
            search={search}
            setSearch={setSearch}
            listScope={listScope}
            setListScope={setListScope}
            resetFilters={resetFilters}
            filteredBookings={filteredBookings}
            isDeleting={isDeleting}
            handleDelete={handleDelete}
            barbers={barbers}
            services={shopDetails?.services || []}
            businessType={businessType}
            onRefresh={refreshBookings}
          />
        )}

        {activeTab === "shifts" && selectedBarber && (
          <ShopTeam_ad
            barbers={barbers}
            selectedBarber={selectedBarber}
            handleSelectBarber={handleSelectBarber}
            draftShifts={draftShifts}
            handleRemoveShift={handleRemoveShift}
            newShiftInputs={newShiftInputs}
            setNewShiftInputs={setNewShiftInputs}
            handleAddShift={handleAddShift}
            handleSaveShifts={handleSaveShifts}
            isSavingShifts={isSavingShifts}
          />
        )}

        {activeTab === "shop" && shopDetails && (
          <ShopNegozio_ad
            shopDetails={shopDetails}
            shopForm={shopForm}
            setShopForm={setShopForm}
            handleSaveShopInfo={handleSaveShopInfo}
            handleOpeningHoursChange={handleOpeningHoursChange}
            newBarberForm={newBarberForm}
            setNewBarberForm={setNewBarberForm}
            handleAddBarber={handleAddBarber}
            handleUpdateBarber={handleUpdateBarber}
            handleDeleteBarber={handleDeleteBarber}
            barbers={barbers}
            newServiceForm={newServiceForm}
            setNewServiceForm={setNewServiceForm}
            handleAddService={handleAddService}
            handleDeleteService={handleDeleteService}
            handleUpdateService={handleUpdateService}
            newProductForm={newProductForm}
            setNewProductForm={setNewProductForm}
            handleAddProduct={handleAddProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleUpdateProduct={handleUpdateProduct}
          />
        )}

      </div>

      <AdminDialog dialog={dialog} onClose={closeDialog} />
    </div>
  );
}