'use client'

import { useState } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'
import { Search, Filter, X, Calendar as CalendarIcon, Tag, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export function TaskFilters() {
  const { state, dispatch } = useTask()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const handleSearchChange = (search: string) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: { search } })
  }

  const handleAssigneeToggle = (assigneeId: string) => {
    const current = state.filters.assignee
    const updated = current.includes(assigneeId)
      ? current.filter(id => id !== assigneeId)
      : [...current, assigneeId]
    
    dispatch({ type: 'UPDATE_FILTERS', payload: { assignee: updated } })
  }

  const handlePriorityToggle = (priority: 'low' | 'medium' | 'high') => {
    const current = state.filters.priority
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority]
    
    dispatch({ type: 'UPDATE_FILTERS', payload: { priority: updated } })
  }

  const handleLabelToggle = (labelId: string) => {
    const current = state.filters.labels
    const updated = current.includes(labelId)
      ? current.filter(id => id !== labelId)
      : [...current, labelId]
    
    dispatch({ type: 'UPDATE_FILTERS', payload: { labels: updated } })
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
    const dateRange = range || {}
    setDateRange(dateRange)
    dispatch({ type: 'UPDATE_FILTERS', payload: { dueDate: dateRange } })
  }

  const clearAllFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        search: '',
        assignee: [],
        priority: [],
        labels: [],
        dueDate: {},
      }
    })
    setDateRange({})
  }

  const activeFilterCount = 
    (state.filters.search ? 1 : 0) +
    state.filters.priority.length +
    state.filters.labels.length +
    (state.filters.dueDate.from || state.filters.dueDate.to ? 1 : 0)

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={state.filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-64"
        />
      </div>

      {/* Filters Popover */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>


            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Priority
              </label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(priority => (
                  <Badge
                    key={priority}
                    variant={state.filters.priority.includes(priority) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer",
                      priority === 'high' && state.filters.priority.includes(priority) && "bg-red-500",
                      priority === 'medium' && state.filters.priority.includes(priority) && "bg-yellow-500",
                      priority === 'low' && state.filters.priority.includes(priority) && "bg-green-500"
                    )}
                    onClick={() => handlePriorityToggle(priority)}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Labels Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {state.labels.map(label => (
                  <Badge
                    key={label.id}
                    variant={state.filters.labels.includes(label.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      state.filters.labels.includes(label.id)
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

            {/* Due Date Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Due Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Pick date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1">
          {state.filters.assignee.map(assigneeId => {
            const member = state.teamMembers.find(m => m.id === assigneeId)
            return member ? (
              <Badge key={assigneeId} variant="secondary" className="text-xs">
                {member.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1"
                  onClick={() => handleAssigneeToggle(assigneeId)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ) : null
          })}
          
          {state.filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="text-xs">
              {priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handlePriorityToggle(priority)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}