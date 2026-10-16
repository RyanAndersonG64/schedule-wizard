import { useEffect, useState } from 'react'
import '../App.css'

function Schedule() {

    useEffect(() => {
    }, [])

    let hours: number[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]

    return (
        <section id="schedule">
            {hours.map(hour => (
                <div key = {hour} className = "hour">
                    {hour == 0 ? "12 AM" : hour < 12 ? String(hour) + " AM" : hour == 12 ? "12 PM" : String(hour - 12) + " PM"}
                </div>
            ))}
        </section>
    )
}

export default Schedule
