import prisma from './db'

export async function logActivity(taskId: string, userId: string, action: string, details?: any) {
  try {
    await prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action,
        details: details ? JSON.stringify(details) : null
      }
    })
  } catch (error) {
    console.error('Failed to log activity', error)
  }
}

export async function logAudit(action: string, resource: string, userId: string, ipAddress?: string, userAgent?: string, details?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        userId,
        ipAddress,
        userAgent,
        details: details ? JSON.stringify(details) : null
      }
    })
  } catch (error) {
    console.error('Failed to log audit', error)
  }
}
