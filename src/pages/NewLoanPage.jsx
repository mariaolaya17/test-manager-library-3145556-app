import { useState, useEffect, useCallback } from 'react'
import { apiFetch, buildQueryString, ApiError } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'

export default function NewLoanPage() {
  const [members, setMembers] = useState([])
  const [books, setBooks] = useState([])
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedBooks, setSelectedBooks] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchMembers = useCallback(async () => {
    try {
      const data = await apiFetch('/members?size=50')
      setMembers(data.items)
    } catch (err) {
      console.error('Failed to load members', err)
    }
  }, [])

  const fetchBooks = useCallback(async () => {
    try {
      const data = await apiFetch('/books?size=50')
      setBooks(data.items.filter((b) => b.available_copies > 0))
    } catch (err) {
      console.error('Failed to load books', err)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
    fetchBooks()
  }, [fetchMembers, fetchBooks])

  const addBook = (bookId) => {
    if (selectedBooks.find((b) => b.book_id === bookId)) return
    if (selectedBooks.length >= 3) return
    const book = books.find((b) => b.id === bookId)
    if (book) {
      setSelectedBooks([...selectedBooks, { book_id: bookId, title: book.title }])
    }
  }

  const removeBook = (bookId) => {
    setSelectedBooks(selectedBooks.filter((b) => b.book_id !== bookId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!selectedMember) {
      setError({ code: 'VALIDATION_ERROR', message: 'Please select a member.', details: [] })
      return
    }

    if (selectedBooks.length === 0) {
      setError({ code: 'VALIDATION_ERROR', message: 'Please select at least one book.', details: [] })
      return
    }

    setLoading(true)
    try {
      const payload = {
        member_id: selectedMember,
        items: selectedBooks.map((b) => ({ book_id: b.book_id })),
      }
      await apiFetch('/loans', { method: 'POST', body: payload })
      setSuccess('Loan registered successfully.')
      setSelectedMember('')
      setSelectedBooks([])
      fetchBooks()
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1rem' }}>New Loan</h1>

      <ErrorBanner error={error} />
      {success && <div className="card" style={{ background: '#d1fae5', color: '#065f46', marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Member</label>
            <select className="input" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} required>
              <option value="">Select a member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.document_number})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Books (max 3)</label>
            {selectedBooks.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                {selectedBooks.map((b) => (
                  <div key={b.book_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.25rem' }}>
                    <span>{b.title}</span>
                    <button type="button" className="btn btn-danger" onClick={() => removeBook(b.book_id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            {selectedBooks.length < 3 && (
              <select className="input" onChange={(e) => { if (e.target.value) { addBook(e.target.value); e.target.value = '' } }}>
                <option value="">Add a book...</option>
                {books.filter((b) => !selectedBooks.find((sb) => sb.book_id === b.id)).map((b) => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
                ))}
              </select>
            )}
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Loan'}
          </button>
        </form>
      </div>
    </div>
  )
}
