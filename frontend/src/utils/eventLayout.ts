// Works out where an event is drawn inside one day's column.

import type { CalendarEvent } from '../types.ts'
import { MINUTES_IN_DAY, addDays, minutesSinceMidnight } from './dates.ts'

/** The part of an event that falls on one day, as percentages of the column height. */
export interface DaySegment {
  topPercent: number
  heightPercent: number
  /** The event started on an earlier day */
  continuesFromPreviousDay: boolean
  /** The event ends on a later day */
  continuesToNextDay: boolean
}

/**
 * The piece of `event` that falls on the day starting at `dayStart` (midnight), or
 * null if the event doesn't touch that day. An event from 10 PM to 1 AM produces a
 * segment at the bottom of the first day and one at the top of the next.
 *
 * Positions use clock time, so on a daylight-saving day 9 AM is still drawn at 9 AM.
 */
export function getDaySegment(event: CalendarEvent, dayStart: Date): DaySegment | null {
  const dayEnd = addDays(dayStart, 1)
  if (event.end <= dayStart || event.start >= dayEnd) return null

  const continuesFromPreviousDay = event.start < dayStart
  const continuesToNextDay = event.end > dayEnd

  const startMinute = continuesFromPreviousDay ? 0 : minutesSinceMidnight(event.start)
  const endMinute =
    event.end >= dayEnd ? MINUTES_IN_DAY : minutesSinceMidnight(event.end)

  return {
    topPercent: (startMinute / MINUTES_IN_DAY) * 100,
    heightPercent: ((endMinute - startMinute) / MINUTES_IN_DAY) * 100,
    continuesFromPreviousDay,
    continuesToNextDay,
  }
}
