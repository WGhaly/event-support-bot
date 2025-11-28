import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Calendar, MapPin, Clock } from 'lucide-react'
import RegistrationForm from './RegistrationForm'

export default async function PublicRegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      formFields: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { registrations: true },
      },
    },
  })

  if (!event || !event.isPublished) {
    notFound()
  }

  // Check if event is full
  const isFull = event.maxAttendees && event._count.registrations >= event.maxAttendees

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Event Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Event Logo/Banner */}
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {event.logoUrl ? (
              <img
                src={event.logoUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Calendar className="w-24 h-24 text-white/80" />
            )}
          </div>

          {/* Event Info */}
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
            {event.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {event.description}
              </p>
            )}

            {/* Event Details */}
            <div className="flex flex-wrap gap-6 text-sm">
              {event.startDate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Start Date</div>
                    <div className="text-muted-foreground">
                      {new Date(event.startDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-muted-foreground">{event.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Registration Status */}
            {event.maxAttendees && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Available Spots</span>
                  <span className="text-lg font-bold">
                    {event.maxAttendees - event._count.registrations} / {event.maxAttendees}
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{
                      width: `${(event._count.registrations / event.maxAttendees) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registration Form */}
        {isFull ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold mb-2">Event is Full</h2>
            <p className="text-muted-foreground">
              Unfortunately, this event has reached maximum capacity.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Register for Event</h2>
            <RegistrationForm event={event} formFields={event.formFields} />
          </div>
        )}
      </div>
    </div>
  )
}
