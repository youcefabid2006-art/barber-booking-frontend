import React, { useState, useEffect } from "react";
import { getAvailability, createBooking, requestOtp } from "../api";

// --- FUNZIONE DI SUPPORTO PER GENERARE I PROSSIMI 14 GIORNI (DINAMICA) ---
// RIPRISTINATA ESATTAMENTE COME NELLA VERSIONE ORIGINALE
function getNext14Days(barbers = [], selectedBarber = null) {
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
        dayName: d.toLocaleDateString('it-IT', { weekday: 'short' }),
        dayNumber: d.toLocaleDateString('it-IT', { day: '2-digit' }),
      });
    }
  }
  return days;
}

export default function ShopBooking({ shopId, service, barbers, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState(null);
  
  // STATI PER IL CALENDARIO (STEP 2)
  // Generiamo i giorni dinamicamente passando i barbieri
  const availableDays = getNext14Days(barbers, selectedBarber);
  
  const [selectedDate, setSelectedDate] = useState(availableDays[0]?.fullDate || new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  
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

  // EFFETTO: Carica gli orari quando arrivi allo Step 2 o cambi data
  useEffect(() => {
    if (step === 2) {
      let isMounted = true;
      setFetchError(false);

      async function fetchSlots() {
        setIsLoadingSlots(true);
        try {
          const slots = await getAvailability(shopId, service.id, selectedDate, selectedBarber);
          if (isMounted) {
            setAvailableSlots(slots);
          }
        } catch (error) {
          console.error("Errore nel caricamento orari:", error);
          if (isMounted) {
            setAvailableSlots([]);
            setFetchError(true);
          }
        } finally {
          if (isMounted) setIsLoadingSlots(false);
        }
      }
      
      fetchSlots();
      return () => { isMounted = false; };
    }
  }, [step, selectedDate, selectedBarber, shopId, service.id]);

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

    const [startHour, startMin] = selectedTime.split(":");
    let totalMins = parseInt(startMin) + service.duration_minutes;
    let endHour = parseInt(startHour) + Math.floor(totalMins / 60);
    let endMin = totalMins % 60;
    
    const formattedEndHour = String(endHour).padStart(2, "0");
    const formattedEndMin = String(endMin).padStart(2, "0");

    const startDateTimeString = `${selectedDate}T${selectedTime}:00+01:00`;
    const endDateTimeString = `${selectedDate}T${formattedEndHour}:${formattedEndMin}:00+01:00`;

    const bookingPayload = {
      shop_id: shopId,
      service_id: service.id,
      barber_id: selectedBarber === "any" ? null : selectedBarber,
      start_datetime: startDateTimeString,
      end_datetime: endDateTimeString,
      customer_name: clientData.firstName,
      customer_surname: clientData.lastName,
      customer_phone: clientData.phone,
    };

    try {
      // Chiamiamo la nuova rotta che salva l'OTP e manda l'SMS fittizio
      await requestOtp({
        phone_number: clientData.phone,
        booking_payload: bookingPayload
      });
      setStep(4); // Passa alla schermata inserimento OTP
    } catch (error) {
      console.error("Errore generazione OTP:", error);
      alert("C'è stato un problema di connessione. Riprova.");
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
      alert("Il codice inserito non è valido o è scaduto. Riprova.");
      setOtpCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-[2rem] shadow-2xl h-[85vh] sm:h-[75vh] max-w-2xl mx-auto transform transition-transform duration-300 ease-out animate-fade-up">
        
        {/* HEADER FISSO */}
        <div className="flex flex-col pt-3 pb-4 px-6 border-b border-slate-100 shrink-0 bg-white rounded-t-[2rem]">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && step < 5 && (
                <button onClick={handleBack} className="p-2 -ml-2 transition-colors rounded-full text-slate-600 hover:bg-slate-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{service.name}</h2>
                <p className="text-sm font-bold text-neutral-700">€ {Number(service.price).toFixed(2)} • {service.duration_minutes} min</p>
              </div>
            </div>
            
            <button onClick={onClose} className="p-2 transition-colors rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* CORPO SCROLLABILE */}
        <div className="relative flex-1 pb-6 overflow-y-auto bg-slate-50">
          
          {/* STEP 1: BARBIERE */}
          {step === 1 && (
            <div className="p-6 animate-fade-up">
              <h3 className="mb-5 text-lg font-bold text-slate-800">Con chi vuoi prenotare?</h3>
              <div className="flex flex-col gap-3">
                {/* Controllo aggiunto qui: visibile solo se barbers > 1 */}
                {barbers && barbers.length > 1 && (
                  <button onClick={() => handleBarberSelect("any")} className="flex items-center justify-between p-5 text-left transition-all bg-white border-2 border-slate-100 rounded-2xl hover:border-neutral-900 hover:shadow-md active:scale-[0.98]">
                    <span className="text-lg font-bold text-slate-800">Qualsiasi collaboratore</span>
                    <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full text-neutral-800 bg-neutral-100">Prima disp.</span>
                  </button>
                )}
                {barbers && barbers.map(barber => (
                  <button key={barber.id} onClick={() => handleBarberSelect(barber.id)} className="flex items-center justify-between p-5 text-left transition-all bg-white border-2 border-slate-100 rounded-2xl hover:border-neutral-900 hover:shadow-md active:scale-[0.98]">
                     <span className="text-lg font-bold text-slate-800">{barber.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SCROLLER GIORNI E ORARI */}
          {step === 2 && (
            <div className="flex flex-col h-full animate-fade-up">
              
              <div className="sticky top-0 z-10 pt-2 pb-1 bg-white border-b shadow-sm border-slate-100">
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                  {availableDays.length === 0 ? (
                    <div className="p-3 text-sm font-bold text-slate-500">Nessun giorno lavorativo impostato.</div>
                  ) : (
                    availableDays.map((day) => {
                      const isSelected = day.fullDate === selectedDate;
                      return (
                        <button
                          key={day.fullDate}
                          onClick={() => setSelectedDate(day.fullDate)}
                          className={`flex-none w-[4.5rem] flex flex-col items-center justify-center p-3 rounded-2xl snap-center transition-all duration-200
                            ${isSelected
                              ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-lg shadow-neutral-300 scale-105'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                          <span className={`text-xs font-bold uppercase tracking-wide mb-1 ${isSelected ? 'text-neutral-300' : 'text-slate-400'}`}>
                            {day.dayName}
                          </span>
                          <span className="text-xl font-extrabold leading-none">
                            {day.dayNumber}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Griglia Orari */}
              <div className="p-6">
                <h3 className="mb-4 text-sm font-bold tracking-wider uppercase text-slate-500">Orari disponibili</h3>
                
                {isLoadingSlots ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                ) : fetchError ? (
                  <div className="flex flex-col items-center justify-center px-4 py-8 text-center border-2 border-dashed bg-red-50 rounded-3xl border-red-200">
                    <span className="mb-2 text-3xl">⚠️</span>
                    <span className="mb-1 font-bold text-red-600">Errore di connessione</span>
                    <span className="mb-4 text-sm font-medium text-red-400">Non sono riuscito a caricare gli orari.</span>
                    <button
                      onClick={() => setStep(step)}
                      className="px-6 py-2 font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600 active:scale-95"
                    >
                      Riprova
                    </button>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className="py-4 text-lg font-bold transition-all bg-white border-2 text-slate-700 border-slate-100 rounded-2xl hover:border-neutral-900 hover:text-neutral-900 hover:shadow-md active:scale-[0.97]"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-white border-2 border-dashed rounded-3xl border-slate-200">
                    <span className="mb-3 text-4xl">😴</span>
                    <span className="px-6 font-medium text-center text-slate-500">Nessun orario disponibile per questa data. Prova un altro giorno!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: DATI CLIENTE */}
          {step === 3 && (
            <div className="p-6 animate-fade-up">
              <div className="flex items-center justify-between p-4 mb-6 border bg-neutral-50 border-neutral-200 rounded-2xl">
                <div>
                  <p className="mb-1 text-xs font-bold tracking-wide uppercase text-neutral-500">Stai prenotando per il</p>
                  <p className="text-lg font-extrabold text-neutral-900">
                    {new Date(selectedDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} alle {selectedTime}
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
                <div>
                  <label className="block mb-2 ml-1 text-sm font-bold text-slate-700">Nome</label>
                  <input type="text" name="firstName" required value={clientData.firstName} onChange={handleInputChange} className="w-full px-5 py-4 font-medium transition-all bg-white border-2 border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-neutral-900 placeholder:text-slate-300" placeholder="Il tuo nome" />
                </div>
                <div>
                  <label className="block mb-2 ml-1 text-sm font-bold text-slate-700">Cognome</label>
                  <input type="text" name="lastName" required value={clientData.lastName} onChange={handleInputChange} className="w-full px-5 py-4 font-medium transition-all bg-white border-2 border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-neutral-900 placeholder:text-slate-300" placeholder="Il tuo cognome" />
                </div>
                <div>
                  <label className="block mb-2 ml-1 text-sm font-bold text-slate-700">Telefono</label>
                  <input type="tel" name="phone" required value={clientData.phone} onChange={handleInputChange} className="w-full px-5 py-4 font-medium transition-all bg-white border-2 border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-neutral-900 placeholder:text-slate-300" placeholder="Es. 333 1234567" />
                </div>
                
                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting} className={`w-full py-4 text-lg font-extrabold text-white transition-all shadow-lg rounded-2xl shadow-neutral-300 ${isSubmitting ? 'bg-neutral-400 cursor-not-allowed' : 'bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-[0.98]'}`}>
                    {isSubmitting ? 'Generazione...' : 'Continua'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: VERIFICA OTP */}
          {step === 4 && (
            <div className="p-6 text-center animate-fade-up">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 shadow-inner bg-neutral-100 rounded-full">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="mb-2 text-2xl font-extrabold text-slate-800">Verifica Telefono</h3>
              <p className="mb-8 text-sm font-medium text-slate-500">
                Ti abbiamo inviato un SMS. Inserisci il codice a 6 cifre per confermare.
              </p>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                <div>
                  <input 
                    type="text" 
                    maxLength="6"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Accetta solo numeri
                    className="w-full text-center tracking-[0.5em] text-3xl px-5 py-4 font-bold transition-all bg-white border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-neutral-900 placeholder:text-slate-200" 
                    placeholder="------" 
                  />
                </div>
                <button type="submit" disabled={isSubmitting || otpCode.length < 6} className={`w-full py-4 text-lg font-extrabold text-white transition-all shadow-lg rounded-2xl shadow-neutral-300 ${isSubmitting || otpCode.length < 6 ? 'bg-neutral-300 cursor-not-allowed' : 'bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-[0.98]'}`}>
                  {isSubmitting ? 'Verifica in corso...' : 'Conferma Prenotazione'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 5: SUCCESSO */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center h-full p-8 mt-10 text-center animate-fade-up">
              <div className="flex items-center justify-center w-24 h-24 mb-6 shadow-inner bg-neutral-100 rounded-full">
                <svg className="w-12 h-12 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-3 text-3xl font-extrabold text-slate-800">Prenotato!</h3>
              <p className="mb-10 text-lg font-medium text-slate-500">
                Grazie <span className="text-slate-800">{clientData.firstName}</span>.<br/>Ti aspettiamo in salone!
              </p>
              <button onClick={onClose} className="w-full py-4 text-lg font-extrabold text-white transition-colors bg-neutral-900 rounded-2xl hover:bg-black shadow-xl active:scale-95">
                Chiudi
              </button>
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}