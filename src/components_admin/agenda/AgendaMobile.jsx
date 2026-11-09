import React, { useMemo, useState } from "react";
import { WEEKDAYS } from "../../constants";
import { useNow } from "./agendaHooks";
import {
  FALLBACK_COLOR,
  addDays,
  formatDayLong,
  formatDayMedium,
  formatTime,
  groupByDate,
  salonParts,
  salonToday,
  startOfWeek,
} from "./agendaUtils";

// ===== AGENDA SU TELEFONO =====
// Sul telefono la griglia a colonne è scomoda: qui Jour e Semaine diventano un elenco cronologico a schede.
// Pensato per chi lavora e dà un'occhiata veloce: chi arriva dopo, a che ora, con chi.
//   - l'orario sta a sinistra, la scheda (colore del collaboratore) a destra; un tocco apre i dettagli
//   - oggi: "En cours" sul cliente attuale, "Prochain" sul successivo, linea con l'ora attuale,
//     e gli appuntamenti già finiti raccolti in una riga (si aprono con un tocco)
//   - gli appuntamenti passati restano visibili ma sbiaditi
// Desktop e tablet non usano questo file: lì resta la griglia (AgendaGrid).

// ---------- Striscia dei giorni (solo vista Jour) ----------
// I 7 giorni della settimana del giorno scelto, con il numero di appuntamenti: si cambia giorno con un tocco.
// La scheda che la contiene e le frecce sono in AgendaMobileBar.
export function AgendaDayStrip({ date, items, setSelectedDate }) {
  const today = salonToday();
  const counts = useMemo(() => groupByDate(items), [items]);
  const monday = startOfWeek(date);

  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEKDAYS.map((name, i) => {
        const day = addDays(monday, i);
        const selected = day === date;
        const count = counts.get(day)?.length || 0;
        return (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDate(day)}
            aria-label={formatDayLong(day)}
            aria-pressed={selected}
            className={`flex flex-col items-center py-2 transition-colors border-2 rounded-xl ${
              selected
                ? "bg-primary border-primary text-white"
                : day === today
                  ? "border-primary text-fg"
                  : "border-transparent text-fg hover:bg-tint-2"
            }`}
          >
            <span className={`text-[11px] font-bold ${selected ? "text-white" : "text-fg-faint"}`}>{name.slice(0, 3)}</span>
            <span className="text-base font-extrabold leading-6">{Number(day.slice(8))}</span>
            <span className={`text-[10px] font-bold leading-4 ${selected ? "text-white" : "text-fg-muted"}`}>
              {count > 0 ? count : "\u00A0"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Una scheda ----------
function Card({ item, color, state, onSelect }) {
  const past = state === "past";
  return (
    <div className="flex gap-3">
      <div className="w-12 pt-3 text-right shrink-0">
        <span className="block text-base font-extrabold leading-5 tabular-nums text-fg">{formatTime(item.startMin)}</span>
        <span className="block text-xs font-medium tabular-nums text-fg-faint">{formatTime(item.endMin)}</span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex-1 min-w-0 p-3 text-left transition-transform border-l-4 shadow-sm rounded-xl active:scale-[0.99]"
        style={{ background: color.bg, borderColor: color.border, color: color.text, opacity: past ? 0.6 : 1 }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-bold leading-5 break-words">{item.clientName}</p>
          {state === "next" && (
            <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded-full shrink-0 bg-primary">Prochain</span>
          )}
          {state === "ongoing" && (
            <span className="px-2 py-0.5 text-[11px] font-bold text-green-700 rounded-full shrink-0 bg-white/80">En cours</span>
          )}
        </div>
        <p className="mt-1 text-sm opacity-80">{item.serviceName}</p>
        <div className="flex items-center justify-between gap-3 mt-2 text-xs font-medium opacity-80">
          <span className="inline-flex items-center min-w-0 gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color.border }} />
            <span className="truncate">{item.barberName || "Indifférent"}</span>
          </span>
          <span className="tabular-nums shrink-0">{item.durMin} min</span>
        </div>
      </button>
    </div>
  );
}

// Linea con l'ora attuale, tra gli appuntamenti già iniziati e quelli che devono ancora iniziare
function NowLine({ minutes }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="w-12 text-xs font-bold text-right text-red-500 tabular-nums shrink-0">{formatTime(minutes)}</span>
      <span className="flex-1 h-px bg-red-500" />
    </div>
  );
}

// ---------- Un giorno ----------
function DayGroup({ dateKey, items, now, today, colors, showHeader, onSelect, onOpenDay }) {
  const [showFinished, setShowFinished] = useState(false);
  const isToday = dateKey === today;
  const sorted = [...items].sort((a, b) => a.startMs - b.startMs || a.barberId - b.barberId);

  // Solo per oggi: raccolgo i finiti in una riga, ma solo se ne restano altri da mostrare
  const finished = isToday ? sorted.filter((it) => it.endMs < now) : [];
  const collapse = finished.length > 0 && finished.length < sorted.length && !showFinished;
  const visible = collapse ? sorted.filter((it) => it.endMs >= now) : sorted;

  const nextId = isToday ? sorted.find((it) => it.startMs > now)?.id : null;
  const stateOf = (it) => {
    if (it.endMs < now) return "past";
    if (it.id === nextId) return "next";
    if (isToday && it.startMs <= now) return "ongoing";
    return "upcoming";
  };

  // La linea dell'ora va prima del primo appuntamento non ancora iniziato, se sopra c'è almeno una scheda
  const lineIndex = isToday ? visible.findIndex((it) => it.startMs > now) : -1;
  const nowMinutes = salonParts(now).minutes;

  return (
    <section>
      {showHeader && (
        <button type="button" onClick={() => onOpenDay(dateKey)} className="flex items-center w-full gap-2 mb-3 text-left">
          <span className="text-lg font-extrabold text-fg font-heading">{formatDayMedium(dateKey)}</span>
          {isToday && <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded-full bg-primary">Aujourd'hui</span>}
          <span className="ml-auto text-xs font-medium text-fg-muted">{items.length} rdv</span>
        </button>
      )}

      <div className="space-y-3">
        {collapse && (
          <button
            type="button"
            onClick={() => setShowFinished(true)}
            className="w-full px-4 py-2 text-sm font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2"
          >
            {finished.length === 1 ? "Voir 1 rendez-vous terminé" : `Voir les ${finished.length} rendez-vous terminés`}
          </button>
        )}

        {visible.map((it, i) => (
          <React.Fragment key={it.id}>
            {lineIndex > 0 && i === lineIndex && <NowLine minutes={nowMinutes} />}
            <Card item={it} color={colors[it.barberId] || FALLBACK_COLOR} state={stateOf(it)} onSelect={onSelect} />
          </React.Fragment>
        ))}

        {isToday && showFinished && finished.length > 0 && finished.length < sorted.length && (
          <button
            type="button"
            onClick={() => setShowFinished(false)}
            className="w-full px-4 py-2 text-sm font-bold transition-colors bg-white border rounded-xl border-line-strong text-fg-2 hover:bg-tint-2"
          >
            Masquer les rendez-vous terminés
          </button>
        )}
      </div>
    </section>
  );
}

// ---------- Elenco ----------
// mode "day": gli appuntamenti del giorno. mode "week": un blocco per ogni giorno della settimana che ha appuntamenti
// (toccando il titolo del giorno si apre la vista Jour). "items" sono già filtrati e limitati al periodo mostrato.
export default function AgendaMobileList({ mode, items, colors, onSelect, onOpenDay }) {
  const now = useNow();
  const today = salonParts(now).dateKey;

  const groups = useMemo(() => {
    const byDay = groupByDate(items);
    return [...byDay.keys()].sort().map((key) => [key, byDay.get(key)]);
  }, [items]);

  // Nessun appuntamento: ci pensa l'avviso di ShopAppuntamenti_ad
  if (groups.length === 0) return null;

  return (
    <div className="space-y-6">
      {groups.map(([key, list]) => (
        <DayGroup
          key={key}
          dateKey={key}
          items={list}
          now={now}
          today={today}
          colors={colors}
          showHeader={mode === "week"}
          onSelect={onSelect}
          onOpenDay={onOpenDay}
        />
      ))}
    </div>
  );
}