'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { createEvent } from './actions'

export function CreateEventForm() {
  const router = useRouter()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit')
      return
    }

    setError('')
    setLogoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)

      // Upload logo if present
      if (logoFile) {
        const logoFormData = new FormData()
        logoFormData.append('logo', logoFile)

        const uploadResponse = await fetch('/api/events/logo', {
          method: 'POST',
          body: logoFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Failed to upload logo')
        }

        const { url } = await uploadResponse.json()
        formData.set('logoUrl', url)
      }

      // Create event
      const result = await createEvent(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Redirect to events list (no details page exists yet)
      router.push('/dashboard/modules/events')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Event Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Event Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Annual Tech Conference 2024"
        />
      </div>

      {/* Event Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          URL Slug *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/register/</span>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="tech-conference-2024"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Lowercase letters, numbers, and hyphens only
        </p>
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
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Tell attendees about your event..."
        />
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Event Logo
        </label>
        
        {!logoPreview ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              id="logo"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="logo"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload logo (JPEG, PNG, GIF, WebP)
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="relative border rounded-lg p-4 flex items-center gap-4">
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-24 h-24 object-contain rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{logoFile?.name}</p>
              <p className="text-xs text-muted-foreground">
                {logoFile && (logoFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <input type="hidden" name="logoUrl" value="" />
      </div>

      {/* Event Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Start Date
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            End Date
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Convention Center, Downtown"
        />
      </div>

      {/* Max Attendees */}
      <div>
        <label htmlFor="maxAttendees" className="block text-sm font-medium mb-2">
          Maximum Attendees
        </label>
        <input
          type="number"
          id="maxAttendees"
          name="maxAttendees"
          min="1"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="500"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Leave empty for unlimited
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Creating...' : 'Create Event'}
        </button>
        <a
          href="/dashboard/modules/events"
          className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
