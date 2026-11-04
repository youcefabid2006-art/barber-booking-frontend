import React, { useEffect, useMemo, useRef, useState } from "react";
import { WEEKDAYS } from "../../constants";
import {
  FALLBACK_COLOR,
  addDays,
  formatTime,
  getInitials,
  gridRange,
  layoutOverlaps,
  offIntervals,
  salonParts,
  shiftsOfDay,
  startOfWeek,
  visibleBarbers,
  weekdayIndex,
} from "./agendaUtils";

// ===== GRIGLIA TEMPORALE DELL'AGENDA =====
// Una sola griglia per due viste (cambia solo cosa sono le colonne):
//   mode "day"  -> una colonna per ogni membro del team, con i suoi turni di lavoro
//   mode "week" -> una colonna per ogni giorno della settimana (il colore dei blocchi dice di chi è l'appuntamento)
// Gli appuntamenti sono blocchi posizionati sull'ora di inizio, alti in proporzione alla durata.
// Se due appuntamenti si sovrappongono nella stessa colonna vengono affiancati (mai coperti).
// "items" sono già filtrati (membro / servizio) e limitati al periodo mostrato da ShopAppuntamenti_ad.

const AXIS_WIDTH = 52; // larghezza della colonna con le ore
const PX_PER_HOUR = 72; // altezza di un'ora: 20 minuti = 24px, quindi anche i servizi brevi restano leggibili
const MIN_COL_WIDTH = { day: 150, week: 112 }; // sotto questa larghezza la griglia scorre in orizzontale (telefono)
const MIN_BLOCK_PX = 22; // altezza minima di un blocco (un appuntamento molto breve resta cliccabile)

// Linee delle ore (più marcate) e delle mezze ore (più leggere), disegnate con il colore del tema
const GRID_LINES =
  "linear-gradient(to bottom, var(--th-line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--th-line) 1px, transparent 1px)";
// Fuori dai turni di lavoro: righine diagonali leggere
const OFF_HOURS = {
  background: "repeating-linear-gradient(135deg, var(--th-tint-2) 0 6px, var(--th-line) 6px 7px)",
  opacity: 0.55,
};

