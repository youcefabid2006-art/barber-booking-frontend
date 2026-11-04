// ===== FUNZIONI DI SUPPORTO DELL'AGENDA =====
// Solo calcoli (date, orari, sovrapposizioni, colori): nessun React qui dentro.
// Date e orari si leggono SEMPRE nel fuso del salone (Africa/Algiers: lo stesso che il gestionale già usava
// per mostrare le ore e che usa il motore degli slot nel backend).
// Una "data" è una stringa "YYYY-MM-DD" (la chiamiamo dateKey).
// Un orario è espresso in "minuti dalla mezzanotte" (es. 09:30 = 570).

export const SALON_TZ = "Africa/Algiers";
export const DAY_MINUTES = 24 * 60;

// ---------- Fuso orario del salone ----------

// hourCycle "h23" evita il famoso "24:00" a mezzanotte
const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SALON_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// Data (dateKey) e minuti dalla mezzanotte di un istante, letti nel fuso del salone
export function salonParts(input) {
  const date = input instanceof Date ? input : new Date(input);
  const p = {};
  for (const part of partsFormatter.formatToParts(date)) p[part.type] = part.value;
  return { dateKey: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

// Oggi, nel fuso del salone (prima si usava toISOString(), che è UTC: tra mezzanotte e l'1 del mattino sbagliava giorno)
export const salonToday = () => salonParts(new Date()).dateKey;

// ---------- Calcoli sulle date (dateKey "YYYY-MM-DD") ----------
// Si lavora sempre a mezzogiorno UTC: così nessun cambio d'ora del browser può spostare il giorno.

const toUtcNoon = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

const fromUtcDate = (d) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

export function addDays(key, n) {
  const d = toUtcNoon(key);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUtcDate(d);
}

// Aggiunge mesi tenendo lo stesso giorno (se il mese di arrivo è più corto, si ferma all'ultimo giorno)
export function addMonths(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + n, 1, 12));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0, 12)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return fromUtcDate(target);
}

// 0 = lunedì ... 6 = domenica (come BarberShift.weekday nel database)
export const weekdayIndex = (key) => (toUtcNoon(key).getUTCDay() + 6) % 7;

export const startOfWeek = (key) => addDays(key, -weekdayIndex(key));

// Primo e ultimo giorno del mese a cui appartiene la data
function monthBounds(key) {
  const [y, m] = key.split("-").map(Number);
  const mm = String(m).padStart(2, "0");
  const lastDay = new Date(Date.UTC(y, m, 0, 12)).getUTCDate();
  return { first: `${y}-${mm}-01`, last: `${y}-${mm}-${String(lastDay).padStart(2, "0")}` };
}

// Tutti i giorni da mostrare nella vista mensile: settimane intere (lunedì-domenica) che coprono il mese
export function monthGrid(key) {
  const { first, last } = monthBounds(key);
  const end = addDays(startOfWeek(last), 6);
  const days = [];
  for (let day = startOfWeek(first); day <= end; day = addDays(day, 1)) days.push(day);
  return days;
}

// Si naviga con le frecce: giorno ±1, settimana ±7 giorni, mese ±1 mese
export function shiftDate(key, view, direction) {
  if (view === "week") return addDays(key, 7 * direction);
  if (view === "month") return addMonths(key, direction);
  return addDays(key, direction);
}

// Primo e ultimo giorno (inclusi) del periodo mostrato
export function rangeFor(view, key) {
  if (view === "week") {
    const from = startOfWeek(key);
    return { from, to: addDays(from, 6) };
  }
  if (view === "month") {
    const { first, last } = monthBounds(key);
    return { from: first, to: last };
  }
  return { from: key, to: key };
}

// ---------- Testi ----------

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmt = (options) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...options });
const fmtLong = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtMonthYear = fmt({ month: "long", year: "numeric" });
const fmtDayMonth = fmt({ day: "numeric", month: "short" });
const fmtDay = fmt({ day: "numeric" });
const fmtShort = fmt({ weekday: "short", day: "2-digit", month: "short" });

export const formatDayLong = (key) => capitalize(fmtLong.format(toUtcNoon(key)));

// Come prima nella tabella: "mar. 03 nov."
export const formatDayShort = (key) => fmtShort.format(toUtcNoon(key));

// 570 -> "09:30"
export const formatTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// Titolo della barra di navigazione: "Mardi 3 novembre 2026", "2 – 8 nov. 2026", "Novembre 2026"
export function periodLabel(view, key) {
  if (view === "month") return capitalize(fmtMonthYear.format(toUtcNoon(key)));
  if (view === "week") {
    const { from, to } = rangeFor("week", key);
    const a = toUtcNoon(from);
    const b = toUtcNoon(to);
    const left = a.getUTCMonth() === b.getUTCMonth() ? fmtDay.format(a) : fmtDayMonth.format(a);
    return `${left} – ${fmtDayMonth.format(b)} ${b.getUTCFullYear()}`;
  }
  return formatDayLong(key);
}

