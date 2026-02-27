import { NextResponse } from 'next/server'
import prisma, { isDemoMode } from '@/lib/db'
import bcrypt from 'bcrypt'
import { createSessionTokens } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    let user: any = null;
    
    if (isDemoMode) {
       user = { id: 'demo-user', email, name: 'Demo User', role: 'ADMIN', password: 'hashed_password' }
    } else {
       user = await prisma.user.findUnique({ where: { email } })
       if (!user) {
         return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
       }
       
       const passwordMatch = await bcrypt.compare(password, user.password)
       if (!passwordMatch) {
         return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
       }
    }

    const { accessToken, refreshToken } = await createSessionTokens(user.id, user.role)

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    })

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 200 })
  } catch (error) {
    console.error('Login error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
