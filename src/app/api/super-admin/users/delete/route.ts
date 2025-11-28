import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import { z } from 'zod'

const deleteUserSchema = z.object({
  userId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    await requireRole('super-admin')

    const body = await req.json()
    const { userId } = deleteUserSchema.parse(body)

    // Check if user exists and is not an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role.name !== 'user') {
      return NextResponse.json(
        { error: 'Cannot delete admin users from this page' },
        { status: 400 }
      )
    }

    // Delete user and all related data (cascading will handle projects, etc.)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
