import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendBulkEventInvites } from '@/lib/email'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[send-bulk] Starting email send process')
    
    const session = await auth()
    if (!session?.user?.id) {
      console.log('[send-bulk] Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await context.params
    const { registrationIds } = await request.json()

    console.log('[send-bulk] Event ID:', eventId)
    console.log('[send-bulk] Registration IDs:', registrationIds)

    if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
      console.log('[send-bulk] No registration IDs provided')
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
      console.log('[send-bulk] Event not found or unauthorized')
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      )
    }

    console.log('[send-bulk] Event found:', event.name)

    // Fetch registrations
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        id: { in: registrationIds },
        eventId: eventId,
        status: 'accepted', // Only send to accepted registrations
      },
    })

    console.log('[send-bulk] Found registrations:', registrations.length)

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'No eligible registrations found. Make sure registrations are accepted.' },
        { status: 400 }
      )
    }

    // Prepare email data
    const qrCodeBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    console.log('[send-bulk] QR Code Base URL:', qrCodeBaseUrl)
    console.log('[send-bulk] Email template exists:', !!event.emailTemplate)
    
    const invites = registrations.map(registration => {
      let formData: any = {}
      try {
        formData = JSON.parse(registration.formData)
      } catch (e) {
        console.error('[send-bulk] Failed to parse form data:', e)
      }

      // Try multiple field names for attendee name
      const attendeeName = formData.name || formData.fullName || formData.full_name || 
        formData.firstName || formData.first_name || 
        (formData.firstName && formData.lastName ? `${formData.firstName} ${formData.lastName}` : null) ||
        (formData.first_name && formData.last_name ? `${formData.first_name} ${formData.last_name}` : null) ||
        'Attendee'
      
      console.log('[send-bulk] Extracted attendee name:', attendeeName, 'from formData:', Object.keys(formData))

      const attendanceUrl = `${qrCodeBaseUrl}/attendance/${registration.id}`

      return {
        to: registration.email,
        eventName: event.name,
        eventDate: event.startDate?.toISOString(),
        eventLocation: event.location || undefined,
        attendeeName,
        qrCodeData: attendanceUrl, // URL that QR code will encode
        customTemplate: event.emailTemplate || undefined,
        registrationId: registration.id,
      }
    })

    console.log('[send-bulk] Prepared invites:', invites.length)
    console.log('[send-bulk] Sample invite:', JSON.stringify(invites[0], null, 2))

    // Send bulk emails
    console.log('[send-bulk] Calling sendBulkEventInvites...')
    const result = await sendBulkEventInvites(invites)

    console.log('[send-bulk] Result:', { sent: result.sent, failed: result.failed, success: result.success })
    if (result.errors && result.errors.length > 0) {
      console.log('[send-bulk] Errors:', JSON.stringify(result.errors, null, 2))
    }

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
    const errorMessage = error instanceof Error ? error.message : 'Failed to send invitations'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
