import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CreateEventForm } from './CreateEventForm'

export default async function CreateEventPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href="/dashboard/modules/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-muted-foreground mb-8">
          Set up your event details and registration form
        </p>

        <CreateEventForm />
      </div>
    </div>
  )
}
