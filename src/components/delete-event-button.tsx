'use client'

export function DeleteEventButton({ 
  eventId, 
  deleteAction 
}: { 
  eventId: string
  deleteAction: (formData: FormData) => Promise<void>
}) {
  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    const formData = new FormData()
    formData.append('id', eventId)
    await deleteAction(formData)
  }

  return (
    <form onSubmit={handleDelete}>
      <input type="hidden" name="id" value={eventId} />
      <button
        type="submit"
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Delete Event
      </button>
    </form>
  )
}
