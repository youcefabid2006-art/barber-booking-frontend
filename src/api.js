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

// ==========================================
// ROTTE PUBBLICHE (VETRINA E PRENOTAZIONI) - NESSUN TOKEN RICHIESTO
// ==========================================

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
  if (data && data.id) {
    const savedIds = JSON.parse(localStorage.getItem("my_booking_ids") || "[]");
    if (!savedIds.includes(data.id)) {
      savedIds.push(data.id);
      localStorage.setItem("my_booking_ids", JSON.stringify(savedIds));
    }
  }
  return data;
}

export async function getUserBookings(shopId) {
  const savedIds = JSON.parse(localStorage.getItem("my_booking_ids") || "[]");
  if (!savedIds.length) return [];
  const { data } = await axios.get(`${API_BASE}/shops/${shopId}/my-bookings?ids=${savedIds.join(",")}`);
  return data;
}

export async function getAvailability(shopId, serviceId, date, barberId = null) {
  // Costruiamo l'URL base con i parametri obbligatori
  let url = `${API_BASE}/availability?shop_id=${shopId}&service_id=${serviceId}&date=${date}`;
 
  // Se è stato scelto un barbiere specifico, aggiungiamo il parametro
  if (barberId && barberId !== "any") {
    url += `&barber_id=${barberId}`;
  }

  const { data } = await axios.get(url);
  return data; // Ritorna l'array di orari (es. ["10:00", "10:30"])
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