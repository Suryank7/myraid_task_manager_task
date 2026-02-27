import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL
// Detect if we are using a placeholder or missing connection string
export const isDemoMode = !url || url.includes('<username>') || url.includes('YOUR_') || url === ''

const prismaClientSingleton = () => {
  if (isDemoMode) {
    if (typeof window === 'undefined') {
      console.warn('⚠️ No valid DATABASE_URL found. Running in Demo Mode (Mock Storage).')
    }
    // Return a proxy that handles any property access without crashing
    return new Proxy({} as any, {
      get: (target, prop) => {
        if (prop === 'then') return undefined
        return new Proxy(() => {}, {
          get: (t, p) => {
            if (p === 'then') return undefined
            return () => Promise.resolve([])
          },
          apply: (t, thisArg, args) => Promise.resolve(null)
        })
      }
    })
  }

  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production' && !isDemoMode) globalThis.prismaGlobal = prisma
