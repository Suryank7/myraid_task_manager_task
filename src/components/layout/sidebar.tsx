'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Calendar, Settings, LogOut, Code2 } from 'lucide-react'
import { useAuth } from '../providers/auth-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl hidden md:flex flex-col relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          <div className="bg-primary/20 p-1.5 rounded-md">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          TaskForge
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          const Icon = link.icon

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "text-white bg-white/10" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active" 
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-4 h-4 relative z-10", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
              <span className="relative z-10">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
