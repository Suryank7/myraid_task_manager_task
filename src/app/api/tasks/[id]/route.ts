import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { encryptData, decryptData } from '@/lib/encryption'
import { logActivity } from '@/lib/audit'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

async function checkAccess(taskId: string, req: Request) {
  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')
  
  if (!userId) return { error: 'Unauthorized', status: 401 }
  
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || task.deletedAt) return { error: 'Not found', status: 404 }
  
  if (task.userId !== userId && role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 }
  }
  
  return { task, userId, role }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const access = await checkAccess(resolvedParams.id, req)
    if (access.error) return NextResponse.json({ error: access.error }, { status: access.status })

    const task = await prisma.task.findUnique({
      where: { id: resolvedParams.id },
      include: {
        comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
        activityLogs: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 }
      }
    })

    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const decryptedTask = {
      ...task,
      description: decryptData(task.description)
    }

    return NextResponse.json({ data: decryptedTask }, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch task', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const access = await checkAccess(resolvedParams.id, req)
    if (access.error || !access.task || !access.userId) return NextResponse.json({ error: access.error }, { status: access.status })

    const { title, description, status, priority, dueDate } = await req.json()
    
    // Construct updates dynamically
    const updateData: any = {}
    let actDetails: any = {}
    
    if (title !== undefined && title !== access.task.title) {
      updateData.title = title
      actDetails.title = { from: access.task.title, to: title }
    }
    
    if (description !== undefined) {
      const decryptedOldDesc = decryptData(access.task.description)
      if (description !== decryptedOldDesc) {
        updateData.description = encryptData(description)
        actDetails.description = 'updated'
      }
    }
    
    if (status !== undefined && status !== access.task.status) {
      updateData.status = status as TaskStatus
      actDetails.status = { from: access.task.status, to: status }
      await logActivity(resolvedParams.id, access.userId, 'STATUS_CHANGED', { from: access.task.status, to: status })
    }
    
    if (priority !== undefined && priority !== access.task.priority) {
      updateData.priority = priority as Priority
      actDetails.priority = { from: access.task.priority, to: priority }
    }
    
    if (dueDate !== undefined) {
      const newDate = dueDate ? new Date(dueDate) : null
      updateData.dueDate = newDate
      actDetails.dueDate = 'updated'
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No changes', data: { ...access.task, description: decryptData(access.task.description) } }, { status: 200 })
    }

    const updatedTask = await prisma.task.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    if (Object.keys(actDetails).length > 0 && !actDetails.status) { // Avoid double logging status change
       await logActivity(resolvedParams.id, access.userId, 'TASK_UPDATED', actDetails)
    }

    const decryptedTask = {
      ...updatedTask,
      description: decryptData(updatedTask.description)
    }

    return NextResponse.json({ data: decryptedTask }, { status: 200 })
  } catch (error) {
    console.error('Failed to update task', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const access = await checkAccess(resolvedParams.id, req)
    if (access.error || !access.userId) return NextResponse.json({ error: access.error }, { status: access.status })

    await prisma.task.update({
      where: { id: resolvedParams.id },
      data: { deletedAt: new Date() }
    })

    await logActivity(resolvedParams.id, access.userId, 'TASK_DELETED')

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Failed to delete task', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
