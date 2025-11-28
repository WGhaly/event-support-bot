'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateEvent(formData: FormData): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const logoUrl = formData.get('logoUrl') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const location = formData.get('location') as string
  const maxAttendees = formData.get('maxAttendees') as string
  const isPublished = formData.get('isPublished') === 'on'

  if (!id || !name || !startDate || !endDate || !location) {
    return { error: 'Name, dates, and location are required' }
  }

  // Verify ownership
  const event = await prisma.event.findUnique({
    where: { id },
  })

  if (!event || event.userId !== session.user.id) {
    return { error: 'Event not found or unauthorized' }
  }

  try {
    await prisma.event.update({
      where: { id },
      data: {
        name,
        description: description || null,
        logoUrl: logoUrl || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        isPublished,
      },
    })

    revalidatePath(`/dashboard/modules/events/${id}`)
    return {}
  } catch (error) {
    console.error('Error updating event:', error)
    return { error: 'Failed to update event' }
  }
}

export async function deleteEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const id = formData.get('id') as string

  if (!id) {
    throw new Error('Event ID is required')
  }

  try {
    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event || event.userId !== session.user.id) {
      throw new Error('Event not found or unauthorized')
    }

    await prisma.event.delete({
      where: { id },
    })

    redirect('/dashboard/modules/events')
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Failed to delete event')
  }
}
