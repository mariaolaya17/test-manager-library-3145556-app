import { useState } from 'react'
import { apiFetch, ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'

export default function UsersPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: { username, password, role: 'librarian' },
      })
      setSuccess(`Librarian '${username}' created successfully.`)
      setUsername('')
      setPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Create Librarian</h1>

      <ErrorBanner error={error} />
      {success && <div className="card" style={{ background: '#d1fae5', color: '#065f46', marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Librarian'}
          </button>
        </form>
      </div>
    </div>
  )
}