export const getInitials = (name) => (name || "?").substring(0, 2).toUpperCase();

// ---------- Prenotazioni -> elementi dell'agenda ----------

// Trasforma una prenotazione del backend in un elemento comodo da disegnare.
// start_datetime / end_datetime arrivano dal server con il fuso (UTC): qui si converte nell'ora del salone.
// La durata è la differenza reale tra fine e inizio (la stessa che il backend ha calcolato dal servizio).
export function toAgendaItem(booking, { serviceName, barberName }) {
  const start = new Date(booking.start_datetime);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(booking.end_datetime);
  const { dateKey, minutes } = salonParts(start);
  const raw = (end.getTime() - start.getTime()) / 60000;
  const durMin = Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 30;
  return {
    id: booking.id,
    dateKey,
    startMin: minutes,
    endMin: Math.min(minutes + durMin, DAY_MINUTES),
    durMin,
    startMs: start.getTime(),
    endMs: start.getTime() + durMin * 60000,
    clientName: `${booking.customer_name || ""} ${booking.customer_surname || ""}`.trim(),
    phone: booking.customer_phone || "",
    serviceName,
    barberId: booking.barber_id,
    barberName,
  };
}

// Filtri membro del team e servizio: condizione AND (un filtro vuoto non esclude nulla)
export function matchesFilters(booking, filterBarber, filterService) {
  if (filterBarber && String(booking.barber_id) !== String(filterBarber)) return false;
  if (filterService && String(booking.service_id) !== String(filterService)) return false;
  return true;
}

// Ricerca per nome / cognome / telefono. Il telefono si confronta solo sulle cifre
// e senza lo zero iniziale, così "0658986532" trova anche "+213658986532".
export function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.clientName.toLowerCase().includes(q)) return true;
  const digits = q.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length > 0 && item.phone.replace(/\D/g, "").includes(digits);
}

// Elenco della vista "Liste": "upcoming" = oggi e giorni successivi, "past" = giorni passati, "all" = tutto.
// Prossimi in ordine crescente, passati dal più recente.
export function listRows(items, scope, query, today) {
  let rows = items;
  if (scope === "upcoming") rows = rows.filter((it) => it.dateKey >= today);
  else if (scope === "past") rows = rows.filter((it) => it.dateKey < today);
  if (query && query.trim()) rows = rows.filter((it) => matchesSearch(it, query));
  return [...rows].sort((a, b) => (scope === "past" ? b.startMs - a.startMs : a.startMs - b.startMs));
}

export function groupByDate(items) {
  const map = new Map();
  for (const it of items) {
    if (!map.has(it.dateKey)) map.set(it.dateKey, []);
    map.get(it.dateKey).push(it);
  }
  return map;
}

// Membri del team da mostrare: se ne è scelto uno si vede solo lui; altrimenti quelli attivi
// (e quelli non più attivi solo se hanno appuntamenti nel periodo mostrato)
export function visibleBarbers(barbers, filterBarber, items) {
  const used = new Set(items.map((it) => it.barberId));
  return barbers.filter((b) => (filterBarber ? String(b.id) === String(filterBarber) : b.is_active || used.has(b.id)));
}

// ---------- Orari di lavoro (turni) ----------

const timeToMinutes = (t) => {
  const [h, m] = String(t).split(":");
  return Number(h) * 60 + Number(m || 0);
};

// Turni di un collaboratore in un giorno della settimana (0 = lunedì): lista di [inizio, fine] in minuti
export function shiftsOfDay(barber, weekday) {
  return (barber.shifts || [])
    .filter((s) => s.weekday === weekday)
    .map((s) => [timeToMinutes(s.start_time), timeToMinutes(s.end_time)])
    .filter(([s, e]) => Number.isFinite(s) && Number.isFinite(e) && e > s);
}

