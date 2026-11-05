import { useEffect, useRef } from 'react'
import type { CalendarEvent } from '../types.ts'
import { daysOfWeek, formatHour, formatWeekday, isSameDay } from '../utils/dates.ts'
import DayColumn from './DayColumn.tsx'
import './Schedule.css'

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const INITIAL_SCROLL_HOUR = 7

interface ScheduleProps {
  weekStart: Date
  events: CalendarEvent[]
  today: Date
}

/**
 * The weekly calendar: a sticky row of day headers, then an hour-label column and
 * seven day columns, all inside one scrolling container.
 */
function Schedule({ weekStart, events, today }: ScheduleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const hourLabelsRef = useRef<HTMLDivElement>(null)
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
        {days.map((day) => (
          <DayColumn
            key={day.getTime()}
            day={day}
            events={events}
            isToday={isSameDay(day, today)}
          />
        ))}
      </div>
    </div>
  )
}

export default Schedule
