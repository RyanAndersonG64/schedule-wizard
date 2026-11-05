// Tests run with TZ=America/New_York (see vite.config.ts). In 2026, daylight saving
// time ends on Sunday, November 1 and starts on Sunday, March 8.

import { describe, expect, it } from 'vitest'
import {
  addDays,
  addWeeks,
  daysOfWeek,
  formatHour,
  formatTime,
  formatWeekRange,
  fromDateAndTimeInputs,
  isSameDay,
  minutesSinceMidnight,
  startOfWeek,
  toDateInputValue,
} from './dates.ts'

const HOUR_MS = 60 * 60 * 1000

describe('startOfWeek', () => {
  it('returns the previous Sunday at midnight', () => {
    expect(startOfWeek(new Date(2026, 10, 4, 15, 30))).toEqual(new Date(2026, 10, 1))
  })

  it('returns the same day when given a Sunday', () => {
    expect(startOfWeek(new Date(2026, 10, 1, 23, 59))).toEqual(new Date(2026, 10, 1))
  })

  it('handles the last minute of Saturday', () => {
    expect(startOfWeek(new Date(2026, 10, 7, 23, 59))).toEqual(new Date(2026, 10, 1))
  })

  it('crosses month and year boundaries', () => {
    expect(startOfWeek(new Date(2027, 0, 1))).toEqual(new Date(2026, 11, 27))
  })
})

describe('addDays and addWeeks', () => {
  it('keeps the clock time across the end of daylight saving time', () => {
    const saturday = new Date(2026, 9, 31, 9, 0)
    const sunday = addDays(saturday, 1)
    expect(sunday).toEqual(new Date(2026, 10, 1, 9, 0))
    // That calendar day was 25 hours long
    expect(sunday.getTime() - saturday.getTime()).toBe(25 * HOUR_MS)
  })

  it('keeps the clock time across the start of daylight saving time', () => {
    expect(addDays(new Date(2026, 2, 7, 9, 0), 1)).toEqual(new Date(2026, 2, 8, 9, 0))
  })

  it('moves between weeks in both directions', () => {
    const week = new Date(2026, 10, 1)
    expect(addWeeks(week, 1)).toEqual(new Date(2026, 10, 8))
    expect(addWeeks(week, -1)).toEqual(new Date(2026, 9, 25))
  })

  it('does not change the date it was given', () => {
    const date = new Date(2026, 10, 1)
    addDays(date, 3)
    expect(date).toEqual(new Date(2026, 10, 1))
  })
})

describe('daysOfWeek', () => {
  it('returns seven midnights, even in a daylight-saving week', () => {
    const days = daysOfWeek(new Date(2026, 10, 1))
    expect(days).toHaveLength(7)
    days.forEach((day, i) => {
      expect(day).toEqual(new Date(2026, 10, 1 + i))
      expect(minutesSinceMidnight(day)).toBe(0)
    })
  })
})

describe('isSameDay', () => {
  it('compares calendar days, ignoring the time', () => {
    expect(isSameDay(new Date(2026, 10, 4, 0, 0), new Date(2026, 10, 4, 23, 59))).toBe(true)
    expect(isSameDay(new Date(2026, 10, 4, 23, 59), new Date(2026, 10, 5, 0, 0))).toBe(false)
  })
})

describe('formatWeekRange', () => {
  it('formats a week within one month', () => {
    expect(formatWeekRange(new Date(2026, 10, 1))).toBe('November 1–7, 2026')
  })

  it('formats a week spanning two months', () => {
    expect(formatWeekRange(new Date(2026, 10, 29))).toBe('Nov 29 – Dec 5, 2026')
  })

  it('formats a week spanning two years', () => {
    expect(formatWeekRange(new Date(2026, 11, 27))).toBe('Dec 27, 2026 – Jan 2, 2027')
  })
})

describe('formatHour and formatTime', () => {
  it('labels hours on a 12-hour clock', () => {
    expect([0, 1, 11, 12, 13, 23].map(formatHour)).toEqual([
      '12 AM', '1 AM', '11 AM', '12 PM', '1 PM', '11 PM',
    ])
  })

  it('shows minutes only when needed', () => {
    expect(formatTime(new Date(2026, 10, 4, 9, 0))).toBe('9 AM')
    expect(formatTime(new Date(2026, 10, 4, 9, 5))).toBe('9:05 AM')
    expect(formatTime(new Date(2026, 10, 4, 0, 30))).toBe('12:30 AM')
    expect(formatTime(new Date(2026, 10, 4, 12, 15))).toBe('12:15 PM')
  })
})

describe('form input conversion', () => {
  it('formats a date for <input type="date">', () => {
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('combines date and time inputs into a local Date', () => {
    expect(fromDateAndTimeInputs('2026-11-04', '09:30')).toEqual(new Date(2026, 10, 4, 9, 30))
  })

  it('round-trips with toDateInputValue', () => {
    const date = new Date(2026, 1, 28)
    expect(fromDateAndTimeInputs(toDateInputValue(date), '00:00')).toEqual(date)
  })

  it('rejects malformed or impossible values', () => {
    expect(fromDateAndTimeInputs('', '09:00')).toBeNull()
    expect(fromDateAndTimeInputs('2026-11-04', '')).toBeNull()
    expect(fromDateAndTimeInputs('2026-02-30', '09:00')).toBeNull()
    expect(fromDateAndTimeInputs('2026-11-04', '24:00')).toBeNull()
    expect(fromDateAndTimeInputs('11/04/2026', '09:00')).toBeNull()
  })
})
