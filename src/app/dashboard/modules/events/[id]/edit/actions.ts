'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function updateEvent(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const logoUrl = formData.get('logoUrl') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string
  const location = formData.get('location') as string
  const maxAttendees = formData.get('maxAttendees') as string
  const isPublished = formData.get('isPublished') === 'on'

  if (!id || !name || !slug) {
    throw new Error('ID, name, and slug are required')
  }

  try {
    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event || event.userId !== session.user.id) {
      throw new Error('Event not found or unauthorized')
    }

    await prisma.event.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: description || null,
        logoUrl: logoUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location: location || null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        isPublished,
      },
    })

    redirect(`/dashboard/modules/events/${id}`)
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Failed to update event')
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
