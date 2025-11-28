import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          console.log('🔐 Auth attempt with:', credentials)
          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              role: true,
            },
          })

          if (!user) {
            console.log('❌ User not found:', email)
            return null
          }

          if (!user.isActive) {
            console.log('❌ User account is disabled:', email)
            return null
          }

          const isValid = await bcrypt.compare(password, user.passwordHash)
          console.log('🔑 Password valid:', isValid)

          if (!isValid) {
            return null
          }

          console.log('✅ Auth successful for:', user.email, 'Role:', user.role.name)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name,
            roleId: user.roleId,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.roleId = user.roleId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.roleId = token.roleId as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
})
