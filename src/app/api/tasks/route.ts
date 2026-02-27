import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { encryptData, decryptData } from '@/lib/encryption'
import { logActivity } from '@/lib/audit'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    const role = req.headers.get('x-user-role')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as Priority | null
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const where: any = {}
    
    // RBAC
    if (role !== 'ADMIN') {
      where.userId = userId
    }

    where.deletedAt = null

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }
    if (status) {
      where.status = status
    }
    if (priority) {
      where.priority = priority
    }

    const skip = (page - 1) * limit

    if (!process.env.DATABASE_URL) {
      const mockTasks = [
        {
          id: 'mock-1',
          title: 'Welcome to TaskForge (Demo Mode)',
          description: 'This is a mock task because no database is connected.',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: { id: 'demo', name: 'Demo User', email: 'demo@example.com' }
        },
        {
          id: 'mock-2',
          title: 'Drag me to In Progress!',
          description: 'The Kanban board still works with client-side state.',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: { id: 'demo', name: 'Demo User', email: 'demo@example.com' }
        }
      ]
      return NextResponse.json({
        data: mockTasks,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 }
      }, { status: 200 })
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.task.count({ where })
    ])

    const decryptedTasks = tasks.map((t: any) => ({
      ...t,
      description: decryptData(t.description)
    }))

    return NextResponse.json({
      data: decryptedTasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Failed to fetch tasks', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, status, priority, dueDate } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      const mockNewTask = {
        id: `mock-${Date.now()}`,
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      return NextResponse.json({ data: mockNewTask }, { status: 201 })
    }

    const encryptedDescription = encryptData(description)

    const task = await prisma.task.create({
      data: {
        title,
        description: encryptedDescription,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId
      }
    })

    await logActivity(task.id, userId, 'TASK_CREATED')

    const responseTask = {
      ...task,
      description: decryptData(task.description)
    }

    return NextResponse.json({ data: responseTask }, { status: 201 })
  } catch (error) {
    console.error('Failed to create task', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
