import { useState } from 'react'
import type { Credentials } from './api/greenApi'
import { Login } from './components/Login/Login'
import { Messenger } from './components/Messenger/Messenger'

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  return credentials ? (
    <Messenger credentials={credentials} onLogout={() => setCredentials(null)} />
  ) : (
    <Login onLogin={setCredentials} />
  )
}
