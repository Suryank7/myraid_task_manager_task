'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { LayoutList, KanbanSquare, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskCard } from '@/components/tasks/task-card'
import { KanbanBoard } from '@/components/tasks/kanban-board'

export default function DashboardPage() {
  const [view, setView] = useState<'list' | 'kanban'>('kanban')

  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiFetch('/api/tasks')
      if (!res.ok) throw new Error('Failed to fetch tasks')
      return res.json()
    }
  })

  const tasks = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your daily goals and objectives.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
          <Button 
            variant={view === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground'}
          >
            <LayoutList className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button 
            variant={view === 'kanban' ? 'secondary' : 'ghost'} 
            size="sm" 
            onClick={() => setView('kanban')}
            className={view === 'kanban' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'text-muted-foreground'}
          >
            <KanbanSquare className="w-4 h-4 mr-2" />
            Board
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4"
            >
              {tasks.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-white/5 rounded-xl border border-white/10 border-dashed">
                  No tasks found. Create one to get started!
                </div>
              ) : (
                tasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <KanbanBoard tasks={tasks} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
