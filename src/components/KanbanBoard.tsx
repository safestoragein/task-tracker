'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column, Task, TaskStatus } from '@/types'
import { useTask } from '@/contexts/TaskContext'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { TaskModal } from './TaskModal'

const columns: Column[] = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280' },
  { id: 'todo', title: 'To Do', color: '#64748b' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#f59e0b' },
  { id: 'done', title: 'Done', color: '#10b981' },
]

export function KanbanBoard() {
  const { state, dispatch, filteredTasks, moveTask, addTask, reorderTasks } = useTask()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduce distance for more responsive dragging
        delay: 50, // Shorter delay for faster response
        tolerance: 8, // Increase tolerance for smoother interaction
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = filteredTasks.find(t => t.id === active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for visual feedback if needed
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Reset active task regardless of outcome
    setActiveTask(null)

    // DEBUG: Log all drag event details
    console.log('🐛 DRAG DEBUG: handleDragEnd called')
    console.log('🐛 DRAG DEBUG: active =', active)
    console.log('🐛 DRAG DEBUG: over =', over)

    // Ensure we have valid drag targets
    if (!over || !active) {
      console.log('🐛 DRAG DEBUG: ❌ Drag ended without valid targets')
      console.log('🐛 DRAG DEBUG: over =', over, 'active =', active)
      return
    }

    const taskId = active.id as string
    const overId = over.id as string

    console.log('🐛 DRAG DEBUG: taskId =', taskId)
    console.log('🐛 DRAG DEBUG: overId =', overId)

    // Find the task being moved
    const task = filteredTasks.find(t => t.id === taskId)
    if (!task) {
      console.log('🐛 DRAG DEBUG: ❌ Task not found:', taskId)
      return
    }

    console.log('🐛 DRAG DEBUG: Found task =', { id: task.id, title: task.title, status: task.status })

    // Check if we're dropping on a column (status change)
    const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done']
    const isDroppedOnColumn = validStatuses.includes(overId)
    
    console.log('🐛 DRAG DEBUG: validStatuses =', validStatuses)
    console.log('🐛 DRAG DEBUG: isDroppedOnColumn =', isDroppedOnColumn)
    
    if (isDroppedOnColumn) {
      const newStatus = overId as TaskStatus
      console.log('🐛 DRAG DEBUG: newStatus =', newStatus)
      
      if (task.status !== newStatus) {
        // Moving to different column
        console.log(`🐛 DRAG DEBUG: ✅ Moving task "${task.title}" from ${task.status} to ${newStatus}`)
        moveTask(taskId, newStatus).catch(error => {
          console.error('🐛 DRAG DEBUG: ❌ Failed to move task:', error)
        })
      } else {
        // Dropped on same column - no status change needed
        console.log('🐛 DRAG DEBUG: ℹ️ Task dropped on same column, no status change needed')
      }
    } else {
      console.log('🐛 DRAG DEBUG: 🔄 Checking for reordering...')
      // Dropped on another task - handle reordering
      const overTask = filteredTasks.find(t => t.id === overId)
      console.log('🐛 DRAG DEBUG: overTask =', overTask ? { id: overTask.id, status: overTask.status } : null)
      
      if (overTask && task.status === overTask.status) {
        console.log(`🐛 DRAG DEBUG: 🔄 Reordering task "${task.title}" within ${task.status} column`)
        
        // Get all tasks in the same column
        const columnTasks = getTasksByStatus(task.status)
        const activeIndex = columnTasks.findIndex(t => t.id === taskId)
        const overIndex = columnTasks.findIndex(t => t.id === overId)
        
        if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
          // Create new ordered array
          const reorderedTasks = [...columnTasks]
          const [movedTask] = reorderedTasks.splice(activeIndex, 1)
          reorderedTasks.splice(overIndex, 0, movedTask)
          
          // Update order values
          const updatedTasks = reorderedTasks.map((task, index) => ({
            ...task,
            order: index,
            updatedAt: new Date()
          }))
          
          // Update all tasks with new order
          const allTasksWithUpdatedOrder = filteredTasks.map(t => {
            const updatedTask = updatedTasks.find(ut => ut.id === t.id)
            return updatedTask || t
          })
          
          reorderTasks(allTasksWithUpdatedOrder).catch(error => {
            console.error('🐛 DRAG DEBUG: ❌ Failed to reorder tasks:', error)
          })
        }
      } else {
        console.log('🐛 DRAG DEBUG: ❌ Cannot reorder - not dropped on valid task in same column')
      }
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks
      .filter(task => task.status === status)
      .sort((a, b) => {
        // Sort by order if available, otherwise by creation date
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
  }

  const getColumnTaskCount = (status: TaskStatus) => {
    return getTasksByStatus(status).length
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Team Task Board</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 kanban-board">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              taskCount={getColumnTaskCount(column.id)}
            />
          ))}
        </div>

        <DragOverlay 
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeTask ? (
            <div className="rotate-3 scale-105 opacity-95">
              <TaskCard task={activeTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (task) => {
          try {
            await addTask(task)
            setIsCreateModalOpen(false)
          } catch (error) {
            console.error('Failed to add task:', error)
          }
        }}
      />
    </div>
  )
}