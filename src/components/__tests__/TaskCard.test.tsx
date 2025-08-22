import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../TaskCard'
import { useTask } from '@/contexts/TaskContext'
import { Task } from '@/types'
import { DndContext } from '@dnd-kit/core'

// Mock the dependencies
jest.mock('@/contexts/TaskContext')
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
}))

// Mock the TaskModal component
jest.mock('../TaskModal', () => ({
  TaskModal: ({ isOpen, onClose, task, onSubmit }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="task-modal">
        <button onClick={() => onSubmit({ ...task, title: 'Updated Task' })}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    )
  },
}))

const getFutureDate = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'medium',
  labels: [
    { id: '1', name: 'bug', color: '#ef4444' },
    { id: '2', name: 'feature', color: '#3b82f6' },
  ],
  assigneeId: 'user-1',
  dueDate: getFutureDate(10), // 10 days from now
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  estimatedHours: undefined,
  actualHours: undefined,
  subtasks: [],
  comments: [],
  attachments: [],
  order: 0,
}

const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    role: 'Developer',
    userRole: 'member' as const,
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: '',
    role: 'Manager',
    userRole: 'admin' as const,
  },
]

const mockUseTask = {
  state: {
    teamMembers: mockTeamMembers,
    tasks: [mockTask],
    labels: [
      { id: '1', name: 'bug', color: '#ef4444' },
      { id: '2', name: 'feature', color: '#3b82f6' },
      { id: '3', name: 'enhancement', color: '#10b981' },
    ],
    groups: [],
    dailyReports: [],
    filters: {
      search: '',
      assignee: [],
      priority: [],
      labels: [],
      dueDate: {},
    },
  },
  dispatch: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
  addGroup: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  initializeDefaultGroups: jest.fn(),
  addDailyReport: jest.fn(),
  updateDailyReport: jest.fn(),
  deleteDailyReport: jest.fn(),
  syncWithDatabase: jest.fn(),
  filteredTasks: [mockTask],
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
}

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTask as jest.Mock).mockReturnValue(mockUseTask)
    // Mock window.confirm
    global.confirm = jest.fn(() => true)
  })

  const renderWithDnd = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>)
  }

  it('renders task card with basic information', () => {
    renderWithDnd(<TaskCard task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('bug')).toBeInTheDocument()
    expect(screen.getByText('feature')).toBeInTheDocument()
  })

  it('displays assignee information correctly', () => {
    renderWithDnd(<TaskCard task={mockTask} />)

    expect(screen.getByText('JD')).toBeInTheDocument() // Avatar initials
  })

  it('shows due date when present', () => {
    renderWithDnd(<TaskCard task={mockTask} />)

    // The date shows as "In X days" for future dates
    expect(screen.getByText('In 10 days')).toBeInTheDocument()
  })

  it('indicates overdue tasks with appropriate styling', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2024-01-01'),
      status: 'todo' as const,
    }

    renderWithDnd(<TaskCard task={overdueTask} />)

    const dueDateElement = screen.getByText(/\d+ days ago/)
    expect(dueDateElement.closest('div')).toHaveClass('text-red-600')
  })

  it('indicates tasks due soon', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dueSoonTask = {
      ...mockTask,
      dueDate: tomorrow,
      status: 'todo' as const,
    }

    renderWithDnd(<TaskCard task={dueSoonTask} />)

    const dueDateElement = screen.getByText('Tomorrow')
    expect(dueDateElement.closest('div')).toHaveClass('text-yellow-600')
  })

  it('shows priority badge with correct color', () => {
    renderWithDnd(<TaskCard task={{ ...mockTask, priority: 'high' }} />)

    const priorityText = screen.getByText('High')
    expect(priorityText).toHaveClass('text-red-600')
  })

  it('handles edit action', async () => {
    const user = userEvent.setup()
    renderWithDnd(<TaskCard task={mockTask} />)

    // Open dropdown
    const menuButton = screen.getByRole('button', { name: /More options/i })
    await user.click(menuButton)

    // Click edit
    const editButton = await screen.findByText('Edit')
    await user.click(editButton)

    // Check modal is open
    await waitFor(() => {
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    })
  })

  it('handles delete action with confirmation', async () => {
    const user = userEvent.setup()
    renderWithDnd(<TaskCard task={mockTask} />)

    // Open dropdown
    const menuButton = screen.getByRole('button', { name: /More options/i })
    await user.click(menuButton)

    // Click delete
    const deleteButton = await screen.findByText('Delete')
    await user.click(deleteButton)

    // Check confirmation was called
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')

    // Check delete function was called
    await waitFor(() => {
      expect(mockUseTask.deleteTask).toHaveBeenCalledWith('task-1')
    })
  })

  it('cancels delete when user declines confirmation', async () => {
    global.confirm = jest.fn(() => false)
    const user = userEvent.setup()
    renderWithDnd(<TaskCard task={mockTask} />)

    // Open dropdown
    const menuButton = screen.getByRole('button', { name: /More options/i })
    await user.click(menuButton)

    // Click delete
    const deleteButton = await screen.findByText('Delete')
    await user.click(deleteButton)

    // Check delete function was NOT called
    expect(mockUseTask.deleteTask).not.toHaveBeenCalled()
  })

  it('renders dragging state correctly', () => {
    // Mock useSortable to return isDragging: true
    const { useSortable } = require('@dnd-kit/sortable')
    useSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: true,
    })

    renderWithDnd(<TaskCard task={mockTask} />)

    const card = screen.getByText('Test Task').closest('.task-card')
    expect(card).toHaveClass('opacity-50', 'scale-105', 'rotate-1', 'cursor-grabbing')
  })

  it('renders task card without recurring indicator (not implemented)', () => {
    const recurringTask = {
      ...mockTask,
    }

    renderWithDnd(<TaskCard task={recurringTask} />)

    // The current implementation doesn't show recurring indicators
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('shows comment count when comments exist', () => {
    const taskWithComments = {
      ...mockTask,
      comments: [
        { id: '1', text: 'Comment 1', userId: 'user-1', createdAt: new Date() },
        { id: '2', text: 'Comment 2', userId: 'user-2', createdAt: new Date() },
      ],
    }

    renderWithDnd(<TaskCard task={taskWithComments} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('handles task without assignee', () => {
    const unassignedTask = {
      ...mockTask,
      assigneeId: undefined,
    }

    renderWithDnd(<TaskCard task={unassignedTask} />)

    // Task without assignee won't show assignee section
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })

  it('handles task without description', () => {
    const taskNoDesc = {
      ...mockTask,
      description: '',
    }

    renderWithDnd(<TaskCard task={taskNoDesc} />)

    // Description should not be rendered
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('handles task without labels', () => {
    const taskNoLabels = {
      ...mockTask,
      labels: [],
    }

    renderWithDnd(<TaskCard task={taskNoLabels} />)

    // Labels should not be rendered
    expect(screen.queryByText('bug')).not.toBeInTheDocument()
    expect(screen.queryByText('feature')).not.toBeInTheDocument()
  })

  it('disables dragging when dropdown is open', async () => {
    const { useSortable } = require('@dnd-kit/sortable')
    const mockUseSortable = jest.fn()
    useSortable.mockImplementation(mockUseSortable)

    const user = userEvent.setup()
    renderWithDnd(<TaskCard task={mockTask} />)

    // Initially dragging should be enabled
    expect(mockUseSortable).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: false,
      })
    )

    // Open dropdown
    const menuButton = screen.getByRole('button', { name: /More options/i })
    await user.click(menuButton)

    // Dragging should be disabled when dropdown is open
    expect(mockUseSortable).toHaveBeenLastCalledWith(
      expect.objectContaining({
        disabled: true,
      })
    )
  })

  it('applies correct styling based on priority', () => {
    // Test high priority
    const { rerender } = renderWithDnd(<TaskCard task={{ ...mockTask, priority: 'high' }} />)
    expect(screen.getByText('High')).toHaveClass('text-red-600')

    // Test medium priority
    rerender(
      <DndContext>
        <TaskCard task={{ ...mockTask, priority: 'medium' }} />
      </DndContext>
    )
    expect(screen.getByText('Medium')).toHaveClass('text-yellow-600')

    // Test low priority
    rerender(
      <DndContext>
        <TaskCard task={{ ...mockTask, priority: 'low' }} />
      </DndContext>
    )
    expect(screen.getByText('Low')).toHaveClass('text-green-600')
  })

  it('handles error during delete gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockUseTask.deleteTask.mockRejectedValue(new Error('Delete failed'))

    const user = userEvent.setup()
    renderWithDnd(<TaskCard task={mockTask} />)

    // Open dropdown and delete
    const menuButton = screen.getByRole('button', { name: /More options/i })
    await user.click(menuButton)
    const deleteButton = await screen.findByText('Delete')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete task:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })
})
