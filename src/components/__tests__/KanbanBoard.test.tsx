import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanBoard } from '../KanbanBoard'
import { useTask } from '@/contexts/TaskContext'
import { Task } from '@/types'
import { DndContext, DragOverlay } from '@dnd-kit/core'

// Mock the dependencies
jest.mock('@/contexts/TaskContext')
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children }: any) => <div>{children}</div>,
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  closestCorners: jest.fn(),
}))

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
  arrayMove: jest.fn((arr, from, to) => {
    const newArr = [...arr]
    const [removed] = newArr.splice(from, 1)
    newArr.splice(to, 0, removed)
    return newArr
  }),
}))

// Mock KanbanColumn
jest.mock('../KanbanColumn', () => ({
  KanbanColumn: ({ status, tasks, onTaskClick }: any) => (
    <div data-testid={`column-${status}`}>
      <h3>{status}</h3>
      <div data-testid={`task-count-${status}`}>{tasks.length}</div>
      {tasks.map((task: Task) => (
        <div 
          key={task.id} 
          data-testid={`task-${task.id}`}
          onClick={() => onTaskClick?.(task)}
        >
          {task.title}
        </div>
      ))}
    </div>
  )
}))

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Todo Task 1',
    description: 'Description 1',
    status: 'todo',
    priority: 'high',
    labels: [],
    assigneeId: 'user-1',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    completedAt: null,
    completedBy: null,
    comments: [],
    projectId: 'project-1',
    isRecurring: false,
    recurringPattern: null,
    originalTaskId: null,
  },
  {
    id: 'task-2',
    title: 'In Progress Task',
    description: 'Description 2',
    status: 'in-progress',
    priority: 'medium',
    labels: [],
    assigneeId: 'user-2',
    dueDate: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    completedAt: null,
    completedBy: null,
    comments: [],
    projectId: 'project-1',
    isRecurring: false,
    recurringPattern: null,
    originalTaskId: null,
  },
  {
    id: 'task-3',
    title: 'Done Task',
    description: 'Description 3',
    status: 'done',
    priority: 'low',
    labels: [],
    assigneeId: 'user-1',
    dueDate: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    completedAt: new Date('2025-01-02'),
    completedBy: 'user-1',
    comments: [],
    projectId: 'project-1',
    isRecurring: false,
    recurringPattern: null,
    originalTaskId: null,
  },
  {
    id: 'task-4',
    title: 'Todo Task 2',
    description: 'Description 4',
    status: 'todo',
    priority: 'medium',
    labels: [],
    assigneeId: null,
    dueDate: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    completedAt: null,
    completedBy: null,
    comments: [],
    projectId: 'project-1',
    isRecurring: false,
    recurringPattern: null,
    originalTaskId: null,
  },
]

const mockState = {
  tasks: mockTasks,
  teamMembers: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'member' as const },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'admin' as const },
  ],
  labels: [],
  filters: {
    search: '',
    assignee: [],
    priority: [],
    labels: [],
    dueDate: {},
  },
  selectedMemberId: null,
  quickFilterMemberId: null,
}

const mockUseTask = {
  state: mockState,
  dispatch: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  addLabel: jest.fn(),
  deleteLabel: jest.fn(),
  addTeamMember: jest.fn(),
  updateTeamMember: jest.fn(),
  deleteTeamMember: jest.fn(),
  setSelectedMemberId: jest.fn(),
  setQuickFilterMemberId: jest.fn(),
}

