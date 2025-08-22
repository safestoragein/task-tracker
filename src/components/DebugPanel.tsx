'use client'

import { LocalStorageManager } from '@/lib/localStorage'
import { useTask } from '@/contexts/TaskContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function DebugPanel() {
  const { state } = useTask()

  const handleClearStorage = () => {
    if (confirm('Clear all localStorage data and reinitialize? This will reload the page.')) {
      LocalStorageManager.clearAll()
      window.location.reload()
    }
  }

  const handleShowStorage = () => {
    const teamMembers = LocalStorageManager.getTeamMembers()
    console.log('📊 LocalStorage Team Members:', teamMembers)
    console.log('📊 Context Team Members:', state.teamMembers)
    alert(`localStorage has ${teamMembers.length} team members. Check console for details.`)
  }

  // Only show in development or if there's a debug flag
  const showDebug = process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')
  
  if (!showDebug) return null

  return (
    <Card className="mt-6 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">🐛 Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <strong>Team Members in Context:</strong> {state.teamMembers.length}
          <br />
          <strong>Names:</strong> {state.teamMembers.map(m => m.name).join(', ')}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleShowStorage} variant="outline" size="sm">
            Check LocalStorage
          </Button>
          <Button onClick={handleClearStorage} variant="destructive" size="sm">
            Clear & Reinitialize
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}