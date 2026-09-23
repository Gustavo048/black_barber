'use client';

import { useState } from 'react';

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function toISODate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Calendario mensal sem dependencia externa. Dias passados e domingos
 * (fechado — ver backend/src/config/businessHours.js) ficam desabilitados;
 * os demais sao clicaveis. A checagem definitiva de horario livre so
 * acontece de fato quando o dia e selecionado e consultamos a API.
 */
export default function Calendar({ selectedDate, onSelectDate, disabled = false }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstDayOfMonth.getDay();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function goPrevMonth() {
    if (isCurrentMonth) return;
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  }

  function goNextMonth() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div className={disabled ? 'opacity-40 pointer-events-none select-none' : ''}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Mes anterior"
          disabled={isCurrentMonth}
          className="h-9 w-9 flex items-center justify-center rounded-sm border border-white/10 text-bone hover:border-cyan hover:text-cyan transition-colors disabled:opacity-20 disabled:hover:border-white/10 disabled:hover:text-bone"
        >
          ‹
        </button>
        <span className="font-display text-lg text-bone">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNextMonth}
          aria-label="Proximo mes"
          className="h-9 w-9 flex items-center justify-center rounded-sm border border-white/10 text-bone hover:border-cyan hover:text-cyan transition-colors"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="text-xs text-muted py-1">
            {label}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;

          const date = new Date(viewYear, viewMonth, day);
          const iso = toISODate(viewYear, viewMonth, day);
          const isPast = date < today;
          const isSunday = date.getDay() === 0;
          const isDisabled = isPast || isSunday;
          const isSelected = selectedDate === iso;
          const isToday = date.getTime() === today.getTime();

          const stateClasses = isDisabled
            ? 'text-muted/25 border-transparent cursor-not-allowed'
            : isSelected
            ? 'bg-cyan text-void font-semibold border-cyan'
            : 'text-bone border-transparent hover:border-cyan/50 hover:text-cyan';

          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(iso)}
              className={`aspect-square rounded-sm text-sm flex items-center justify-center relative border transition-colors ${stateClasses}`}
            >
              {day}
              {isToday && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
