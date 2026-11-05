// Shapes of the data the frontend works with. Times are Date objects here; the API
// module converts them to and from the ISO strings the backend uses.

/** An event saved on the backend. Matches EventRead in backend/schemas.py. */
export interface CalendarEvent {
  id: number
  title: string
  description: string
  start: Date
  end: Date
}

/** An event about to be created. Matches EventCreate in backend/schemas.py. */
export interface NewEvent {
  title: string
  description: string
  start: Date
  end: Date
}
