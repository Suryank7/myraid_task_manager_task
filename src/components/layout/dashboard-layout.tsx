'use client'

import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { CommandPalette } from '../command-palette'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Topbar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
      <CommandPalette />
      <CreateTaskModal />
    </div>
  )
}
