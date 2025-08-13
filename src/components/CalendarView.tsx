'use client'

import { useState, useMemo } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { Task, Priority } from '@/types'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { TaskModal } from './TaskModal'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { cn } from '@/lib/utils'

export function CalendarView() {
  const { state, dispatch, filteredTasks } = useTask()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    
    filteredTasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(task.dueDate, 'yyyy-MM-dd')
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(task)
      }
    })

    return groups
  }, [filteredTasks])

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  const handleTaskUpdate = (updatedTask: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id: updatedTask.id, updates: updatedTask } })
  }

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsTaskModalOpen(true)
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isSelected = (date: Date) => selectedDate && isSameDay(date, selectedDate)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar */}
      <div className="lg:col-span-2 space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd')
                const dayTasks = tasksByDate[dateKey] || []
                const isCurrentMonth = isSameMonth(date, currentDate)
                
                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "min-h-[100px] p-2 border border-border rounded-lg cursor-pointer transition-colors",
                      "hover:bg-accent/50",
                      !isCurrentMonth && "text-muted-foreground bg-muted/30",
                      isToday(date) && "ring-2 ring-primary",
                      isSelected(date) && "bg-accent"
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="font-medium text-sm mb-1">
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => {
                        const assignee = state.teamMembers.find(m => m.id === task.assigneeId)
                        const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'done'
                        
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "text-xs p-1 rounded truncate cursor-pointer",
                              getStatusColor(task.status),
                              isOverdue && "ring-1 ring-red-500"
                            )}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTask(task)
                              setIsTaskModalOpen(true)
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                              <span className="truncate flex-1">{task.title}</span>
                            </div>
                          </div>
                        )
                      })}
                      
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Selected Date Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM dd') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedDate ? (
              selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => {
                  const assignee = state.teamMembers.find(m => m.id === task.assigneeId)
                  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'done'
                  
                  return (
                    <div
                      key={task.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors space-y-2"
                      onClick={() => {
                        setSelectedTask(task)
                        setIsTaskModalOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className={cn("font-medium text-sm", isOverdue && "text-red-600")}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getStatusColor(task.status))}
                          >
                            {task.status.replace('-', ' ')}
                          </Badge>
                          
                          {assignee && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{assignee.name.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.estimatedHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedHours}h</span>
                          </div>
                        )}
                      </div>

                      {task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.labels.slice(0, 3).map(label => (
                            <Badge 
                              key={label.id} 
                              variant="outline" 
                              className="text-xs px-1 py-0"
                              style={{ color: label.color, borderColor: label.color }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No tasks for this date
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Pre-fill with selected date
                        setSelectedTask({
                          id: '',
                          title: '',
                          description: '',
                          status: 'todo',
                          priority: 'medium',
                          dueDate: selectedDate,
                          labels: [],
                          subtasks: [],
                          comments: [],
                          attachments: [],
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        } as Task)
                        setIsTaskModalOpen(true)
                      }}
                    >
                      Create task for this date
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Click on a date to view tasks
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {filteredTasks.filter(t => t.status === 'in-progress').length}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {filteredTasks.filter(t => t.status === 'done').length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {filteredTasks.filter(t => 
                  t.dueDate && t.dueDate < new Date() && t.status !== 'done'
                ).length}
              </div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </CardContent>
        </Card>
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