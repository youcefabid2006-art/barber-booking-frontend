import React, { useState, useEffect } from "react";
import {
  getAdminBookings, deleteAdminBooking, getAdminBarbers, updateBarberShifts,
  getShopBySlug, updateShopDetails, createService, updateService, deleteService, createBarber,
  updateBarber, deleteBarber
} from "../api";

import ShopAppuntamenti_ad from "../components_admin/ShopAppuntamenti_ad.jsx";
import ShopTeam_ad from "../components_admin/ShopTeam_ad.jsx";
import ShopNegozio_ad from "../components_admin/ShopNegozio_ad.jsx";
// IMPORTIAMO LA NUOVA PAGINA DI LOGIN
import ShopLogin_ad from "../components_admin/ShopLogin_ad.jsx";

const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// ===== POPUP NELLO STILE DELLA PAGINA (al posto di alert / confirm / prompt del browser) =====
let dialogSeq = 0;

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
  const iconTone = isSuccess ? "bg-green-50 text-green-600" : (isError || danger) ? "bg-red-50 text-red-500" : "bg-neutral-100 text-neutral-900";

  const cancel = () => onClose(isPrompt ? null : isConfirm ? false : true);

  // Chiusura con il tasto Esc (utile da computer)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cancelBtn = "flex-1 py-3 text-sm font-bold transition-colors rounded-xl text-neutral-700 bg-neutral-100 hover:bg-neutral-200 active:scale-95";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={cancel} />

      <div className="relative w-full max-w-sm p-6 text-center bg-white border shadow-2xl rounded-2xl border-neutral-200">
        <div className={`flex items-center justify-center mx-auto mb-4 rounded-full w-14 h-14 ${iconTone}`}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>

        <h3 className="mb-1 text-lg font-extrabold text-neutral-900">{title}</h3>
        {dialog.message && <p className="text-sm font-medium break-words text-neutral-500">{dialog.message}</p>}

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
              className="w-full px-4 py-2 font-medium text-neutral-900 placeholder-neutral-400 border rounded-xl border-neutral-200 focus:outline-none focus:border-neutral-900"
            />
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={cancel} className={cancelBtn}>Annuler</button>
              <button type="submit" className="flex-1 py-3 text-sm font-bold text-white transition-all rounded-xl bg-neutral-900 hover:bg-black active:scale-95">
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
              className={`flex-1 py-3 text-sm font-bold text-white transition-all rounded-xl active:scale-95 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-neutral-900 hover:bg-black"}`}
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
              className="w-full py-3 text-sm font-bold text-white transition-all rounded-xl bg-neutral-900 hover:bg-black active:scale-95"
            >
              {isSuccess ? "Ok" : "Fermer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DialogHost({ dialog, onClose }) {
  if (!dialog) return null;
  return <DialogCard key={dialog.id} dialog={dialog} onClose={onClose} />;
}

