import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await context.params
    const { registrationIds, action } = await request.json()

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json(
        { error: 'Registration IDs are required' },
        { status: 400 }
      )
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    // Verify event ownership
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update registrations
    const result = await prisma.eventRegistration.updateMany({
      where: {
        id: { in: registrationIds },
        eventId: eventId,
      },
      data: {
        status: action === 'accept' ? 'accepted' : 'rejected',
      },
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: 'Failed to update registrations' },
      { status: 500 }
    )
  }
}
