import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** "Posted 1 day ago" / "Posted 3 days ago" — singular per the KLAS content rules. */
export function postedAgo(dateString) {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  return `Posted ${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export const EMPLOYMENT_TYPES = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract' };
export const LEVELS = { entry: 'Entry', intermediate: 'Intermediate', advanced: 'Advanced' };
