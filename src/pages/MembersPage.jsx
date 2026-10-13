import { useState, useEffect, useCallback } from 'react'
import { apiFetch, buildQueryString, ApiError } from '../api/client'
import Pagination from '../components/Pagination'
import ErrorBanner from '../components/ErrorBanner'

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [q, setQ] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQueryString({ q, page, size })
      const data = await apiFetch(`/members${qs}`)
      setMembers(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }, [q, page, size])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.target)
    const payload = {
      full_name: formData.get('full_name'),
      document_number: formData.get('document_number'),
    }
    try {
      await apiFetch('/members', { method: 'POST', body: payload })
      setShowForm(false)
      fetchMembers()
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Members</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Member'}
        </button>
      </div>

      <ErrorBanner error={error} />

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2>New Member</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" name="full_name" required />
            </div>
            <div className="form-group">
              <label>Document Number</label>
              <input className="input" name="document_number" required />
            </div>
            <button className="btn" type="submit">Create</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <input
            className="input"
            placeholder="Search by name or document..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Document</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.full_name}</td>
                    <td>{member.document_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} size={size} total={total} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
