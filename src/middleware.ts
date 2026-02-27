import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/jwt'

// Simplified Rate Limiter in memory for edge
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count += 1
  return true
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  // Rate limiting
  const isAllowed = rateLimit(ip, 200, 60 * 1000) // 200 req per minute
  if (!isAllowed) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Protect /api/tasks and /api/audit routes
  if (request.nextUrl.pathname.startsWith('/api/tasks') || request.nextUrl.pathname.startsWith('/api/audit')) {
    const accessToken = request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const payload = await decrypt(accessToken)
    if (!payload || payload.type !== 'access') {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // RBAC Example: only admins can access /api/audit
    if (request.nextUrl.pathname.startsWith('/api/audit') && payload.role !== 'ADMIN') {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
