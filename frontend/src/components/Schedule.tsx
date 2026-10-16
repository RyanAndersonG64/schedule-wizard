import { Fragment, useEffect, useState } from 'react'
import '../App.css'

function Schedule() {

    useEffect(() => {
    }, [])

    let hours: number[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
    let days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    return (
        <section id="schedule">
            {/* Header row: empty corner above the hour labels, then one cell per day */}
            <div className="corner"></div>
            {days.map(day => (
                <div key = {day} className='day'>
                    {day}
                </div>
            ))}
            {/* One row per hour: the hour label, then one slot per day */}
            {hours.map(hour => (
                <Fragment key = {hour}>
                    <div className = "hour">
                        {hour == 0 ? "12 AM" : hour < 12 ? String(hour) + " AM" : hour == 12 ? "12 PM" : String(hour - 12) + " PM"}
                    </div>
                    {days.map(day => (
                        <div key = {day} className = "slot"></div>
                    ))}
                </Fragment>
            ))}
        </section>
    )
}

export default Schedule
