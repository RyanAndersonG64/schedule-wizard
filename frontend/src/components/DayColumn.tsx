import type { CalendarEvent } from '../types.ts'
import { getDaySegment } from '../utils/eventLayout.ts'
import EventBlock from './EventBlock.tsx'

interface DayColumnProps {
  day: Date // midnight at the start of this day
  events: CalendarEvent[]
  isToday: boolean
  /** The selected event, if it's selected in this column */
  selectedEventId: number | null
  /** Open selected events toward the left (for columns near the right edge) */
  alignRight: boolean
  onSelectEvent: (eventId: number | null) => void
  onEditEvent: (event: CalendarEvent) => void
  onEventDeleted: (eventId: number) => void
}

/**
 * One day's 24-hour column. Hour lines are drawn with a CSS background, and events
 * are absolutely positioned inside it (see EventBlock).
 */
function DayColumn({
  day,
  events,
  isToday,
  selectedEventId,
  alignRight,
  onSelectEvent,
  onEditEvent,
  onEventDeleted,
}: DayColumnProps) {
  return (
    <div className={isToday ? 'day-column day-column-today' : 'day-column'}>
      {events.map((event) => {
        const segment = getDaySegment(event, day)
        return (
          segment && (
            <EventBlock
              key={event.id}
              event={event}
              segment={segment}
              selected={event.id === selectedEventId}
              alignRight={alignRight}
              onSelect={() => onSelectEvent(event.id)}
              onDeselect={() => onSelectEvent(null)}
              onEdit={() => onEditEvent(event)}
              onDeleted={() => onEventDeleted(event.id)}
            />
          )
        )
      })}
    </div>
  )
}

export default DayColumn
