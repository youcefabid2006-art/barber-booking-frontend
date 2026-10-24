// Funzioni di utilità condivise dai componenti della Boutique (ShopCatalogo, ShopProdottoDettaglio, ShopPreferiti).
// Qui dentro ci sono solo funzioni normali, nessun componente React.

// Quantità massima di uno stesso prodotto nei preferiti
export const MAX_QTY = 99;

// Prezzo come nel resto del progetto (servizi, gestionale): nessun separatore delle migliaia, 8500 -> "8500"
// (poi il componente aggiunge " DA", numero prima e DA dopo). Al massimo 2 decimali, senza zeri inutili:
// 12500.5 -> "12500.5"; il toFixed evita anche i resti dei calcoli in virgola mobile (es. 0.1 x 3 = 0.30000000000000004).
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Number(n.toFixed(2)));
}

// Per la ricerca: minuscole e senza accenti, così "creme" trova anche "Crème"
export function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Raggruppa i prodotti per categoria (ordine di prima apparizione), come groupByCategory di ShopServizi.
// Il confronto ignora maiuscole e spazi; i prodotti senza categoria vanno in "Autres produits".
export function groupProductsByCategory(products) {
  const groups = [];
  const byKey = new Map();
  products.forEach((product) => {
    const label = (product.category || "").trim() || "Autres produits";
    const key = label.toLowerCase();
    if (!byKey.has(key)) {
      const group = { key, label, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    byKey.get(key).items.push(product);
  });
  return groups;
}

// ==========================================
// PREFERITI (localStorage)
// Formato salvato: { "<id prodotto>": quantità }. Una chiave PER NEGOZIO (id, che non cambia mai:
// lo slug invece il negozio lo può modificare), perché dallo stesso telefono si possono aprire più negozi.
// Non c'è nessun token né hash: i preferiti sono solo una comodità del cliente, non un dato da proteggere.
// ==========================================
const FAVORITES_KEY_PREFIX = "shop_favorites:";

// Legge i preferiti salvati scartando tutto ciò che non è valido o che non esiste più nel catalogo
// (es. un prodotto eliminato dal negozio dopo che il cliente lo aveva messo nei preferiti).
export function readFavorites(shopId, products) {
  const validIds = new Set(products.map((p) => String(p.id)));
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY_PREFIX + shopId) || "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const clean = {};
    Object.entries(raw).forEach(([id, qty]) => {
      const q = Math.floor(Number(qty));
      if (validIds.has(id) && Number.isFinite(q) && q > 0) {
        clean[id] = Math.min(q, MAX_QTY);
      }
    });
    return clean;
  } catch (e) {
    return {};
  }
}

export function writeFavorites(shopId, favorites) {
  try {
    if (Object.keys(favorites).length === 0) {
      localStorage.removeItem(FAVORITES_KEY_PREFIX + shopId);
    } else {
      localStorage.setItem(FAVORITES_KEY_PREFIX + shopId, JSON.stringify(favorites));
    }
  } catch (e) {
    // localStorage non disponibile (es. navigazione privata): i preferiti restano solo finché la pagina è aperta
  }
}