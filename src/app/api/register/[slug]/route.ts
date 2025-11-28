import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Get event
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        formFields: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event || !event.isPublished) {
      return NextResponse.json(
        { error: 'Event not found or not published' },
        { status: 404 }
      )
    }

    // Check if event is full
    if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    
    // Extract email (required field)
    let email = ''
    const emailField = event.formFields.find(f => f.fieldType === 'email')
    if (emailField) {
      email = formData.get(emailField.id) as string
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Build form responses
    const responses: Record<string, any> = {}
    
    for (const field of event.formFields) {
      if (field.fieldType === 'checkbox') {
        // Handle multiple checkbox values
        const values = formData.getAll(field.id)
        responses[field.id] = values
      } else {
        const value = formData.get(field.id)
        responses[field.id] = value
      }

      // Validate required fields
      if (field.isRequired && (!responses[field.id] || responses[field.id].length === 0)) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        )
      }
    }

    // Generate unique QR code
    const qrCode = nanoid(16)

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        email,
        formData: JSON.stringify(responses),
        qrCode,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      id: registration.id,
      qrCode: registration.qrCode,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}
