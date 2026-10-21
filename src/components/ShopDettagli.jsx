import React from "react";

export default function ShopDettagli({ shop, onClose }) {
  if (!shop) return null;

  const getInitials = (name) => name.substring(0, 2).toUpperCase();

  // MAPPATURA LINGUA: Dal DB (Inglese neutrale) -> allo Schermo (Italiano)
  // In futuro, potrai creare una mappa simile per l'Arabo/Darija
  const mappaGiorni = [
    { dbKey: "Monday", display: "Lundi" },
    { dbKey: "Tuesday", display: "Mardi" },
    { dbKey: "Wednesday", display: "Mercredi" },
    { dbKey: "Thursday", display: "Jeudi" },
    { dbKey: "Friday", display: "Vendredi" },
    { dbKey: "Saturday", display: "Samedi" },
    { dbKey: "Sunday", display: "Dimanche" }
  ];

  // Generazione dinamica degli orari dal database
  const orari = mappaGiorni.map(({ dbKey, display }) => {
    // 1. Cerca la chiave in inglese (es. "Monday") nel JSON
    const orarioStringa = shop.opening_hours ? shop.opening_hours[dbKey] : null;
   
    // 2. Capiamo se è chiuso (Accetta "Closed" come standard internazionale, o "Chiuso" per sicurezza)
    // Ripristinati i simboli || (OR) che si erano persi
    const isClosed = !orarioStringa || orarioStringa.toLowerCase().includes("closed") || orarioStringa.toLowerCase().includes("chius") || orarioStringa.toLowerCase().includes("ferm");
   
    // 3. Traduciamo la parola "Closed" in "Chiuso" per l'utente finale
    let stringaVisualizzata = orarioStringa;
    if (isClosed) {
      stringaVisualizzata = "Fermé"; // In futuro qui metterai la variabile di traduzione araba
    }

    return {
      giorno: display, // Mostra "Lunedì" a schermo
      ore: stringaVisualizzata, // Mostra "08:30 - 19:00" o "Chiuso"
      aperto: !isClosed
    };
  });

  // NUOVO: testo di benvenuto usato solo se il negozio non ha una descrizione.
  // Il testo per i barbieri resta quello di prima; i saloni di bellezza hanno il loro.
  const defaultDescription = shop.business_type === "beauty"
    ? `Bienvenue chez ${shop.name}. Notre institut vous accueille dans une atmosphère douce et raffinée, pensée pour votre bien-être. Nous proposons des soins et des services d'excellence, réalisés avec soin et passion.`
    : `Bienvenue chez ${shop.name}. Notre salon est né de l'idée d'offrir une atmosphère intime et relaxante, alliant la tradition du barbier classique aux techniques les plus modernes. Nous proposons des services d'excellence et des soins spécifiques.`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white animate-fade-up">
     
      {/* HEADER STICKY CON FRECCIA INDIETRO */}
      <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-line-strong">
        <button onClick={onClose} className="p-2 mr-2 transition rounded-full text-fg-2 hover:bg-tint-2">
          <svg className="w-6 h-6 text-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-fg font-heading">Détails du salon</h2>
      </div>

      <div className="w-full max-w-3xl flex-1 p-5 mx-auto">
       
        {/* INDIRIZZO */}
        <div className="flex items-start justify-between pb-6 mb-8 border-b border-line-strong">
          {/* Indirizzo diventato cliccabile */}
          <a
            href={`https://maps.google.com/?q=${shop.address}`}
            target="_blank"
            rel="noreferrer"
            className="text-[15px] leading-relaxed text-fg-2 hover:text-fg transition-colors"
          >
            {shop.address}<br />
           
          </a>
          <a href={`https://maps.google.com/?q=${shop.address}`} target="_blank" rel="noreferrer" className="text-sm font-bold transition-colors text-primary hover:text-primary-hover hover:underline">
            Carte
          </a>
        </div>

{/* RECAPITI (NUOVA SEZIONE) */}
        <div className="pb-6 mb-8 border-b border-line-strong">
          <h3 className="mb-4 text-lg font-bold text-fg font-heading">Coordonnées</h3>
          <div className="flex flex-col gap-3 text-[15px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-fg">Tél :</span>
              {shop.phone ? (
                <a href={`tel:${shop.phone}`} className="text-fg-2 transition-colors hover:text-fg hover:underline">
                  {shop.phone}
                </a>
              ) : (
                <span className="text-fg-faint">Non renseigné</span>
              )}
            </div>
          </div>
        </div>

        {/* IL TEAM */}
        <div className="pb-6 mb-8 border-b border-line-strong">
          <h3 className="mb-6 text-lg font-bold text-fg font-heading">L'équipe</h3>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar">
            {shop.barbers && shop.barbers.map((barber) => (
              <div key={barber.id} className="flex flex-col items-center min-w-[80px]">
                <div className="flex items-center justify-center mb-3 text-2xl font-bold text-white shadow-md w-20 h-20 rounded-full bg-gradient-to-br from-grad-start to-avatar-end">
                  {getInitials(barber.name)}
                </div>
                <span className="font-bold text-fg">{barber.name}</span>
                <button className="px-5 py-1.5 mt-3 text-sm font-bold transition-colors border-2 rounded-lg border-primary text-primary hover:bg-primary hover:text-white">
                  Voir
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ORARI DI APERTURA (Internazionalizzati) */}
        <div className="pb-6 mb-8 border-b border-line-strong">
          <h3 className="mb-5 text-lg font-bold text-fg font-heading">Horaires d'ouverture</h3>
          <div className="flex flex-col gap-3 text-[15px]">
            {orari.map((o, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {o.aperto ? (
                    <div className="w-3.5 h-3.5 bg-primary rounded-full shadow-sm"></div>
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 border-fg-ghost rounded-full"></div>
                  )}
                  <span className={o.aperto ? "font-medium text-fg" : "text-fg-muted"}>{o.giorno}</span>
                </div>
                <span className={o.aperto ? "font-bold text-fg" : "font-medium text-fg-faint"}>{o.ore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DESCRIZIONE */}
        <div className="mb-10">
          <h3 className="mb-4 text-lg font-bold text-fg font-heading">Description</h3>
          <p className="text-[15px] leading-relaxed text-justify text-fg-2 whitespace-pre-wrap">
            {shop.description
              ? shop.description
              : defaultDescription
            }
          </p>
        </div>

      </div>
    </div>
  );
}