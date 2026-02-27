'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account settings and preferences.</p>
      </div>
      
      <div className="grid gap-6">
        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile details and email address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue={user?.name || ''} className="bg-white/5 border-white/10" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} className="bg-white/5 border-white/10" readOnly />
            </div>
            <Button disabled className="mt-2">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and security settings. (Disabled in preview)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" className="bg-white/5 border-white/10" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" className="bg-white/5 border-white/10" disabled />
            </div>
            <Button disabled variant="secondary" className="mt-2">Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
