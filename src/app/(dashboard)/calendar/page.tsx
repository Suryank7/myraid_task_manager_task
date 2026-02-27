'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiFetch('/api/tasks?limit=100') // fetch more tasks to ensure we cover the month
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    }
  })

  const updateTaskDate = useMutation({
    mutationFn: async ({ id, dueDate }: { id: string; dueDate: string | null }) => {
      const res = await apiFetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate })
      })
      if (!res.ok) throw new Error('Failed to update task')
      return res.json()
    },
    onMutate: async ({ id, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks'])
      
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((task: any) => 
            task.id === id ? { ...task, dueDate: dueDate ? new Date(dueDate) : null } : task
          )
        }
      })
      
      return { previousTasks }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks)
      toast.error('Failed to schedule task.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const tasks = data?.data || []
  const unscheduledTasks = tasks.filter((t: any) => !t.dueDate && t.status !== 'ARCHIVED' && t.status !== 'DONE')
  const scheduledTasks = tasks.filter((t: any) => t.dueDate && t.status !== 'ARCHIVED')

  // Calendar logic
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Drag and Drop Logic
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

  const handleDropOnDate = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      // Create a date string avoiding timezone shifts (keep local ISO-like string)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}T12:00:00.000Z` // default to noon UTC so it resolves to same day everywhere ideally
      
      updateTaskDate.mutate({ id: taskId, dueDate: dateString })
    }
  }

  const handleDropOnUnscheduled = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      const task = tasks.find((t: any) => t.id === taskId)
      if (task && task.dueDate !== null) {
        updateTaskDate.mutate({ id: taskId, dueDate: null })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Generate calendar days
  const calendarDays = []
  let day = startDate
  while (day <= endDate) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  const priorityColors = {
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    URGENT: 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6">
      
      {/* Calendar Main View */}
      <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-2.5 rounded-xl hidden sm:block">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
              <p className="text-muted-foreground text-sm">Schedule and organize your given deadlines</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="bg-transparent border-white/10 hover:bg-white/10">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="bg-transparent border-white/10 hover:bg-white/10 hidden sm:flex">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="bg-transparent border-white/10 hover:bg-white/10">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-black/20 text-center text-xs font-semibold text-muted-foreground py-3 uppercase tracking-wider">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto min-h-[500px]">
          {calendarDays.map((d, i) => {
            const isCurrentMonth = isSameMonth(d, monthStart)
            const isToday = isSameDay(d, new Date())
            const dayTasks = scheduledTasks.filter((t: any) => isSameDay(new Date(t.dueDate), d))

            return (
              <div 
                key={i} 
                className={cn(
                  "border-r border-b border-white/5 min-h-[100px] p-2 transition-colors relative group",
                  !isCurrentMonth && "bg-black/40 opacity-50",
                  "hover:bg-white/5 data-[isover=true]:bg-white/10"
                )}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={(e) => handleDropOnDate(e, d)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-white"
                  )}>
                    {format(d, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">{dayTasks.length}</span>
                  )}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[calc(100%-2rem)] hide-scrollbar">
                  {dayTasks.map((t: any) => (
                    <div 
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      className={cn(
                        "text-xs px-2 py-1.5 rounded-md border cursor-grab active:cursor-grabbing truncate transition-transform hover:scale-[1.02]",
                        priorityColors[t.priority as keyof typeof priorityColors] || priorityColors.MEDIUM
                      )}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unscheduled Tasks Sidebar */}
      <div 
        className="w-full xl:w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col h-[400px] xl:h-full"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDrop={handleDropOnUnscheduled}
      >
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Unscheduled Tasks</h3>
          <span className="ml-auto bg-white/10 text-xs py-0.5 px-2 rounded-full">{unscheduledTasks.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {unscheduledTasks.length === 0 ? (
            <div className="h-24 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center text-sm text-muted-foreground/50 text-center px-4">
              Drag tasks here to unschedule them
            </div>
          ) : (
            unscheduledTasks.map((task: any) => (
              <div 
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                className="bg-white/5 border border-white/10 p-3 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
              >
                <div className="font-medium text-sm mb-1">{task.title}</div>
                <div className="flex items-center gap-2">
                   <span className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                      priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM
                    )}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">{task.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
