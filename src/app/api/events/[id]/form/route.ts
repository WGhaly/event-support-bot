import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { fields } = await request.json()

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 })
    }

    // Delete existing fields
    await prisma.formField.deleteMany({
      where: { eventId: id },
    })

    // Create new fields
    if (fields && fields.length > 0) {
      // Parse options field if it's a string
      const processedFields = fields.map((field: any) => {
        let options = field.options
        
        // If options is a string, try to parse as JSON or split by newlines
        if (typeof options === 'string' && options.trim()) {
          try {
            // Try to parse as JSON
            const parsed = JSON.parse(options)
            options = JSON.stringify(Array.isArray(parsed) ? parsed : [options])
          } catch {
            // Split by newlines and create array
            const optionsArray = options.split('\n').map((o: string) => o.trim()).filter((o: string) => o)
            options = JSON.stringify(optionsArray)
          }
        }

        return {
          eventId: id,
          label: field.label,
          fieldType: field.fieldType,
          placeholder: field.placeholder || null,
          helpText: field.helpText || null,
          isRequired: field.isRequired || false,
          options: options || null,
          order: field.order,
        }
      })

      await prisma.formField.createMany({
        data: processedFields,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form save error:', error)
    return NextResponse.json(
      { error: 'Failed to save form' },
      { status: 500 }
    )
  }
}
