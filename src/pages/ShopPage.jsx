import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopBySlug } from "../api";
import ShopVetrina from "../components/ShopVetrina";
import ShopServizi from "../components/ShopServizi";
import ShopBooking from "../components/ShopBooking";
import ShopDettagli from "../components/ShopDettagli";

export default function ShopPage() {
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadShop() {
      if (!slug) return;
      try {
        const data = await getShopBySlug(slug);
        if (!cancelled) setShop(data);
      } catch (err) {
        if (!cancelled) setError("Erreur de connexion ou salon introuvable");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadShop();
    return () => { cancelled = true; };
  }, [slug]);

  // SKELETON LOADER CON LA DIVISIONE NETTA COME HAI CHIESTO
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] animate-pulse pb-20">
       
        {/* SKELETON VETRINA (Immagine + Testo sotto) */}
        <div className="bg-white pb-6 shadow-sm rounded-b-3xl overflow-hidden">
          {/* Finta Immagine Netta */}
          <div className="h-64 md:h-[400px] bg-slate-200 w-full"></div>
         
          {/* Finto Box info negozio (staccato dall'immagine) */}
          <div className="max-w-3xl px-4 py-6 mx-auto md:px-8">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4 mb-4"></div> {/* Titolo */}
            <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-6"></div> {/* Indirizzo */}
            <div className="h-14 bg-neutral-800 rounded-xl w-full"></div> {/* Bottone Dettagli Nero */}
          </div>
        </div>
       
        {/* SKELETON LISTA SERVIZI */}
        <main className="max-w-3xl px-4 mx-auto mt-6 md:px-8">
          <div className="h-6 bg-slate-300 rounded-lg w-40 mb-4"></div>
         
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div className="flex-1 pr-4">
                  <div className="h-5 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-20"></div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="h-5 bg-slate-200 rounded-lg w-16"></div>
                  <div className="h-10 w-24 bg-neutral-800 rounded-xl"></div> {/* Finto bottone prenota nero */}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Schermata di errore
  if (error || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F2F5] px-4 text-center">
        <span className="mb-4 text-4xl">🔌</span>
        <h2 className="mb-2 text-xl font-bold text-slate-800">Oups, une erreur est survenue</h2>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  // CONTENUTO REALE
  return (
    <div className="min-h-screen font-sans bg-[#F0F2F5] text-slate-900 pb-20">
     
      <ShopVetrina
        shop={shop}
        onOpenDetails={() => setShowDetails(true)}
      />

      <main className="max-w-3xl px-4 mx-auto mt-6 md:px-8">
        <ShopServizi
          services={shop.services}
          onServiceClick={(service) => setSelectedService(service)}
        />
      </main>

      {/* POPUP PRENOTAZIONE */}
      {selectedService && (
        <ShopBooking
          shopId={shop.id}
          service={selectedService}
          barbers={shop.barbers}
          onClose={() => setSelectedService(null)}
        />
      )}

      {/* POPUP DETTAGLI SALONE */}
      {showDetails && (
        <ShopDettagli
          shop={shop}
          onClose={() => setShowDetails(false)}
        />
      )}

    </div>
  );
}