export default function AdminDashboard() {
  // ===== NUOVO STATO DI AUTENTICAZIONE =====
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Slug del negozio che ha fatto il login (= username): arriva dal Login e resta in localStorage insieme al token
  const [shopSlug, setShopSlug] = useState(null);

  const [activeTab, setActiveTab] = useState("bookings");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stati Appuntamenti
  const [bookings, setBookings] = useState([]);
  const todayString = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(todayString);
  const [isDeleting, setIsDeleting] = useState(null);

  // Stati Orari
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [draftShifts, setDraftShifts] = useState([]);
  const [isSavingShifts, setIsSavingShifts] = useState(false);
  const [newShiftInputs, setNewShiftInputs] = useState(
    WEEKDAYS.reduce((acc, _, i) => ({ ...acc, [i]: { start: "", end: "" } }), {})
  );

  // Stati Negozio
  const [shopDetails, setShopDetails] = useState(null);
  // Id del negozio loggato: si ricava dal negozio caricato tramite slug (disponibile dopo loadDashboardData)
  const activeShopId = shopDetails?.id;
  const [shopForm, setShopForm] = useState({
    name: "", slug: "", description: "", address: "", phone: "", opening_hours: {}
  });
  const [newServiceForm, setNewServiceForm] = useState({
    name: "", description: "", duration_minutes: 30, price: 0
  });
  const [newBarberForm, setNewBarberForm] = useState({ name: "" });

  // Popup nello stile della pagina: ritornano una Promise, come alert / confirm / prompt
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

  // --- FUNZIONI DI GESTIONE INVARIATE ---
  const handleDelete = async (appointmentId) => {
    const conferma = await askConfirm("Annuler la réservation", "Êtes-vous sûr de vouloir annuler cette réservation ?", "Oui, annuler", true, "Retour");
    if (!conferma) return;
    setIsDeleting(appointmentId);
    try {
      await deleteAdminBooking(appointmentId);
      setBookings(prev => prev.filter(b => b.id !== appointmentId));
    } catch (err) {
      await notify("error", "Erreur lors de l'annulation.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredBookings = filterDate
    ? bookings.filter(b => b.start_datetime.startsWith(filterDate))
    : bookings;

  const handleSelectBarber = (barber) => {
    setSelectedBarber(barber);
    setDraftShifts(barber.shifts || []);
    setNewShiftInputs(WEEKDAYS.reduce((acc, _, i) => ({ ...acc, [i]: { start: "", end: "" } }), {}));
  };

  const handleAddShift = (weekday) => {
    const { start, end } = newShiftInputs[weekday];
    if (!start || !end) return notify("error", "Veuillez saisir l'heure de début et de fin.", "Horaire manquant");
    if (start >= end) return notify("error", "L'heure de fin doit être postérieure à l'heure de début.", "Horaire invalide");
    const newShift = {
      barber_id: selectedBarber.id,
      weekday: weekday,
      start_time: start.length === 5 ? `${start}:00` : start,
      end_time: end.length === 5 ? `${end}:00` : end,
    };
    setDraftShifts([...draftShifts, newShift]);
    setNewShiftInputs({ ...newShiftInputs, [weekday]: { start: "", end: "" } });
  };

  const handleRemoveShift = (indexToRemove) => {
    setDraftShifts(draftShifts.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveShifts = async () => {
    setIsSavingShifts(true);
    try {
      await updateBarberShifts(selectedBarber.id, draftShifts);
      setIsSavingShifts(false);
      await notify("success", "Horaires mis à jour avec succès !");
      await loadDashboardData();
    } catch (err) {
      setIsSavingShifts(false);
      await notify("error", "Erreur lors de l'enregistrement des horaires.");
    } finally {
      setIsSavingShifts(false);
    }
  };

  const handleSaveShopInfo = async (e) => {
    e.preventDefault();
    try {
      await updateShopDetails(activeShopId, shopForm);
      await notify("success", "Informations du salon mises à jour avec succès !");
      await loadDashboardData();
    } catch (err) {
      await notify("error", "Erreur lors de la mise à jour du salon.");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await createService(activeShopId, { ...newServiceForm, shop_id: activeShopId });
      await notify("success", "Service ajouté avec succès !");
      setNewServiceForm({ name: "", description: "", duration_minutes: 30, price: 0 });
      await loadDashboardData();
    } catch (err) {
      await notify("error", "Erreur lors de l'ajout du service.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!(await askConfirm("Supprimer le service", "Voulez-vous vraiment supprimer ce service ?", "Supprimer"))) return;
    try {
      await deleteService(serviceId);
      await loadDashboardData();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de la suppression du service.");
    }
  };

  // Modifica di un servizio (nome, descrizione, durata, prezzo). Ritorna true se è andata a buon fine.
  const handleUpdateService = async (serviceId, data) => {
    try {
      await updateService(serviceId, data);
      await loadDashboardData();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de la modification du service.");
      return false;
    }
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    if(!newBarberForm.name.trim()) return;
    try {
      await createBarber(activeShopId, { ...newBarberForm, shop_id: activeShopId });
      await notify("success", "Collaborateur ajouté avec succès !");
      setNewBarberForm({ name: "" });
      await loadDashboardData();
    } catch (err) {
      await notify("error", "Erreur lors de l'ajout du collaborateur.");
    }
  };

  const handleUpdateBarber = async (barberId, currentName) => {
    const newName = await askText("Modifier le collaborateur", "Saisissez le nouveau nom du collaborateur :", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;
    try {
      await updateBarber(barberId, newName.trim());
      await loadDashboardData();
    } catch (err) {
      await notify("error", "Erreur lors de la modification du collaborateur.");
    }
  };

  const handleDeleteBarber = async (barberId) => {
    if (!(await askConfirm("Supprimer le collaborateur", "Voulez-vous vraiment supprimer ce collaborateur ?", "Supprimer"))) return;
    try {
      await deleteBarber(barberId);
      await loadDashboardData();
    } catch (err) {
      await notify("error", "Erreur lors de la suppression du collaborateur.");
    }
  };

  const handleOpeningHoursChange = (dbDay, value) => {
    setShopForm(prev => ({ ...prev, opening_hours: { ...prev.opening_hours, [dbDay]: value } }));
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
    return <div className="flex items-center justify-center min-h-screen font-medium bg-[#F0F2F5] text-neutral-500">Chargement du panneau d'administration...</div>;
  }

  // 3. Se c'è un errore fatale nel caricamento dati
  if (error) {
    return <div className="flex items-center justify-center min-h-screen font-bold bg-[#F0F2F5] text-red-500">{error}</div>;
  }

  // 4. Renderizzazione normale della Dashboard
  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#F0F2F5] font-sans">
      <div className="max-w-6xl mx-auto">
       
        {/* Intestazione e Tasto Logout */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Tableau de bord du salon</h1>
            <p className="mt-1 font-medium text-neutral-500">Gérez les rendez-vous, votre équipe et les informations publiques.</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_shop_slug");
              // Svuota i dati del negozio: se poi entra un altro negozio non deve vedere quelli del precedente
              setShopSlug(null);
              setShopDetails(null);
              setBookings([]);
              setBarbers([]);
              setSelectedBarber(null);
              setDraftShifts([]);
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 text-sm font-bold text-red-600 transition-colors border border-red-200 rounded-xl hover:bg-red-50"
          >
            Se déconnecter
          </button>
        </div>

        <div className="flex gap-6 mb-8 overflow-x-auto border-b border-neutral-200 hide-scrollbar">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'bookings' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            Rendez-vous
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'shifts' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            Horaires de l'équipe
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'shop' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            Salon et Services
          </button>
        </div>
       
        {activeTab === "bookings" && (
          <ShopAppuntamenti_ad
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            filteredBookings={filteredBookings}
            isDeleting={isDeleting}
            handleDelete={handleDelete}
            services={shopDetails?.services || []}
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
          />
        )}

      </div>

      <DialogHost dialog={dialog} onClose={closeDialog} />
    </div>
  );
}