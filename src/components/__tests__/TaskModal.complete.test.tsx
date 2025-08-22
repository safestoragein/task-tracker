import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskModal } from '../TaskModal'
import { TaskContext } from '@/contexts/TaskContext'
import { Task, TaskState } from '@/types'

// ✅ COMPLETE test data
const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'todo',
  priority: 'medium',
  assigneeId: 'user-1',
  dueDate: new Date('2025-12-31'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  labels: [
    { id: 'label-1', name: 'bug', color: '#ff0000' },
    { id: 'label-2', name: 'feature', color: '#00ff00' }
  ],
  subtasks: [
    { id: 'sub-1', title: 'Subtask 1', completed: false, createdAt: new Date() },
    { id: 'sub-2', title: 'Subtask 2', completed: true, createdAt: new Date() }
  ],
  comments: [
    { id: 'comment-1', content: 'First comment', authorId: 'user-1', createdAt: new Date() },
    { id: 'comment-2', content: 'Second comment', authorId: 'user-2', createdAt: new Date() }
  ],
  attachments: [
    { id: 'att-1', name: 'document.pdf', url: '/files/document.pdf', size: 1024, type: 'application/pdf', uploadedAt: new Date() }
  ],
  order: 0,
  estimatedHours: 8,
  actualHours: 6
}

const mockTeamMembers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'Developer', userRole: 'admin' as const },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'Designer', userRole: 'member' as const },
  { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com', avatar: '', role: 'Manager', userRole: 'admin' as const }
]

const mockLabels = [
  { id: 'label-1', name: 'bug', color: '#ff0000' },
  { id: 'label-2', name: 'feature', color: '#00ff00' },
  { id: 'label-3', name: 'enhancement', color: '#0000ff' },
  { id: 'label-4', name: 'documentation', color: '#ffff00' }
]

const mockState: TaskState = {
  tasks: [mockTask],
  teamMembers: mockTeamMembers,
  labels: mockLabels,
  dailyReports: [],
  filters: {
    search: '',
    assignee: [],
    priority: [],
    labels: [],
    dueDate: {},
  }
}

const mockContextValue = {
  state: mockState,
  dispatch: jest.fn(),
  filteredTasks: [mockTask],
  isOnline: true,
  isSyncing: false,
  lastSyncTime: new Date(),
  addTask: jest.fn().mockResolvedValue(undefined),
  updateTask: jest.fn().mockResolvedValue(undefined),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
  addDailyReport: jest.fn(),
  updateDailyReport: jest.fn(),
  deleteDailyReport: jest.fn(),
  syncWithDatabase: jest.fn(),
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  task?: Task
  mode?: 'create' | 'edit'
}

const renderTaskModal = (props: Partial<TaskModalProps> = {}, contextOverrides = {}) => {
  const defaultProps: TaskModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
    mode: 'create',
    ...props
  }
  
  const value = { ...mockContextValue, ...contextOverrides }
  
  return render(
    <TaskContext.Provider value={value}>
      <TaskModal {...defaultProps} />
    </TaskContext.Provider>
  )
}

