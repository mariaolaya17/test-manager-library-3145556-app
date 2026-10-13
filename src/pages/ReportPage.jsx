import { useState } from 'react'
import { apiFetch, ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'

export default function ReportPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch(`/reports/most-borrowed?from=${from}&to=${to}`)
      setRows(data.rows || [])
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Most Borrowed Books Report</h1>

      <ErrorBanner error={error} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>From</label>
              <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>To</label>
              <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <p>No data for the selected range.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Category</th>
                <th>Times Borrowed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>{row.book_title}</td>
                  <td>{row.category_name}</td>
                  <td>{row.times_borrowed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
