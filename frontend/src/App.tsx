import { useState } from 'react'
import './App.css'
import EventForm from './components/EventForm.tsx'
import Schedule from './components/Schedule.tsx'
import WeekNav from './components/WeekNav.tsx'
import { type LoadStatus, useWeekEvents } from './hooks/useWeekEvents.ts'
import { addWeeks, isSameDay, startOfWeek } from './utils/dates.ts'

function App() {
  // Read the clock once when the app loads. (If the page stays open past midnight,
  // "today" won't move until a reload; fine for now.)
  const [today] = useState(() => new Date())
  const currentWeekStart = startOfWeek(today)

  // The week on screen, identified by midnight on its Sunday
  const [weekStart, setWeekStart] = useState(currentWeekStart)
  const [formOpen, setFormOpen] = useState(false)
  const { events, status, error, retry, addEvent } = useWeekEvents(weekStart)

  const isCurrentWeek = isSameDay(weekStart, currentWeekStart)
  // New events default to today when viewing this week, otherwise the week's Sunday
  const defaultFormDate = isCurrentWeek ? today : weekStart

  return (
    <div className="app">
      <header className="app-header">
        <WeekNav
          weekStart={weekStart}
          isCurrentWeek={isCurrentWeek}
          onPrevious={() => setWeekStart((week) => addWeeks(week, -1))}
          onNext={() => setWeekStart((week) => addWeeks(week, 1))}
          onToday={() => setWeekStart(currentWeekStart)}
        />
        <button type="button" className="button button-primary" onClick={() => setFormOpen(true)}>
          + New event
        </button>
      </header>

      <StatusMessage status={status} error={error} isEmpty={events.length === 0} onRetry={retry} />

      <Schedule weekStart={weekStart} events={events} today={today} />

      {formOpen && (
        <EventForm
          defaultDate={defaultFormDate}
          onCreated={addEvent}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  )
}

interface StatusMessageProps {
  status: LoadStatus
  error: string | null
  isEmpty: boolean
  onRetry: () => void
}

/** Loading, error, and empty-week messages shown above the calendar. */
function StatusMessage({ status, error, isEmpty, onRetry }: StatusMessageProps) {
  if (status === 'loading') {
    return <p className="status" role="status">Loading events…</p>
  }
  if (status === 'error') {
    return (
      <div className="status status-error" role="alert">
        <span>Couldn't load events: {error}</span>
        <button type="button" className="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }
  if (isEmpty) {
    return <p className="status">No events this week. Add one with + New event.</p>
  }
  // Keep the same height when there's nothing to say, so the calendar doesn't jump
  return <p className="status" aria-hidden="true" />
}

export default App
