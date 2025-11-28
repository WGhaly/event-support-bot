import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft, Plus } from 'lucide-react'

export default async function FormBuilderPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      formFields: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!event || event.userId !== session.user.id) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/dashboard/modules/events/${event.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Registration Form Builder</h1>
            <p className="text-muted-foreground">
              Build your custom registration form for {event.name}
            </p>
          </div>
        </div>

        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Form Builder Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            The drag-and-drop form builder will be available shortly
          </p>
          <p className="text-sm text-muted-foreground">
            Currently configured fields: {event.formFields.length}
          </p>
        </div>
      </div>
    </div>
  )
}
