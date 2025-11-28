import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { registrationId } = await params

    // Get registration with event
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

    // Verify user is event creator
    if (registration.event.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only event creator can mark attendance' },
        { status: 403 }
      )
    }

    // Create attendance record
    const attendance = await prisma.eventAttendance.create({
      data: {
        registrationId: registration.id,
        checkedInBy: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      attendance: {
        id: attendance.id,
        checkedInAt: attendance.checkedInAt,
      },
    })
  } catch (error) {
    console.error('Attendance marking error:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}
