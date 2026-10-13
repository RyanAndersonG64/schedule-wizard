import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data: { message: string }) => setMessage(data.message))
      .catch(() => setMessage('Could not reach the backend.'))
  }, [])

  return (
    <section id="center">
      <h1>Schedule Wizard</h1>
      <p>{message}</p>
    </section>
  )
}

export default App
