// Minimal test page with no imports
export const dynamic = 'force-dynamic'

export default function EventDetailsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>
        ✅ ROUTE FOUND - PAGE IS RENDERING!
      </h1>
      <p style={{ marginTop: '1rem' }}>
        This is a minimal test page with no imports or database calls.
      </p>
    </div>
  )
}
