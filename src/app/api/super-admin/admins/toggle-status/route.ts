import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { z } from 'zod'

const toggleStatusSchema = z.object({
  adminId: z.string(),
  isActive: z.boolean(),
})

export async function POST(req: NextRequest) {
  try {
    await requireRole('super-admin')

    const body = await req.json()
    const { adminId, isActive } = toggleStatusSchema.parse(body)

    // Check if admin exists and is not super-admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      include: { role: true },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    if (admin.role.name === 'super-admin') {
      return NextResponse.json(
        { error: 'Cannot disable super-admin accounts' },
        { status: 400 }
      )
    }

    if (!['admin', 'super-admin'].includes(admin.role.name)) {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 400 }
      )
    }

    // Update admin status
    await prisma.user.update({
      where: { id: adminId },
      data: { isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling admin status:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to toggle admin status' },
      { status: 500 }
    )
  }
}
