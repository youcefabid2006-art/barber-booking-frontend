import React, { useMemo } from "react";
import { WEEKDAYS } from "../../constants";
import { FALLBACK_COLOR, groupByDate, monthGrid, salonToday } from "./agendaUtils";

// ===== VISTA MENSILE =====
// Solo una panoramica: per ogni giorno il numero di appuntamenti e un pallino per ogni membro del team coinvolto.
// Cliccando su un giorno si apre la vista giornaliera (onOpenDay).
export default function AgendaMonth({ date, items, colors, onOpenDay }) {
  const today = salonToday();
  const days = useMemo(() => monthGrid(date), [date]);
  const byDay = useMemo(() => groupByDate(items), [items]);
  const month = date.slice(0, 7);

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-line-strong">
      <div className="grid grid-cols-7 border-b bg-tint border-line-strong">
        {WEEKDAYS.map((name) => (
          <div key={name} className="py-2.5 text-xs font-bold text-center text-fg-muted">
            {name.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* gap-px su sfondo colorato = linee sottili tra i giorni, senza bordi doppi */}
      <div className="grid grid-cols-7 gap-px bg-line-strong">
        {days.map((day) => {
          const dayItems = byDay.get(day) || [];
          const inMonth = day.startsWith(month);
          const isToday = day === today;
          // Un pallino per ogni membro del team con appuntamenti quel giorno
          const memberIds = [...new Set(dayItems.map((it) => it.barberId))].slice(0, 6);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onOpenDay(day)}
              className={`flex flex-col items-start min-h-[68px] md:min-h-[100px] p-1.5 md:p-2 text-left transition-colors hover:bg-tint-2 ${inMonth ? "bg-white" : "bg-tint"}`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full md:text-sm ${
                  isToday ? "bg-primary text-white" : inMonth ? "text-fg" : "text-fg-ghost"
                }`}
              >
                {Number(day.slice(8))}
              </span>

              {dayItems.length > 0 && (
                <>
                  <span className="mt-1 text-[11px] md:text-xs font-bold text-fg-2">
                    {dayItems.length}
                    <span className="hidden md:inline"> rendez-vous</span>
                  </span>
                  <span className="flex flex-wrap gap-1 pt-1 mt-auto">
                    {memberIds.map((id) => (
                      <span
                        key={id}
                        className="w-2 h-2 rounded-full"
                        style={{ background: (colors[id] || FALLBACK_COLOR).border }}
                      />
                    ))}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}