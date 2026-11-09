import { useState } from 'react'
import { ApiError, deleteEvent } from '../api/events.ts'
import type { CalendarEvent } from '../types.ts'

interface EventDetailsProps {
  event: CalendarEvent
  onEdit: () => void
  onDeleted: () => void
}

/**
 * The extra content shown inside a selected event: its description and the Edit and
 * Delete buttons. EventBlock renders this only while the event is selected, so the
 * "are you sure?" step resets every time the event is closed.
 */
function EventDetails({ event, onEdit, onDeleted }: EventDetailsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await deleteEvent(event.id)
      onDeleted()
    } catch (err) {
      // 404 means it's already gone (e.g. deleted in another tab), which is what we wanted
      if (err instanceof ApiError && err.status === 404) {
        onDeleted()
        return
      }
      setError(err instanceof ApiError ? err.message : 'Could not delete the event.')
      setDeleting(false)
    }
  }

  return (
    <div className="event-details">
      {event.description ? (
        <p className="event-description">{event.description}</p>
      ) : (
        <p className="event-description event-description-empty">No description</p>
      )}

      {error && (
        <p className="event-details-error" role="alert">
          {error}
        </p>
      )}

      {confirmingDelete ? (
        <div className="event-actions">
          <span className="event-confirm-text">Delete this event?</span>
          <button
            type="button"
            className="button button-small"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button-small button-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      ) : (
        <div className="event-actions">
          <button type="button" className="button button-small" onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className="button button-small button-danger"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default EventDetails
