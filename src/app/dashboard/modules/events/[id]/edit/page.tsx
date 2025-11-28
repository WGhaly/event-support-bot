import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { deleteEvent } from './actions'
import { DeleteEventButton } from '@/components/delete-event-button'
import EditEventForm from './EditEventForm'

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
        <EditEventForm event={event} />

        {/* Delete Event - Separate Form */}
        <div className="mt-8 pt-8 border-t">
          <DeleteEventButton eventId={event.id} deleteAction={deleteEvent} />
        </div>
      </div>
    </div>
  )
}
