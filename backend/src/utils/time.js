/** Converte "HH:mm" em minutos desde a meia-noite. */
function toMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Converte minutos desde a meia-noite de volta para "HH:mm". */
function toHHMM(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Dia da semana (0-6) de uma data "YYYY-MM-DD", sem risco de a conversao de
 * fuso horario "vazar" para o dia anterior/seguinte (por isso fixamos o
 * horario em meio-dia antes de criar o Date).
 */
function getWeekday(dateStr) {
  return new Date(`${dateStr}T12:00:00`).getDay();
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { toMinutes, toHHMM, getWeekday, todayISO };
