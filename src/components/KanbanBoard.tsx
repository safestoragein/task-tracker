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
  const { state, dispatch, filteredTasks, moveTask, addTask } = useTask()
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

    // Ensure we have valid drag targets
    if (!over || !active) {
      console.log('Drag ended without valid targets')
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Validate that we're dropping on a valid column
    const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done']
    if (!validStatuses.includes(newStatus)) {
      console.log('Invalid drop target:', newStatus)
      return
    }

    // Find the task being moved
    const task = filteredTasks.find(t => t.id === taskId)
    if (!task) {
      console.log('Task not found:', taskId)
      return
    }

    // Only move if status is actually changing
    if (task.status !== newStatus) {
      console.log(`Moving task "${task.title}" from ${task.status} to ${newStatus}`)
      moveTask(taskId, newStatus).catch(error => {
        console.error('Failed to move task:', error)
      })
    } else {
      console.log('Task dropped on same column, no action needed')
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(task => task.status === status)
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