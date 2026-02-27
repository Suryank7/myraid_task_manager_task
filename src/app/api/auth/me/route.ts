import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/jwt'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    
    if (!accessToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const payload = await decrypt(accessToken)
    
    if (!payload || payload.type !== 'access') {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true }
    })
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch user', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
