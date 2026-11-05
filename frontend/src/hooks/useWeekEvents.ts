import { useCallback, useEffect, useState } from 'react'
import { ApiError, fetchEvents } from '../api/events.ts'
import type { CalendarEvent } from '../types.ts'
import { addWeeks } from '../utils/dates.ts'

export type LoadStatus = 'loading' | 'ready' | 'error'

/** The outcome of one request, tagged with the request it answered. */
interface LoadResult {
  requestKey: string
  events: CalendarEvent[]
  error: string | null
}

/**
 * Loads the events for the week starting at `weekStart`, and reloads whenever the
 * week changes.
 */
export function useWeekEvents(weekStart: Date) {
  // Date objects are compared by identity, so depend on the timestamp instead
  const weekTime = weekStart.getTime()
  // Bumping this number makes a new request key, which is how retry() works
  const [reloadCount, setReloadCount] = useState(0)

  // Identifies the request the screen currently needs. "Loading" isn't stored as
  // state: it's simply "the latest result answers a different request than this one".
  const requestKey = `${weekTime}:${reloadCount}`
  const [result, setResult] = useState<LoadResult | null>(null)

  useEffect(() => {
    // If the week changes before this request finishes, cancel it so a slow response
    // for the old week can't overwrite the new week's events
    const controller = new AbortController()
    const start = new Date(weekTime)

    fetchEvents(start, addWeeks(start, 1), controller.signal)
      .then((events) => setResult({ requestKey, events, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const error =
          err instanceof ApiError ? err.message : 'Something went wrong loading events.'
        setResult({ requestKey, events: [], error })
      })

    return () => controller.abort()
  }, [requestKey, weekTime])

  const isCurrent = result?.requestKey === requestKey
  const status: LoadStatus = !isCurrent ? 'loading' : result.error ? 'error' : 'ready'

  const retry = useCallback(() => setReloadCount((n) => n + 1), [])

  /** Show a newly created event without reloading the week. */
  const addEvent = useCallback(
    (event: CalendarEvent) => {
      const weekStart = new Date(weekTime)
      const inThisWeek = event.start < addWeeks(weekStart, 1) && event.end > weekStart
      if (!inThisWeek) return
      setResult((current) =>
        current && current.requestKey === requestKey
          ? {
              ...current,
              events: [...current.events, event].sort(
                (a, b) => a.start.getTime() - b.start.getTime(),
              ),
            }
          : current,
      )
    },
    [requestKey, weekTime],
  )

  return {
    events: isCurrent ? result.events : [],
    status,
    error: isCurrent ? result.error : null,
    retry,
    addEvent,
  }
}
