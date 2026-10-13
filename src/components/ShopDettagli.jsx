import React from "react";

export default function ShopDettagli({ shop, onClose }) {
  if (!shop) return null;

  const getInitials = (name) => name.substring(0, 2).toUpperCase();

  // MAPPATURA LINGUA: Dal DB (Inglese neutrale) -> allo Schermo (Italiano)
  // In futuro, potrai creare una mappa simile per l'Arabo/Darija
  const mappaGiorni = [
    { dbKey: "Monday", display: "Lunedì" },
    { dbKey: "Tuesday", display: "Martedì" },
    { dbKey: "Wednesday", display: "Mercoledì" },
    { dbKey: "Thursday", display: "Giovedì" },
    { dbKey: "Friday", display: "Venerdì" },
    { dbKey: "Saturday", display: "Sabato" },
    { dbKey: "Sunday", display: "Domenica" }
  ];

  // Generazione dinamica degli orari dal database
  const orari = mappaGiorni.map(({ dbKey, display }) => {
    // 1. Cerca la chiave in inglese (es. "Monday") nel JSON
    const orarioStringa = shop.opening_hours ? shop.opening_hours[dbKey] : null;
    
    // 2. Capiamo se è chiuso (Accetta "Closed" come standard internazionale, o "Chiuso" per sicurezza)
    // Ripristinati i simboli || (OR) che si erano persi
    const isClosed = !orarioStringa || orarioStringa.toLowerCase().includes("closed") || orarioStringa.toLowerCase().includes("chius");
    
    // 3. Traduciamo la parola "Closed" in "Chiuso" per l'utente finale
    let stringaVisualizzata = orarioStringa;
    if (isClosed) {
      stringaVisualizzata = "Chiuso"; // In futuro qui metterai la variabile di traduzione araba
    }

    return {
      giorno: display, // Mostra "Lunedì" a schermo
      ore: stringaVisualizzata, // Mostra "08:30 - 19:00" o "Chiuso"
      aperto: !isClosed
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white animate-fade-up">
      
      {/* HEADER STICKY CON FRECCIA INDIETRO */}
      <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-neutral-200">
        <button onClick={onClose} className="p-2 mr-2 transition rounded-full text-neutral-600 hover:bg-neutral-100">
          <svg className="w-6 h-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">Dettagli del salone</h2>
      </div>

      <div className="w-full max-w-3xl flex-1 p-5 mx-auto">
        
        {/* INDIRIZZO */}
        <div className="flex items-start justify-between pb-6 mb-8 border-b border-neutral-200">
          {/* Indirizzo diventato cliccabile */}
          <a 
            href={`https://maps.google.com/?q=${shop.address}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-[15px] leading-relaxed text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            {shop.address}<br />
            
          </a>
          <a href={`https://maps.google.com/?q=${shop.address}`} target="_blank" rel="noreferrer" className="text-sm font-bold transition-colors text-neutral-900 hover:text-black hover:underline">
            Mappa
          </a>
        </div>

        {/* RECAPITI (NUOVA SEZIONE) */}
        <div className="pb-6 mb-8 border-b border-neutral-200">
          <h3 className="mb-4 text-lg font-bold text-neutral-900">Recapiti</h3>
          <div className="flex flex-col gap-3 text-[15px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-800">Tel:</span>
              {shop.phone ? (
                <a href={`tel:${shop.phone}`} className="text-neutral-600 transition-colors hover:text-neutral-900 hover:underline">
                  {shop.phone}
                </a>
              ) : (
                <span className="text-neutral-400">Non impostato</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-800">Email:</span>
              <span className="text-neutral-400">Non disponibile</span>
            </div>
          </div>
        </div>

        {/* IL TEAM */}
        <div className="pb-6 mb-8 border-b border-neutral-200">
          <h3 className="mb-6 text-lg font-bold text-neutral-900">Il team</h3>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar">
            {shop.barbers && shop.barbers.map((barber) => (
              <div key={barber.id} className="flex flex-col items-center min-w-[80px]">
                <div className="flex items-center justify-center mb-3 text-2xl font-bold text-white shadow-md w-20 h-20 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700">
                  {getInitials(barber.name)}
                </div>
                <span className="font-bold text-neutral-800">{barber.name}</span>
                <button className="px-5 py-1.5 mt-3 text-sm font-bold transition-colors border-2 rounded-lg border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white">
                  Vedi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ORARI DI APERTURA (Internazionalizzati) */}
        <div className="pb-6 mb-8 border-b border-neutral-200">
          <h3 className="mb-5 text-lg font-bold text-neutral-900">Orari di apertura</h3>
          <div className="flex flex-col gap-3 text-[15px]">
            {orari.map((o, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {o.aperto ? (
                    <div className="w-3.5 h-3.5 bg-neutral-900 rounded-full shadow-sm"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 border-neutral-300 rounded-full"></div>
                  )}
                  <span className={o.aperto ? "font-medium text-neutral-900" : "text-neutral-500"}>{o.giorno}</span>
                </div>
                <span className={o.aperto ? "font-bold text-neutral-900" : "font-medium text-neutral-400"}>{o.ore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DESCRIZIONE */}
        <div className="mb-10">
          <h3 className="mb-4 text-lg font-bold text-neutral-900">Descrizione</h3>
          <p className="text-[15px] leading-relaxed text-justify text-neutral-600 whitespace-pre-wrap">
            {shop.description
              ? shop.description
              : `Benvenuti in ${shop.name}. Il nostro salone nasce dall'idea di portare un'atmosfera intima e rilassante, unendo la tradizione della barberia classica alle tecniche più moderne. Offriamo servizi di eccellenza e trattamenti specifici.`
            }
          </p>
        </div>

      </div>
    </div>
  );
}