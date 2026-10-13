import { useState, useEffect, useCallback } from 'react'
import { apiFetch, buildQueryString, ApiError } from '../api/client'
import Pagination from '../components/Pagination'
import ErrorBanner from '../components/ErrorBanner'

export default function LoansPage() {
  const [loans, setLoans] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [status, setStatus] = useState('')
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQueryString({ from, to, status, member_id: memberId, page, size })
      const data = await apiFetch(`/loans${qs}`)
      setLoans(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }, [from, to, status, memberId, page, size])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const handleReturn = async (loanId, itemId) => {
    if (!confirm('Confirm return of this item?')) return
    try {
      await apiFetch(`/loans/${loanId}/items/${itemId}/return`, { method: 'POST' })
      fetchLoans()
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    }
  }

  const statusBadge = (s) => {
    const cls = s === 'open' ? 'badge-open' : s === 'overdue' ? 'badge-overdue' : 'badge-closed'
    return <span className={`badge ${cls}`}>{s}</span>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>Loans</h1>

      <ErrorBanner error={error} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input className="input" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} placeholder="From" />
          <input className="input" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} placeholder="To" />
          <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="overdue">Overdue</option>
            <option value="closed">Closed</option>
          </select>
          <input className="input" placeholder="Member ID" value={memberId} onChange={(e) => { setMemberId(e.target.value); setPage(1) }} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.id.slice(0, 8)}...</td>
                    <td>{loan.member_id.slice(0, 8)}...</td>
                    <td>{new Date(loan.loaned_at).toLocaleDateString()}</td>
                    <td>{statusBadge(loan.status)}</td>
                    <td>{loan.items?.length || 0}</td>
                    <td>
                      {loan.items?.filter((i) => !i.returned_at).map((item) => (
                        <button key={item.id} className="btn btn-secondary" onClick={() => handleReturn(loan.id, item.id)}>
                          Return: {item.book_title.slice(0, 20)}
                        </button>
                      ))}
                    </td>
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