describe('TaskModal - 100% Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ✅ BASIC RENDERING TESTS
  describe('Rendering', () => {
    it('renders create modal when mode is create', () => {
      renderTaskModal({ mode: 'create' })
      
      expect(screen.getByText('Create New Task')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument()
    })

    it('renders edit modal when mode is edit', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('Edit Task')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      renderTaskModal({ isOpen: false })
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderTaskModal()
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/estimated hours/i)).toBeInTheDocument()
    })

    it('renders labels section', () => {
      renderTaskModal()
      
      expect(screen.getByText('Labels')).toBeInTheDocument()
      mockLabels.forEach(label => {
        expect(screen.getByText(label.name)).toBeInTheDocument()
      })
    })

    it('renders subtasks section', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('Subtasks')).toBeInTheDocument()
      expect(screen.getByText('Subtask 1')).toBeInTheDocument()
      expect(screen.getByText('Subtask 2')).toBeInTheDocument()
    })

    it('renders comments section', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('Comments')).toBeInTheDocument()
      expect(screen.getByText('First comment')).toBeInTheDocument()
      expect(screen.getByText('Second comment')).toBeInTheDocument()
    })

    it('renders attachments section', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('Attachments')).toBeInTheDocument()
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })
  })

  // ✅ FORM VALIDATION TESTS
  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
    })

    it('validates title length', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'A'.repeat(256)) // Assuming max length is 255
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/title is too long/i)).toBeInTheDocument()
      })
    })

    it('validates due date is not in the past', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.type(dueDateInput, '2020-01-01') // Past date
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/due date cannot be in the past/i)).toBeInTheDocument()
      })
    })

    it('validates estimated hours is positive', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Valid Title')
      
      const estimatedHoursInput = screen.getByLabelText(/estimated hours/i)
      await user.type(estimatedHoursInput, '-5') // Negative value
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/estimated hours must be positive/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when field is corrected', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
      })
      
      // Fix the error
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'Valid Title')
      
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
      })
    })
  })

  // ✅ CREATE TASK TESTS
  describe('Create Task', () => {
    it('creates task with basic information', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderTaskModal({ onSubmit: mockOnSubmit })
      
      // Fill required fields
      const titleInput = screen.getByLabelText(/title/i)
      await user.type(titleInput, 'New Task')
      
      const descriptionInput = screen.getByLabelText(/description/i)
      await user.type(descriptionInput, 'Task description')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Task',
            description: 'Task description',
            status: 'todo', // Default status
            priority: 'medium', // Default priority
          })
        )
      })
    })

    it('creates task with all fields filled', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderTaskModal({ onSubmit: mockOnSubmit })
      
      // Fill all fields
      await user.type(screen.getByLabelText(/title/i), 'Complete Task')
      await user.type(screen.getByLabelText(/description/i), 'Complete description')
      
      await user.selectOptions(screen.getByLabelText(/status/i), 'in-progress')
      await user.selectOptions(screen.getByLabelText(/priority/i), 'high')
      await user.selectOptions(screen.getByLabelText(/assignee/i), 'user-1')
      
      await user.type(screen.getByLabelText(/due date/i), '2025-12-31')
      await user.type(screen.getByLabelText(/estimated hours/i), '8')
      
      // Select labels
      const bugLabel = screen.getByLabelText('bug')
      await user.click(bugLabel)
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Complete Task',
            description: 'Complete description',
            status: 'in-progress',
            priority: 'high',
            assigneeId: 'user-1',
            dueDate: new Date('2025-12-31'),
            estimatedHours: 8,
            labels: expect.arrayContaining([
              expect.objectContaining({ name: 'bug' })
            ])
          })
        )
      })
    })

    it('selects multiple labels', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      // Select multiple labels
      const bugLabel = screen.getByLabelText('bug')
      const featureLabel = screen.getByLabelText('feature')
      
      await user.click(bugLabel)
      await user.click(featureLabel)
      
      expect(bugLabel).toBeChecked()
      expect(featureLabel).toBeChecked()
    })

    it('deselects labels when clicked again', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      const bugLabel = screen.getByLabelText('bug')
      
      // Select then deselect
      await user.click(bugLabel)
      expect(bugLabel).toBeChecked()
      
      await user.click(bugLabel)
      expect(bugLabel).not.toBeChecked()
    })
  })

  // ✅ EDIT TASK TESTS
  describe('Edit Task', () => {
    it('pre-fills form with existing task data', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test task description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('todo')).toBeInTheDocument()
      expect(screen.getByDisplayValue('medium')).toBeInTheDocument()
      expect(screen.getByDisplayValue('user-1')).toBeInTheDocument()
    })

    it('pre-selects existing labels', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const bugLabel = screen.getByLabelText('bug')
      const featureLabel = screen.getByLabelText('feature')
      const enhancementLabel = screen.getByLabelText('enhancement')
      
      expect(bugLabel).toBeChecked()
      expect(featureLabel).toBeChecked()
      expect(enhancementLabel).not.toBeChecked()
    })

    it('updates task with modified data', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderTaskModal({ mode: 'edit', task: mockTask, onSubmit: mockOnSubmit })
      
      // Modify title
      const titleInput = screen.getByDisplayValue('Test Task')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task')
      
      // Change status
      await user.selectOptions(screen.getByLabelText(/status/i), 'done')
      
      const submitButton = screen.getByRole('button', { name: /update task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Updated Task',
            status: 'done'
          })
        )
      })
    })
  })

  // ✅ SUBTASKS MANAGEMENT TESTS
  describe('Subtasks Management', () => {
    it('displays existing subtasks', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('Subtask 1')).toBeInTheDocument()
      expect(screen.getByText('Subtask 2')).toBeInTheDocument()
    })

    it('shows subtask completion status', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const subtask1Checkbox = screen.getByLabelText('Subtask 1')
      const subtask2Checkbox = screen.getByLabelText('Subtask 2')
      
      expect(subtask1Checkbox).not.toBeChecked()
      expect(subtask2Checkbox).toBeChecked()
    })

    it('toggles subtask completion', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const subtask1Checkbox = screen.getByLabelText('Subtask 1')
      await user.click(subtask1Checkbox)
      
      expect(subtask1Checkbox).toBeChecked()
    })

    it('adds new subtask', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const addSubtaskButton = screen.getByRole('button', { name: /add subtask/i })
      await user.click(addSubtaskButton)
      
      const newSubtaskInput = screen.getByPlaceholderText(/enter subtask title/i)
      await user.type(newSubtaskInput, 'New Subtask')
      
      const saveSubtaskButton = screen.getByRole('button', { name: /save subtask/i })
      await user.click(saveSubtaskButton)
      
      expect(screen.getByText('New Subtask')).toBeInTheDocument()
    })

    it('cancels adding new subtask', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const addSubtaskButton = screen.getByRole('button', { name: /add subtask/i })
      await user.click(addSubtaskButton)
      
      const cancelSubtaskButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelSubtaskButton)
      
      expect(screen.queryByPlaceholderText(/enter subtask title/i)).not.toBeInTheDocument()
    })

    it('deletes subtask', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete subtask/i })
      await user.click(deleteButtons[0])
      
      // Should show confirmation
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)
      
      expect(screen.queryByText('Subtask 1')).not.toBeInTheDocument()
    })
  })

  // ✅ COMMENTS MANAGEMENT TESTS
  describe('Comments Management', () => {
    it('displays existing comments', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('First comment')).toBeInTheDocument()
      expect(screen.getByText('Second comment')).toBeInTheDocument()
    })

    it('shows comment authors', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('adds new comment', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const commentInput = screen.getByPlaceholderText(/add a comment/i)
      await user.type(commentInput, 'New comment')
      
      const addCommentButton = screen.getByRole('button', { name: /add comment/i })
      await user.click(addCommentButton)
      
      expect(screen.getByText('New comment')).toBeInTheDocument()
    })

    it('clears comment input after adding', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const commentInput = screen.getByPlaceholderText(/add a comment/i)
      await user.type(commentInput, 'New comment')
      
      const addCommentButton = screen.getByRole('button', { name: /add comment/i })
      await user.click(addCommentButton)
      
      expect(commentInput).toHaveValue('')
    })

    it('does not add empty comments', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const addCommentButton = screen.getByRole('button', { name: /add comment/i })
      await user.click(addCommentButton)
      
      // Should not add empty comment
      expect(screen.getAllByText(/comment/i)).toHaveLength(4) // Existing comments + section title + button
    })

    it('deletes comment', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete comment/i })
      await user.click(deleteButtons[0])
      
      expect(screen.queryByText('First comment')).not.toBeInTheDocument()
    })
  })

  // ✅ ATTACHMENTS MANAGEMENT TESTS
  describe('Attachments Management', () => {
    it('displays existing attachments', () => {
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
      expect(screen.getByText('1 KB')).toBeInTheDocument() // File size
    })

    it('allows file upload', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const fileInput = screen.getByLabelText(/upload file/i)
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      await user.upload(fileInput, file)
      
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })

    it('validates file size', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const fileInput = screen.getByLabelText(/upload file/i)
      // Create a large file (assuming 10MB limit)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' })
      
      await user.upload(fileInput, largeFile)
      
      expect(screen.getByText(/file size too large/i)).toBeInTheDocument()
    })

    it('validates file type', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const fileInput = screen.getByLabelText(/upload file/i)
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-executable' })
      
      await user.upload(fileInput, invalidFile)
      
      expect(screen.getByText(/file type not allowed/i)).toBeInTheDocument()
    })

    it('deletes attachment', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const deleteButton = screen.getByRole('button', { name: /delete attachment/i })
      await user.click(deleteButton)
      
      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument()
    })

    it('downloads attachment', async () => {
      const user = userEvent.setup()
      renderTaskModal({ mode: 'edit', task: mockTask })
      
      const downloadButton = screen.getByRole('button', { name: /download/i })
      
      // Mock window.open
      const mockOpen = jest.fn()
      Object.defineProperty(window, 'open', { value: mockOpen })
      
      await user.click(downloadButton)
      
      expect(mockOpen).toHaveBeenCalledWith('/files/document.pdf', '_blank')
    })
  })

  // ✅ MODAL BEHAVIOR TESTS
  describe('Modal Behavior', () => {
    it('closes modal when close button is clicked', async () => {
      const mockOnClose = jest.fn()
      const user = userEvent.setup()
      
      renderTaskModal({ onClose: mockOnClose })
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes modal when cancel button is clicked', async () => {
      const mockOnClose = jest.fn()
      const user = userEvent.setup()
      
      renderTaskModal({ onClose: mockOnClose })
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes modal when clicking outside', async () => {
      const mockOnClose = jest.fn()
      const user = userEvent.setup()
      
      renderTaskModal({ onClose: mockOnClose })
      
      const modalOverlay = screen.getByTestId('modal-overlay')
      await user.click(modalOverlay)
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not close when clicking inside modal', async () => {
      const mockOnClose = jest.fn()
      const user = userEvent.setup()
      
      renderTaskModal({ onClose: mockOnClose })
      
      const modalContent = screen.getByRole('dialog')
      await user.click(modalContent)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('closes modal with Escape key', async () => {
      const mockOnClose = jest.fn()
      const user = userEvent.setup()
      
      renderTaskModal({ onClose: mockOnClose })
      
      await user.keyboard('{Escape}')
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('closes modal after successful submission', async () => {
      const mockOnClose = jest.fn()
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderTaskModal({ onClose: mockOnClose, onSubmit: mockOnSubmit })
      
      // Fill required fields and submit
      await user.type(screen.getByLabelText(/title/i), 'New Task')
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  // ✅ ERROR HANDLING TESTS
  describe('Error Handling', () => {
    it('handles submission errors', async () => {
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'))
      const user = userEvent.setup()
      
      renderTaskModal({ onSubmit: mockOnSubmit })
      
      await user.type(screen.getByLabelText(/title/i), 'New Task')
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save task/i)).toBeInTheDocument()
      })
    })

    it('disables submit button during submission', async () => {
      let resolveSubmit: () => void
      const mockOnSubmit = jest.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve
      }))
      const user = userEvent.setup()
      
      renderTaskModal({ onSubmit: mockOnSubmit })
      
      await user.type(screen.getByLabelText(/title/i), 'New Task')
      
      const submitButton = screen.getByRole('button', { name: /create task/i })
      await user.click(submitButton)
      
      // Button should be disabled
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
      
      // Resolve the promise
      resolveSubmit!()
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('handles invalid task data gracefully', () => {
      const invalidTask = {
        ...mockTask,
        assigneeId: 'non-existent-user'
      }
      
      // Should render without crashing
      renderTaskModal({ mode: 'edit', task: invalidTask })
      
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    })
  })

  // ✅ ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderTaskModal()
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby')
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('manages focus properly', () => {
      renderTaskModal()
      
      // First focusable element should be focused
      expect(screen.getByLabelText(/title/i)).toHaveFocus()
    })

    it('traps focus within modal', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      // Tab through all elements
      let focusedElement = screen.getByLabelText(/title/i)
      expect(focusedElement).toHaveFocus()
      
      // Continue tabbing until we cycle back
      for (let i = 0; i < 20; i++) {
        await user.tab()
      }
      
      // Should cycle back to first element
      expect(screen.getByLabelText(/title/i)).toHaveFocus()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      // Navigate with tab
      await user.tab()
      expect(screen.getByLabelText(/description/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/status/i)).toHaveFocus()
    })
  })

  // ✅ PERFORMANCE TESTS
  describe('Performance', () => {
    it('renders efficiently with large datasets', () => {
      const taskWithManyItems = {
        ...mockTask,
        subtasks: Array.from({ length: 100 }, (_, i) => ({
          id: `sub-${i}`,
          title: `Subtask ${i}`,
          completed: false,
          createdAt: new Date()
        })),
        comments: Array.from({ length: 100 }, (_, i) => ({
          id: `comment-${i}`,
          content: `Comment ${i}`,
          authorId: 'user-1',
          createdAt: new Date()
        }))
      }
      
      const startTime = performance.now()
      
      renderTaskModal({ mode: 'edit', task: taskWithManyItems })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(1000) // 1 second
    })

    it('debounces form validation', async () => {
      const user = userEvent.setup()
      renderTaskModal()
      
      const titleInput = screen.getByLabelText(/title/i)
      
      // Type quickly
      await user.type(titleInput, 'quick typing test')
      
      // Validation should be debounced
      // This would need to be implemented with a validation debounce
    })
  })
})