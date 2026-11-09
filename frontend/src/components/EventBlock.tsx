import { type CSSProperties, useEffect, useRef } from 'react'
import type { CalendarEvent } from '../types.ts'
import type { DaySegment } from '../utils/eventLayout.ts'
import { formatTime } from '../utils/dates.ts'
import EventDetails from './EventDetails.tsx'
import './EventBlock.css'

/** Segments ending below this point in the day grow upward when expanded. */
const GROW_UPWARD_BELOW_PERCENT = 75

interface EventBlockProps {
  event: CalendarEvent
  segment: DaySegment
  selected: boolean
  /** Expand toward the left, for columns near the right edge of the screen */
  alignRight: boolean
  onSelect: () => void
  onDeselect: () => void
  onEdit: () => void
  onDeleted: () => void
}

/**
 * One event drawn inside a day column, positioned by its DaySegment percentages.
 * Clicking it selects it: the block expands to show the full details and buttons.
 */
function EventBlock({
  event,
  segment,
  selected,
  alignRight,
  onSelect,
  onDeselect,
  onEdit,
  onDeleted,
}: EventBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null)
  const timeRange = `${formatTime(event.start)} – ${formatTime(event.end)}`

  // While selected, close on Escape or on a click anywhere outside this block.
  // (Effects are the right place for this: it's a subscription to the document,
  // which lives outside React, and the cleanup unsubscribes.)
  useEffect(() => {
    if (!selected) return

    function handlePointerDown(e: PointerEvent) {
      if (!blockRef.current?.contains(e.target as Node)) onDeselect()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDeselect()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selected, onDeselect])

  const classNames = ['event']
  if (segment.continuesFromPreviousDay) classNames.push('event-continued-from')
  if (segment.continuesToNextDay) classNames.push('event-continues-to')
  if (selected) classNames.push('event-selected')
  if (selected && alignRight) classNames.push('event-align-right')

  return (
    <div
      ref={blockRef}
      className={classNames.join(' ')}
      style={selected ? expandedPosition(segment) : collapsedPosition(segment)}
      // Native tooltip, handy for blocks too small to show everything
      title={selected ? undefined : [event.title, timeRange, event.description].filter(Boolean).join('\n')}
    >
      {/* A real <button> so the event can be opened with the keyboard too */}
      <button
        type="button"
        className="event-summary"
        onClick={selected ? onDeselect : onSelect}
        aria-expanded={selected}
      >
        <span className="event-title">{event.title}</span>
        <span className="event-time">{timeRange}</span>
      </button>

      {selected && <EventDetails event={event} onEdit={onEdit} onDeleted={onDeleted} />}
    </div>
  )
}

/** Exactly the event's time slot. */
function collapsedPosition(segment: DaySegment): CSSProperties {
  return { top: `${segment.topPercent}%`, height: `${segment.heightPercent}%` }
}

/**
 * At least the event's time slot, growing to fit the details. Events late in the day
 * grow upward (anchored by their bottom edge) so they don't run off the column.
 */
function expandedPosition(segment: DaySegment): CSSProperties {
  const bottomPercent = segment.topPercent + segment.heightPercent
  const minHeight = `${segment.heightPercent}%`
  if (bottomPercent > GROW_UPWARD_BELOW_PERCENT) {
    return { bottom: `${100 - bottomPercent}%`, minHeight }
  }
  return { top: `${segment.topPercent}%`, minHeight }
}

export default EventBlock
