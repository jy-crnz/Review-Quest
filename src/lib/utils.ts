import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Architecture Principle: Infrastructure Layer Utility
 * Safely merges Tailwind classes and handles conditional logic.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}