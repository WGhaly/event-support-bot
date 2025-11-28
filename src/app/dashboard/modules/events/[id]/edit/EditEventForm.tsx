'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { updateEvent } from './actions'

interface EditEventFormProps {
  event: {
    id: string
    name: string
    description: string | null
    logoUrl: string | null
    startDate: Date | null
    endDate: Date | null
    location: string | null
    maxAttendees: number | null
    isPublished: boolean
  }
}

export default function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(event.logoUrl)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearLogo = () => {
    setLogoFile(null)
    setLogoPreview(event.logoUrl)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let logoUrl = event.logoUrl

      // Upload logo if a new file is selected
      if (logoFile) {
        setIsUploadingLogo(true)
        const formData = new FormData()
        formData.append('file', logoFile)

        const uploadResponse = await fetch('/api/events/logo', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || 'Failed to upload logo')
        }

        const { url } = await uploadResponse.json()
        logoUrl = url
        setIsUploadingLogo(false)
      }

      // Update event
      const formData = new FormData(e.currentTarget)
      if (logoUrl) {
        formData.set('logoUrl', logoUrl)
      }

      const result = await updateEvent(formData)

      if (result?.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Success - redirect to event details
      router.push(`/dashboard/modules/events/${event.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
      setIsUploadingLogo(false)
    }
  }

  // Format date for datetime-local input
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={event.id} />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Event Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Event Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={event.name}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Annual Tech Conference 2024"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event.description || ''}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Tell attendees about your event..."
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Event Logo
        </label>
        <div className="space-y-4">
          {logoPreview && (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={clearLogo}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-dashed rounded-lg hover:bg-muted flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </button>
            <p className="text-sm text-muted-foreground mt-1">
              Recommended: Square image, max 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Event Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            required
            defaultValue={event.startDate ? formatDateForInput(event.startDate) : ''}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            required
            defaultValue={event.endDate ? formatDateForInput(event.endDate) : ''}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          defaultValue={event.location || ''}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Convention Center, City Hall"
        />
      </div>

      {/* Capacity */}
      <div>
        <label htmlFor="maxAttendees" className="block text-sm font-medium mb-2">
          Capacity
        </label>
        <input
          type="number"
          id="maxAttendees"
          name="maxAttendees"
          min="1"
          defaultValue={event.maxAttendees || ''}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Maximum number of attendees"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Leave empty for unlimited capacity
        </p>
      </div>

      {/* Published Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          defaultChecked={event.isPublished}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="isPublished" className="text-sm font-medium">
          Publish event (make registration page public)
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploadingLogo}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isUploadingLogo
            ? 'Uploading Logo...'
            : isSubmitting
            ? 'Updating...'
            : 'Update Event'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/modules/events/${event.id}`)}
          className="px-6 py-3 border rounded-lg hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
