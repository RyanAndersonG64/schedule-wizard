import { describe, expect, it } from 'vitest'
import { type EventFormValues, validateEvent } from './validateEvent.ts'

function values(overrides: Partial<EventFormValues> = {}): EventFormValues {
  return {
    title: 'Coding',
    description: '',
    date: '2026-11-04',
    startTime: '09:00',
    endTime: '10:00',
    ...overrides,
  }
}

describe('validateEvent', () => {
  it('turns valid input into a NewEvent', () => {
    const result = validateEvent(values({ title: '  Coding  ', description: ' Phase 1 ' }))
    expect(result).toEqual({
      ok: true,
      event: {
        title: 'Coding',
        description: 'Phase 1',
        start: new Date(2026, 10, 4, 9, 0),
        end: new Date(2026, 10, 4, 10, 0),
      },
    })
  })

  it('requires a title', () => {
    const result = validateEvent(values({ title: '   ' }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.title).toBe('Title is required.')
  })

  it('limits the title length', () => {
    const result = validateEvent(values({ title: 'x'.repeat(201) }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.title).toMatch(/200 characters/)
  })

  it('limits the description length', () => {
    const result = validateEvent(values({ description: 'x'.repeat(2001) }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.description).toBeDefined()
  })

  it.each([
    ['date', { date: '' }],
    ['startTime', { startTime: '' }],
    ['endTime', { endTime: '' }],
  ] as const)('requires %s', (field, override) => {
    const result = validateEvent(values(override))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[field]).toBeDefined()
  })

  it('rejects an end time before the start time', () => {
    const result = validateEvent(values({ startTime: '10:00', endTime: '09:00' }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.endTime).toBe('End time must be after start time.')
  })

  it('rejects a zero-length event', () => {
    expect(validateEvent(values({ endTime: '09:00' })).ok).toBe(false)
  })

  it('reports several problems at once', () => {
    const result = validateEvent(values({ title: '', date: '' }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['date', 'title'])
  })
})