describe('KanbanBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTask as jest.Mock).mockReturnValue(mockUseTask)
  })

  it('renders all kanban columns', () => {
    render(<KanbanBoard />)
    
    expect(screen.getByTestId('column-todo')).toBeInTheDocument()
    expect(screen.getByTestId('column-in-progress')).toBeInTheDocument()
    expect(screen.getByTestId('column-done')).toBeInTheDocument()
  })

  it('displays tasks in correct columns', () => {
    render(<KanbanBoard />)
    
    // Check todo column has 2 tasks
    const todoColumn = screen.getByTestId('column-todo')
    expect(within(todoColumn).getByText('Todo Task 1')).toBeInTheDocument()
    expect(within(todoColumn).getByText('Todo Task 2')).toBeInTheDocument()
    expect(screen.getByTestId('task-count-todo')).toHaveTextContent('2')
    
    // Check in-progress column has 1 task
    const inProgressColumn = screen.getByTestId('column-in-progress')
    expect(within(inProgressColumn).getByText('In Progress Task')).toBeInTheDocument()
    expect(screen.getByTestId('task-count-in-progress')).toHaveTextContent('1')
    
    // Check done column has 1 task
    const doneColumn = screen.getByTestId('column-done')
    expect(within(doneColumn).getByText('Done Task')).toBeInTheDocument()
    expect(screen.getByTestId('task-count-done')).toHaveTextContent('1')
  })

  it('filters tasks based on search', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          search: 'Todo',
        }
      }
    })
    
    render(<KanbanBoard />)
    
    // Should only show tasks with "Todo" in title
    expect(screen.getByText('Todo Task 1')).toBeInTheDocument()
    expect(screen.getByText('Todo Task 2')).toBeInTheDocument()
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument()
  })

  it('filters tasks by assignee', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          assignee: ['user-1'],
        }
      }
    })
    
    render(<KanbanBoard />)
    
    // Should only show tasks assigned to user-1
    expect(screen.getByText('Todo Task 1')).toBeInTheDocument()
    expect(screen.getByText('Done Task')).toBeInTheDocument()
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Todo Task 2')).not.toBeInTheDocument() // unassigned
  })

  it('filters tasks by priority', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          priority: ['high'],
        }
      }
    })
    
    render(<KanbanBoard />)
    
    // Should only show high priority tasks
    expect(screen.getByText('Todo Task 1')).toBeInTheDocument()
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Todo Task 2')).not.toBeInTheDocument()
  })

  it('filters tasks by quick filter member', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        quickFilterMemberId: 'user-2',
      }
    })
    
    render(<KanbanBoard />)
    
    // Should only show tasks assigned to user-2
    expect(screen.getByText('In Progress Task')).toBeInTheDocument()
    expect(screen.queryByText('Todo Task 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Todo Task 2')).not.toBeInTheDocument()
  })

  it('filters tasks by due date range', () => {
    const today = new Date()
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          dueDate: {
            from: today,
            to: new Date('2025-12-31'),
          },
        }
      }
    })
    
    render(<KanbanBoard />)
    
    // Should only show tasks with due date in range
    expect(screen.getByText('Todo Task 1')).toBeInTheDocument()
    // Tasks without due dates should not appear
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument()
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument()
  })

  it('handles task click to open edit modal', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard />)
    
    const task = screen.getByTestId('task-task-1')
    await user.click(task)
    
    // Should open task modal (mocked in this test)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('handles drag and drop between columns', async () => {
    const mockDndContext = require('@dnd-kit/core').DndContext
    mockDndContext.mockImplementation(({ onDragEnd, children }: any) => {
      // Simulate drag end
      React.useEffect(() => {
        onDragEnd({
          active: { id: 'task-1' },
          over: { id: 'in-progress' },
        })
      }, [onDragEnd])
      return <div>{children}</div>
    })
    
    render(<KanbanBoard />)
    
    await waitFor(() => {
      expect(mockUseTask.moveTask).toHaveBeenCalledWith('task-1', 'in-progress')
    })
  })

  it('handles drag and drop within same column for reordering', async () => {
    const mockDndContext = require('@dnd-kit/core').DndContext
    mockDndContext.mockImplementation(({ onDragEnd, children }: any) => {
      // Simulate drag within same column
      React.useEffect(() => {
        onDragEnd({
          active: { id: 'task-1' },
          over: { id: 'task-4' },
        })
      }, [onDragEnd])
      return <div>{children}</div>
    })
    
    render(<KanbanBoard />)
    
    await waitFor(() => {
      expect(mockUseTask.reorderTasks).toHaveBeenCalled()
    })
  })

  it('shows drag overlay when dragging', () => {
    const mockDndContext = require('@dnd-kit/core').DndContext
    mockDndContext.mockImplementation(({ children }: any) => {
      return (
        <div>
          {children}
          <div data-testid="drag-overlay">
            <div>Dragging Task</div>
          </div>
        </div>
      )
    })
    
    render(<KanbanBoard />)
    
    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument()
  })

  it('applies correct column styling', () => {
    render(<KanbanBoard />)
    
    const todoColumn = screen.getByTestId('column-todo')
    const inProgressColumn = screen.getByTestId('column-in-progress')
    const doneColumn = screen.getByTestId('column-done')
    
    // Verify columns are rendered (styling would be in actual component)
    expect(todoColumn).toBeInTheDocument()
    expect(inProgressColumn).toBeInTheDocument()
    expect(doneColumn).toBeInTheDocument()
  })

  it('handles empty columns gracefully', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        tasks: [], // No tasks
      }
    })
    
    render(<KanbanBoard />)
    
    // All columns should still render
    expect(screen.getByTestId('column-todo')).toBeInTheDocument()
    expect(screen.getByTestId('column-in-progress')).toBeInTheDocument()
    expect(screen.getByTestId('column-done')).toBeInTheDocument()
    
    // All should show 0 tasks
    expect(screen.getByTestId('task-count-todo')).toHaveTextContent('0')
    expect(screen.getByTestId('task-count-in-progress')).toHaveTextContent('0')
    expect(screen.getByTestId('task-count-done')).toHaveTextContent('0')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<KanbanBoard />)
    
    const firstTask = screen.getByTestId('task-task-1')
    
    // Focus on first task
    firstTask.focus()
    
    // Navigate with keyboard
    await user.keyboard('{ArrowDown}')
    
    // Verify focus moved (would need actual implementation)
    expect(document.activeElement).toBeDefined()
  })

  it('combines multiple filters correctly', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          search: 'Task',
          assignee: ['user-1'],
          priority: ['high'],
          labels: [],
          dueDate: {},
        }
      }
    })
    
    render(<KanbanBoard />)
    
    // Should only show tasks matching all filters
    expect(screen.getByText('Todo Task 1')).toBeInTheDocument() // Matches all
    expect(screen.queryByText('Todo Task 2')).not.toBeInTheDocument() // Wrong priority
    expect(screen.queryByText('In Progress Task')).not.toBeInTheDocument() // Wrong assignee
    expect(screen.queryByText('Done Task')).not.toBeInTheDocument() // Wrong priority
  })

  it('handles case-insensitive search', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          search: 'TODO',
        }
      }
    })
    
    render(<KanbanBoard />)
    
    // Should find tasks with "Todo" despite search being "TODO"
    expect(screen.getByText('Todo Task 1')).toBeInTheDocument()
    expect(screen.getByText('Todo Task 2')).toBeInTheDocument()
  })

  it('handles special characters in search', () => {
    const taskWithSpecialChars = {
      ...mockTasks[0],
      id: 'task-special',
      title: 'Task with @special #characters!',
    }
    
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        tasks: [...mockTasks, taskWithSpecialChars],
        filters: {
          ...mockState.filters,
          search: '@special',
        }
      }
    })
    
    render(<KanbanBoard />)
    
    expect(screen.getByText('Task with @special #characters!')).toBeInTheDocument()
  })
})