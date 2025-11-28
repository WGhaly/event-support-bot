import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { updateEvent, deleteEvent } from './actions'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id },
  })

  if (!event || event.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href={`/dashboard/modules/events/${event.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>

        <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
        <p className="text-muted-foreground mb-8">
          Update your event details
        </p>

        {/* Form */}
        <form action={updateEvent} className="space-y-6">
          <input type="hidden" name="id" value={event.id} />

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
              defaultValue={event.name}
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
                defaultValue={event.slug}
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
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
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

          {/* Logo URL */}
          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium mb-2">
              Logo URL
            </label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              defaultValue={event.logoUrl || ''}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Optional: Add a logo image URL
            </p>
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium mb-2"
              >
                Start Date
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                defaultValue={
                  event.startDate
                    ? new Date(event.startDate).toISOString().slice(0, 16)
                    : ''
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium mb-2"
              >
                End Date
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                defaultValue={
                  event.endDate
                    ? new Date(event.endDate).toISOString().slice(0, 16)
                    : ''
                }
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
              defaultValue={event.location || ''}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Convention Center, Downtown"
            />
          </div>

          {/* Max Attendees */}
          <div>
            <label
              htmlFor="maxAttendees"
              className="block text-sm font-medium mb-2"
            >
              Maximum Attendees
            </label>
            <input
              type="number"
              id="maxAttendees"
              name="maxAttendees"
              min="1"
              defaultValue={event.maxAttendees || ''}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="500"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty for unlimited
            </p>
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              defaultChecked={event.isPublished}
              className="w-4 h-4 text-primary"
            />
            <div>
              <label htmlFor="isPublished" className="font-medium cursor-pointer">
                Publish Event
              </label>
              <p className="text-sm text-muted-foreground">
                Make the registration form publicly accessible
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
              <Link
                href={`/dashboard/modules/events/${event.id}`}
                className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </Link>
            </div>
            <button
              type="button"
              formAction={deleteEvent}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={(e) => {
                if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                  e.preventDefault()
                }
              }}
            >
              Delete Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