// Ora attuale, aggiornata ogni minuto (serve per la linea dell'ora corrente e per sbiadire gli appuntamenti passati)
function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function Block({ item, top, height, lane, lanes, color, isPast, showBarber, onSelect }) {
  // Quante righe di testo ci stanno nel blocco
  const lines = height >= 50 ? 3 : height >= 34 ? 2 : 1;
  const timeRange = `${formatTime(item.startMin)} – ${formatTime(item.endMin)}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      title={`${item.clientName}\n${item.serviceName}\n${timeRange}`}
      className="absolute px-1.5 py-[3px] overflow-hidden text-left transition-shadow border-l-4 rounded-md shadow-sm hover:shadow-md hover:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        top,
        height,
        left: `calc(${(lane * 100) / lanes}% + 1px)`,
        width: `calc(${100 / lanes}% - 3px)`,
        background: color.bg,
        borderColor: color.border,
        color: color.text,
        opacity: isPast ? 0.6 : 1,
      }}
    >
      {lines === 1 ? (
        <p className="truncate text-[11px] leading-[14px]">
          <span className="font-bold tabular-nums">{formatTime(item.startMin)}</span> {item.clientName}
        </p>
      ) : (
        <>
          <p className="truncate text-xs font-bold leading-[15px]">{item.clientName}</p>
          <p className="truncate text-[11px] leading-[14px] opacity-80">{item.serviceName}</p>
          {lines === 3 && (
            <p className="truncate text-[11px] leading-[14px] opacity-70 tabular-nums">
              {timeRange}
              {showBarber && item.barberName ? `, ${item.barberName}` : ""}
            </p>
          )}
        </>
      )}
    </button>
  );
}

export default function AgendaGrid({ mode, date, items, barbers, filterBarber, colors, onSelect, onOpenDay }) {
  const now = useNow();
  const { dateKey: today, minutes: nowMin } = salonParts(now);
  const px = PX_PER_HOUR;
  const minColWidth = MIN_COL_WIDTH[mode];
  const scrollRef = useRef(null);

  // Le colonne: membri del team (giorno) oppure giorni (settimana)
  const columns = useMemo(() => {
    const shown = visibleBarbers(barbers, filterBarber, items);

    if (mode === "week") {
      const monday = startOfWeek(date);
      // Se nessun collaboratore ha turni impostati non sappiamo gli orari di lavoro: non si spegne nulla
      const hasShiftInfo = shown.some((b) => (b.shifts || []).length > 0);
      return Array.from({ length: 7 }, (_, i) => {
        const dateKey = addDays(monday, i);
        return {
          key: dateKey,
          dateKey,
          weekday: i,
          items: items.filter((it) => it.dateKey === dateKey),
          // Orari in cui lavora almeno uno dei membri mostrati
          shifts: hasShiftInfo ? shown.flatMap((b) => shiftsOfDay(b, i)) : null,
        };
      });
    }

    const dayItems = items.filter((it) => it.dateKey === date);
    if (shown.length === 0) {
      // Nessun collaboratore in elenco: una sola colonna con tutti gli appuntamenti del giorno
      return [{ key: "all", dateKey: date, items: dayItems, shifts: null }];
    }
    const weekday = weekdayIndex(date);
    return shown.map((b) => ({
      key: b.id,
      dateKey: date,
      barber: b,
      items: dayItems.filter((it) => it.barberId === b.id),
      shifts: shiftsOfDay(b, weekday),
    }));
  }, [mode, date, items, barbers, filterBarber]);

  const { startMin, endMin } = useMemo(() => gridRange(columns, items), [columns, items]);
  const totalHeight = ((endMin - startMin) / 60) * px;
  const minBlockMinutes = (MIN_BLOCK_PX / px) * 60;
  const hours = [];
  for (let m = startMin; m < endMin; m += 60) hours.push(m);

  // Quando si cambia giorno / vista la griglia scorre da sola: all'ora attuale se si guarda oggi,
  // altrimenti al primo appuntamento
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    let focus = null;
    if (columns.some((c) => c.dateKey === today)) focus = nowMin - 60;
    else if (items.length > 0) focus = Math.min(...items.map((it) => it.startMin)) - 30;
    box.scrollTop = focus === null ? 0 : Math.max(0, ((focus - startMin) / 60) * px);
    // Volutamente solo [mode, date]: non deve rimettersi a scorrere ad ogni filtro o annullamento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, date]);

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-line-strong">
      <div ref={scrollRef} className="overflow-auto overscroll-contain" style={{ maxHeight: "72vh" }}>
        <div style={{ minWidth: AXIS_WIDTH + columns.length * minColWidth }}>
          {/* Intestazione delle colonne (resta ferma in alto quando si scorre) */}
          <div className="sticky top-0 z-20 flex bg-white border-b border-line-strong">
            <div className="sticky left-0 z-30 bg-white shrink-0" style={{ width: AXIS_WIDTH }} />
            {columns.map((col) => {
              const isToday = col.dateKey === today;
              const color = (col.barber && colors[col.barber.id]) || FALLBACK_COLOR;
              return (
                <div key={col.key} className="flex-1 border-l border-line" style={{ minWidth: minColWidth }}>
                  {mode === "week" ? (
                    <button
                      type="button"
                      onClick={() => onOpenDay(col.dateKey)}
                      className="flex flex-col items-center w-full gap-0.5 px-1 py-2 transition-colors hover:bg-tint"
                    >
                      <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-fg-faint"}`}>
                        {WEEKDAYS[col.weekday].slice(0, 3)}
                      </span>
                      <span
                        className={`flex items-center justify-center w-8 h-8 text-base font-extrabold rounded-full ${isToday ? "bg-primary text-white" : "text-fg"}`}
                      >
                        {Number(col.dateKey.slice(8))}
                      </span>
                      <span className="text-[11px] font-medium text-fg-muted">
                        {col.items.length > 0 ? `${col.items.length} rdv` : "\u00A0"}
                      </span>
                    </button>
                  ) : col.barber ? (
                    <div className="flex items-center justify-center gap-2 px-2 py-2.5">
                      <span
                        className="flex items-center justify-center text-xs font-bold border rounded-full w-9 h-9 shrink-0"
                        style={{ background: color.bg, borderColor: color.border, color: color.text }}
                      >
                        {getInitials(col.barber.name)}
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block text-sm font-bold truncate text-fg">{col.barber.name}</span>
                        <span className="block text-[11px] font-medium text-fg-muted">
                          {col.items.length > 0 ? `${col.items.length} rdv` : "Aucun rdv"}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="px-2 py-3.5 text-sm font-bold text-center text-fg">Rendez-vous</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Corpo: colonna delle ore + una colonna per ogni membro / giorno */}
          <div className="flex" style={{ height: totalHeight }}>
            <div className="sticky left-0 z-10 bg-white border-r shrink-0 border-line" style={{ width: AXIS_WIDTH }}>
              {hours.map((m, i) => (
                <span
                  key={m}
                  className="absolute right-2 text-[11px] font-medium tabular-nums text-fg-faint"
                  style={{ top: ((m - startMin) / 60) * px, transform: i === 0 ? "translateY(4px)" : "translateY(-50%)" }}
                >
                  {formatTime(m)}
                </span>
              ))}
            </div>

            {columns.map((col) => {
              const isToday = col.dateKey === today;
              const layout = layoutOverlaps(
                col.items.map((it) => ({ id: it.id, start: it.startMin, end: Math.max(it.endMin, it.startMin + minBlockMinutes) }))
              );
              const off = offIntervals(col.shifts, startMin, endMin);
              return (
                <div
                  key={col.key}
                  className="relative flex-1 border-l border-line"
                  style={{
                    minWidth: minColWidth,
                    backgroundColor: isToday && mode === "week" ? "var(--th-tint)" : "#fff",
                    backgroundImage: GRID_LINES,
                    backgroundSize: `100% ${px}px, 100% ${px / 2}px`,
                  }}
                >
                  {off.map(([s, e]) => (
                    <div
                      key={s}
                      className="absolute inset-x-0 pointer-events-none"
                      style={{ top: ((s - startMin) / 60) * px, height: ((e - s) / 60) * px, ...OFF_HOURS }}
                    />
                  ))}

                  {col.items.map((it) => {
                    const pos = layout.get(it.id);
                    return (
                      <Block
                        key={it.id}
                        item={it}
                        top={((it.startMin - startMin) / 60) * px}
                        height={Math.max((it.durMin / 60) * px - 2, MIN_BLOCK_PX)}
                        lane={pos.lane}
                        lanes={pos.lanes}
                        color={colors[it.barberId] || FALLBACK_COLOR}
                        isPast={it.endMs < now}
                        showBarber={mode === "week"}
                        onSelect={onSelect}
                      />
                    );
                  })}

                  {/* Linea dell'ora corrente (solo nella colonna di oggi) */}
                  {isToday && nowMin >= startMin && nowMin <= endMin && (
                    <div
                      className="absolute inset-x-0 z-[5] pointer-events-none"
                      style={{ top: ((nowMin - startMin) / 60) * px }}
                    >
                      <div className="h-px bg-red-500" />
                      <div className="absolute w-2 h-2 -mt-[5px] -ml-1 bg-red-500 rounded-full left-0" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}