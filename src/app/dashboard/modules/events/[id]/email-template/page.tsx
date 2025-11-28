import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'
import EmailTemplateEditor from './EmailTemplateEditor'

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
    <div className="h-screen flex flex-col">
      <div className="border-b p-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/dashboard/modules/events/${event.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </Link>
          <h1 className="text-2xl font-bold">Email Template - {event.name}</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <EmailTemplateEditor 
          eventId={event.id} 
          initialTemplate={event.emailTemplate || undefined}
          eventLogoUrl={event.logoUrl}
        />
      </div>
    </div>
  )
}
