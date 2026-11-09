import { useEffect, useRef, useState } from 'react'
import type { CalendarEvent } from '../types.ts'
import { daysOfWeek, formatHour, formatWeekday, isSameDay } from '../utils/dates.ts'
import DayColumn from './DayColumn.tsx'
import './Schedule.css'

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const INITIAL_SCROLL_HOUR = 7
/** Columns from this day (Wednesday) on open selected events toward the left */
const ALIGN_RIGHT_FROM_DAY = 3

/**
 * The event that's open, and which day's column it's open in. An event that crosses
 * midnight has a block in two columns; only the one that was clicked expands.
 */
interface Selection {
  eventId: number
  dayTime: number
}

interface ScheduleProps {
  weekStart: Date
  events: CalendarEvent[]
  today: Date
  onEditEvent: (event: CalendarEvent) => void
  onEventDeleted: (eventId: number) => void
}

/**
 * The weekly calendar: a sticky row of day headers, then an hour-label column and
 * seven day columns, all inside one scrolling container.
 */
function Schedule({ weekStart, events, today, onEditEvent, onEventDeleted }: ScheduleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const hourLabelsRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const days = daysOfWeek(weekStart)

  // Start scrolled to the morning instead of midnight. The hour height comes from
  // the rendered labels, so it stays in sync with the CSS.
  useEffect(() => {
    if (!scrollRef.current || !hourLabelsRef.current) return
    const hourHeight = hourLabelsRef.current.offsetHeight / HOURS.length
    // Half an hour of margin keeps the first label from hiding under the sticky header
    scrollRef.current.scrollTop = (INITIAL_SCROLL_HOUR - 0.5) * hourHeight
  }, [])

  return (
    <div className="schedule" ref={scrollRef}>
      <div className="schedule-grid">
        {/* Header row: empty corner above the hour labels, then one cell per day */}
        <div className="schedule-corner" />
        {days.map((day) => (
          <div
            key={day.getTime()}
            className={isSameDay(day, today) ? 'schedule-day-header is-today' : 'schedule-day-header'}
          >
            <span className="schedule-weekday">{formatWeekday(day)}</span>
            <span className="schedule-date">{day.getDate()}</span>
          </div>
        ))}

        {/* Body: hour labels, then one 24-hour column per day */}
        <div className="hour-labels" ref={hourLabelsRef}>
          {HOURS.map((hour) => (
            <div key={hour} className="hour-label">
              {/* Skip midnight; it would sit right under the header */}
              {hour > 0 && <span>{formatHour(hour)}</span>}
            </div>
          ))}
        </div>
        {days.map((day, index) => {
          const dayTime = day.getTime()
          return (
            <DayColumn
              key={dayTime}
              day={day}
              events={events}
              isToday={isSameDay(day, today)}
              selectedEventId={selection?.dayTime === dayTime ? selection.eventId : null}
              alignRight={index >= ALIGN_RIGHT_FROM_DAY}
              onSelectEvent={(eventId) =>
                setSelection(eventId === null ? null : { eventId, dayTime })
              }
              onEditEvent={(event) => {
                setSelection(null)
                onEditEvent(event)
              }}
              onEventDeleted={(eventId) => {
                setSelection(null)
                onEventDeleted(eventId)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default Schedule
