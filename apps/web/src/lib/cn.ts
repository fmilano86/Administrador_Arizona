import clsx, { type ClassValue } from "clsx";

// Combina clases condicionales de Tailwind.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
