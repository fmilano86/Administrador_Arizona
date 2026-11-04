import {
  addDays,
  differenceInCalendarDays,
  differenceInYears,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

export { addDays, isSameDay, parseISO, startOfDay };

export const capitalize = (texto: string) =>
  texto.length ? texto[0].toUpperCase() + texto.slice(1) : texto;

// Date -> "yyyy-MM-dd" (formato que espera la API para filtros).
export const toApiDate = (fecha: Date) => format(fecha, "yyyy-MM-dd");

// Semana de lunes a domingo.
export const inicioSemana = (fecha: Date) =>
  startOfWeek(fecha, { weekStartsOn: 1 });
export const finSemana = (fecha: Date) => endOfWeek(fecha, { weekStartsOn: 1 });
export const diasDeSemana = (inicio: Date) =>
  Array.from({ length: 7 }, (_, i) => addDays(inicio, i));

export const formatHora = (iso: string) => format(parseISO(iso), "HH:mm");
export const rangoHorario = (inicio: string, fin: string) =>
  `${formatHora(inicio)} – ${formatHora(fin)}`;

// "Martes 10 de junio".
export const formatDiaLargo = (fecha: Date | string) => {
  const d = typeof fecha === "string" ? parseISO(fecha) : fecha;
  return capitalize(format(d, "EEEE d 'de' MMMM", { locale: es }));
};

// "Martes, 10 de junio de 2025".
export const formatFechaCompleta = (fecha: Date) =>
  capitalize(format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }));

// "10/06/2025".
export const formatFechaCorta = (fecha: Date | string) => {
  const d = typeof fecha === "string" ? parseISO(fecha) : fecha;
  return format(d, "dd/MM/yyyy");
};

// "10 jun".
export const formatDiaMes = (fecha: Date | string) => {
  const d = typeof fecha === "string" ? parseISO(fecha) : fecha;
  return format(d, "d MMM", { locale: es }).replace(".", "");
};

// "Lun".
export const formatDiaSemanaCorto = (fecha: Date) =>
  capitalize(format(fecha, "EEE", { locale: es }).replace(".", ""));

// "10 jun – 16 jun".
export const formatRangoSemana = (inicio: Date) =>
  `${formatDiaMes(inicio)} – ${formatDiaMes(addDays(inicio, 6))}`;

export const yaComenzo = (inicioIso: string) =>
  !isBefore(new Date(), parseISO(inicioIso));
export const yaTermino = (finIso: string) =>
  !isBefore(new Date(), parseISO(finIso));
export const esHoy = (fecha: Date | string) =>
  isSameDay(typeof fecha === "string" ? parseISO(fecha) : fecha, new Date());

export const edadDesde = (fechaNacimiento: string) =>
  differenceInYears(new Date(), parseISO(fechaNacimiento));

// "martes" (en minúscula, para usar dentro de una frase).
export const nombreDiaSemana = (fecha: Date | string) => {
  const d = typeof fecha === "string" ? parseISO(fecha) : fecha;
  return format(d, "EEEE", { locale: es });
};

// Cantidad de ocurrencias semanales entre dos fechas yyyy-MM-dd (ambas inclusive).
export const ocurrenciasSemanales = (desde: string, hasta: string) => {
  const dias = differenceInCalendarDays(parseISO(hasta), parseISO(desde));
  return dias < 0 ? 0 : Math.floor(dias / 7) + 1;
};
