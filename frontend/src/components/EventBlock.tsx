import type { CalendarEvent } from '../types.ts'
import type { DaySegment } from '../utils/eventLayout.ts'
import { formatTime } from '../utils/dates.ts'
import './EventBlock.css'

interface EventBlockProps {
  event: CalendarEvent
  segment: DaySegment
}

/** One event drawn inside a day column. Positioned by its DaySegment percentages. */
function EventBlock({ event, segment }: EventBlockProps) {
  const timeRange = `${formatTime(event.start)} – ${formatTime(event.end)}`

  const classNames = ['event']
  if (segment.continuesFromPreviousDay) classNames.push('event-continued-from')
  if (segment.continuesToNextDay) classNames.push('event-continues-to')

  return (
    <div
      className={classNames.join(' ')}
      style={{ top: `${segment.topPercent}%`, height: `${segment.heightPercent}%` }}
      // Native tooltip with the full details, useful when the block is too small to show them
      title={[event.title, timeRange, event.description].filter(Boolean).join('\n')}
    >
      <div className="event-title">{event.title}</div>
      <div className="event-time">{timeRange}</div>
    </div>
  )
}

export default EventBlock
