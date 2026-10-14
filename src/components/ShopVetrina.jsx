import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Ci serve per reindirizzare all'AdminDash
import ShopPrenotazioni from "./ShopPrenotazioni";

// Funzione di utility per decodificare il JWT Token nel browser
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function ShopVetrina({ shop, onOpenDetails }) {
  const [showPrenotazioni, setShowPrenotazioni] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const navigate = useNavigate();

  // Controllo di sicurezza: verifichiamo se l'utente è l'admin di QUESTO specifico negozio
  useEffect(() => {
    if (shop && shop.slug) {
      const token = localStorage.getItem("admin_token");
      if (token) {
        const decoded = parseJwt(token);
        // Se il "sub" del token (lo slug salvato) combacia con lo slug del negozio visualizzato
        if (decoded && decoded.sub === shop.slug) {
          setIsAdminAuth(true);
        }
      }
    }
  }, [shop]);

  if (!shop) return null;

  const fallbackImage = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2400&q=80";
  const coverImage = shop.images && shop.images.length > 0 ? shop.images[0] : fallbackImage;

  const formatExternalUrl = (url) => {
    if (!url || url.trim() === "") return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const hasSocials = Boolean(
    (shop.instagram_url && shop.instagram_url.trim() !== "") ||
    (shop.facebook_url && shop.facebook_url.trim() !== "") ||
    (shop.whatsapp_number && shop.whatsapp_number.trim() !== "")
  );

  return (
    <>
      <div className="overflow-hidden bg-white border-b shadow-sm border-slate-200 rounded-b-3xl">
       
        <div className="w-full h-64 md:h-[400px] relative">
          <img
            src={coverImage}
            alt={`Vetrina di ${shop.name}`}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>

        <div className="max-w-3xl px-4 py-6 mx-auto md:px-8">
          <div className="flex flex-col">
           
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight capitalize md:text-4xl text-slate-900">
              {shop.name}
            </h1>

            <div className="flex flex-col gap-3 mb-6">
              <a
                href={`https://maps.google.com/?q=${shop.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors w-fit text-slate-600 hover:text-slate-900"
              >
                <svg className="shrink-0 w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="leading-tight font-medium text-[15px]">
                  {shop.address ? shop.address : "Indirizzo non impostato"}
                </span>
              </a>

<a
                href={shop.phone ? `tel:${shop.phone}` : undefined}
                className={`flex items-center gap-2 transition-colors w-fit ${shop.phone ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 cursor-default'}`}
              >
                <svg className="shrink-0 w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="leading-tight font-medium text-[15px]">
                  {shop.phone ? shop.phone : "Telefono non impostato"}
                </span>
              </a>
            </div>

            {hasSocials && (
              <div className="flex items-center gap-3 mb-6">
               
                {shop.instagram_url && shop.instagram_url.trim() !== "" && (
                  <a
                    href={formatExternalUrl(shop.instagram_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-neutral-900 ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-900 hover:text-white hover:ring-neutral-900 hover:shadow-[0_6px_16px_rgba(15,23,42,0.18)] active:translate-y-0 active:scale-95"
                    title="Instagram"
                  >
                    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                )}

                {shop.facebook_url && shop.facebook_url.trim() !== "" && (
                  <a
                    href={formatExternalUrl(shop.facebook_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-neutral-900 ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-900 hover:text-white hover:ring-neutral-900 hover:shadow-[0_6px_16px_rgba(15,23,42,0.18)] active:translate-y-0 active:scale-95"
                    title="Facebook"
                  >
                    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.8l.2-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                )}

                {shop.whatsapp_number && shop.whatsapp_number.trim() !== "" && (
                  <a
                    href={`https://wa.me/${shop.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-neutral-900 ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-900 hover:text-white hover:ring-neutral-900 hover:shadow-[0_6px_16px_rgba(15,23,42,0.18)] active:translate-y-0 active:scale-95"
                    title="WhatsApp"
                  >
                    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                    </svg>
                  </a>
                )}

              </div>
            )}

<button
              onClick={onOpenDetails}
              className="flex items-center justify-between w-full p-4 transition-all shadow-md rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 active:scale-[0.98] group"
            >
              <span className="font-bold text-white text-[15px]">Visualizza dettagli salone</span>
              <svg className="w-5 h-5 transition-colors text-neutral-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR FISSA */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-safe pt-2">
        <div className="flex items-center justify-around max-w-md px-6 pb-2 mx-auto">
         
          {/* Tasto HOME */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center p-2 transition-colors text-neutral-900"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Home</span>
          </button>

          {/* Tasto PRENOTAZIONI */}
          <button
            onClick={() => setShowPrenotazioni(true)}
            className="flex flex-col items-center justify-center p-2 transition-colors text-slate-400 hover:text-neutral-900 group"
          >
            <svg className="w-6 h-6 mb-1 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide uppercase">Prenotazioni</span>
          </button>

          {/* Tasto IMPOSTAZIONI (Visibile SOLO all'Admin) */}
          {isAdminAuth && (
            <button
              onClick={() => navigate('/admin')}
              className="flex flex-col items-center justify-center p-2 transition-colors text-slate-400 hover:text-neutral-900 group"
            >
              <svg className="w-6 h-6 mb-1 transition-transform group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-bold tracking-wide uppercase">Impostazioni</span>
            </button>
          )}

        </div>
      </div>

      {/* OVERLAY PRENOTAZIONI */}
      {showPrenotazioni && (
        <ShopPrenotazioni shopId={shop.id} onHome={() => setShowPrenotazioni(false)} />
      )}
    </>
  );
}