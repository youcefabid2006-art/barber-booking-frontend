import { useState } from "react";
import {
  updateShopDetails, createService, updateService, deleteService, createBarber,
  updateBarber, deleteBarber,
  createProduct, updateProduct, deleteProduct // NUOVO: prodotti della Boutique
} from "../api";

// ===== LOGICA DELLA TAB "Salon et Services" DEL GESTIONALE =====
// Tiene i dati del negozio, i moduli di inserimento (nuovo servizio / prodotto / collaboratore)
// e tutte le azioni: salvare le informazioni, aggiungere / modificare / eliminare servizi, prodotti e collaboratori.
// Lo stato vive in AdminDash (qui dentro c'è solo il codice): cambiando tab i moduli compilati a metà restano.
// Dati e moduli li riempie / li ricarica loadDashboardData di AdminDash tramite setShopDetails e setShopForm.
// "reload" è loadDashboardData di AdminDash: ricarica tutti i dati dopo ogni modifica.
export default function useNegozioAdmin({ notify, askConfirm, askText, reload }) {
  // Stati Negozio
  const [shopDetails, setShopDetails] = useState(null);
  // Id del negozio loggato: si ricava dal negozio caricato tramite slug (disponibile dopo loadDashboardData)
  const activeShopId = shopDetails?.id;
  const [shopForm, setShopForm] = useState({
    name: "", slug: "", description: "", address: "", phone: "", opening_hours: {}
  });
  const [newServiceForm, setNewServiceForm] = useState({
    name: "", description: "", duration_minutes: 30, price: 0, category: ""
  });
  // NUOVO: modulo "Nouveau produit" (il prezzo resta testo finché non si salva, poi viene convertito in numero)
  const [newProductForm, setNewProductForm] = useState({
    name: "", description: "", price: "", category: "", image_url: ""
  });
  const [newBarberForm, setNewBarberForm] = useState({ name: "" });

  const handleSaveShopInfo = async (e) => {
    e.preventDefault();
    try {
      await updateShopDetails(activeShopId, shopForm);
      await notify("success", "Informations du salon mises à jour avec succès !");
      await reload();
    } catch (err) {
      await notify("error", "Erreur lors de la mise à jour du salon.");
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await createService(activeShopId, { ...newServiceForm, shop_id: activeShopId });
      await notify("success", "Service ajouté avec succès !");
      setNewServiceForm({ name: "", description: "", duration_minutes: 30, price: 0, category: "" });
      await reload();
    } catch (err) {
      await notify("error", "Erreur lors de l'ajout du service.");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!(await askConfirm("Supprimer le service", "Voulez-vous vraiment supprimer ce service ?", "Supprimer"))) return;
    try {
      await deleteService(serviceId);
      await reload();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de la suppression du service.");
    }
  };

  // Modifica di un servizio (nome, descrizione, durata, prezzo). Ritorna true se è andata a buon fine.
  const handleUpdateService = async (serviceId, data) => {
    try {
      await updateService(serviceId, data);
      await reload();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de la modification du service.");
      return false;
    }
  };

  // ===== NUOVO: PRODOTTI DELLA BOUTIQUE (stessa logica dei servizi) =====
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const price = parseFloat(newProductForm.price);
    if (Number.isNaN(price) || price < 0) {
      return notify("error", "Veuillez saisir un prix valide.", "Prix invalide");
    }
    try {
      await createProduct(activeShopId, {
        shop_id: activeShopId,
        name: newProductForm.name.trim(),
        description: newProductForm.description.trim(),
        price,
        category: newProductForm.category.trim(),
        image_url: newProductForm.image_url.trim()
      });
      await notify("success", "Produit ajouté avec succès !");
      setNewProductForm({ name: "", description: "", price: "", category: "", image_url: "" });
      await reload();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de l'ajout du produit.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!(await askConfirm("Supprimer le produit", "Voulez-vous vraiment supprimer ce produit ?", "Supprimer"))) return;
    try {
      await deleteProduct(productId);
      await reload();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de la suppression du produit.");
    }
  };

  // Modifica di un prodotto (nome, descrizione, prezzo, categoria, immagine). Ritorna true se è andata a buon fine.
  const handleUpdateProduct = async (productId, data) => {
    if (Number.isNaN(data.price) || data.price < 0) {
      await notify("error", "Veuillez saisir un prix valide.", "Prix invalide");
      return false;
    }
    try {
      await updateProduct(productId, data);
      await reload();
      return true;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      await notify("error", typeof detail === "string" ? detail : "Erreur lors de la modification du produit.");
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
      await reload();
    } catch (err) {
      await notify("error", "Erreur lors de l'ajout du collaborateur.");
    }
  };

  const handleUpdateBarber = async (barberId, currentName) => {
    const newName = await askText("Modifier le collaborateur", "Saisissez le nouveau nom du collaborateur :", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;
    try {
      await updateBarber(barberId, newName.trim());
      await reload();
    } catch (err) {
      await notify("error", "Erreur lors de la modification du collaborateur.");
    }
  };

  const handleDeleteBarber = async (barberId) => {
    if (!(await askConfirm("Supprimer le collaborateur", "Voulez-vous vraiment supprimer ce collaborateur ?", "Supprimer"))) return;
    try {
      await deleteBarber(barberId);
      await reload();
    } catch (err) {
      await notify("error", "Erreur lors de la suppression du collaborateur.");
    }
  };

  const handleOpeningHoursChange = (dbDay, value) => {
    setShopForm(prev => ({ ...prev, opening_hours: { ...prev.opening_hours, [dbDay]: value } }));
  };

  return {
    shopDetails,
    setShopDetails,
    shopForm,
    setShopForm,
    newServiceForm,
    setNewServiceForm,
    newProductForm,
    setNewProductForm,
    newBarberForm,
    setNewBarberForm,
    handleSaveShopInfo,
    handleAddService,
    handleDeleteService,
    handleUpdateService,
    handleAddProduct,
    handleDeleteProduct,
    handleUpdateProduct,
    handleAddBarber,
    handleUpdateBarber,
    handleDeleteBarber,
    handleOpeningHoursChange
  };
}
