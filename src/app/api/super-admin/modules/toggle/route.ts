import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await requireRole('super-admin')
    
    const body = await request.json()
    const { moduleId, isActive } = body

    if (!moduleId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    await prisma.module.update({
      where: { id: moduleId },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling module:', error)
    return NextResponse.json(
      { error: 'Failed to update module status' },
      { status: 500 }
    )
  }
}
