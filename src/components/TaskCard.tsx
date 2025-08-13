'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types'
import { useTask } from '@/contexts/TaskContext'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { TaskModal } from './TaskModal'
import { cn, formatDate, getPriorityColor } from '@/lib/utils'
import { Calendar, Clock, MessageCircle, MoreHorizontal, User, AlertCircle } from 'lucide-react'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { state, dispatch } = useTask()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: task.id,
    disabled: isDropdownOpen, // Disable dragging when dropdown is open
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const assignee = state.teamMembers.find(member => member.id === task.assigneeId)
  
  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'done'
  const isDueSoon = task.dueDate && !isOverdue && 
    task.dueDate.getTime() - Date.now() <= 2 * 24 * 60 * 60 * 1000 // Due within 2 days

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleDelete = (e?: React.MouseEvent) => {
    // Stop any potential event propagation
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
      dispatch({ type: 'DELETE_TASK', payload: task.id })
    }
    setIsDropdownOpen(false)
  }

  if (isDragging || isSortableDragging) {
    return (
      <Card className="task-card cursor-grabbing opacity-50 rotate-3 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "task-card hover:shadow-md border-l-4 group relative",
          task.priority === 'high' && "border-l-red-500",
          task.priority === 'medium' && "border-l-yellow-500",
          task.priority === 'low' && "border-l-green-500",
          isOverdue && "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800",
          // Add cursor styles conditionally
          !isDropdownOpen && "cursor-grab"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div 
              {...listeners} 
              className="font-medium text-sm line-clamp-2 flex-1 cursor-grab"
            >
              {task.title}
            </div>
            <DropdownMenu 
              open={isDropdownOpen} 
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDropdownOpen(!isDropdownOpen)
                  }}
                  onPointerDown={(e) => {
                    // Prevent drag from starting when clicking on dropdown
                    e.stopPropagation()
                  }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                    setIsDropdownOpen(false)
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => handleDelete(e)} 
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {task.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0 space-y-3" {...listeners}>
          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.labels.slice(0, 2).map(label => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: `${label.color}15`, color: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
              {task.labels.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.labels.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Priority & Due Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <AlertCircle className={cn("h-3 w-3", getPriorityColor(task.priority))} />
              <span className={getPriorityColor(task.priority)}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>

            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : ""
              )}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {task.actualHours ? `${task.actualHours}h` : `~${task.estimatedHours}h`}
                {task.estimatedHours && task.actualHours && (
                  <span className="text-muted-foreground"> / {task.estimatedHours}h</span>
                )}
              </span>
            </div>
          )}

          {/* Subtasks Progress */}
          {task.subtasks.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all"
                  style={{
                    width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
                  }}
                />
              </div>
              <span>
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
              </span>
            </div>
          )}

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            {/* Assignee */}
            {assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-20">
                  {assignee.name.split(' ')[0]}
                </span>
              </div>
            )}

            {/* Comments Count */}
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onSubmit={(updatedTask) => {
          dispatch({
            type: 'UPDATE_TASK',
            payload: { id: task.id, updates: updatedTask }
          })
          setIsEditModalOpen(false)
        }}
      />
    </>
  )
}