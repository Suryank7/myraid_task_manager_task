import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decrypt, encrypt } from '@/lib/jwt'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }
    
    const payload = await decrypt(refreshToken)
    
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
    }
    
    // Issue new access token
    const newAccessToken = await encrypt({ userId: payload.userId, role: payload.role, type: 'access' }, '15m')
    
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    })
    
    return NextResponse.json({ message: 'Token refreshed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Refresh token error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
