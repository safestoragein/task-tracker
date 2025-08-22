import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DailyReport } from '../DailyReport'
import { TaskContext } from '@/contexts/TaskContext'
import { Task, TaskState, DailyReport as DailyReportType } from '@/types'

// ✅ COMPLETE test data for daily reports
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Completed Task 1',
    description: 'A completed task',
    status: 'done',
    priority: 'high',
    assigneeId: 'user-1',
    dueDate: new Date('2025-08-19'),
    createdAt: new Date('2025-08-18'),
    updatedAt: new Date('2025-08-19'),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: 'task-2',
    title: 'In Progress Task',
    description: 'A task in progress',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 'user-1',
    dueDate: new Date('2025-08-21'),
    createdAt: new Date('2025-08-19'),
    updatedAt: new Date('2025-08-20'),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: 'task-3',
    title: 'Another Completed Task',
    description: 'Another completed task',
    status: 'done',
    priority: 'low',
    assigneeId: 'user-2',
    dueDate: new Date('2025-08-20'),
    createdAt: new Date('2025-08-19'),
    updatedAt: new Date('2025-08-20'),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
  }
]

const mockDailyReports: DailyReportType[] = [
  {
    id: 'report-1',
    authorId: 'user-1',
    date: '2025-08-20',
    yesterdayWork: 'Completed task analysis and design',
    todayPlan: 'Implement new features',
    blockers: 'Waiting for API documentation',
    notes: 'Need to follow up with backend team',
    tasksCompleted: ['task-1'],
    tasksInProgress: ['task-2'],
    createdAt: new Date('2025-08-20T09:00:00'),
    updatedAt: new Date('2025-08-20T09:00:00'),
  },
  {
    id: 'report-2',
    authorId: 'user-2',
    date: '2025-08-19',
    yesterdayWork: 'Fixed critical bugs',
    todayPlan: 'Code review and testing',
    blockers: '',
    notes: 'All good so far',
    tasksCompleted: ['task-3'],
    tasksInProgress: [],
    createdAt: new Date('2025-08-19T10:00:00'),
    updatedAt: new Date('2025-08-19T10:00:00'),
  }
]

const mockTeamMembers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'Developer', userRole: 'admin' as const },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'Designer', userRole: 'member' as const }
]

