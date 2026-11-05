// Date helpers for the weekly calendar. Everything here works in the user's local time.
//
// Days are added with setDate() rather than by adding 24 hours of milliseconds: on
// daylight-saving days a day is 23 or 25 hours long, and millisecond math would land
// an hour off.

export const DAYS_IN_WEEK = 7
export const MINUTES_IN_DAY = 24 * 60

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Midnight at the start of the given day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Midnight on the Sunday that starts the week containing the given date. */
export function startOfWeek(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
}

/** The same time of day, `days` calendar days later (or earlier, if negative). */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * DAYS_IN_WEEK)
}

/** The seven days (at midnight) of the week starting on `weekStart`. */
export function daysOfWeek(weekStart: Date): Date[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(weekStart, i))
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Minutes since midnight on the clock, e.g. 9:30 AM -> 570. */
export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/** e.g. "November 1–7, 2026", "Oct 25 – Nov 1, 2026", "Dec 27, 2026 – Jan 2, 2027" */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, DAYS_IN_WEEK - 1)
  const startMonth = MONTHS[weekStart.getMonth()]
  const endMonth = MONTHS[weekEnd.getMonth()]

  if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
    return (
      `${startMonth.slice(0, 3)} ${weekStart.getDate()}, ${weekStart.getFullYear()} – ` +
      `${endMonth.slice(0, 3)} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    )
  }
  if (weekStart.getMonth() !== weekEnd.getMonth()) {
    return (
      `${startMonth.slice(0, 3)} ${weekStart.getDate()} – ` +
      `${endMonth.slice(0, 3)} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    )
  }
  return `${startMonth} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
}

/** "Sun", "Mon", ... */
export function formatWeekday(date: Date): string {
  return SHORT_WEEKDAYS[date.getDay()]
}

/** Label for an hour of the day: 0 -> "12 AM", 13 -> "1 PM" */
export function formatHour(hour: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM'
  return `${hour % 12 === 0 ? 12 : hour % 12} ${suffix}`
}

/** "9 AM", "9:30 AM" */
export function formatTime(date: Date): string {
  const hour = date.getHours()
  const minutes = date.getMinutes()
  const suffix = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return minutes === 0
    ? `${displayHour} ${suffix}`
    : `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

// --- Form input conversion ---------------------------------------------------
// <input type="date"> and <input type="time"> use "YYYY-MM-DD" and "HH:MM" strings
// in local time.

/** Date -> "YYYY-MM-DD" */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** "YYYY-MM-DD" + "HH:MM" -> a local Date, or null if either is malformed. */
export function fromDateAndTimeInputs(date: string, time: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time)
  if (!dateMatch || !timeMatch) return null

  const [year, month, day] = dateMatch.slice(1).map(Number)
  const [hours, minutes] = timeMatch.slice(1).map(Number)
  const result = new Date(year, month - 1, day, hours, minutes)

  // new Date() quietly rolls invalid values over (Feb 30 -> Mar 2); reject those instead
  if (result.getMonth() !== month - 1 || result.getDate() !== day) return null
  if (hours > 23 || minutes > 59) return null
  return result
}
