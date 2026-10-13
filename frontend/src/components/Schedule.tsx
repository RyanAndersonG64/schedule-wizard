import { useEffect, useState } from 'react'
import '../App.css'

function Schedule() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    setMessage("hhuehuehuehue")
  }, [])

  return (
    <section id="center">
      <h1>Schedule Wizard</h1>
      <p>{message}</p>
    </section>
  )
}

export default Schedule
