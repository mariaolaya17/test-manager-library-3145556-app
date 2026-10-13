export default function ErrorBanner({ error }) {
  if (!error) return null

  return (
    <div className="error-banner">
      <strong>{error.code}:</strong> {error.message}
      {error.details?.length > 0 && (
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
          {error.details.map((d, i) => (
            <li key={i}>{d.field}: {d.issue}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
