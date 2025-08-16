import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from '../TaskModal'
import { useTask } from '@/contexts/TaskContext'
import { Task, TaskStatus, Priority } from '@/types'

// Mock the dependencies
jest.mock('@/contexts/TaskContext')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid')
}))

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'medium',
  labels: [
    { id: 'label-1', name: 'bug', color: 'red' },
    { id: 'label-2', name: 'feature', color: 'blue' }
  ],
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
  estimatedHours: 5,
  actualHours: 2,
  subtasks: [
    { id: 'subtask-1', title: 'Subtask 1', completed: false },
    { id: 'subtask-2', title: 'Subtask 2', completed: true }
  ],
  attachments: []
}

const mockState = {
  teamMembers: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'member' as const },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'admin' as const },
  ],
  labels: [
    { id: 'label-1', name: 'bug', color: 'red' },
    { id: 'label-2', name: 'feature', color: 'blue' },
    { id: 'label-3', name: 'enhancement', color: 'green' },
  ],
  tasks: [],
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

describe('TaskModal', () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTask as jest.Mock).mockReturnValue(mockUseTask)
  })

  it('renders modal when open', () => {
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Create Task')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <TaskModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders with edit mode when task is provided', () => {
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('handles title input change', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const titleInput = screen.getByPlaceholderText('Enter task title')
    await user.type(titleInput, 'New Task Title')
    
    expect(titleInput).toHaveValue('New Task Title')
  })

  it('handles description input change', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const descInput = screen.getByPlaceholderText('Enter task description')
    await user.type(descInput, 'New task description')
    
    expect(descInput).toHaveValue('New task description')
  })

  it('handles status selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const statusSelect = screen.getByRole('combobox', { name: /status/i })
    await user.click(statusSelect)
    
    const inProgressOption = await screen.findByText('In Progress')
    await user.click(inProgressOption)
    
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('handles priority selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const prioritySelect = screen.getByRole('combobox', { name: /priority/i })
    await user.click(prioritySelect)
    
    const highOption = await screen.findByText('High')
    await user.click(highOption)
    
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('handles assignee selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const assigneeSelect = screen.getByRole('combobox', { name: /assignee/i })
    await user.click(assigneeSelect)
    
    const johnOption = await screen.findByText('John Doe')
    await user.click(johnOption)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('handles label selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const bugLabel = screen.getByText('bug')
    await user.click(bugLabel)
    
    // Label should be selected (have different styling)
    expect(bugLabel.closest('button')).toHaveClass('bg-primary')
  })

  it('handles due date selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const dateButton = screen.getByRole('button', { name: /pick a date/i })
    await user.click(dateButton)
    
    // Select a date (simplified)
    const dateInCalendar = screen.getAllByText('15')[0]
    await user.click(dateInCalendar)
    
    // Date should be selected
    expect(screen.queryByText(/pick a date/i)).not.toBeInTheDocument()
  })

  it('handles estimated hours input', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const estimatedInput = screen.getByPlaceholderText('Estimated hours')
    await user.type(estimatedInput, '8')
    
    expect(estimatedInput).toHaveValue(8)
  })

  it('adds subtasks', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const subtaskInput = screen.getByPlaceholderText('Add a subtask')
    const addButton = screen.getByRole('button', { name: /add subtask/i })
    
    await user.type(subtaskInput, 'New Subtask')
    await user.click(addButton)
    
    expect(screen.getByText('New Subtask')).toBeInTheDocument()
  })

  it('toggles subtask completion', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    const subtaskCheckbox = screen.getByRole('checkbox', { name: /Subtask 1/i })
    await user.click(subtaskCheckbox)
    
    expect(subtaskCheckbox).toBeChecked()
  })

  it('removes subtasks', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(removeButtons[0])
    
    expect(screen.queryByText('Subtask 1')).not.toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    // Fill in required fields
    const titleInput = screen.getByPlaceholderText('Enter task title')
    await user.type(titleInput, 'New Task')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'mock-uuid',
        title: 'New Task',
        status: 'todo',
        priority: 'medium',
      })
    )
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('does not submit with empty title', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    // Try to submit without title
    const submitButton = screen.getByRole('button', { name: /create/i })
    await user.click(submitButton)
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('updates existing task', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    // Modify title
    const titleInput = screen.getByDisplayValue('Test Task')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Task')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-1',
        title: 'Updated Task',
      })
    )
  })

  it('cancels and closes modal', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('resets form when modal opens with no task', () => {
    const { rerender } = render(
      <TaskModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    // Open modal without task
    rerender(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
      />
    )
    
    const titleInput = screen.getByPlaceholderText('Enter task title')
    expect(titleInput).toHaveValue('')
  })

  it('populates form when modal opens with task', () => {
    const { rerender } = render(
      <TaskModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
      />
    )
    
    // Open modal with task
    rerender(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    // Fill in title
    const titleInput = screen.getByPlaceholderText('Enter task title')
    await user.type(titleInput, 'Quick Task')
    
    // Press Ctrl+Enter to submit
    await user.keyboard('{Control>}{Enter}{/Control}')
    
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('handles escape key to close', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    await user.keyboard('{Escape}')
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('validates numeric input for estimated hours', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const estimatedInput = screen.getByPlaceholderText('Estimated hours')
    await user.type(estimatedInput, 'abc')
    
    // Should not accept non-numeric input
    expect(estimatedInput).toHaveValue(null)
  })

  it('handles multiple label selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    )
    
    const bugLabel = screen.getByText('bug')
    const featureLabel = screen.getByText('feature')
    
    await user.click(bugLabel)
    await user.click(featureLabel)
    
    expect(bugLabel.closest('button')).toHaveClass('bg-primary')
    expect(featureLabel.closest('button')).toHaveClass('bg-primary')
  })

  it('deselects labels on second click', async () => {
    const user = userEvent.setup()
    render(
      <TaskModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit}
        task={mockTask}
      />
    )
    
    // Bug label should be selected initially
    const bugLabel = screen.getByText('bug')
    expect(bugLabel.closest('button')).toHaveClass('bg-primary')
    
    // Click to deselect
    await user.click(bugLabel)
    
    expect(bugLabel.closest('button')).not.toHaveClass('bg-primary')
  })
})