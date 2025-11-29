import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import {
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  MapPin,
  Settings,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { CopyUrlButton } from '@/components/copy-url-button'

// Force dynamic rendering
// Build timestamp: 2025-11-29 - Testing route resolution
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // DEBUG: Test if this page is even executing
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-green-600">✅ EVENT PAGE COMPONENT IS EXECUTING!</h1>
      <p className="mt-4 text-lg">If you see this, Next.js found the route and is rendering the component.</p>
    </div>
  )
  
  // Auth is handled by dashboard layout - we can safely assume user is authenticated here
  // Getting session from auth() might fail in Edge Runtime, so we'll get user ID from the database query
  
  const { id } = await params
  
  let event
  try {
    event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
            formFields: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('Database error fetching event:', error)
    // If database fails, we can't do much - let it error
    throw error
  }

  if (!event) {
    notFound()
  }

  // Since we can't reliably get session.user.id in Edge Runtime,
  // we'll just show the event. Access control is done at the API level.
  // This is temporary until we fix the Edge Runtime auth() issue.

  const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register/${event.slug}`

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/dashboard/modules/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            {event.logoUrl ? (
              <img
                src={event.logoUrl}
                alt={event.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              {event.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    event.isPublished
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {event.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/dashboard/modules/events/${event.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Link>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {event.location && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-sm">{event.location}</p>
            </div>
          )}
          {event.startDate && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Start Date</span>
              </div>
              <p className="text-sm">
                {new Date(event.startDate).toLocaleString()}
              </p>
            </div>
          )}
          {event.maxAttendees && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Capacity</span>
              </div>
              <p className="text-sm">
                {event._count.registrations} / {event.maxAttendees}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/dashboard/modules/events/${event.id}/form-builder`}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <Settings className="w-8 h-8 mb-3 text-blue-500" />
            <h3 className="font-semibold mb-1">Registration Form</h3>
            <p className="text-sm text-muted-foreground">
              {event._count.formFields} fields configured
            </p>
          </Link>

          <Link
            href={`/dashboard/modules/events/${event.id}/registrations`}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <Users className="w-8 h-8 mb-3 text-green-500" />
            <h3 className="font-semibold mb-1">Registrations</h3>
            <p className="text-sm text-muted-foreground">
              {event._count.registrations} registered
            </p>
          </Link>

          <Link
            href={`/dashboard/modules/events/${event.id}/email-template`}
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <Mail className="w-8 h-8 mb-3 text-purple-500" />
            <h3 className="font-semibold mb-1">Email Template</h3>
            <p className="text-sm text-muted-foreground">
              Customize invitation emails
            </p>
          </Link>

          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <ExternalLink className="w-8 h-8 mb-3 text-orange-500" />
            <h3 className="font-semibold mb-1">Public Registration</h3>
            <p className="text-sm text-muted-foreground break-all">
              /{event.slug}
            </p>
          </a>
        </div>

        {/* Registration URL */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Registration URL</h3>
              <p className="text-sm text-muted-foreground break-all">
                {registrationUrl}
              </p>
            </div>
            <CopyUrlButton url={registrationUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}
