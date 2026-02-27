'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../providers/auth-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Topbar() {
  const { user } = useAuth()
  
  const handleSearchFocus = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative hidden sm:block w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
          <Input 
            placeholder="Search tasks... (⌘K)" 
            className="pl-9 bg-white/5 border-white/10 rounded-full focus-visible:ring-primary/50"
            onFocus={handleSearchFocus}
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/10">
          <Bell className="w-5 h-5 text-muted-foreground hover:text-white transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </Button>
        
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{user.role}</span>
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-white/10 transition-all hover:ring-primary/50 cursor-pointer">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary">{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  )
}