// Parti della giornata FUORI dai turni (da mostrare "spente").
// shifts = null -> non sappiamo gli orari di lavoro, non si spegne nulla.
// shifts = []   -> in quel giorno non si lavora: si spegne tutto.
export function offIntervals(shifts, start, end) {
  if (!shifts) return [];
  const sorted = shifts
    .map(([s, e]) => [Math.max(s, start), Math.min(e, end)])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  const off = [];
  let cursor = start;
  for (const [s, e] of sorted) {
    if (s > cursor) off.push([cursor, s]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < end) off.push([cursor, end]);
  return off;
}

// Fascia oraria della griglia: dall'ora piena prima del primo turno/appuntamento all'ora piena dopo l'ultimo.
// Così nessun appuntamento viene mai tagliato fuori, anche se è fuori dai turni.
export function gridRange(columns, items) {
  let min = Infinity;
  let max = -Infinity;
  for (const col of columns) {
    for (const [s, e] of col.shifts || []) {
      min = Math.min(min, s);
      max = Math.max(max, e);
    }
  }
  for (const it of items) {
    min = Math.min(min, it.startMin);
    max = Math.max(max, it.endMin);
  }
  if (!Number.isFinite(min)) {
    min = 9 * 60;
    max = 19 * 60;
  }
  let startMin = Math.max(0, Math.floor(min / 60) * 60);
  let endMin = Math.min(DAY_MINUTES, Math.ceil(max / 60) * 60);
  if (endMin - startMin < 6 * 60) endMin = Math.min(DAY_MINUTES, startMin + 6 * 60);
  if (endMin - startMin < 6 * 60) startMin = Math.max(0, endMin - 6 * 60);
  return { startMin, endMin };
}

// ---------- Appuntamenti sovrapposti ----------
// Riceve [{ id, start, end }] (minuti) e restituisce una Map id -> { lane, lanes }:
// "lanes" = quante corsie affiancate servono in quel gruppo di appuntamenti che si toccano, "lane" = la corsia dell'appuntamento.
// Due appuntamenti attaccati (uno finisce quando l'altro inizia) NON sono sovrapposti.
export function layoutOverlaps(entries) {
  const sorted = [...entries].sort((a, b) => a.start - b.start || b.end - a.end);
  const result = new Map();
  let cluster = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    const laneEnds = [];
    for (const entry of cluster) {
      let lane = laneEnds.findIndex((end) => end <= entry.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(entry.end);
      } else {
        laneEnds[lane] = entry.end;
      }
      entry.lane = lane;
    }
    for (const entry of cluster) result.set(entry.id, { lane: entry.lane, lanes: laneEnds.length });
    cluster = [];
  };

  for (const entry of sorted) {
    if (cluster.length && entry.start >= clusterEnd) {
      flush();
      clusterEnd = -Infinity;
    }
    cluster.push({ ...entry });
    clusterEnd = Math.max(clusterEnd, entry.end);
  }
  if (cluster.length) flush();
  return result;
}

// ---------- Colori del team ----------
// Ogni collaboratore ha il suo colore (in ordine di id, quindi stabile). La palette segue il tipo di negozio:
// toni caldi e cipriati per i saloni (crema / oro / rosa), toni neutri e spenti per i barbieri (nero / bianco).
// Sono valori fissi qui dentro: index.css non si tocca.
export const FALLBACK_COLOR = { bg: "#f1f5f9", border: "#94a3b8", text: "#334155" };

export const MEMBER_PALETTES = {
  beauty: [
    { bg: "#f6e4e0", border: "#d79a8f", text: "#6b3a33" }, // cipria
    { bg: "#f3e8d0", border: "#b08d57", text: "#5c4520" }, // oro
    { bg: "#e3ead9", border: "#92aa80", text: "#3f5233" }, // salvia
    { bg: "#ece3ef", border: "#b09abf", text: "#4f3b62" }, // glicine
    { bg: "#dfe9ee", border: "#86abc0", text: "#2f5167" }, // azzurro polvere
    { bg: "#f4dfd0", border: "#cf9473", text: "#6a3d24" }, // terracotta
    { bg: "#ebe3da", border: "#a89787", text: "#4d4037" }, // tortora
    { bg: "#e0ece7", border: "#7fb0a0", text: "#2c5649" }, // menta
  ],
  barber: [
    { bg: "#e9ecf1", border: "#334155", text: "#1e293b" }, // ardesia
    { bg: "#ece9e4", border: "#78716c", text: "#292524" }, // pietra
    { bg: "#e2eaf3", border: "#3d5a80", text: "#1e3350" }, // acciaio
    { bg: "#e5ebe6", border: "#5b7260", text: "#233326" }, // salvia scuro
    { bg: "#f0e4e4", border: "#8a4b4b", text: "#4a2222" }, // bordeaux
    { bg: "#efe9d9", border: "#8a7335", text: "#463a14" }, // ottone
    { bg: "#e4e4e7", border: "#52525b", text: "#18181b" }, // zinco
    { bg: "#e3edee", border: "#4a7378", text: "#1d3b3f" }, // petrolio
  ],
};

// Restituisce { [barber_id]: { bg, border, text } }
export function buildMemberColors(barbers, businessType) {
  const palette = MEMBER_PALETTES[businessType] || MEMBER_PALETTES.barber;
  const colors = {};
  [...barbers]
    .sort((a, b) => a.id - b.id)
    .forEach((b, i) => {
      colors[b.id] = palette[i % palette.length];
    });
  return colors;
}