import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await requireRole('super-admin')
    
    const body = await request.json()
    const { userId, isActive } = body

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Prevent disabling super admins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (user?.role.name === 'super-admin') {
      return NextResponse.json(
        { error: 'Cannot disable super admin accounts' },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}
