import { describe, expect, it } from 'vitest'
import type { CalendarEvent } from '../types.ts'
import { getDaySegment } from './eventLayout.ts'

function event(start: Date, end: Date): CalendarEvent {
  return { id: 1, title: 'Test', description: '', start, end }
}

const HOUR_PERCENT = 100 / 24
const NOV_4 = new Date(2026, 10, 4)
const NOV_5 = new Date(2026, 10, 5)

describe('getDaySegment', () => {
  it('positions an event by its start time and duration', () => {
    const segment = getDaySegment(event(new Date(2026, 10, 4, 9, 0), new Date(2026, 10, 4, 10, 30)), NOV_4)
    expect(segment?.topPercent).toBeCloseTo(9 * HOUR_PERCENT)
    expect(segment?.heightPercent).toBeCloseTo(1.5 * HOUR_PERCENT)
    expect(segment?.continuesFromPreviousDay).toBe(false)
    expect(segment?.continuesToNextDay).toBe(false)
  })

  it('returns null for an event on a different day', () => {
    const e = event(new Date(2026, 10, 4, 9, 0), new Date(2026, 10, 4, 10, 0))
    expect(getDaySegment(e, NOV_5)).toBeNull()
  })

  it('splits an event that crosses midnight across both days', () => {
    const e = event(new Date(2026, 10, 4, 22, 0), new Date(2026, 10, 5, 1, 0))

    const first = getDaySegment(e, NOV_4)
    expect(first?.topPercent).toBeCloseTo(22 * HOUR_PERCENT)
    expect(first?.heightPercent).toBeCloseTo(2 * HOUR_PERCENT)
    expect(first?.continuesToNextDay).toBe(true)

    const second = getDaySegment(e, NOV_5)
    expect(second?.topPercent).toBe(0)
    expect(second?.heightPercent).toBeCloseTo(1 * HOUR_PERCENT)
    expect(second?.continuesFromPreviousDay).toBe(true)
  })

  it('does not show an event ending exactly at midnight on the next day', () => {
    const e = event(new Date(2026, 10, 4, 23, 0), new Date(2026, 10, 5, 0, 0))
    expect(getDaySegment(e, NOV_4)?.heightPercent).toBeCloseTo(HOUR_PERCENT)
    expect(getDaySegment(e, NOV_4)?.continuesToNextDay).toBe(false)
    expect(getDaySegment(e, NOV_5)).toBeNull()
  })

  it('positions by clock time on a daylight-saving day', () => {
    // November 1, 2026 is 25 hours long; 9 AM should still be drawn at 9 AM
    const nov1 = new Date(2026, 10, 1)
    const e = event(new Date(2026, 10, 1, 9, 0), new Date(2026, 10, 1, 10, 0))
    expect(getDaySegment(e, nov1)?.topPercent).toBeCloseTo(9 * HOUR_PERCENT)
  })

  it('fills the whole day for an event spanning several days', () => {
    const e = event(new Date(2026, 10, 3, 12, 0), new Date(2026, 10, 6, 12, 0))
    const segment = getDaySegment(e, NOV_4)
    expect(segment?.topPercent).toBe(0)
    expect(segment?.heightPercent).toBe(100)
  })
})
