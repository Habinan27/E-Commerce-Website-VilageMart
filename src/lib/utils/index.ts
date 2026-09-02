import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | bigint | any | null | undefined): string {
  if (price === null || price === undefined) return 'Rs. 0.00';
  const num = typeof price === 'bigint' ? Number(price) : typeof price === 'object' && price !== null && 'toNumber' in price ? price.toNumber() : typeof price === 'string' ? parseFloat(price) : Number(price);
  return `Rs. ${(isNaN(num) ? 0 : num).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u0B80-\u0BFF\u0D80-\u0DFF\-]+/g, '') // Keep alphanumeric, Tamil, Sinhala and hyphens
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

// Convert BigInt objects in Prisma records to strings for clean JSON serialization
export function serializeBigInt<T>(obj: T): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    })
  );
}
