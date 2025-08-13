'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column, Task } from '@/types'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  taskCount: number
}

export function KanbanColumn({ column, tasks, taskCount }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const isOverLimit = column.limit && taskCount >= column.limit

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {column.title}
          </h3>
          <span className={cn(
            "px-2 py-1 text-xs rounded-full",
            isOverLimit 
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          )}>
            {taskCount}
            {column.limit && ` / ${column.limit}`}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 min-h-32 p-2 rounded-lg transition-colors",
          isOver 
            ? "bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800"
            : "bg-gray-50 dark:bg-gray-800 border-2 border-transparent",
          isOverLimit && "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
        )}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-600 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}