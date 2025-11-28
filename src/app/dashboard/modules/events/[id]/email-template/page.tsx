import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft, Mail } from 'lucide-react'

export default async function EmailTemplatePage({
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
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/dashboard/modules/events/${event.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Template Builder</h1>
          <p className="text-muted-foreground">
            Customize invitation emails for {event.name}
          </p>
        </div>

        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Email Builder Coming Soon</h3>
          <p className="text-muted-foreground">
            The canvas-like email template builder will be available shortly
          </p>
        </div>
      </div>
    </div>
  )
}
