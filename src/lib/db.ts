import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL
  const isPlaceholder = !url || url.includes('<username>') || url.includes('YOUR_') || url === ''
  
  if (isPlaceholder) {
    if (typeof window === 'undefined') {
      console.warn('⚠️ No valid DATABASE_URL found. Running in Demo Mode (Mock Storage).')
    }
    return {} as any
  }

  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
