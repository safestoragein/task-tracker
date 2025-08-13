'use client'

import { useState, useMemo } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { Task, Priority, TaskStatus } from '@/types'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { TaskModal } from './TaskModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Calendar, 
  User, 
  Flag, 
  Hash, 
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'assignee'
type SortDirection = 'asc' | 'desc'

export function ListView() {
  const { state, dispatch, filteredTasks } = useTask()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority' | 'assignee'>('status')

  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks].sort((a, b) => {
      let aValue: any
      let bValue: any

      // Handle assignee sorting
      if (sortField === 'assignee') {
        const aAssignee = state.teamMembers.find(m => m.id === a.assigneeId)?.name || 'Unassigned'
        const bAssignee = state.teamMembers.find(m => m.id === b.assigneeId)?.name || 'Unassigned'
        aValue = aAssignee
        bValue = bAssignee
      } else {
        aValue = a[sortField as keyof Task]
        bValue = b[sortField as keyof Task]
      }

      // Handle date sorting
      if (sortField === 'dueDate' || sortField === 'createdAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      // Handle priority sorting (high > medium > low)
      if (sortField === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        aValue = priorityOrder[aValue as Priority]
        bValue = priorityOrder[bValue as Priority]
      }

      // Handle status sorting
      if (sortField === 'status') {
        const statusOrder = { 'backlog': 0, 'todo': 1, 'in-progress': 2, 'review': 3, 'done': 4 }
        aValue = statusOrder[aValue as TaskStatus]
        bValue = statusOrder[bValue as TaskStatus]
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredTasks, sortField, sortDirection, state.teamMembers])

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': sortedTasks }
    }

    return sortedTasks.reduce((groups, task) => {
      let groupKey: string

      switch (groupBy) {
        case 'status':
          groupKey = task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
          break
        case 'priority':
          groupKey = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + ' Priority'
          break
        case 'assignee':
          const assignee = state.teamMembers.find(m => m.id === task.assigneeId)
          groupKey = assignee ? assignee.name : 'Unassigned'
          break
        default:
          groupKey = 'All Tasks'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(task)
      return groups
    }, {} as Record<string, Task[]>)
  }, [sortedTasks, groupBy, state.teamMembers])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: updatedTask.id, updates: updatedTask } })
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus } })
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'review': return 'text-yellow-600 bg-yellow-50'
      case 'done': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Group by:</span>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as typeof groupBy)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="assignee">Assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Button
          onClick={() => {
            setSelectedTask(null)
            setIsTaskModalOpen(true)
          }}
          size="sm"
        >
          New Task
        </Button>
      </div>

      {/* Task Groups */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, tasks]) => (
          <div key={groupName} className="space-y-3">
            {groupBy !== 'none' && (
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{groupName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {tasks.length}
                </Badge>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Task
                        <SortIcon field="title" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('priority')}
                    >
                      <div className="flex items-center gap-2">
                        Priority
                        <SortIcon field="priority" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('assignee')}
                    >
                      <div className="flex items-center gap-2">
                        Assignee
                        <SortIcon field="assignee" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex items-center gap-2">
                        Due Date
                        <SortIcon field="dueDate" />
                      </div>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const assignee = state.teamMembers.find(m => m.id === task.assigneeId)
                    const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'done'
                    
                    return (
                      <TableRow 
                        key={task.id} 
                        className="hover:bg-muted/50 cursor-pointer group"
                        onClick={() => {
                          setSelectedTask(task)
                          setIsTaskModalOpen(true)
                        }}
                      >
                        <TableCell className="font-medium">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(isOverdue && 'text-red-600')}>{task.title}</span>
                              {task.labels.length > 0 && (
                                <div className="flex gap-1">
                                  {task.labels.slice(0, 2).map(label => (
                                    <Badge 
                                      key={label.id} 
                                      variant="outline" 
                                      className="text-xs px-1"
                                      style={{ color: label.color, borderColor: label.color }}
                                    >
                                      {label.name}
                                    </Badge>
                                  ))}
                                  {task.labels.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1">
                                      +{task.labels.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            {task.description && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Select
                            value={task.status}
                            onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                          >
                            <SelectTrigger 
                              className={cn("w-28 h-7 text-xs", getStatusColor(task.status))}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(task.priority))}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback className="text-xs">
                                  {assignee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {task.dueDate ? (
                            <div className={cn(
                              "flex items-center gap-1 text-sm",
                              isOverdue ? "text-red-600" : "text-muted-foreground"
                            )}>
                              <Calendar className="h-3 w-3" />
                              {format(task.dueDate, 'MMM dd')}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No due date</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTask(task)
                              setIsTaskModalOpen(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setSelectedTask(null)
        }}
        onSubmit={handleTaskUpdate}
        task={selectedTask || undefined}
      />
    </div>
  )
}