import { useState, useEffect, useCallback } from 'react'
import { apiFetch, buildQueryString, ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import Pagination from '../components/Pagination'
import ErrorBanner from '../components/ErrorBanner'

export default function BooksPage() {
  const { role } = useAuth()
  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  const isAdmin = role === 'admin'

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch('/categories')
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }, [])

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = buildQueryString({ q, category_id: categoryId, page, size })
      const data = await apiFetch(`/books${qs}`)
      setBooks(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    } finally {
      setLoading(false)
    }
  }, [q, categoryId, page, size])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    try {
      await apiFetch(`/books/${id}`, { method: 'DELETE' })
      fetchBooks()
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.target)
    const payload = {
      title: formData.get('title'),
      author: formData.get('author'),
      isbn: formData.get('isbn'),
      category_id: formData.get('category_id'),
      total_copies: parseInt(formData.get('total_copies'), 10),
    }
    try {
      if (editingBook) {
        await apiFetch(`/books/${editingBook.id}`, { method: 'PUT', body: payload })
      } else {
        await apiFetch('/books', { method: 'POST', body: payload })
      }
      setShowForm(false)
      setEditingBook(null)
      fetchBooks()
    } catch (err) {
      setError(err instanceof ApiError ? err : { code: 'UNKNOWN', message: err.message, details: [] })
    }
  }

  const startEdit = (book) => {
    setEditingBook(book)
    setShowForm(true)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Books</h1>
        {isAdmin && (
          <button className="btn" onClick={() => { setEditingBook(null); setShowForm(!showForm) }}>
            {showForm ? 'Cancel' : 'New Book'}
          </button>
        )}
      </div>

      <ErrorBanner error={error} />

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2>{editingBook ? 'Edit Book' : 'New Book'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input className="input" name="title" defaultValue={editingBook?.title || ''} required />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input className="input" name="author" defaultValue={editingBook?.author || ''} required />
            </div>
            {!editingBook && (
              <div className="form-group">
                <label>ISBN (13 digits)</label>
                <input className="input" name="isbn" pattern="\d{13}" defaultValue={editingBook?.isbn || ''} required />
              </div>
            )}
            <div className="form-group">
              <label>Category</label>
              <select className="input" name="category_id" defaultValue={editingBook?.category?.id || ''} required>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Total Copies</label>
              <input className="input" name="total_copies" type="number" min="1" defaultValue={editingBook?.total_copies || 1} required />
            </div>
            <button className="btn" type="submit">{editingBook ? 'Update' : 'Create'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            className="input"
            placeholder="Search by title or author..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
          />
          <select className="input" style={{ maxWidth: '200px' }} value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Available</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category?.name}</td>
                    <td>{book.available_copies} / {book.total_copies}</td>
                    {isAdmin && (
                      <td>
                        <button className="btn btn-secondary" onClick={() => startEdit(book)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(book.id)}>Delete</button>
                      </td>
                    )}
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
