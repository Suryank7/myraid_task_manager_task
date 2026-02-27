'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { TaskCard } from './task-card'

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'border-slate-500/50' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-purple-500/50' },
  { id: 'DONE', title: 'Done', color: 'border-green-500/50' },
]

export function KanbanBoard({ tasks }: { tasks: any[] }) {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks'])
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((task: any) => task.id === id ? { ...task, status } : task)
        }
      })
      return { previousTasks }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks)
      toast.error('Failed to move task')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() 
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== statusId) {
        mutation.mutate({ id: taskId, status: statusId })
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id)
        
        return (
          <div 
            key={col.id}
            className="flex flex-col gap-4 group"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`border-b-2 ${col.color} pb-2 flex items-center justify-between`}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{col.title}</h3>
              <span className="bg-white/10 text-xs py-0.5 px-2 rounded-full">{colTasks.length}</span>
            </div>
            
            <div className="flex flex-col gap-3 min-h-[500px] p-2 -mx-2 rounded-xl transition-colors hover:bg-white/5 data-[isover=true]:bg-white/10">
              {colTasks.map(task => (
                <div 
                  key={task.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="cursor-grab active:cursor-grabbing transform transition-transform hover:scale-[1.02]"
                >
                  <TaskCard task={task} />
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="h-24 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-sm text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  Drop here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
