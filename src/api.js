import axios from "axios";

const API_BASE = import.meta.env.DEV
  ? "http://localhost:8000/api/v1"
  : "https://barber-booking-backend-sxus.onrender.com/api/v1";

// ==========================================
// INTERCETTATORE DI SICUREZZA (AXIOS INTERCEPTOR)
// ==========================================
// Inietta automaticamente il Token JWT in tutte le chiamate Admin
axios.interceptors.request.use(
  (config) => {
    // Applica il token solo se l'URL della chiamata include "/admin/"
    if (config.url && config.url.includes("/admin/")) {
      const token = localStorage.getItem("admin_token");
      if (token) {
        // Formato standard OAuth2: "Bearer <token>"
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// NUOVO: se una rotta admin risponde 401 (token scaduto, o token vecchio dopo un aggiornamento di sicurezza)
// eliminiamo il token e ricarichiamo la pagina: AdminDash non trova più il token e mostra il login.
// Il login stesso è escluso (lì un 401 significa solo "password sbagliata").
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error?.config?.url || "";
    if (error?.response?.status === 401 && url.includes("/admin/") && !url.includes("/admin/login")) {
      localStorage.removeItem("admin_token");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ==========================================
// ROTTE PUBBLICHE (VETRINA E PRENOTAZIONI) - NESSUN TOKEN RICHIESTO
// ==========================================

// Le prenotazioni del cliente si salvano come [{ id, token }]: il token lo genera il server
// alla prenotazione e dimostra che la prenotazione è davvero sua (l'id da solo non basta).
const MY_BOOKINGS_KEY = "my_bookings";

function readMyBookings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MY_BOOKINGS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((b) => b && b.id && b.token) : [];
  } catch (e) {
    return [];
  }
}

export async function getShopBySlug(slug) {
  const { data } = await axios.get(`${API_BASE}/shops/${slug}`);
  return data;
}

export async function requestOtp(payload) {
  const { data } = await axios.post(`${API_BASE}/request-otp`, payload);
  return data;
}

export async function createBooking(phoneNumber, otpCode) {
  // Invia i dati come stringa JSON per matchare la nuova firma di create_booking_with_otp
  const { data } = await axios.post(`${API_BASE}/bookings/`, {
    phone_number: phoneNumber,
    otp_code: otpCode
  });
  if (data && data.id && data.manage_token) {
    const saved = readMyBookings().filter((b) => b.id !== data.id);
    saved.push({ id: data.id, token: data.manage_token });
    localStorage.setItem(MY_BOOKINGS_KEY, JSON.stringify(saved));
  }
  return data;
}

export async function getUserBookings(shopId) {
  // Vecchio formato (solo id, senza token): non è più valido, lo eliminiamo
  localStorage.removeItem("my_booking_ids");

  // Massimo 50 per richiesta (limite del server): prendiamo le più recenti
  const saved = readMyBookings().slice(-50);
  if (!saved.length) return [];
  // POST: i token non finiscono nell'URL (e quindi nemmeno nei log)
  const { data } = await axios.post(`${API_BASE}/shops/${shopId}/my-bookings`, { items: saved });
  return data;
}

// UNICA rotta per gli orari (ha sostituito getAvailability e getAvailabilityDetailed).
// Restituisce anche gli orari NON prenotabili con questo servizio (available: false) per mostrarli sbiaditi.
export async function getAvailability(shopId, serviceId, date, barberId = null) {
  let url = `${API_BASE}/availability?shop_id=${shopId}&service_id=${serviceId}&date=${date}`;

  // Se è stato scelto un barbiere specifico, aggiungiamo il parametro
  if (barberId && barberId !== "any") {
    url += `&barber_id=${barberId}`;
  }

  const { data } = await axios.get(url);
  return data; // Ritorna l'array di orari (es. [{ time: "10:00", available: true }, { time: "16:00", available: false }])
}

// ... il resto di api.js (rotte Admin) rimane esattamente come prima
export async function getAdminBookings(shopId) {
  const { data } = await axios.get(`${API_BASE}/admin/shops/${shopId}/bookings`);
  return data;
}

export async function deleteAdminBooking(appointmentId) {
  try {
    await axios.delete(`${API_BASE}/admin/bookings/${appointmentId}`);
    return true;
  } catch (error) {
    console.error("Errore durante la cancellazione:", error);
    throw error;
  }
}

export async function getAdminBarbers(shopId) {
  const { data } = await axios.get(`${API_BASE}/admin/shops/${shopId}/barbers`);
  return data;
}

export async function updateBarberShifts(barberId, shifts) {
  const { data } = await axios.put(`${API_BASE}/admin/barbers/${barberId}/shifts`, shifts);
  return data;
}

export async function updateShopDetails(shopId, payload) {
  const { data } = await axios.put(`${API_BASE}/admin/shops/${shopId}`, payload);
  return data;
}

export async function createService(shopId, payload) {
  const { data } = await axios.post(`${API_BASE}/admin/shops/${shopId}/services`, payload);
  return data;
}

export async function updateService(serviceId, payload) {
  const { data } = await axios.put(`${API_BASE}/admin/services/${serviceId}`, payload);
  return data;
}

export async function deleteService(serviceId) {
  const { data } = await axios.delete(`${API_BASE}/admin/services/${serviceId}`);
  return data;
}

export async function createBarber(shopId, payload) {
  const { data } = await axios.post(`${API_BASE}/admin/shops/${shopId}/barbers`, payload);
  return data;
}

export async function updateBarber(barberId, name) {
  const { data } = await axios.put(`${API_BASE}/admin/barbers/${barberId}`, { name });
  return data;
}

export async function deleteBarber(barberId) {
  const { data } = await axios.delete(`${API_BASE}/admin/barbers/${barberId}`);
  return data;
}

// ==========================================
// NUOVO: PRODOTTI DELLA BOUTIQUE (rotte Admin: il token lo aggiunge l'intercettatore in cima al file)
// Per ora nessun componente le usa: servono alla gestione del catalogo nella dashboard.
// payload = { name, description, price, category, image_url } (in più shop_id solo per createProduct)
// ==========================================
export async function createProduct(shopId, payload) {
  const { data } = await axios.post(`${API_BASE}/admin/shops/${shopId}/products`, payload);
  return data;
}

export async function updateProduct(productId, payload) {
  const { data } = await axios.put(`${API_BASE}/admin/products/${productId}`, payload);
  return data;
}

export async function deleteProduct(productId) {
  const { data } = await axios.delete(`${API_BASE}/admin/products/${productId}`);
  return data;
}