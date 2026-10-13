import { useState, useEffect, useCallback } from 'react'
import { apiFetch, ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'

export default function OverduePage() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchOverdue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/loans/overdue')
      setItems(data.items || [])
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverdue()
  }, [fetchOverdue])

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Overdue Loans</h1>

      <ErrorBanner error={error} />

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No overdue loans.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Due Date</th>
                <th>Days Late</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.item_id}>
                  <td>{item.book_title}</td>
                  <td>{item.member_name}</td>
                  <td>{new Date(item.due_at).toLocaleDateString()}</td>
                  <td>{item.days_late}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
