'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTask } from '@/contexts/TaskContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Database, 
  Download, 
  Upload,
  Trash2,
  Shield,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export function Settings() {
  const { state: authState, logout } = useAuth()
  const { state: taskState, dispatch } = useTask()
  
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      taskDeadlines: true,
      dailyDigest: false,
      teamUpdates: true
    },
    preferences: {
      defaultView: 'kanban' as 'kanban' | 'list' | 'calendar',
      theme: 'light' as 'light' | 'dark' | 'system',
      timezone: 'UTC+05:30',
      dateFormat: 'DD/MM/YYYY'
    },
    privacy: {
      profileVisibility: 'team' as 'public' | 'team' | 'private',
      taskVisibility: 'assigned' as 'all' | 'assigned' | 'own'
    }
  })
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const handleSaveSettings = async () => {
    setSaveStatus('saving')
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleExportData = () => {
    const data = {
      tasks: taskState.tasks,
      teamMembers: taskState.teamMembers,
      labels: taskState.labels,
      dailyReports: taskState.dailyReports,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `safestorage-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const updatePreferenceSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }))
  }

  const updatePrivacySetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }))
  }

  // Show loading state while authentication is being checked
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your SafeStorage preferences and account settings</p>
        </div>
        
        <Button onClick={handleSaveSettings} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
          {saveStatus === 'saved' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
          {saveStatus === 'error' && <AlertCircle className="h-4 w-4 mr-2 text-red-500" />}
          Save Settings
        </Button>
      </div>

      {saveStatus === 'saved' && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error saving settings. Please try again.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account and profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={authState.user?.name || ''} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={authState.user?.email || ''} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{authState.user?.role}</Badge>
                {authState.user?.userRole === 'admin' && (
                  <Badge variant="default">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive task updates via email</p>
              </div>
              <Switch 
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Task Deadline Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified before task deadlines</p>
              </div>
              <Switch 
                checked={settings.notifications.taskDeadlines}
                onCheckedChange={(checked) => updateNotificationSetting('taskDeadlines', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Digest</Label>
                <p className="text-sm text-muted-foreground">Daily summary of your tasks</p>
              </div>
              <Switch 
                checked={settings.notifications.dailyDigest}
                onCheckedChange={(checked) => updateNotificationSetting('dailyDigest', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Team Updates</Label>
                <p className="text-sm text-muted-foreground">Notifications about team activities</p>
              </div>
              <Switch 
                checked={settings.notifications.teamUpdates}
                onCheckedChange={(checked) => updateNotificationSetting('teamUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Appearance & Preferences
            </CardTitle>
            <CardDescription>Customize your SafeStorage experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default View</Label>
              <Select 
                value={settings.preferences.defaultView} 
                onValueChange={(value) => updatePreferenceSetting('defaultView', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban Board</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="calendar">Calendar View</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Theme</Label>
              <Select 
                value={settings.preferences.theme} 
                onValueChange={(value) => updatePreferenceSetting('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timezone</Label>
              <Select 
                value={settings.preferences.timezone} 
                onValueChange={(value) => updatePreferenceSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC+05:30">IST (UTC+05:30)</SelectItem>
                  <SelectItem value="UTC+04:00">GST (UTC+04:00)</SelectItem>
                  <SelectItem value="UTC+00:00">GMT (UTC+00:00)</SelectItem>
                  <SelectItem value="UTC-05:00">EST (UTC-05:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Format</Label>
              <Select 
                value={settings.preferences.dateFormat} 
                onValueChange={(value) => updatePreferenceSetting('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your privacy and data visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Profile Visibility</Label>
              <Select 
                value={settings.privacy.profileVisibility} 
                onValueChange={(value) => updatePrivacySetting('profileVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="team">Team Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Task Visibility</Label>
              <Select 
                value={settings.privacy.taskVisibility} 
                onValueChange={(value) => updatePrivacySetting('taskVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="assigned">Assigned to Me</SelectItem>
                  <SelectItem value="own">My Tasks Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Button variant="outline" onClick={logout} className="w-full">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management - Only for admins */}
        {authState.user?.userRole === 'admin' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Management
              </CardTitle>
              <CardDescription>Export, import, and manage SafeStorage data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button variant="destructive" onClick={handleClearAllData}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Data management operations affect all team members. 
                  Export data regularly as backups. Clearing all data is irreversible.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}