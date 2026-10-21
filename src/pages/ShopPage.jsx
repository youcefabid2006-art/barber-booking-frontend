import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopBySlug } from "../api";
import ShopVetrina from "../components/ShopVetrina";
import ShopServizi from "../components/ShopServizi";
import ShopBooking from "../components/ShopBooking";
import ShopDettagli from "../components/ShopDettagli";

// Font dei saloni di bellezza (Cormorant Garamond + Jost): si caricano SOLO per i negozi "beauty",
// così le pagine dei barbieri non scaricano nulla in più.
const BEAUTY_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap";

// Tema "ricordato" di ogni negozio: serve solo perché lo skeleton di caricamento abbia subito i colori
// giusti (barber / beauty) invece di partire in stile barber e cambiare dopo (con il cold start di Render
// può durare a lungo). Una chiave PER SLUG, e non una sola chiave globale, perché dallo stesso telefono
// si possono aprire negozi di tipo diverso. Il valore vero arriva sempre dal negozio appena caricato.
const THEME_CACHE_PREFIX = "shop_theme:";

function readCachedTheme(slug) {
  if (!slug) return null;
  try {
    return localStorage.getItem(THEME_CACHE_PREFIX + slug) || null;
  } catch (e) {
    return null;
  }
}

function writeCachedTheme(slug, theme) {
  try {
    localStorage.setItem(THEME_CACHE_PREFIX + slug, theme);
  } catch (e) {
    // localStorage non disponibile (es. navigazione privata): si ignora, resta il comportamento di prima
  }
}

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
        if (!cancelled) {
          setShop(data);
          // Ricordiamo il tema di questo slug per la prossima visita (serve allo skeleton)
          if (data) writeCachedTheme(slug, data.business_type || "barber");
        }
      } catch (err) {
        if (!cancelled) setError("Erreur de connexion ou salon introuvable");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadShop();
    return () => { cancelled = true; };
  }, [slug]);

  // TEMA GRAFICO: "barber" (default) o "beauty", in base a shop.business_type.
  // Lo mettiamo su <html> così vale anche per popup e overlay; quando si lascia la pagina
  // (es. si va su /admin) l'attributo viene tolto e tornano i colori di default.
  // Finché il negozio non è arrivato si usa l'ultimo tema ricordato per questo slug, così anche lo skeleton
  // ha i colori giusti; alla prima visita (nessun tema ricordato) non si imposta nulla, come prima.
  const theme = shop ? (shop.business_type || "barber") : readCachedTheme(slug);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.dataset.theme = theme;

    let fontLink = null;
    if (theme === "beauty") {
      fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = BEAUTY_FONTS_URL;
      document.head.appendChild(fontLink);
    }

    return () => {
      delete document.documentElement.dataset.theme;
      if (fontLink) fontLink.remove();
    };
  }, [theme]);

  // SKELETON LOADER CON LA DIVISIONE NETTA COME HAI CHIESTO
  if (isLoading) {
    return (
      <div className="min-h-screen bg-page animate-pulse pb-20">
       
        {/* SKELETON VETRINA (Immagine + Testo sotto) */}
        <div className="bg-white pb-6 shadow-sm rounded-b-3xl overflow-hidden">
          {/* Finta Immagine Netta */}
          <div className="h-64 md:h-[400px] bg-line-strong w-full"></div>
         
          {/* Finto Box info negozio (staccato dall'immagine) */}
          <div className="max-w-3xl px-4 py-6 mx-auto md:px-8">
            <div className="h-8 bg-line-strong rounded-xl w-3/4 mb-4"></div> {/* Titolo */}
            <div className="h-4 bg-line-strong rounded-md w-1/2 mb-6"></div> {/* Indirizzo */}
            <div className="h-14 bg-grad-end rounded-xl w-full"></div> {/* Bottone Dettagli Nero */}
          </div>
        </div>
       
        {/* SKELETON LISTA SERVIZI */}
        <main className="max-w-3xl px-4 mx-auto mt-6 md:px-8">
          <div className="h-6 bg-fg-ghost rounded-lg w-40 mb-4"></div>
         
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-line flex justify-between items-center">
                <div className="flex-1 pr-4">
                  <div className="h-5 bg-line-strong rounded-lg w-3/4 mb-2"></div>
                  <div className="h-4 bg-line rounded-md w-1/2 mb-4"></div>
                  <div className="h-4 bg-line rounded-md w-20"></div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="h-5 bg-line-strong rounded-lg w-16"></div>
                  <div className="h-10 w-24 bg-grad-end rounded-xl"></div> {/* Finto bottone prenota nero */}
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-page px-4 text-center">
        <span className="mb-4 text-4xl">🔌</span>
        <h2 className="mb-2 text-xl font-bold text-fg">Oups, une erreur est survenue</h2>
        <p className="text-fg-muted">{error}</p>
      </div>
    );
  }

  // CONTENUTO REALE
  return (
    <div className="min-h-screen font-sans bg-page text-fg pb-20">
     
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