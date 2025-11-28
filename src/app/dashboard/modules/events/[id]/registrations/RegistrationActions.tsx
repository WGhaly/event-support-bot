'use client'

import { useState, useMemo } from 'react'
import { Check, X, Search, Mail } from 'lucide-react'

type Registration = {
  id: string
  email: string
  status: string
  createdAt: Date
  inviteSent?: boolean
}

export default function RegistrationActions({
  registrations,
  eventId,
}: {
  registrations: Registration[]
  eventId: string
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter
      const matchesSearch = reg.email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [registrations, statusFilter, searchQuery])

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const toggleSelectAll = () => {
    if (selected.size === filteredRegistrations.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredRegistrations.map(r => r.id)))
    }
  }

  const handleBulkAction = async (action: 'accept' | 'reject') => {
    if (selected.size === 0) {
      alert('Please select at least one registration')
      return
    }

    if (!confirm(`${action} ${selected.size} registration(s)?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationIds: Array.from(selected),
          action,
        }),
      })

      if (!response.ok) throw new Error('Failed to update registrations')

      window.location.reload()
    } catch (error) {
      alert('Failed to update registrations. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkEmail = async () => {
    if (selected.size === 0) {
      alert('Please select at least one registration')
      return
    }

    const acceptedSelected = Array.from(selected).filter(id => {
      const reg = registrations.find(r => r.id === id)
      return reg?.status === 'accepted'
    })

    if (acceptedSelected.length === 0) {
      alert('Please select at least one accepted registration')
      return
    }

    if (!confirm(`Send invitation emails to ${acceptedSelected.length} attendee(s)?`)) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationIds: acceptedSelected,
        }),
      })

      if (!response.ok) throw new Error('Failed to send emails')

      const result = await response.json()
      alert(`Successfully sent ${result.sent} invitation(s). Failed: ${result.failed}`)
      window.location.reload()
    } catch (error) {
      alert('Failed to send emails. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <span className="font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('accept')}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Accept Selected
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reject Selected
            </button>
            <button
              onClick={handleBulkEmail}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              Send Invites
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === filteredRegistrations.length && filteredRegistrations.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Registered</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRegistrations.map((registration) => (
              <tr key={registration.id} className={selected.has(registration.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(registration.id)}
                    onChange={() => toggleSelect(registration.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-4 py-3">{registration.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      registration.status === 'accepted'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : registration.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {registration.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(registration.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/attendance/${registration.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
