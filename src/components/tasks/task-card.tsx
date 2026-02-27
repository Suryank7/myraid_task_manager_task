'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { CalendarIcon, MessageSquare, Paperclip, Activity } from 'lucide-react'

const priorityColors = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  URGENT: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const statusColors = {
  TODO: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DONE: 'bg-green-500/20 text-green-400 border-green-500/30',
  ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export function TaskCard({ task }: { task: any }) {
  return (
    <Card className="group overflow-hidden bg-black/40 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors">{task.title}</h3>
            {task.dueDate && (
              <span className="flex items-center text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {task.comments.length}</span>
            )}
            {task.attachments && task.attachments.length > 0 && (
              <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {task.attachments.length}</span>
            )}
            {task.activityLogs && task.activityLogs.length > 0 && (
               <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {task.activityLogs.length} updates</span>
            )}
            <span className="text-xs opacity-50">Added {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColors[task.status as keyof typeof statusColors] || statusColors.TODO}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.MEDIUM}`}>
            {task.priority}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
