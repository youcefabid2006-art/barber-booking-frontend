// ===== FUNZIONI DI SUPPORTO DI ShopBooking =====
// Sono funzioni "pure" (non usano React): ricevono dei dati e restituiscono un risultato.
// Per questo stanno in un file a parte: ShopBooking.jsx resta leggibile e queste si possono provare da sole.

// --- FUNZIONE DI SUPPORTO PER GENERARE I PROSSIMI 14 GIORNI (DINAMICA) ---
// RIPRISTINATA ESATTAMENTE COME NELLA VERSIONE ORIGINALE
export function getNext14Days(barbers = [], selectedBarber = null) {
    const days = [];
    const today = new Date();
   
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
     
      // JS getDay(): 0=Domenica, 1=Lunedì ... 6=Sabato
      // Nostro DB: 0=Lunedì, 1=Martedì ... 6=Domenica
      const jsDay = d.getDay();
      const dbWeekday = jsDay === 0 ? 6 : jsDay - 1;
     
      let isWorkingDay = false;
     
      // Se non ci sono barbieri caricati, per sicurezza mostriamo tutto per non rompere l'UI
      if (!barbers || barbers.length === 0) {
        isWorkingDay = true;
      } else {
        if (selectedBarber && selectedBarber !== "any") {
          // Controlla se il barbiere specifico selezionato ha almeno un turno in questo giorno
          const barber = barbers.find(b => b.id === selectedBarber);
          if (barber && barber.shifts && barber.shifts.some(s => s.weekday === dbWeekday)) {
            isWorkingDay = true;
          }
        } else {
          // "Qualsiasi collaboratore": controlla se ALMENO UN barbiere del team lavora oggi
          isWorkingDay = barbers.some(b => b.shifts && b.shifts.some(s => s.weekday === dbWeekday));
        }
      }
     
      // Aggiungiamo il giorno all'array SOLO se c'è almeno un turno lavorativo
      if (isWorkingDay) {
        days.push({
          fullDate: d.toISOString().split('T')[0],
          dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
          dayNumber: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
        });
      }
    }
    return days;
  }
  
  // Costruisce il payload della prenotazione che si manda a requestOtp (nel campo booking_payload):
  // calcola l'orario di fine sommando la durata del servizio all'orario di inizio.
  // Il formato è quello che si aspetta il backend: chiavi e formato di data/ora non vanno cambiati.
  export function buildBookingPayload({ shopId, service, selectedBarber, selectedDate, selectedTime, clientData }) {
    const [startHour, startMin] = selectedTime.split(":");
    let totalMins = parseInt(startMin) + service.duration_minutes;
    let endHour = parseInt(startHour) + Math.floor(totalMins / 60);
    let endMin = totalMins % 60;
   
    const formattedEndHour = String(endHour).padStart(2, "0");
    const formattedEndMin = String(endMin).padStart(2, "0");
  
    const startDateTimeString = `${selectedDate}T${selectedTime}:00+01:00`;
    const endDateTimeString = `${selectedDate}T${formattedEndHour}:${formattedEndMin}:00+01:00`;
  
    return {
      shop_id: shopId,
      service_id: service.id,
      barber_id: selectedBarber === "any" ? null : selectedBarber,
      start_datetime: startDateTimeString,
      end_datetime: endDateTimeString,
      customer_name: clientData.firstName,
      customer_surname: clientData.lastName,
      customer_phone: clientData.phone,
    };
  }
  
  // Riconosce l'errore 400 del backend "orario non prenotabile" (fuori turno, troppo lungo, occupato, passato)
  export function isSlotUnavailableError(error) {
    const detail = String(error?.response?.data?.detail || "").toLowerCase();
    return error?.response?.status === 400 && detail.includes("time slot");
  }
  
  // NUOVO: il backend, per gli errori di sicurezza (codice sbagliato o scaduto, troppi tentativi,
  // troppe richieste di codice, limiti di prenotazione, telefono non valido), risponde con
  // detail = { code, message } dove message è già in francese e pronto da mostrare al cliente.
  // Restituisce { code, message } oppure null se l'errore è di un altro tipo (es. rete assente).
  export function getApiError(error) {
    const detail = error?.response?.data?.detail;
    if (detail && typeof detail === "object" && typeof detail.message === "string") {
      return { code: detail.code, message: detail.message };
    }
    return null;
  }
  
  // NUOVO (solo estetica): prepara il contenuto del popup elegante del negozio che sostituisce
  // gli alert() nativi del browser. Il testo mostrato al cliente resta quello già pronto in francese
  // inviato dal backend; icona e titolo vengono scelti in base al codice errore (se il codice non
  // è riconosciuto si usa un titolo neutro). "fallback" è il contenuto usato quando l'errore non
  // arriva dal backend (es. rete assente).
  export function getNoticeContent(apiError, fallback) {
    if (!apiError) {
      return { buttonLabel: "J'ai compris", ...fallback };
    }
  
    const code = String(apiError.code || "").toLowerCase();
    let icon = "ℹ️";
    let title = "Action impossible";
    let buttonLabel = "J'ai compris";
  
    if (code === "otp_invalid") {
      icon = "🔐";
      title = "Code incorrect";
      buttonLabel = "Réessayer";
    } else if (code === "phone_name_mismatch") {
      icon = "👤";
      title = "Nom différent";
    } else if (/limit|too_many|blocked|locked|attempt|throttle|cooldown|cap/.test(code)) {
      icon = "⏳";
      title = "Limite atteinte";
    } else if (code.includes("expired")) {
      icon = "⌛";
      title = "Code expiré";
    } else if (code.includes("phone")) {
      icon = "📱";
      title = "Numéro invalide";
    }
  
    return { icon, title, message: apiError.message, buttonLabel };
  }
  