export default function Pagination({ page, size, total, onPageChange }) {
  const totalPages = Math.ceil(total / size)

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>Page {page} of {totalPages} ({total} results)</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </div>
  )
}
