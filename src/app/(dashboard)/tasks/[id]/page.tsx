'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Loader2, Trash2, Edit2, Activity, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema } from '@/lib/validations'
import * as z from 'zod'

type TaskFormValues = z.infer<typeof taskSchema>

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string
  const queryClient = useQueryClient()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await apiFetch(`/api/tasks/${taskId}`)
      if (!res.ok) {
        if (res.status === 404) router.push('/tasks')
        throw new Error('Task not found')
      }
      return res.json()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
      router.push('/')
    },
    onError: () => toast.error('Failed to delete task')
  })

  const editMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
      setIsEditOpen(false)
    },
    onError: () => toast.error('Failed to update task')
  })

  const task = data?.data

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    values: task ? {
      title: task.title,
      description: task.description || '',
      status: task.status as any,
      priority: task.priority as any,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined
    } : undefined
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) return <div className="p-6">Task not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="bg-white/5 border-white/10 hover:bg-white/10">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Task
          </Button>
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm('Are you sure you want to delete this task?')) deleteMutation.mutate()
          }} disabled={deleteMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-2" /> {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
              <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider">{task.status.replace('_', ' ')}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                task.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>{task.priority}</span>
              {task.dueDate && (
                <div className="flex items-center text-muted-foreground text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  Due {format(new Date(task.dueDate), 'PPP')}
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none relative z-10">
              <h3 className="text-lg font-medium text-white/80 mb-3 flex items-center gap-2">
                Description
              </h3>
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 text-muted-foreground min-h-[120px] whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided.'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Activity Log Sidebar */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-primary" /> Activity History
            </h3>
            
            <div className="space-y-6">
              {task.activityLogs?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                task.activityLogs?.map((log: any) => (
                  <div key={log.id} className="relative pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-white/10 last:before:hidden">
                    <div className="absolute left-0 top-1.5 w-6 h-6 bg-black rounded-full border border-white/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="text-white/90">
                        <span className="font-medium">{log.user.name || log.user.email}</span>{' '}
                        <span className="text-muted-foreground">{log.action.replace('_', ' ').toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black/90 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to this task. Updates will be securely encrypted.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => editMutation.mutate(d))} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} className="bg-white/5 border-white/10" />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" {...register('description')} className="bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select {...register('status')} className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select {...register('priority')} className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={editMutation.isPending} className="w-full">
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
