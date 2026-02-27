'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema } from '@/lib/validations'
import * as z from 'zod'

type TaskFormValues = z.infer<typeof taskSchema>

export function CreateTaskModal() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: 'TODO', priority: 'MEDIUM' }
  })

  useEffect(() => {
    const handleOpen = () => setOpen(true)
    document.addEventListener('open-new-task', handleOpen)
    return () => document.removeEventListener('open-new-task', handleOpen)
  }, [])

  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create task')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully')
      setOpen(false)
      reset()
    },
    onError: () => toast.error('Failed to create task')
  })

  const onSubmit = (data: TaskFormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task. Information is securely encrypted.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} className="bg-white/5 border-white/10 focus-visible:ring-primary/50" />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} className="bg-white/5 border-white/10 focus-visible:ring-primary/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select {...register('status')} className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select {...register('priority')} className="flex h-10 w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full relative overflow-hidden group">
             <span className="relative z-10">{mutation.isPending ? 'Creating...' : 'Create Task'}</span>
             <div className="absolute inset-0 h-full w-full bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left ease-out duration-300" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
