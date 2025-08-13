'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { KanbanBoard } from '@/components/KanbanBoard'
import { ListView } from '@/components/ListView'
import { CalendarView } from '@/components/CalendarView'
import { TaskFilters } from '@/components/TaskFilters' 
import { TaskAnalytics } from '@/components/TaskAnalytics'
import { DailyReport } from '@/components/DailyReport'
import { TeamManagement } from '@/components/TeamManagement'
import { Settings } from '@/components/Settings'
import { Header } from '@/components/Header'
import { LoginForm } from '@/components/LoginForm'
import { QuickAssigneeFilter } from '@/components/QuickAssigneeFilter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const { state: authState } = useAuth()
  const [view, setView] = useState<'kanban' | 'list' | 'calendar' | 'analytics' | 'standup' | 'team' | 'settings'>('kanban')

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SafeStorage Task Manager...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-fit grid-cols-7">
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="standup">Standup</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {!['team', 'settings'].includes(view) && <TaskFilters />}
          </div>

          {/* Quick Assignee Filter - Only show for task-related views */}
          {['kanban', 'list', 'calendar'].includes(view) && (
            <div className="border-b pb-4 mb-6">
              <QuickAssigneeFilter />
            </div>
          )}

          <TabsContent value="kanban">
            <KanbanBoard />
          </TabsContent>
          
          <TabsContent value="list">
            <ListView />
          </TabsContent>
          
          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
          
          <TabsContent value="standup">
            <DailyReport />
          </TabsContent>
          
          <TabsContent value="analytics">
            <TaskAnalytics />
          </TabsContent>
          
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>
          
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}