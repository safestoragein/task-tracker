'use client'

import { useState, useRef, useEffect } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { parseNaturalLanguageTask } from '@/lib/natural-language-parser'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Task, Priority } from '@/types'
import { Plus, Zap, Calendar, User, Flag, Hash, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

interface QuickTaskInputProps {
  onTaskCreated?: (task: Task) => void
  className?: string
}

export function QuickTaskInput({ onTaskCreated, className }: QuickTaskInputProps) {
  const { state, dispatch } = useTask()
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [preview, setPreview] = useState<ReturnType<typeof parseNaturalLanguageTask> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (input.trim()) {
      const parsed = parseNaturalLanguageTask(input, state.teamMembers)
      setPreview(parsed)
    } else {
      setPreview(null)
    }
  }, [input, state.teamMembers])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const parsed = parseNaturalLanguageTask(input, state.teamMembers)
    
    // Find matching labels
    const matchingLabels = parsed.labels?.map(labelName => 
      state.labels.find(label => 
        label.name.toLowerCase().includes(labelName) || 
        labelName.includes(label.name.toLowerCase())
      )
    ).filter(Boolean) || []

    const newTask: Task = {
      id: uuidv4(),
      title: parsed.title,
      description: '',
      status: parsed.status || 'todo',
      priority: parsed.priority || 'medium',
      assigneeId: parsed.assignee,
      dueDate: parsed.dueDate,
      estimatedHours: parsed.estimatedHours,
      labels: matchingLabels as any[],
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    dispatch({ type: 'ADD_TASK', payload: newTask })
    onTaskCreated?.(newTask)
    setInput('')
    setPreview(null)
    setIsExpanded(false)
  }

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
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Quick add: 'Fix login bug high priority tomorrow @alice 2h #bug'"
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" type="button" className="h-6 px-2" data-testid="help-button">
                  <Zap className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="space-y-2 text-xs">
                  <h4 className="font-medium">Quick Task Examples:</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>• &quot;Fix login bug high priority tomorrow @alice 2h #bug&quot;</div>
                    <div>• &quot;Design homepage @bob next week #design&quot;</div>
                    <div>• &quot;Update docs friday 1h #documentation&quot;</div>
                    <div>• &quot;Code review today @charlie #review&quot;</div>
                  </div>
                  <div className="pt-2 border-t space-y-1">
                    <div><strong>Priority:</strong> high, medium, low</div>
                    <div><strong>Assignee:</strong> @name</div>
                    <div><strong>Due:</strong> today, tomorrow, friday, next week</div>
                    <div><strong>Time:</strong> 2h, 30m, 1.5 hours</div>
                    <div><strong>Labels:</strong> #bug, #feature</div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" size="sm" disabled={!input.trim()} data-testid="submit-button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Preview Card */}
      {isExpanded && preview && input.trim() && (
        <Card className="mt-2 border-dashed">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="font-medium text-sm flex-1">{preview.title}</div>
                {preview.priority && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(preview.priority)}`} />
                    <span className="text-xs text-muted-foreground capitalize">{preview.priority}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {preview.assignee && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {getAssigneeName(preview.assignee)}
                  </Badge>
                )}
                
                {preview.dueDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(preview.dueDate, 'MMM dd')}
                  </Badge>
                )}

                {preview.estimatedHours && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {preview.estimatedHours}h
                  </Badge>
                )}

                {preview.labels && preview.labels.length > 0 && (
                  <div className="flex gap-1">
                    {preview.labels.map(label => (
                      <Badge key={label} variant="outline" className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {preview.status && preview.status !== 'todo' && (
                  <Badge variant="outline" className="capitalize">
                    {preview.status.replace('-', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}