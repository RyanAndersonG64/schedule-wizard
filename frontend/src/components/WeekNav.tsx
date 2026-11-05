import { formatWeekRange } from '../utils/dates.ts'
import './WeekNav.css'

interface WeekNavProps {
  weekStart: Date
  isCurrentWeek: boolean
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

function WeekNav({ weekStart, isCurrentWeek, onPrevious, onNext, onToday }: WeekNavProps) {
  return (
    <nav className="week-nav" aria-label="Week navigation">
      <button type="button" className="button week-nav-arrow" onClick={onPrevious} aria-label="Previous week">
        ‹
      </button>
      <button type="button" className="button week-nav-arrow" onClick={onNext} aria-label="Next week">
        ›
      </button>
      <h1 className="week-nav-title">{formatWeekRange(weekStart)}</h1>
      <button type="button" className="button" onClick={onToday} disabled={isCurrentWeek}>
        Today
      </button>
    </nav>
  )
}

export default WeekNav
