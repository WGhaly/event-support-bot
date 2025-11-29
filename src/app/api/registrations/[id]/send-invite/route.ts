import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEventInvite } from '@/lib/email'

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: registrationId } = await context.params

    // Fetch registration with event details
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Verify event ownership
    if (registration.event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already sent
    if (registration.inviteSent) {
      return NextResponse.json(
        { error: 'Invitation already sent' },
        { status: 400 }
      )
    }

    // Parse form data to get attendee name
    let formData: any = {}
    try {
      formData = JSON.parse(registration.formData)
    } catch (e) {
      console.error('Failed to parse form data:', e)
    }

    const attendeeName = formData.name || formData.fullName || 'Attendee'

    // Generate attendance URL (what the QR code will encode)
    const attendanceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/attendance/${registration.id}`

    // Send email
    const result = await sendEventInvite({
      to: registration.email,
      eventName: registration.event.name,
      eventDate: registration.event.startDate?.toISOString(),
      eventLocation: registration.event.location || undefined,
      attendeeName,
      qrCodeData: attendanceUrl,
      customTemplate: registration.event.emailTemplate || undefined,
      registrationId: registration.id,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Mark as sent
    await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: {
        inviteSent: true,
        inviteSentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send invite error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
