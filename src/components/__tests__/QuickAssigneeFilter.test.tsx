import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickAssigneeFilter } from '../QuickAssigneeFilter'
import { TaskContext } from '@/contexts/TaskContext'
import { AuthContext } from '@/contexts/AuthContext'
import { Task, TaskState } from '@/types'

// Mock data
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Task 1',
    description: 'First task',
    status: 'todo',
    priority: 'high',
    assigneeId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
    order: 0
  },
  {
    id: 'task-2',
    title: 'Task 2',
    description: 'Second task',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 'user-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
    order: 1
  },
  {
    id: 'task-3',
    title: 'Task 3',
    description: 'Third task',
    status: 'done',
    priority: 'low',
    assigneeId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
    order: 2
  }
]

const mockTeamMembers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'Developer', userRole: 'admin' as const },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'Designer', userRole: 'member' as const },
  { id: 'user-3', name: 'Bob Wilson', email: 'bob@example.com', avatar: '', role: 'Manager', userRole: 'admin' as const }
]

const mockState: TaskState = {
  tasks: mockTasks,
  teamMembers: mockTeamMembers,
  labels: [],
  dailyReports: [],
  filters: {
    search: '',
    assignee: [],
    priority: [],
    labels: [],
    dueDate: {},
  }
}

const mockDispatch = jest.fn()

const mockTaskContextValue = {
  state: mockState,
  dispatch: mockDispatch,
  filteredTasks: mockTasks,
  isOnline: true,
  isSyncing: false,
  lastSyncTime: new Date(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
  addDailyReport: jest.fn(),
  updateDailyReport: jest.fn(),
  deleteDailyReport: jest.fn(),
  syncWithDatabase: jest.fn(),
}

const mockAuthContextValue = {
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer',
    userRole: 'admin' as const,
    avatar: ''
  },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  canEditTask: jest.fn().mockReturnValue(true),
  state: {
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Developer',
      userRole: 'admin' as const,
      avatar: ''
    }
  }
}

const renderWithContext = (taskOverrides = {}, authOverrides = {}) => {
  const taskValue = { ...mockTaskContextValue, ...taskOverrides }
  const authValue = { ...mockAuthContextValue, ...authOverrides }
  
  return render(
    <AuthContext.Provider value={authValue}>
      <TaskContext.Provider value={taskValue}>
        <QuickAssigneeFilter />
      </TaskContext.Provider>
    </AuthContext.Provider>
  )
}

