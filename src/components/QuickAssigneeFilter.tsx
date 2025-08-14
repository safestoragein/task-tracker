'use client'

import { useTask } from '@/contexts/TaskContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { X, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuickAssigneeFilter() {
  const { state, dispatch, filteredTasks } = useTask()
  const { state: authState, canEditTask } = useAuth()

  const selectedAssignees = state.filters.assignee
  
  // Show all team members to all authenticated users
  const visibleMembers = state.teamMembers.filter(member => {
    return authState.user ? true : false
  })

  const toggleAssignee = (memberId: string) => {
    const currentAssignees = [...selectedAssignees]
    const index = currentAssignees.indexOf(memberId)
    
    if (index === -1) {
      currentAssignees.push(memberId)
    } else {
      currentAssignees.splice(index, 1)
    }

    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { assignee: currentAssignees }
    })
  }

  const clearAssigneeFilter = () => {
    dispatch({
      type: 'UPDATE_FILTERS',
      payload: { assignee: [] }
    })
  }

  const getTaskCount = (memberId: string) => {
    // Get total tasks assigned to this member (not filtered by current filters)
    return state.tasks.filter(task => task.assigneeId === memberId).length
  }

  if (visibleMembers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 pb-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Quick Filter:</span>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* Show All Button */}
        <Button
          variant={selectedAssignees.length === 0 ? "default" : "outline"}
          size="sm"
          onClick={clearAssigneeFilter}
          className="h-8"
        >
          All Tasks
          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
            {state.tasks.length}
          </Badge>
        </Button>

        {/* Team Member Filters */}
        {visibleMembers.map(member => {
          const isSelected = selectedAssignees.includes(member.id)
          const taskCount = getTaskCount(member.id)
          
          return (
            <Button
              key={member.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAssignee(member.id)}
              className={cn(
                "h-8 gap-2",
                isSelected && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <span>{member.name}</span>
              
              {member.userRole === 'admin' && (
                <Shield className="h-3 w-3" />
              )}
              
              <Badge 
                variant={isSelected ? "secondary" : "secondary"} 
                className={cn(
                  "h-5 px-1.5 text-xs",
                  isSelected ? "bg-blue-200 text-blue-900" : "bg-gray-100 text-gray-700"
                )}
              >
                {taskCount}
              </Badge>
            </Button>
          )
        })}

        {/* Clear Selected Filters */}
        {selectedAssignees.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAssigneeFilter}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Summary */}
      {selectedAssignees.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing {selectedAssignees.length === 1 ? '1 assignee' : `${selectedAssignees.length} assignees`}
        </div>
      )}
    </div>
  )
}