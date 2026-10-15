import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getAdminBookings, deleteAdminBooking, getAdminBarbers, updateBarberShifts,
  getShopBySlug, updateShopDetails, createService, deleteService, createBarber,
  updateBarber, deleteBarber
} from "../api";

import ShopAppuntamenti_ad from "../components_admin/ShopAppuntamenti_ad.jsx";
import ShopTeam_ad from "../components_admin/ShopTeam_ad.jsx";
import ShopNegozio_ad from "../components_admin/ShopNegozio_ad.jsx";
// IMPORTIAMO LA NUOVA PAGINA DI LOGIN
import ShopLogin_ad from "../components_admin/ShopLogin_ad.jsx";

const WEEKDAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

export default function AdminDashboard() {
  const { id } = useParams();
  const activeShopId = id || 1;

  // ===== NUOVO STATO DI AUTENTICAZIONE =====
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const [shopForm, setShopForm] = useState({
    name: "", slug: "", description: "", address: "", phone: "", opening_hours: {}
  });
  const [newServiceForm, setNewServiceForm] = useState({
    name: "", description: "", duration_minutes: 30, price: 0
  });
  const [newBarberForm, setNewBarberForm] = useState({ name: "" });

  // Controllo del Token all'avvio
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsLoading(false); // Se non c'è token, smetti di caricare e mostra il Login
    }
  }, []);

  // Carica i dati SOLO se siamo autenticati
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [activeShopId, isAuthenticated]);

  async function loadDashboardData() {
    setIsLoading(true);
    try {
      const shopData = await getShopBySlug("barberia-picasso");
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
        getAdminBookings(activeShopId),
        getAdminBarbers(activeShopId)
      ]);
      setBookings(bookingsData);
      setBarbers(barbersData);
     
      if (barbersData.length > 0) {
        setSelectedBarber(barbersData[0]);
        setDraftShifts(barbersData[0].shifts || []);
      }
    } catch (err) {
      setError("Errore di connessione al server.");
    } finally {
      setIsLoading(false);
    }
  }

// --- FUNZIONI DI GESTIONE INVARIATE ---
  const handleDelete = async (appointmentId) => {
    const conferma = window.confirm("Sei sicuro di annullare questa prenotazione?");
    if (!conferma) return;
    setIsDeleting(appointmentId);
    try {
      await deleteAdminBooking(appointmentId);
      setBookings(prev => prev.filter(b => b.id !== appointmentId));
    } catch (err) {
      alert("Errore durante la cancellazione.");
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
    if (!start || !end) return alert("Inserisci sia l'orario di inizio che di fine.");
    if (start >= end) return alert("L'orario di fine deve essere successivo all'inizio.");
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
      alert("Orari aggiornati con successo!");
      await loadDashboardData();
    } catch (err) {
      alert("Errore durante il salvataggio degli orari.");
    } finally {
      setIsSavingShifts(false);
    }
  };

  const handleSaveShopInfo = async (e) => {
    e.preventDefault();
    try {
      await updateShopDetails(activeShopId, shopForm);
      alert("Informazioni negozio aggiornate con successo!");
      await loadDashboardData();
    } catch (err) {
      alert("Errore nell'aggiornamento del negozio.");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await createService(activeShopId, { ...newServiceForm, shop_id: activeShopId });
      alert("Servizio aggiunto con successo!");
      setNewServiceForm({ name: "", description: "", duration_minutes: 30, price: 0 });
      await loadDashboardData();
    } catch (err) {
      alert("Errore nell'aggiunta del servizio.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if(!window.confirm("Vuoi davvero eliminare questo servizio?")) return;
    try {
      await deleteService(serviceId);
      await loadDashboardData();
    } catch (err) {
      alert(err?.response?.data?.detail || "Errore durante l'eliminazione del servizio.");
    }
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    if(!newBarberForm.name.trim()) return;
    try {
      await createBarber(activeShopId, { ...newBarberForm, shop_id: activeShopId });
      alert("Collaboratore aggiunto con successo!");
      setNewBarberForm({ name: "" });
      await loadDashboardData();
    } catch (err) {
      alert("Errore nell'aggiunta del collaboratore.");
    }
  };

  const handleUpdateBarber = async (barberId, currentName) => {
    const newName = window.prompt("Inserisci il nuovo nome del collaboratore:", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;
    try {
      await updateBarber(barberId, newName.trim());
      await loadDashboardData();
    } catch (err) {
      alert("Errore durante la modifica del collaboratore.");
    }
  };

  const handleDeleteBarber = async (barberId) => {
    if (!window.confirm("Vuoi davvero eliminare questo collaboratore?")) return;
    try {
      await deleteBarber(barberId);
      await loadDashboardData();
    } catch (err) {
      alert("Errore durante l'eliminazione del collaboratore.");
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
        shopSlug="barberia-picasso"
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

// 2. Se siamo loggati ma i dati stanno caricando
  if (isLoading && bookings.length === 0) {
    return <div className="flex items-center justify-center min-h-screen font-medium bg-[#F0F2F5] text-neutral-500">Caricamento pannello admin...</div>;
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
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Dashboard Salone</h1>
            <p className="mt-1 font-medium text-neutral-500">Gestisci gli appuntamenti, il tuo team e le informazioni pubbliche.</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 text-sm font-bold text-red-600 transition-colors border border-red-200 rounded-xl hover:bg-red-50"
          >
            Esci dall'Account
          </button>
        </div>

        <div className="flex gap-6 mb-8 overflow-x-auto border-b border-neutral-200 hide-scrollbar">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'bookings' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            Appuntamenti
          </button>
          <button
            onClick={() => setActiveTab("shifts")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'shifts' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            Orari Team
          </button>
          <button
            onClick={() => setActiveTab("shop")}
            className={`pb-3 font-bold text-[15px] whitespace-nowrap transition-all border-b-2 ${activeTab === 'shop' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
          >
            Negozio e Servizi
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
          />
        )}

      </div>
    </div>
  );
}