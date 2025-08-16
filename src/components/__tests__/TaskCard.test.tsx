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
  TaskModal: ({ isOpen, onClose, task, onSave }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="task-modal">
        <button onClick={() => onSave({ ...task, title: 'Updated Task' })}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
}))

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'medium',
  labels: ['bug', 'feature'],
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
}

const mockTeamMembers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'member' as const },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'admin' as const },
]

const mockUseTask = {
  state: {
    teamMembers: mockTeamMembers,
    tasks: [mockTask],
    labels: ['bug', 'feature', 'enhancement'],
    selectedMemberId: null,
    quickFilterMemberId: null,
  },
  dispatch: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  addLabel: jest.fn(),
  deleteLabel: jest.fn(),
  addTeamMember: jest.fn(),
  updateTeamMember: jest.fn(),
  deleteTeamMember: jest.fn(),
  setSelectedMemberId: jest.fn(),
  setQuickFilterMemberId: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
}

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTask as jest.Mock).mockReturnValue(mockUseTask)
    // Mock window.confirm
    global.confirm = jest.fn(() => true)
  })

  it('renders task card with basic information', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('bug')).toBeInTheDocument()
    expect(screen.getByText('feature')).toBeInTheDocument()
  })

  it('displays assignee information correctly', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByText('JD')).toBeInTheDocument() // Avatar initials
  })

  it('shows due date when present', () => {
    render(<TaskCard task={mockTask} />)
    
    expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument()
  })

  it('indicates overdue tasks with appropriate styling', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2024-01-01'),
      status: 'todo' as const,
    }
    
    render(<TaskCard task={overdueTask} />)
    
    const dueDateElement = screen.getByText(/Jan 1, 2024/)
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
    
    render(<TaskCard task={dueSoonTask} />)
    
    const dueDateElement = screen.getByText(/Due/)
    expect(dueDateElement.closest('div')).toHaveClass('text-orange-600')
  })

  it('shows priority badge with correct color', () => {
    render(<TaskCard task={{ ...mockTask, priority: 'high' }} />)
    
    const priorityBadge = screen.getByText('High')
    expect(priorityBadge).toHaveClass('bg-red-100')
  })

  it('handles edit action', async () => {
    const user = userEvent.setup()
    render(<TaskCard task={mockTask} />)
    
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
    render(<TaskCard task={mockTask} />)
    
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
    render(<TaskCard task={mockTask} />)
    
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
    render(<TaskCard task={mockTask} isDragging={true} />)
    
    const card = screen.getByText('Test Task').closest('.task-card')
    expect(card).toHaveClass('cursor-grabbing', 'opacity-80', 'rotate-2')
  })

  it('displays recurring task indicator', () => {
    const recurringTask = {
      ...mockTask,
      isRecurring: true,
      recurringPattern: 'daily' as const,
    }
    
    render(<TaskCard task={recurringTask} />)
    
    // Check for recurring icon/indicator
    expect(screen.getByTestId('recurring-icon')).toBeInTheDocument()
  })

  it('shows comment count when comments exist', () => {
    const taskWithComments = {
      ...mockTask,
      comments: [
        { id: '1', text: 'Comment 1', userId: 'user-1', createdAt: new Date() },
        { id: '2', text: 'Comment 2', userId: 'user-2', createdAt: new Date() },
      ],
    }
    
    render(<TaskCard task={taskWithComments} />)
    
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('handles task without assignee', () => {
    const unassignedTask = {
      ...mockTask,
      assigneeId: undefined,
    }
    
    render(<TaskCard task={unassignedTask} />)
    
    // Should show unassigned indicator
    expect(screen.getByTestId('unassigned-icon')).toBeInTheDocument()
  })

  it('handles task without description', () => {
    const taskNoDesc = {
      ...mockTask,
      description: '',
    }
    
    render(<TaskCard task={taskNoDesc} />)
    
    // Description should not be rendered
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('handles task without labels', () => {
    const taskNoLabels = {
      ...mockTask,
      labels: [],
    }
    
    render(<TaskCard task={taskNoLabels} />)
    
    // Labels should not be rendered
    expect(screen.queryByText('bug')).not.toBeInTheDocument()
    expect(screen.queryByText('feature')).not.toBeInTheDocument()
  })

  it('disables dragging when dropdown is open', async () => {
    const { useSortable } = require('@dnd-kit/sortable')
    const mockUseSortable = jest.fn()
    useSortable.mockImplementation(mockUseSortable)
    
    const user = userEvent.setup()
    render(<TaskCard task={mockTask} />)
    
    // Initially dragging should be enabled
    expect(mockUseSortable).toHaveBeenCalledWith(expect.objectContaining({
      disabled: false,
    }))
    
    // Open dropdown
    const menuButton = screen.getByRole('button', { name: /More options/i })
    await user.click(menuButton)
    
    // Dragging should be disabled when dropdown is open
    expect(mockUseSortable).toHaveBeenLastCalledWith(expect.objectContaining({
      disabled: true,
    }))
  })

  it('applies correct styling based on priority', () => {
    // Test high priority
    const { rerender } = render(<TaskCard task={{ ...mockTask, priority: 'high' }} />)
    expect(screen.getByText('High')).toHaveClass('bg-red-100')
    
    // Test medium priority
    rerender(<TaskCard task={{ ...mockTask, priority: 'medium' }} />)
    expect(screen.getByText('Medium')).toHaveClass('bg-yellow-100')
    
    // Test low priority
    rerender(<TaskCard task={{ ...mockTask, priority: 'low' }} />)
    expect(screen.getByText('Low')).toHaveClass('bg-green-100')
  })

  it('handles error during delete gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockUseTask.deleteTask.mockRejectedValue(new Error('Delete failed'))
    
    const user = userEvent.setup()
    render(<TaskCard task={mockTask} />)
    
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