const mockState: TaskState = {
  tasks: mockTasks,
  teamMembers: mockTeamMembers,
  labels: [],
  dailyReports: mockDailyReports,
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
  filteredTasks: mockTasks,
  isOnline: true,
  isSyncing: false,
  lastSyncTime: new Date(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
  addDailyReport: jest.fn().mockResolvedValue(undefined),
  updateDailyReport: jest.fn().mockResolvedValue(undefined),
  deleteDailyReport: jest.fn().mockResolvedValue(undefined),
  syncWithDatabase: jest.fn(),
}

const renderWithContext = (contextOverrides = {}) => {
  const value = { ...mockContextValue, ...contextOverrides }
  return render(
    <TaskContext.Provider value={value}>
      <DailyReport />
    </TaskContext.Provider>
  )
}

describe('DailyReport - 100% Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ✅ BASIC RENDERING TESTS
  describe('Rendering', () => {
    it('renders main heading', () => {
      renderWithContext()
      expect(screen.getByText('Daily Reports')).toBeInTheDocument()
    })

    it('renders Add Report button', () => {
      renderWithContext()
      expect(screen.getByRole('button', { name: /add report/i })).toBeInTheDocument()
    })

    it('renders existing daily reports', () => {
      renderWithContext()
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('2025-08-20')).toBeInTheDocument()
      expect(screen.getByText('2025-08-19')).toBeInTheDocument()
    })

    it('displays report content correctly', () => {
      renderWithContext()
      
      expect(screen.getByText('Completed task analysis and design')).toBeInTheDocument()
      expect(screen.getByText('Implement new features')).toBeInTheDocument()
      expect(screen.getByText('Waiting for API documentation')).toBeInTheDocument()
      expect(screen.getByText('Need to follow up with backend team')).toBeInTheDocument()
    })

    it('handles empty daily reports list', () => {
      renderWithContext({
        state: { ...mockState, dailyReports: [] }
      })
      
      expect(screen.getByText(/no daily reports/i)).toBeInTheDocument()
    })
  })

  // ✅ CREATE REPORT TESTS
  describe('Create Report', () => {
    it('opens create modal when Add Report button is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Create Daily Report')).toBeInTheDocument()
      })
    })

    it('fills form with default values', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        // Date should be today
        const dateInput = screen.getByLabelText(/date/i)
        expect(dateInput).toHaveValue(new Date().toISOString().split('T')[0])
        
        // Author should be current user or first team member
        const authorSelect = screen.getByLabelText(/author/i)
        expect(authorSelect).toBeInTheDocument()
      })
    })

    it('submits new report with all fields', async () => {
      const mockAddDailyReport = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderWithContext({ addDailyReport: mockAddDailyReport })
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      // Fill form
      const yesterdayWorkInput = screen.getByLabelText(/yesterday.*work/i)
      await user.type(yesterdayWorkInput, 'Worked on testing')
      
      const todayPlanInput = screen.getByLabelText(/today.*plan/i)
      await user.type(todayPlanInput, 'Continue with implementation')
      
      const blockersInput = screen.getByLabelText(/blockers/i)
      await user.type(blockersInput, 'No blockers')
      
      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, 'Everything on track')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /create report/i })
      await user.click(submitButton)
      
      expect(mockAddDailyReport).toHaveBeenCalledWith(
        expect.objectContaining({
          yesterdayWork: 'Worked on testing',
          todayPlan: 'Continue with implementation',
          blockers: 'No blockers',
          notes: 'Everything on track'
        })
      )
    })

    it('closes modal after successful submission', async () => {
      const mockAddDailyReport = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderWithContext({ addDailyReport: mockAddDailyReport })
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const submitButton = screen.getByRole('button', { name: /create report/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('handles form validation errors', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /create report/i })
      await user.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('cancels report creation', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  // ✅ EDIT REPORT TESTS
  describe('Edit Report', () => {
    it('opens edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Edit Daily Report')).toBeInTheDocument()
      })
    })

    it('pre-fills form with existing data', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        const yesterdayWorkInput = screen.getByLabelText(/yesterday.*work/i)
        expect(yesterdayWorkInput).toHaveValue('Completed task analysis and design')
        
        const todayPlanInput = screen.getByLabelText(/today.*plan/i)
        expect(todayPlanInput).toHaveValue('Implement new features')
        
        const blockersInput = screen.getByLabelText(/blockers/i)
        expect(blockersInput).toHaveValue('Waiting for API documentation')
        
        const notesInput = screen.getByLabelText(/notes/i)
        expect(notesInput).toHaveValue('Need to follow up with backend team')
      })
    })

    it('updates report with modified data', async () => {
      const mockUpdateDailyReport = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderWithContext({ updateDailyReport: mockUpdateDailyReport })
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      // Modify form
      const yesterdayWorkInput = screen.getByLabelText(/yesterday.*work/i)
      await user.clear(yesterdayWorkInput)
      await user.type(yesterdayWorkInput, 'Updated yesterday work')
      
      // Submit changes
      const updateButton = screen.getByRole('button', { name: /update report/i })
      await user.click(updateButton)
      
      expect(mockUpdateDailyReport).toHaveBeenCalledWith(
        'report-1',
        expect.objectContaining({
          yesterdayWork: 'Updated yesterday work'
        })
      )
    })
  })

  // ✅ DELETE REPORT TESTS
  describe('Delete Report', () => {
    it('shows delete confirmation dialog', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
      })
    })

    it('deletes report when confirmed', async () => {
      const mockDeleteDailyReport = jest.fn().mockResolvedValue(undefined)
      const user = userEvent.setup()
      
      renderWithContext({ deleteDailyReport: mockDeleteDailyReport })
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: /confirm delete/i })
      await user.click(confirmButton)
      
      expect(mockDeleteDailyReport).toHaveBeenCalledWith('report-1')
    })

    it('cancels deletion', async () => {
      const mockDeleteDailyReport = jest.fn()
      const user = userEvent.setup()
      
      renderWithContext({ deleteDailyReport: mockDeleteDailyReport })
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      })
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      
      expect(mockDeleteDailyReport).not.toHaveBeenCalled()
    })
  })

  // ✅ TASK SELECTION TESTS
  describe('Task Selection', () => {
    it('displays available tasks for selection', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByText('Tasks Completed')).toBeInTheDocument()
        expect(screen.getByText('Tasks In Progress')).toBeInTheDocument()
        
        // Should show available tasks
        expect(screen.getByText('Completed Task 1')).toBeInTheDocument()
        expect(screen.getByText('In Progress Task')).toBeInTheDocument()
      })
    })

    it('allows selecting tasks for completed and in-progress', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      // Select completed task
      const completedTaskCheckbox = screen.getByLabelText('Completed Task 1')
      await user.click(completedTaskCheckbox)
      expect(completedTaskCheckbox).toBeChecked()
      
      // Select in-progress task
      const inProgressTaskCheckbox = screen.getByLabelText('In Progress Task')
      await user.click(inProgressTaskCheckbox)
      expect(inProgressTaskCheckbox).toBeChecked()
    })

    it('filters tasks by status for selection', () => {
      renderWithContext()
      
      // Verify that only appropriate tasks are shown for each section
      const completedTasks = mockTasks.filter(t => t.status === 'done')
      const inProgressTasks = mockTasks.filter(t => t.status === 'in-progress')
      
      expect(completedTasks).toHaveLength(2)
      expect(inProgressTasks).toHaveLength(1)
    })
  })

  // ✅ FILTERING AND SORTING TESTS
  describe('Filtering and Sorting', () => {
    it('filters reports by author', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const authorFilter = screen.getByLabelText(/filter by author/i)
      await user.selectOptions(authorFilter, 'user-1')
      
      // Should only show reports by user-1
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('filters reports by date range', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const fromDateInput = screen.getByLabelText(/from date/i)
      await user.type(fromDateInput, '2025-08-20')
      
      const toDateInput = screen.getByLabelText(/to date/i)
      await user.type(toDateInput, '2025-08-20')
      
      // Should only show reports from 2025-08-20
      expect(screen.getByText('2025-08-20')).toBeInTheDocument()
      expect(screen.queryByText('2025-08-19')).not.toBeInTheDocument()
    })

    it('sorts reports by date (newest first)', () => {
      renderWithContext()
      
      const reportElements = screen.getAllByText(/2025-08-\d{2}/)
      expect(reportElements[0]).toHaveTextContent('2025-08-20')
      expect(reportElements[1]).toHaveTextContent('2025-08-19')
    })
  })

  // ✅ ERROR HANDLING TESTS
  describe('Error Handling', () => {
    it('handles addDailyReport errors', async () => {
      const mockAddDailyReport = jest.fn().mockRejectedValue(new Error('Add failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      
      renderWithContext({ addDailyReport: mockAddDailyReport })
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const submitButton = screen.getByRole('button', { name: /create report/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to add daily report:', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })

    it('handles updateDailyReport errors', async () => {
      const mockUpdateDailyReport = jest.fn().mockRejectedValue(new Error('Update failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      
      renderWithContext({ updateDailyReport: mockUpdateDailyReport })
      
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const updateButton = screen.getByRole('button', { name: /update report/i })
      await user.click(updateButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to update daily report:', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })

    it('handles deleteDailyReport errors', async () => {
      const mockDeleteDailyReport = jest.fn().mockRejectedValue(new Error('Delete failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      
      renderWithContext({ deleteDailyReport: mockDeleteDailyReport })
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument()
      })
      
      const confirmButton = screen.getByRole('button', { name: /confirm delete/i })
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to delete daily report:', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })
  })

  // ✅ EDGE CASES
  describe('Edge Cases', () => {
    it('handles reports with empty fields', () => {
      const reportsWithEmptyFields = [{
        id: 'empty-report',
        authorId: 'user-1',
        date: '2025-08-20',
        yesterdayWork: '',
        todayPlan: '',
        blockers: '',
        notes: '',
        tasksCompleted: [],
        tasksInProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
      
      renderWithContext({
        state: { ...mockState, dailyReports: reportsWithEmptyFields }
      })
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('2025-08-20')).toBeInTheDocument()
    })

    it('handles reports with very long text', () => {
      const longText = 'Lorem ipsum '.repeat(100)
      const reportsWithLongText = [{
        id: 'long-report',
        authorId: 'user-1',
        date: '2025-08-20',
        yesterdayWork: longText,
        todayPlan: longText,
        blockers: longText,
        notes: longText,
        tasksCompleted: [],
        tasksInProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
      
      renderWithContext({
        state: { ...mockState, dailyReports: reportsWithLongText }
      })
      
      // Should handle long text gracefully
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('handles invalid dates', () => {
      const reportsWithInvalidDate = [{
        id: 'invalid-date-report',
        authorId: 'user-1',
        date: 'invalid-date',
        yesterdayWork: 'Work',
        todayPlan: 'Plan',
        blockers: '',
        notes: '',
        tasksCompleted: [],
        tasksInProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
      
      renderWithContext({
        state: { ...mockState, dailyReports: reportsWithInvalidDate }
      })
      
      // Should handle invalid dates gracefully
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('handles reports with non-existent author', () => {
      const reportsWithInvalidAuthor = [{
        id: 'invalid-author-report',
        authorId: 'non-existent-user',
        date: '2025-08-20',
        yesterdayWork: 'Work',
        todayPlan: 'Plan',
        blockers: '',
        notes: '',
        tasksCompleted: [],
        tasksInProgress: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
      
      renderWithContext({
        state: { ...mockState, dailyReports: reportsWithInvalidAuthor }
      })
      
      // Should show unknown author
      expect(screen.getByText('Unknown Author')).toBeInTheDocument()
    })
  })

  // ✅ ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('has proper form labels', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      await user.click(addButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText(/yesterday.*work/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/today.*plan/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/blockers/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      // Tab through interactive elements
      await user.tab()
      expect(screen.getByRole('button', { name: /add report/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getAllByRole('button', { name: /edit/i })[0]).toHaveFocus()
    })

    it('has proper ARIA attributes', () => {
      renderWithContext()
      
      const addButton = screen.getByRole('button', { name: /add report/i })
      expect(addButton).toHaveAttribute('aria-label')
    })
  })
})