import prisma from './db'

export async function logActivity(taskId: string, userId: string, action: string, details?: any) {
  if (!process.env.DATABASE_URL) {
    console.log(`[MOCK AUDIT] Activity Log: ${action} on task ${taskId} by user ${userId}`)
    return
  }
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
  if (!process.env.DATABASE_URL) {
    console.log(`[MOCK AUDIT] Audit Log: ${action} on resource ${resource} by user ${userId}`)
    return
  }
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
