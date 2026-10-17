import React from "react";

// Aggiungiamo 'onServiceClick' per far comunicare questo componente con la pagina principale
export default function ShopServizi({ services, onServiceClick }) {
  if (!services || services.length === 0) {
    return (
      <div className="p-8 mt-4 text-center bg-white border shadow-sm border-neutral-200 rounded-2xl">
        <span className="block mb-2 text-3xl">✂️</span>
        <span className="font-medium text-neutral-500">Aucun service disponible pour le moment.</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border shadow-sm border-neutral-200 rounded-2xl">
      <div className="p-5 bg-white border-b border-neutral-100">
        <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">Services du salon</h2>
      </div>

      <div className="flex flex-col">
        {services.map((service, index) => (
          <div
            key={service.id}
            onClick={() => onServiceClick(service)}
            className={`p-5 flex justify-between items-center hover:bg-neutral-50 transition-colors cursor-pointer group ${
              index !== services.length - 1 ? 'border-b border-neutral-100' : ''
            }`}
          >
            <div className="flex flex-col flex-1 pr-4 gap-1.5">
              <h3 className="text-base font-bold text-neutral-900">{service.name}</h3>
             
              {/* Se in futuro aggiungi 'description' al Service nel DB, apparirà qui magicamente */}
              {service.description && (
                <p className="text-sm font-medium leading-snug text-neutral-500">
                  {service.description}
                </p>
              )}
             
              <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{service.duration_minutes} min</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-base font-extrabold text-neutral-900">
                {Number(service.price)} DA
              </span>
             
              {/* Bottone elegante "Prenota" al posto della semplice freccetta */}
              <button className="px-4 py-1.5 text-xs font-bold text-neutral-900 transition-colors border-2 rounded-lg border-neutral-200 group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                Réserver
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}