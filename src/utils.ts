/** Оставляет только цифры; российский номер с 8 в начале приводит к формату с 7 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits
}

const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp)
}

export function cx(...classNames: Array<string | false | undefined>): string {
  return classNames.filter(Boolean).join(' ')
}
