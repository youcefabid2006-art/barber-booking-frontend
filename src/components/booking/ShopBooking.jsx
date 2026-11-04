import React, { useState, useEffect } from "react";
import { createBooking, requestOtp } from "../../api";
import {
  getNext14Days,
  buildBookingPayload,
  isSlotUnavailableError,
  getApiError,
  getNoticeContent
} from "./ShopBookingUtils";
import StepBarbiere from "./StepBarbiere";
import StepOrario from "./StepOrario";
import StepDatiCliente from "./StepDatiCliente";
import StepOtp from "./StepOtp";
import StepConferma from "./StepConferma";
import { UnavailableTimePopup, NoticePopup } from "./BookingPopups";

// ===== IL "REGISTA" DELLA PRENOTAZIONE =====
// Tiene lo step corrente e i dati scelti (collaboratore, giorno, orario, dati cliente, codice OTP)
// e gestisce le due richieste al backend: richiesta del codice OTP (step 3) e conferma (step 4).
// Le singole schermate sono nei file Step*.jsx di questa cartella; i calcoli in ShopBookingUtils.js.
export default function ShopBooking({ shopId, service, barbers, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState(null);
 
  // STATI PER IL CALENDARIO (STEP 2)
  // Generiamo i giorni dinamicamente passando i barbieri
  const availableDays = getNext14Days(barbers, selectedBarber);
 
  const [selectedDate, setSelectedDate] = useState(availableDays[0]?.fullDate || new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  // Orario per cui mostrare il popup "non disponibile" (null = popup chiuso)
  const [unavailableTime, setUnavailableTime] = useState(null);
  // NUOVO: popup elegante per gli avvisi del backend (null = chiuso), al posto degli alert() del browser
  // Forma: { icon, title, message, buttonLabel }
  const [notice, setNotice] = useState(null);
 
  // STATI CLIENTE E OTP (STEP 3 & 4)
  const [clientData, setClientData] = useState({
    firstName: "", lastName: "", phone: ""
  });
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EFFETTO: Auto-Compilazione da LocalStorage all'avvio
  useEffect(() => {
    const savedFirstName = localStorage.getItem("client_firstName");
    const savedLastName = localStorage.getItem("client_lastName");
    const savedPhone = localStorage.getItem("client_phone");
    if (savedFirstName || savedLastName || savedPhone) {
      setClientData({
        firstName: savedFirstName || "",
        lastName: savedLastName || "",
        phone: savedPhone || ""
      });
    }
  }, []);

  if (!service) return null;

  const handleBarberSelect = (barberId) => {
    setSelectedBarber(barberId);
   
    // Ricalcoliamo i giorni per il barbiere scelto, così impostiamo la prima data VERA disponibile
    const specificDays = getNext14Days(barbers, barberId);
    if (specificDays.length > 0) {
      setSelectedDate(specificDays[0].fullDate);
    }
   
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  // STEP 3: Generazione OTP (Invece di salvare subito)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
   
    // Salviamo i dati per la prossima volta (Frizione Zero)
    localStorage.setItem("client_firstName", clientData.firstName);
    localStorage.setItem("client_lastName", clientData.lastName);
    localStorage.setItem("client_phone", clientData.phone);

    // Orari di inizio e fine calcolati in ShopBookingUtils.js
    const bookingPayload = buildBookingPayload({
      shopId,
      service,
      selectedBarber,
      selectedDate,
      selectedTime,
      clientData
    });

    try {
      // Chiamiamo la nuova rotta che salva l'OTP e manda l'SMS fittizio
      const otpResponse = await requestOtp({
        phone_number: clientData.phone,
        booking_payload: bookingPayload
      });
      if (otpResponse && typeof otpResponse.auto_code === "string") {
        // NEGOZIO DEMO: il backend non manda l'SMS e restituisce il codice (solo per i negozi in OTP_AUTO_SHOP_IDS).
        // Mostriamo comunque la schermata di inserimento del codice (step 4), ma con il codice già compilato:
        // il cliente deve solo premere "Confirmer la réservation" (la conferma passa da handleVerifyOtp, come per tutti).
        setOtpCode(otpResponse.auto_code);
        setStep(4);
      } else {
        setStep(4); // Passa alla schermata inserimento OTP
      }
    } catch (error) {
      console.error("Errore generazione OTP:", error);
      if (isSlotUnavailableError(error)) {
        // Orario non prenotabile: popup, e torniamo agli orari (che si ricaricano da soli)
        setUnavailableTime(selectedTime);
        setSelectedTime(null);
        setStep(2);
      } else {
        // NUOVO: se il backend ha un messaggio per il cliente (troppe richieste, numero bloccato,
        // limite di prenotazioni, telefono non valido...) lo mostriamo; si resta sullo step 3
        // così il cliente può correggere i dati.
        // Ora il messaggio compare nel popup elegante del negozio (non più con alert del browser).
        const apiError = getApiError(error);
        setNotice(getNoticeContent(apiError, {
          icon: "📶",
          title: "Problème de connexion",
          message: "Un problème de connexion est survenu. Veuillez réessayer.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 4: Verifica OTP e Salvataggio Reale
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Invia numero e codice. Se FastAPI approva, la prenotazione viene salvata.
      await createBooking(clientData.phone, otpCode);
      setStep(5); // Successo!
    } catch (error) {
      console.error("Errore validazione OTP:", error);
      if (isSlotUnavailableError(error)) {
        // Caso raro: mentre inserivi il codice qualcuno ha preso lo stesso orario
        setUnavailableTime(selectedTime);
        setSelectedTime(null);
        setOtpCode("");
        setStep(2);
      } else {
        // NUOVO: messaggio del backend (es. "Il vous reste 3 tentatives", "Code expiré",
        // "Trop de codes erronés. Réessayez dans 10 minutes.").
        // Solo se il codice è semplicemente sbagliato si resta sullo step 4;
        // negli altri casi (codice scaduto, numero bloccato, limiti) il codice non è più valido
        // e si torna allo step 3.
        // Ora il messaggio compare nel popup elegante del negozio (non più con alert del browser).
        const apiError = getApiError(error);
        setNotice(getNoticeContent(apiError, {
          icon: "🔐",
          title: "Code non valide",
          message: "Le code saisi n'est pas valide ou a expiré. Veuillez réessayer.",
          buttonLabel: "Réessayer",
        }));
        setOtpCode("");
        if (apiError && apiError.code !== "otp_invalid") {
          setStep(3);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity bg-fg/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-[2rem] shadow-2xl h-[85vh] sm:h-[75vh] max-w-2xl mx-auto transform transition-transform duration-300 ease-out animate-fade-up">
       
        {/* HEADER FISSO */}
        <div className="flex flex-col pt-3 pb-4 px-6 border-b border-line shrink-0 bg-white rounded-t-[2rem]">
          <div className="w-12 h-1.5 bg-line-strong rounded-full mx-auto mb-4"></div>
         
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && step < 5 && (
                <button onClick={handleBack} className="p-2 -ml-2 transition-colors rounded-full text-fg-2 hover:bg-tint-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-fg font-heading">{service.name}</h2>
                <p className="text-sm font-bold text-fg-2">{Number(service.price)} DA • {service.duration_minutes} min</p>
              </div>
            </div>
           
            <button onClick={onClose} className="p-2 transition-colors rounded-full text-fg-faint hover:text-fg hover:bg-tint-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* CORPO SCROLLABILE: mostra la schermata dello step corrente */}
        <div className="relative flex-1 pb-6 overflow-y-auto bg-tint">

          {step === 1 && (
            <StepBarbiere barbers={barbers} onSelect={handleBarberSelect} />
          )}

          {step === 2 && (
            <StepOrario
              shopId={shopId}
              service={service}
              selectedBarber={selectedBarber}
              availableDays={availableDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSelectTime={handleTimeSelect}
              onUnavailableClick={setUnavailableTime}
              // NOTA: comportamento originale conservato. Impostare lo stesso step non ricarica gli orari,
              // quindi oggi questo tasto non fa nulla (vedi nota nel riepilogo della ristrutturazione).
              onRetry={() => setStep(step)}
            />
          )}

          {step === 3 && (
            <StepDatiCliente
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              clientData={clientData}
              onInputChange={handleInputChange}
              onSubmit={handleRequestOtp}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 4 && (
            <StepOtp
              otpCode={otpCode}
              onOtpChange={setOtpCode}
              onSubmit={handleVerifyOtp}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 5 && (
            <StepConferma firstName={clientData.firstName} onClose={onClose} />
          )}

        </div>
      </div>

      {unavailableTime && (
        <UnavailableTimePopup
          service={service}
          time={unavailableTime}
          onClose={() => setUnavailableTime(null)}
        />
      )}

      {notice && (
        <NoticePopup notice={notice} onClose={() => setNotice(null)} />
      )}
     
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}