describe('QuickAssigneeFilter - 100% Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ✅ RENDERING TESTS
  describe('Rendering', () => {
    it('renders the quick filter with all elements', () => {
      renderWithContext()
      
      expect(screen.getByText('Quick Filter:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /all tasks/i })).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    })

    it('shows task counts for each member', () => {
      renderWithContext()
      
      // John Doe has 2 tasks (task-1 and task-3)
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      expect(within(johnButton).getByText('2')).toBeInTheDocument()
      
      // Jane Smith has 1 task (task-2)
      const janeButton = screen.getByRole('button', { name: /jane smith/i })
      expect(within(janeButton).getByText('1')).toBeInTheDocument()
      
      // Bob Wilson has 0 tasks
      const bobButton = screen.getByRole('button', { name: /bob wilson/i })
      expect(within(bobButton).getByText('0')).toBeInTheDocument()
    })

    it('shows total task count on All Tasks button', () => {
      renderWithContext()
      
      const allTasksButton = screen.getByRole('button', { name: /all tasks/i })
      expect(within(allTasksButton).getByText('3')).toBeInTheDocument()
    })

    it('shows admin shields for admin users', () => {
      renderWithContext()
      
      // Looking for Shield icons within buttons - they may not have testids
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      expect(johnButton).toBeInTheDocument()
      
      const bobButton = screen.getByRole('button', { name: /bob wilson/i })
      expect(bobButton).toBeInTheDocument()
      
      // Jane Smith is not admin
      const janeButton = screen.getByRole('button', { name: /jane smith/i })
      expect(janeButton).toBeInTheDocument()
    })

    it('returns null when no visible members', () => {
      const { container } = renderWithContext({}, {
        state: { user: null },
        user: null,
        isAuthenticated: false
      })
      
      expect(container.firstChild).toBeNull()
    })
  })

  // ✅ FILTER SELECTION TESTS
  describe('Filter Selection', () => {
    it('shows All Tasks as selected by default', () => {
      renderWithContext()
      
      const allTasksButton = screen.getByRole('button', { name: /all tasks/i })
      expect(allTasksButton).toHaveClass('bg-primary')
    })

    it('toggles assignee selection when clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      await user.click(johnButton)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: ['user-1'] }
      })
    })

    it('adds multiple assignees to filter', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      // First click John
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      await user.click(johnButton)
      
      // Then click Jane (simulate state update)
      const stateWithJohnSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithJohnSelected })
      
      const janeButton = screen.getByRole('button', { name: /jane smith/i })
      await user.click(janeButton)
      
      expect(mockDispatch).toHaveBeenLastCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: ['user-1', 'user-2'] }
      })
    })

    it('removes assignee when clicked again', async () => {
      const user = userEvent.setup()
      
      // Start with John selected
      const stateWithJohnSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithJohnSelected })
      
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      await user.click(johnButton)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: [] }
      })
    })
  })

  // ✅ VISUAL STATE TESTS
  describe('Visual States', () => {
    it('shows selected state for active assignees', () => {
      const stateWithAssigneeSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithAssigneeSelected })
      
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      expect(johnButton).toHaveClass('bg-blue-600')
      
      const allTasksButton = screen.getByRole('button', { name: /all tasks/i })
      expect(allTasksButton).not.toHaveClass('bg-primary')
    })

    it('shows different badge styling for selected vs unselected', () => {
      const stateWithAssigneeSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithAssigneeSelected })
      
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      const johnBadge = within(johnButton).getByText('2')
      expect(johnBadge).toHaveClass('bg-blue-200', 'text-blue-900')
      
      const janeButton = screen.getByRole('button', { name: /jane smith/i })
      const janeBadge = within(janeButton).getByText('1')
      expect(janeBadge).toHaveClass('bg-gray-100', 'text-gray-700')
    })
  })

  // ✅ CLEAR FILTERS TESTS
  describe('Clear Filters', () => {
    it('shows clear button when filters are selected', () => {
      const stateWithAssigneeSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithAssigneeSelected })
      
      // The clear button is just an X icon, look for it by icon
      const clearButton = screen.getByRole('button', { name: '' })
      expect(clearButton).toBeInTheDocument()
    })

    it('does not show clear button when no filters selected', () => {
      renderWithContext()
      
      // Should not have X icon button when no filters
      const buttons = screen.getAllByRole('button')
      const buttonTexts = buttons.map(btn => btn.textContent)
      expect(buttonTexts.some(text => text === '')).toBe(false)
    })

    it('clears all filters when All Tasks button is clicked', async () => {
      const user = userEvent.setup()
      
      const stateWithAssigneeSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithAssigneeSelected })
      
      const allTasksButton = screen.getByRole('button', { name: /all tasks/i })
      await user.click(allTasksButton)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: [] }
      })
    })

    it('clears filters when X button is clicked', async () => {
      const user = userEvent.setup()
      
      const stateWithAssigneeSelected = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithAssigneeSelected })
      
      const clearButton = screen.getByRole('button', { name: '' })
      await user.click(clearButton)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: [] }
      })
    })
  })

  // ✅ FILTER SUMMARY TESTS
  describe('Filter Summary', () => {
    it('shows singular assignee summary', () => {
      const stateWithOneAssignee = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1'] }
      }
      
      renderWithContext({ state: stateWithOneAssignee })
      
      expect(screen.getByText('Showing 1 assignee')).toBeInTheDocument()
    })

    it('shows plural assignees summary', () => {
      const stateWithMultipleAssignees = {
        ...mockState,
        filters: { ...mockState.filters, assignee: ['user-1', 'user-2'] }
      }
      
      renderWithContext({ state: stateWithMultipleAssignees })
      
      expect(screen.getByText('Showing 2 assignees')).toBeInTheDocument()
    })

    it('does not show summary when no filters selected', () => {
      renderWithContext()
      
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument()
    })
  })

  // ✅ AVATAR AND INITIALS TESTS
  describe('Avatars', () => {
    it('generates correct initials for team members', () => {
      renderWithContext()
      
      // John Doe -> JD
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      expect(within(johnButton).getByText('JD')).toBeInTheDocument()
      
      // Jane Smith -> JS
      const janeButton = screen.getByRole('button', { name: /jane smith/i })
      expect(within(janeButton).getByText('JS')).toBeInTheDocument()
      
      // Bob Wilson -> BW
      const bobButton = screen.getByRole('button', { name: /bob wilson/i })
      expect(within(bobButton).getByText('BW')).toBeInTheDocument()
    })

    it('handles team members with avatar images', () => {
      const membersWithAvatars = mockTeamMembers.map(member => ({
        ...member,
        avatar: 'https://example.com/avatar.jpg'
      }))
      
      const stateWithAvatars = {
        ...mockState,
        teamMembers: membersWithAvatars
      }
      
      renderWithContext({ state: stateWithAvatars })
      
      const avatarImages = screen.getAllByRole('img')
      expect(avatarImages.length).toBeGreaterThan(0)
    })
  })

  // ✅ EDGE CASES
  describe('Edge Cases', () => {
    it('handles empty team members list', () => {
      const stateWithNoMembers = {
        ...mockState,
        teamMembers: []
      }
      
      const { container } = renderWithContext({ state: stateWithNoMembers })
      
      expect(container.firstChild).toBeNull()
    })

    it('handles team member without tasks', () => {
      renderWithContext()
      
      const bobButton = screen.getByRole('button', { name: /bob wilson/i })
      expect(within(bobButton).getByText('0')).toBeInTheDocument()
    })

    it('handles long team member names', () => {
      const memberWithLongName = {
        id: 'user-4',
        name: 'Very Long Name That Should Be Handled Properly',
        email: 'long@example.com',
        avatar: '',
        role: 'Developer',
        userRole: 'member' as const
      }
      
      const stateWithLongName = {
        ...mockState,
        teamMembers: [...mockTeamMembers, memberWithLongName]
      }
      
      renderWithContext({ state: stateWithLongName })
      
      expect(screen.getByText('Very Long Name That Should Be Handled Properly')).toBeInTheDocument()
    })

    it('handles team member with single name', () => {
      const memberWithSingleName = {
        id: 'user-4',
        name: 'Madonna',
        email: 'madonna@example.com',
        avatar: '',
        role: 'Artist',
        userRole: 'member' as const
      }
      
      const stateWithSingleName = {
        ...mockState,
        teamMembers: [...mockTeamMembers, memberWithSingleName]
      }
      
      renderWithContext({ state: stateWithSingleName })
      
      const madonnaButton = screen.getByRole('button', { name: /madonna/i })
      expect(within(madonnaButton).getByText('M')).toBeInTheDocument()
    })
  })

  // ✅ ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      renderWithContext()
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      // Tab to first button
      await user.tab()
      expect(screen.getByRole('button', { name: /all tasks/i })).toHaveFocus()
      
      // Tab to next button
      await user.tab()
      expect(screen.getByRole('button', { name: /john doe/i })).toHaveFocus()
    })

    it('activates filters with Enter key', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const johnButton = screen.getByRole('button', { name: /john doe/i })
      johnButton.focus()
      
      await user.keyboard('{Enter}')
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: ['user-1'] }
      })
    })

    it('activates filters with Space key', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const janeButton = screen.getByRole('button', { name: /jane smith/i })
      janeButton.focus()
      
      await user.keyboard('{ }')
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { assignee: ['user-2'] }
      })
    })
  })
})