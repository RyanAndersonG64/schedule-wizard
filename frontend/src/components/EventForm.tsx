import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { ApiError, createEvent, updateEvent } from '../api/events.ts'
import type { CalendarEvent } from '../types.ts'
import { toDateInputValue, toTimeInputValue } from '../utils/dates.ts'
import {
  DESCRIPTION_MAX_LENGTH,
  type EventFormErrors,
  type EventFormValues,
  TITLE_MAX_LENGTH,
  validateEvent,
} from '../utils/validateEvent.ts'
import './EventForm.css'

interface EventFormProps {
  /** The event to edit. Leave it out to create a new event instead. */
  event?: CalendarEvent
  /** Starting date for a new event (ignored when editing) */
  defaultDate: Date
  onSaved: (event: CalendarEvent) => void
  onClose: () => void
}

/** The form's starting values: the event being edited, or a blank 9–10 AM event. */
function initialValues(event: CalendarEvent | undefined, defaultDate: Date): EventFormValues {
  if (event) {
    return {
      title: event.title,
      description: event.description,
      date: toDateInputValue(event.start),
      startTime: toTimeInputValue(event.start),
      endTime: toTimeInputValue(event.end),
    }
  }
  return {
    title: '',
    description: '',
    date: toDateInputValue(defaultDate),
    startTime: '09:00',
    endTime: '10:00',
  }
}

/**
 * Add/edit-event form in a modal <dialog>. The parent renders it only while it's
 * open, so every opening starts fresh from initialValues().
 */
function EventForm({ event, defaultDate, onSaved, onClose }: EventFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [values, setValues] = useState(() => initialValues(event, defaultDate))
  const [errors, setErrors] = useState<EventFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // showModal() dims the page, traps focus in the dialog, and closes it on Escape
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function update(field: keyof EventFormValues) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((current) => ({ ...current, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = validateEvent(values)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    setServerError(null)
    setSaving(true)
    try {
      const saved = event
        ? await updateEvent(event.id, result.event)
        : await createEvent(result.event)
      onSaved(saved)
      dialogRef.current?.close() // fires onClose, which unmounts this component
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Could not save the event.')
      setSaving(false)
    }
  }

  return (
    // onClose fires however the dialog closes: Cancel, Escape, or after saving
    <dialog ref={dialogRef} className="event-form-dialog" onClose={onClose}>
      {/* noValidate: show our own error messages instead of the browser's */}
      <form className="event-form" onSubmit={handleSubmit} noValidate>
        <h2>{event ? 'Edit event' : 'New event'}</h2>

        {serverError && (
          <p className="event-form-server-error" role="alert">
            {serverError}
          </p>
        )}

        <Field label="Title" error={errors.title}>
          <input
            type="text"
            value={values.title}
            onChange={update('title')}
            maxLength={TITLE_MAX_LENGTH}
            autoFocus
          />
        </Field>

        <Field label="Description (optional)" error={errors.description}>
          <textarea
            rows={3}
            value={values.description}
            onChange={update('description')}
            maxLength={DESCRIPTION_MAX_LENGTH}
          />
        </Field>

        <Field label="Date" error={errors.date}>
          <input type="date" value={values.date} onChange={update('date')} />
        </Field>

        <div className="event-form-row">
          <Field label="Start" error={errors.startTime}>
            <input type="time" value={values.startTime} onChange={update('startTime')} />
          </Field>
          <Field label="End" error={errors.endTime}>
            <input type="time" value={values.endTime} onChange={update('endTime')} />
          </Field>
        </div>

        <div className="event-form-actions">
          <button type="button" className="button" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

/** A labelled form field with an optional error message underneath. */
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className={error ? 'event-form-field has-error' : 'event-form-field'}>
      <span className="event-form-label">{label}</span>
      {children}
      {error && <span className="event-form-error">{error}</span>}
    </label>
  )
}

export default EventForm
