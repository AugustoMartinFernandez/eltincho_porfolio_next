import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma inteligente.
 * Resuelve conflictos (ej: p-4 vs p-2) y maneja condicionales.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}