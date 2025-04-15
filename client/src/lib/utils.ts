import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in MAD
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price / 100);
}

// Calculate discounted price
export function calculateDiscountedPrice(price: number, discount: number): number {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

// Format date for display
export function formatDate(date: Date | string): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return dateObject.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Map status to French
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'En attente',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };
  
  return statusMap[status] || status;
}

// Map status to color
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-amber-500',
    shipped: 'bg-blue-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  };
  
  return colorMap[status] || 'bg-gray-500';
}
