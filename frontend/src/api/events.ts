// All communication with the events API goes through this file. Components never
// call fetch directly, so changes to URLs or data formats only need to happen here.

import type { CalendarEvent, NewEvent } from '../types.ts'

const EVENTS_URL = '/api/events'

/** An event as the API sends it: times are UTC ISO strings ("2026-11-04T14:00:00Z"). */
interface EventResponse {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
}

/** A failed request, with a message that can be shown to the user. */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function fromResponse(data: EventResponse): CalendarEvent {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    // new Date() reads the "Z" and converts to the browser's local time
    start: new Date(data.start_time),
    end: new Date(data.end_time),
  }
}

/** Pull a readable message out of a FastAPI error response. */
async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    // HTTPException: { detail: "message" }
    if (typeof body.detail === 'string') return body.detail
    // Validation error: { detail: [{ msg: "Value error, end_time must be after start_time", ... }] }
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((item: { msg?: string }) => item.msg?.replace(/^Value error, /, ''))
        .filter(Boolean)
        .join(' ')
    }
  } catch {
    // Not JSON (e.g. the backend isn't running and the dev proxy returned an error page)
  }
  if (response.status >= 502 && response.status <= 504) {
    return 'Could not reach the server. Is the backend running?'
  }
  return `Request failed (${response.status} ${response.statusText})`
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('Could not reach the server.', 0)
  }
  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status)
  }
  // 204 No Content (e.g. after a delete) has no body to parse
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

/** Events overlapping the range [start, end). */
export async function fetchEvents(
  start: Date,
  end: Date,
  signal?: AbortSignal,
): Promise<CalendarEvent[]> {
  // toISOString() sends UTC ("...Z"), which the backend accepts as-is
  const params = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() })
  const data = await request<EventResponse[]>(`${EVENTS_URL}?${params}`, { signal })
  return data.map(fromResponse)
}

/** Request options for sending an event as JSON (used by both create and update). */
function sendEvent(method: 'POST' | 'PUT', event: NewEvent): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: event.title,
      description: event.description,
      start_time: event.start.toISOString(),
      end_time: event.end.toISOString(),
    }),
  }
}

export async function createEvent(event: NewEvent): Promise<CalendarEvent> {
  const data = await request<EventResponse>(EVENTS_URL, sendEvent('POST', event))
  return fromResponse(data)
}

/** Replace every field of an existing event. */
export async function updateEvent(id: number, event: NewEvent): Promise<CalendarEvent> {
  const data = await request<EventResponse>(`${EVENTS_URL}/${id}`, sendEvent('PUT', event))
  return fromResponse(data)
}

export async function deleteEvent(id: number): Promise<void> {
  await request<void>(`${EVENTS_URL}/${id}`, { method: 'DELETE' })
}
