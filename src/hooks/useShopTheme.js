import { useEffect } from "react";

// Font dei saloni di bellezza (Cormorant Garamond + Jost): si caricano SOLO per i negozi "beauty",
// così le pagine dei barbieri non scaricano nulla in più.
const BEAUTY_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap";

// TEMA GRAFICO: "barber" (default) o "beauty", in base a shop.business_type.
// Lo mettiamo su <html> (attributo data-theme) così vale anche per popup e overlay; quando si lascia la pagina
// (es. si va su /admin, o si fa il logout) l'attributo viene tolto e tornano i colori di default.
// Se "theme" è vuoto (null) non si imposta nulla.
// Usato sia dalla pagina pubblica (ShopPage) sia dal gestionale (AdminDash): prima la stessa logica era scritta due volte.
export default function useShopTheme(theme) {
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
}
