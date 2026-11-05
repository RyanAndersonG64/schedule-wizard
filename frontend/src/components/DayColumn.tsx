import type { CalendarEvent } from '../types.ts'
import { getDaySegment } from '../utils/eventLayout.ts'
import EventBlock from './EventBlock.tsx'

interface DayColumnProps {
  day: Date // midnight at the start of this day
  events: CalendarEvent[]
  isToday: boolean
}

/**
 * One day's 24-hour column. Hour lines are drawn with a CSS background, and events
 * are absolutely positioned inside it (see EventBlock).
 */
function DayColumn({ day, events, isToday }: DayColumnProps) {
  return (
    <div className={isToday ? 'day-column day-column-today' : 'day-column'}>
      {events.map((event) => {
        const segment = getDaySegment(event, day)
        return segment && <EventBlock key={event.id} event={event} segment={segment} />
      })}
    </div>
  )
}

export default DayColumn
