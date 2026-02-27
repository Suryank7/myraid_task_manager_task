const url = process.env.DATABASE_URL
export const isDemoMode = !url || url.includes('<username>') || url.includes('YOUR_') || url === ''

const mockPrisma = new Proxy({} as any, {
  get: (target, prop) => {
    // Check if prop is common Prisma model (lowercase or uppercase)
    const mockModel = new Proxy({} as any, {
      get: (t, p) => {
        if (p === 'then') return undefined
        return (...args: any[]) => {
          // Return empty arrays for list calls, null for others
          if (p === 'findMany' || p === 'groupBy' || p === 'aggregate') return Promise.resolve([])
          if (p === 'count') return Promise.resolve(0)
          return Promise.resolve(null)
        }
      }
    })
    return mockModel
  }
})

let prisma: any

if (isDemoMode) {
  if (typeof window === 'undefined') {
    console.warn('⚠️ DATABASE_URL is missing or a placeholder. Running in Demo Mode (Mock Storage).')
  }
  prisma = mockPrisma
} else {
  try {
    // Only require Prisma if we actually have a connection string
    const { PrismaClient } = require('@prisma/client')
    prisma = new PrismaClient()
  } catch (err) {
    console.error('Failed to initialize Prisma Client:', err)
    prisma = mockPrisma
  }
}

export default prisma
