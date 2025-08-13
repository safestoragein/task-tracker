'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { parseNaturalLanguageTask } from '@/lib/natural-language-parser'
import { Dialog, DialogContent } from './ui/dialog'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from './ui/command'
import { Task, Priority } from '@/types'
import { 
  Plus, 
  Search, 
  User, 
  Calendar, 
  Flag, 
  Hash, 
  Clock,
  Zap,
  Filter,
  BarChart3,
  Settings,
  Users,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { state, dispatch, filteredTasks } = useTask()
  const [input, setInput] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Parse natural language for task creation
  const taskPreview = useMemo(() => {
    if (input.trim() && !input.startsWith('/')) {
      return parseNaturalLanguageTask(input, state.teamMembers)
    }
    return null
  }, [input, state.teamMembers])

  // Quick actions and searches
  const quickActions = useMemo(() => {
    const actions = []
    
    // Task creation
    if (taskPreview) {
      actions.push({
        type: 'create-task',
        title: `Create: ${taskPreview.title}`,
        description: 'Press Enter to create this task',
        icon: Plus,
        action: () => {
          const matchingLabels = taskPreview.labels?.map(labelName => 
            state.labels.find(label => 
              label.name.toLowerCase().includes(labelName) || 
              labelName.includes(label.name.toLowerCase())
            )
          ).filter(Boolean) || []

          const newTask: Task = {
            id: uuidv4(),
            title: taskPreview.title,
            description: '',
            status: taskPreview.status || 'todo',
            priority: taskPreview.priority || 'medium',
            assigneeId: taskPreview.assignee,
            dueDate: taskPreview.dueDate,
            estimatedHours: taskPreview.estimatedHours,
            labels: matchingLabels as any[],
            subtasks: [],
            comments: [],
            attachments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          dispatch({ type: 'ADD_TASK', payload: newTask })
          onClose()
          setInput('')
        }
      })
    }

    // Search in tasks
    if (input.trim() && input.startsWith('/')) {
      const searchTerm = input.slice(1).toLowerCase()
      
      if (searchTerm) {
        const matchingTasks = filteredTasks.filter(task =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm)
        ).slice(0, 5)

        matchingTasks.forEach(task => {
          actions.push({
            type: 'search-result',
            title: task.title,
            description: `${task.status} • ${task.priority} priority`,
            icon: Search,
            task,
            action: () => {
              // Could navigate to task or open task modal
              onClose()
            }
          })
        })
      }

      // Navigation actions
      actions.push(
        {
          type: 'navigation',
          title: 'Go to Analytics',
          description: 'View team performance metrics',
          icon: BarChart3,
          action: () => {
            // Navigate to analytics
            onClose()
          }
        },
        {
          type: 'navigation', 
          title: 'Team Management',
          description: 'Manage team members and permissions',
          icon: Users,
          action: () => {
            onClose()
          }
        },
        {
          type: 'navigation',
          title: 'Settings',
          description: 'Configure application settings',
          icon: Settings,
          action: () => {
            onClose()
          }
        }
      )
    }

    // Quick filters if no input
    if (!input.trim()) {
      actions.push(
        {
          type: 'filter',
          title: 'Show High Priority Tasks',
          description: 'Filter by high priority',
          icon: Flag,
          action: () => {
            dispatch({ type: 'UPDATE_FILTERS', payload: { priority: ['high'] } })
            onClose()
          }
        },
        {
          type: 'filter',
          title: 'Show My Tasks',
          description: 'Filter by assigned to me',
          icon: User,
          action: () => {
            // Would need current user context
            onClose()
          }
        },
        {
          type: 'filter',
          title: 'Show Overdue Tasks',
          description: 'Filter by overdue tasks',
          icon: Calendar,
          action: () => {
            // Would implement overdue filter
            onClose()
          }
        }
      )
    }

    return actions
  }, [input, taskPreview, state, filteredTasks, dispatch, onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, quickActions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (quickActions[selectedIndex]) {
            quickActions[selectedIndex].action()
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, quickActions, onClose])

  // Reset selection when actions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [quickActions])

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getAssigneeName = (assigneeId: string) => {
    return state.teamMembers.find(m => m.id === assigneeId)?.name || 'Unknown'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-3 h-4 w-4 shrink-0 opacity-50" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command or create a task..."
            className="border-0 p-0 text-base shadow-none outline-none ring-0 focus-visible:ring-0"
            autoFocus
          />
          {!input && (
            <div className="flex gap-1 text-xs text-muted-foreground">
              <kbd className="px-1 py-0.5 border rounded text-xs">⌘K</kbd>
            </div>
          )}
        </div>

        {/* Task Preview */}
        {taskPreview && (
          <div className="border-b px-4 py-3 bg-muted/20">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="font-medium text-sm flex-1">{taskPreview.title}</div>
                {taskPreview.priority && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(taskPreview.priority)}`} />
                    <span className="text-xs text-muted-foreground capitalize">{taskPreview.priority}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {taskPreview.assignee && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {getAssigneeName(taskPreview.assignee)}
                  </Badge>
                )}
                
                {taskPreview.dueDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(taskPreview.dueDate, 'MMM dd')}
                  </Badge>
                )}

                {taskPreview.estimatedHours && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {taskPreview.estimatedHours}h
                  </Badge>
                )}

                {taskPreview.labels && taskPreview.labels.length > 0 && (
                  <div className="flex gap-1">
                    {taskPreview.labels.map(label => (
                      <Badge key={label} variant="outline" className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="max-h-96 overflow-y-auto">
          {quickActions.length > 0 ? (
            <div className="py-2">
              {quickActions.map((action, index) => (
                <div
                  key={`${action.type}-${index}`}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent ${
                    index === selectedIndex ? 'bg-accent' : ''
                  }`}
                  onClick={action.action}
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    {action.description && (
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <div className="mb-2">
                <Zap className="h-8 w-8 mx-auto opacity-20" />
              </div>
              <div className="text-sm">
                Type to create a task or search<br />
                <span className="text-xs">Try: &quot;Fix login bug high priority @alice tomorrow 2h #bug&quot;</span>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        {!input && (
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Use &quot;/&quot; for search and navigation</span>
              <span>↑↓ to navigate • ↵ to select • esc to close</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}