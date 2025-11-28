'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function createEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const logoUrl = formData.get('logoUrl') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const location = formData.get('location') as string
  const maxAttendees = formData.get('maxAttendees') as string

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  try {
    const event = await prisma.event.create({
      data: {
        userId: session.user.id,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: description || null,
        logoUrl: logoUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      },
    })

    redirect(`/dashboard/modules/events/${event.id}`)
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Failed to create event')
  }
}
