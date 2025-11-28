import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await requireRole('super-admin')
    
    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json(
        { error: 'Missing adminId' },
        { status: 400 }
      )
    }

    // Check if the user is an admin or super-admin
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

    // Prevent deleting super admins
    if (admin.role.name === 'super-admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin accounts' },
        { status: 403 }
      )
    }

    // Delete the admin
    await prisma.user.delete({
      where: { id: adminId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}
