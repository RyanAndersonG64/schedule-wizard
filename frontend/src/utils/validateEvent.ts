// Checks the add-event form before it's sent. The backend applies the same rules
// (backend/schemas.py) and has the final say; this just gives faster feedback.

import type { NewEvent } from '../types.ts'
import { fromDateAndTimeInputs } from './dates.ts'

export const TITLE_MAX_LENGTH = 200
export const DESCRIPTION_MAX_LENGTH = 2000

/** The form's raw input values, as strings. */
export interface EventFormValues {
  title: string
  description: string
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:MM"
  endTime: string // "HH:MM"
}

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

export type ValidationResult =
  | { ok: true; event: NewEvent }
  | { ok: false; errors: EventFormErrors }

export function validateEvent(values: EventFormValues): ValidationResult {
  const errors: EventFormErrors = {}

  const title = values.title.trim()
  if (!title) {
    errors.title = 'Title is required.'
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`
  }

  if (values.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }

  if (!values.date) errors.date = 'Date is required.'
  if (!values.startTime) errors.startTime = 'Start time is required.'
  if (!values.endTime) errors.endTime = 'End time is required.'

  const start = fromDateAndTimeInputs(values.date, values.startTime)
  const end = fromDateAndTimeInputs(values.date, values.endTime)

  if (values.date && values.startTime && values.endTime) {
    if (!start || !end) {
      errors.date = 'Enter a valid date and times.'
    } else if (end <= start) {
      errors.endTime = 'End time must be after start time.'
    }
  }

  if (Object.keys(errors).length > 0 || !start || !end) {
    return { ok: false, errors }
  }
  return { ok: true, event: { title, description: values.description.trim(), start, end } }
}
