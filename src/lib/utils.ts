/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppPhone(phone?: string) {
  if (!phone) return ''
  const clean = phone.replace(/\D/g, '')
  if (!clean) return ''
  return clean.length <= 11 ? `55${clean}` : clean
}

export function getWhatsAppLink(phone: string | undefined, message: string) {
  const formattedPhone = formatWhatsAppPhone(phone)
  const encodedMessage = encodeURIComponent(message)
  if (formattedPhone) {
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
  }
  return `https://wa.me/?text=${encodedMessage}`
}
