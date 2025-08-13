'use client'

import { useState, useEffect } from 'react'
import { Task, Priority, TaskStatus } from '@/types'
import { useTask } from '@/contexts/TaskContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'
import { CalendarIcon, X, Plus, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Task) => void
  task?: Task
}

const defaultTask: Partial<Task> = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  labels: [],
  subtasks: [],
  comments: [],
  attachments: [],
}

export function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
  const { state } = useTask()
  const [formData, setFormData] = useState<Partial<Task>>(defaultTask)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [newSubtask, setNewSubtask] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate
      })
      setSelectedLabels(task.labels.map(l => l.id))
    } else {
      setFormData(defaultTask)
      setSelectedLabels([])
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title?.trim()) return

    const selectedLabelObjects = state.labels.filter(label => 
      selectedLabels.includes(label.id)
    )

    const taskData: Task = {
      id: task?.id || uuidv4(),
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      status: formData.status as TaskStatus,
      priority: formData.priority as Priority,
      assigneeId: formData.assigneeId,
      dueDate: formData.dueDate,
      labels: selectedLabelObjects,
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      subtasks: formData.subtasks || [],
      comments: formData.comments || [],
      attachments: formData.attachments || [],
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    onSubmit(taskData)
    onClose()
  }

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    
    const subtask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      createdAt: new Date(),
    }

    setFormData(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), subtask]
    }))
    setNewSubtask('')
  }

  const removeSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).filter(s => s.id !== subtaskId)
    }))
  }

  const toggleSubtaskComplete = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: (prev.subtasks || []).map(s => 
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      )
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Status, Priority, Assignee Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Priority }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={formData.assigneeId || 'unassigned'}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  assigneeId: value === 'unassigned' ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {state.teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedHours: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="0"
                  className="pl-9"
                />
              </div>
            </div>

            {task && (
              <div>
                <Label htmlFor="actualHours">Actual Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="actualHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.actualHours || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      actualHours: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                    placeholder="0"
                    className="pl-9"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {state.labels.map(label => (
                <Badge
                  key={label.id}
                  variant={selectedLabels.includes(label.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={
                    selectedLabels.includes(label.id)
                      ? { backgroundColor: label.color, color: 'white' }
                      : { borderColor: label.color, color: label.color }
                  }
                  onClick={() => handleLabelToggle(label.id)}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Subtasks */}
          <div>
            <Label>Subtasks</Label>
            <div className="space-y-2 mt-2">
              {formData.subtasks?.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtaskComplete(subtask.id)}
                    className="rounded"
                  />
                  <span className={cn(
                    "flex-1",
                    subtask.completed && "line-through text-muted-foreground"
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubtask(subtask.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" onClick={addSubtask} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}