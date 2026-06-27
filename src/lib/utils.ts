import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isFuture } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'dd MMM')
}

export function getWeekDays(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getWeekLabel(date: Date = new Date()): string {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`
}

export function isDateFuture(date: Date): boolean {
  return isFuture(date) && !isToday(date)
}

export function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatHours(hours: number | string): string {
  const n = typeof hours === 'string' ? parseFloat(hours) : hours
  return n % 1 === 0 ? `${n}h` : `${n}h`
}
