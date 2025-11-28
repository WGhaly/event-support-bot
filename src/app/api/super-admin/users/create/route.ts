import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole } from '@/lib/rbac'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    await requireRole('super-admin')

    const body = await req.json()
    const { email, name, password } = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Get the 'user' role
    const userRole = await prisma.role.findUnique({
      where: { name: 'user' },
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 500 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        roleId: userRole.id,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
