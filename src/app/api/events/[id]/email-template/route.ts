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
    const { template } = await request.json()

    if (!template || typeof template !== 'string') {
      return NextResponse.json(
        { error: 'Template HTML is required' },
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

    // Update event with email template
    await prisma.event.update({
      where: { id: eventId },
      data: { emailTemplate: template },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email template save error:', error)
    return NextResponse.json(
      { error: 'Failed to save email template' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: eventId } = await context.params

    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: session.user.id,
      },
      select: {
        emailTemplate: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template: event.emailTemplate })
  } catch (error) {
    console.error('Email template fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email template' },
      { status: 500 }
    )
  }
}
