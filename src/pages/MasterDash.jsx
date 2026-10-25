import React, { useState, useEffect } from "react";
import {
  getMasterToken, saveMasterToken, clearMasterToken, masterLogin,
  masterGetShops, masterCreateShop, masterUpdateShop, masterDeleteShop,
  masterSetPassword, masterGetAdminToken, masterUploadImage
} from "../api";

import MasterLogin from "../components_master/MasterLogin.jsx";
import MasterNegozi from "../components_master/MasterNegozi.jsx";
import MasterNegozioForm from "../components_master/MasterNegozioForm.jsx";
import MasterAzioni from "../components_master/MasterAzioni.jsx";

// Testo d'errore leggibile da una risposta del backend ("detail" è testo, oppure la lista di errori di Pydantic)
function errorText(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) return detail.map((d) => d.msg).join(" · ");
  return fallback;
}

export default function MasterDash() {
  // Il token master vive in sessionStorage (vedi api.js): se c'è già, si parte autenticati
  const [isAuthenticated, setIsAuthenticated] = useState(() => getMasterToken() !== "");
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Scheda aperta a destra: null = nessuna, "new" = nuovo negozio, numero = id del negozio
  const [selectedId, setSelectedId] = useState(null);

  // Messaggio temporaneo in basso: { type: "success" | "error", text }
  const [toast, setToast] = useState(null);
  const showToast = (type, text) => setToast({ type, text });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const logout = () => {
    clearMasterToken();
    setShops([]);
    setSelectedId(null);
    setIsAuthenticated(false);
  };

  // Se il server risponde 401 la sessione è scaduta o non vale più: si torna alla schermata di login
  const handleError = (err, fallback) => {
    if (err?.response?.status === 401) {
      logout();
      return;
    }
    showToast("error", errorText(err, fallback));
  };

  async function loadShops() {
    setIsLoading(true);
    try {
      setShops(await masterGetShops());
    } catch (err) {
      handleError(err, "Impossibile caricare i negozi.");
    } finally {
      setIsLoading(false);
    }
  }

  // Al primo caricamento: se il token è già salvato, carica l'elenco
  useEffect(() => {
    if (isAuthenticated) loadShops();
  }, []);

  // Login: username fisso + MASTER_KEY. Ottenuto il token si carica subito l'elenco.
  // Ritorna il messaggio d'errore, o null se è andata bene.
  const handleLogin = async (username, password) => {
    try {
      const { access_token } = await masterLogin(username, password);
      saveMasterToken(access_token);
      setShops(await masterGetShops());
      setIsAuthenticated(true);
      return null;
    } catch (err) {
      clearMasterToken();
      return err?.response?.status === 401
        ? "Username o password errati."
        : errorText(err, "Impossibile contattare il server.");
    }
  };

  // Inserisce o sostituisce un negozio nell'elenco (sempre in ordine di id)
  const upsertShop = (shop) =>
    setShops((prev) => [...prev.filter((s) => s.id !== shop.id), shop].sort((a, b) => a.id - b.id));

  // Crea (selectedId === "new") oppure modifica il negozio aperto. Ritorna true se è andata a buon fine.
  const handleSave = async (payload) => {
    try {
      if (selectedId === "new") {
        const created = await masterCreateShop(payload);
        upsertShop(created);
        setSelectedId(created.id);
        showToast("success", "Negozio creato.");
      } else {
        const updated = await masterUpdateShop(selectedId, payload);
        upsertShop(updated);
        showToast("success", "Modifiche salvate.");
      }
      return true;
    } catch (err) {
      handleError(err, "Salvataggio non riuscito.");
      return false;
    }
  };

  const handleDelete = async (shop) => {
    try {
      await masterDeleteShop(shop.id);
      setShops((prev) => prev.filter((s) => s.id !== shop.id));
      setSelectedId(null);
      showToast("success", `Negozio «${shop.name}» eliminato.`);
      return true;
    } catch (err) {
      handleError(err, "Eliminazione non riuscita.");
      return false;
    }
  };

  const handleSetPassword = async (shop, password) => {
    try {
      await masterSetPassword(shop.id, password);
      upsertShop({ ...shop, has_password: true });
      showToast("success", "Password aggiornata.");
      return true;
    } catch (err) {
      handleError(err, "Impossibile impostare la password.");
      return false;
    }
  };

  // Entra nel gestionale del negozio: chiede un token al backend, lo salva dove lo cerca AdminDash
  // (stesse chiavi di localStorage) e apre /admin in una nuova scheda.
  // La scheda si apre SUBITO (durante il click) e viene indirizzata dopo: altrimenti il browser può bloccarla.
  const handleOpenAdmin = async (shop) => {
    const win = window.open("about:blank", "_blank");
    try {
      const { access_token, slug } = await masterGetAdminToken(shop.id);
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_shop_slug", slug);
      localStorage.setItem("admin_business_type", shop.business_type || "barber"); // colori giusti già dalla schermata di caricamento
      if (win) {
        win.location.href = "/admin";
      } else {
        showToast("error", "Il browser ha bloccato la nuova scheda: consenti i popup per questo sito e riprova.");
      }
    } catch (err) {
      if (win) win.close();
      handleError(err, "Impossibile aprire l'admin del negozio.");
    }
  };

  const handleUploadImage = async (file) => {
    try {
      const { url } = await masterUploadImage(file);
      return url;
    } catch (err) {
      handleError(err, "Caricamento dell'immagine non riuscito.");
      return null;
    }
  };

  // ===============================================
  // RENDER
  // ===============================================
  if (!isAuthenticated) {
    return <MasterLogin onSubmit={handleLogin} />;
  }

  const selectedShop = typeof selectedId === "number" ? shops.find((s) => s.id === selectedId) || null : null;
  const showForm = selectedId === "new" || selectedShop !== null;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-page font-sans">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-fg font-heading">Master</h1>
            <p className="mt-1 font-medium text-fg-muted">Tutti i negozi della piattaforma.</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-bold text-red-600 transition-colors border border-red-200 rounded-xl hover:bg-red-50"
          >
            Esci
          </button>
        </div>

        {/* Da telefono si vede o l'elenco o la scheda; da computer sempre affiancati */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className={`md:col-span-5 ${showForm ? "hidden md:block" : ""}`}>
            <MasterNegozi
              shops={shops}
              isLoading={isLoading}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onNew={() => setSelectedId("new")}
              onOpenAdmin={handleOpenAdmin}
            />
          </div>

          <div className={`md:col-span-7 ${showForm ? "" : "hidden md:block"}`}>
            {showForm ? (
              <>
                <MasterNegozioForm
                  key={`scheda-${selectedId}`}
                  shop={selectedShop}
                  onSave={handleSave}
                  onClose={() => setSelectedId(null)}
                  onUpload={handleUploadImage}
                />
                {selectedShop && (
                  <MasterAzioni
                    key={`azioni-${selectedShop.id}`}
                    shop={selectedShop}
                    onOpenAdmin={() => handleOpenAdmin(selectedShop)}
                    onSetPassword={(password) => handleSetPassword(selectedShop, password)}
                    onDelete={() => handleDelete(selectedShop)}
                  />
                )}
              </>
            ) : (
              <div className="p-10 text-sm font-medium text-center border border-dashed rounded-2xl border-line-strong text-fg-muted">
                Seleziona un negozio dall'elenco oppure creane uno nuovo.
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed z-[80] px-4 py-3 text-sm font-bold text-white -translate-x-1/2 shadow-lg bottom-6 left-1/2 rounded-xl max-w-[90vw] ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}