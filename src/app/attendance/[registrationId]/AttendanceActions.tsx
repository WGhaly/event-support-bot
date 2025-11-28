'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AttendanceActions({ registrationId }: { registrationId: string }) {
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)

  async function handleMarkAttendance() {
    if (!confirm('Mark this attendee as present?')) {
      return
    }

    setIsMarking(true)

    try {
      const response = await fetch(`/api/attendance/${registrationId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark attendance')
      }

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      alert('Failed to mark attendance. Please try again.')
      setIsMarking(false)
    }
  }

  return (
    <button
      onClick={handleMarkAttendance}
      disabled={isMarking}
      className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isMarking ? 'Marking Attendance...' : 'Mark as Present'}
    </button>
  )
}
