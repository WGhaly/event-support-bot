import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await requireRole('super-admin')
    
    const body = await request.json()
    const { userId, moduleId, isEnabled } = body

    if (!userId || !moduleId || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Check if the user-module relationship exists
    const existing = await prisma.userModule.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    })

    if (existing) {
      // Update existing
      await prisma.userModule.update({
        where: {
          userId_moduleId: {
            userId,
            moduleId,
          },
        },
        data: { isEnabled },
      })
    } else {
      // Create new
      await prisma.userModule.create({
        data: {
          userId,
          moduleId,
          isEnabled,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling module:', error)
    return NextResponse.json(
      { error: 'Failed to update module access' },
      { status: 500 }
    )
  }
}
