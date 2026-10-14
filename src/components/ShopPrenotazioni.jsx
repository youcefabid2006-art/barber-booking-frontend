import React, { useState, useEffect } from "react";
import { getUserBookings } from "../api";

export default function ShopPrenotazioni({ shopId, onHome }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Caricamento delle prenotazioni all'apertura della scheda
  useEffect(() => {
    async function fetchMyBookings() {
      try {
        setIsLoading(true);
        const data = await getUserBookings(shopId);
        
        // Ordiniamo dalla più recente alla più vecchia per comodità visiva
        const sortedData = data.sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
        setBookings(sortedData);
      } catch (error) {
        console.error("Errore nel caricamento delle prenotazioni:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (shopId) {
      fetchMyBookings();
    }
  }, [shopId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-slate-50 animate-fade-up pb-24">
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-10 flex items-center justify-center p-5 bg-white border-b border-neutral-200 shadow-sm">
        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">Le tue prenotazioni</h2>
      </div>

      {/* CONTENUTO DELLA PAGINA */}
      <div className="flex-1 w-full max-w-xl px-4 py-6 mx-auto">
        
        {isLoading ? (
          // SKELETON LOADER (Effetto caricamento Premium)
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-32 bg-white border border-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          // EMPTY STATE (Nessuna prenotazione)
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <div className="flex items-center justify-center w-24 h-24 mb-6 transition-transform shadow-inner bg-white border border-slate-100 rounded-full hover:scale-105">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">Nessun appuntamento</h3>
            <p className="max-w-xs text-[15px] leading-relaxed text-slate-500">
              Non hai ancora effettuato prenotazioni presso questo salone.
            </p>
          </div>
        ) : (
          // LISTA DELLE PRENOTAZIONI (Layout a Label Rettangolari Arrotondati)
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => {
              const dataObj = new Date(booking.start_datetime);
              const giornoNome = dataObj.toLocaleDateString("it-IT", { weekday: "long", timeZone: "Africa/Algiers" });
              const giornoNumero = dataObj.toLocaleDateString("it-IT", { day: "numeric", month: "long", timeZone: "Africa/Algiers" });
              const ora = dataObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
              
              return (
                <div 
                  key={booking.id} 
                  className="relative flex flex-col p-5 overflow-hidden transition-shadow bg-white border shadow-sm border-slate-200 rounded-2xl hover:shadow-md"
                >
                  {/* Bordo decorativo laterale (Opzionale, dà un tocco di classe) */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-neutral-900"></div>

                  <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-4 ml-2">
                    <div>
                      <p className="text-xs font-bold tracking-wide uppercase text-slate-400 mb-1 capitalize">
                        {giornoNome}, {giornoNumero}
                      </p>
                      <h4 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{ora}</h4>
                    </div>
                    {/* Badge di stato */}
                    <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-green-50 border border-green-100 text-green-600 rounded-lg">
                      Confermato
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 ml-2">
                    
                    {/* Info Cliente (Temporaneo, visibile finché non ci sarà il login personale) */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-wide uppercase text-slate-400">Prenotato a nome di</p>
                        <p className="text-sm font-bold text-slate-800 capitalize">{booking.customer_name} {booking.customer_surname}</p>
                      </div>
                    </div>

                    {/* Info Barbiere */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-wide uppercase text-slate-400">Con chi</p>
                        <p className="text-sm font-bold text-slate-800">
                          {booking.barber ? booking.barber.name : "Qualsiasi collaboratore"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe pt-2">
        <div className="flex items-center justify-around max-w-md px-6 pb-2 mx-auto">
          
          <button 
            onClick={onHome} 
            className="flex flex-col items-center justify-center p-2 transition-colors text-slate-400 hover:text-neutral-900 group"
          >
            <svg className="w-6 h-6 mb-1 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Home</span>
          </button>

          <button 
            className="flex flex-col items-center justify-center p-2 transition-colors text-neutral-900"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Prenotazioni</span>
          </button>

        </div>
      </div>
    </div>
  );
}