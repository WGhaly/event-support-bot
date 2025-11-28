import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendBulkEventInvites } from '@/lib/email'

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
    const { registrationIds } = await request.json()

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json(
        { error: 'Registration IDs are required' },
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

    // Fetch registrations
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        id: { in: registrationIds },
        eventId: eventId,
        status: 'accepted', // Only send to accepted registrations
        inviteSent: false, // Only send to those who haven't received it yet
      },
    })

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'No eligible registrations found' },
        { status: 400 }
      )
    }

    // Prepare email data
    const qrCodeBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const invites = registrations.map(registration => {
      let formData: any = {}
      try {
        formData = JSON.parse(registration.formData)
      } catch (e) {
        console.error('Failed to parse form data:', e)
      }

      const attendeeName = formData.name || formData.fullName || 'Attendee'

      return {
        to: registration.email,
        eventName: event.name,
        eventDate: event.startDate?.toISOString(),
        eventLocation: event.location || undefined,
        attendeeName,
        qrCodeUrl: `${qrCodeBaseUrl}/attendance/${registration.id}`,
        customTemplate: event.emailTemplate || undefined,
        registrationId: registration.id,
      }
    })

    // Send bulk emails
    const result = await sendBulkEventInvites(invites)

    // Update sent status for successful sends
    if (result.sent > 0) {
      const sentIds = registrations
        .slice(0, result.sent)
        .map(r => r.id)

      await prisma.eventRegistration.updateMany({
        where: { id: { in: sentIds } },
        data: {
          inviteSent: true,
          inviteSentAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: registrations.length,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Bulk send error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    )
  }
}
