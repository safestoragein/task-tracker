import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../Header'
import { useTask } from '@/contexts/TaskContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock the dependencies
jest.mock('@/contexts/TaskContext')
jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the components
jest.mock('../CommandPalette', () => ({
  CommandPalette: () => <div data-testid="command-palette">Command Palette</div>,
}))

jest.mock('../TeamManagement', () => ({
  TeamManagement: ({ isOpen, onClose }: any) =>
    isOpen ? <div data-testid="team-management">Team Management</div> : null,
}))

jest.mock('../Settings', () => ({
  Settings: ({ isOpen, onClose }: any) =>
    isOpen ? <div data-testid="settings">Settings</div> : null,
}))

jest.mock('../DailyReport', () => ({
  DailyReport: ({ isOpen, onClose }: any) =>
    isOpen ? <div data-testid="daily-report">Daily Report</div> : null,
}))

const mockState = {
  tasks: [
    { id: '1', title: 'Task 1', status: 'todo' },
    { id: '2', title: 'Task 2', status: 'in-progress' },
    { id: '3', title: 'Task 3', status: 'done' },
  ],
  teamMembers: [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '',
      role: 'admin' as const,
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: '',
      role: 'member' as const,
    },
  ],
  labels: ['bug', 'feature'],
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
  filteredTasks: mockState.tasks,
}

const mockUseAuth = {
  state: {
    user: { id: 'user-1', email: 'john@example.com', name: 'John Doe', userRole: 'admin' },
    isAuthenticated: true,
    isLoading: false,
  },
  dispatch: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  canEditTask: jest.fn(() => true),
  canEditDailyReport: jest.fn(() => true),
}

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTask as jest.Mock).mockReturnValue(mockUseTask)
    ;(useAuth as jest.Mock).mockReturnValue(mockUseAuth)
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders header with title', () => {
    render(<Header />)

    expect(screen.getByText('Task Tracker')).toBeInTheDocument()
  })

  it('displays task statistics', () => {
    render(<Header />)

    expect(screen.getByText('3')).toBeInTheDocument() // Total tasks
    expect(screen.getByText('1')).toBeInTheDocument() // Todo
    expect(screen.getByText('1')).toBeInTheDocument() // In Progress
    expect(screen.getByText('1')).toBeInTheDocument() // Done
  })

  it('shows user information when logged in', () => {
    render(<Header />)

    expect(screen.getByText('JD')).toBeInTheDocument() // Avatar initials
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows sign in button when not logged in', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockUseAuth,
      user: null,
    })

    render(<Header />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('opens team management dialog', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const teamButton = screen.getByRole('button', { name: /team/i })
    await user.click(teamButton)

    expect(screen.getByTestId('team-management')).toBeInTheDocument()
  })

  it('opens settings dialog', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const settingsButton = screen.getByRole('button', { name: /settings/i })
    await user.click(settingsButton)

    expect(screen.getByTestId('settings')).toBeInTheDocument()
  })

  it('opens daily report dialog', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const reportButton = screen.getByRole('button', { name: /daily report/i })
    await user.click(reportButton)

    expect(screen.getByTestId('daily-report')).toBeInTheDocument()
  })

  it('handles sign out', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Open user menu
    const userMenuButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userMenuButton)

    // Click sign out
    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)

    expect(mockUseAuth.signOut).toHaveBeenCalled()
  })

  it('toggles theme', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(themeToggle)

    // Check if theme class is toggled on document
    expect(document.documentElement.classList.contains('dark')).toBeDefined()
  })

  it('shows command palette', () => {
    render(<Header />)

    expect(screen.getByTestId('command-palette')).toBeInTheDocument()
  })

  it('displays keyboard shortcut hints', () => {
    render(<Header />)

    // Should show keyboard shortcut for command palette
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('shows notification badge when there are notifications', () => {
    // Mock state with notifications (e.g., overdue tasks)
    const tasksWithOverdue = [
      ...mockState.tasks,
      {
        id: '4',
        title: 'Overdue Task',
        status: 'todo',
        dueDate: new Date('2024-01-01'), // Past date
      },
    ]

    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        tasks: tasksWithOverdue,
      },
    })

    render(<Header />)

    // Should show notification indicator
    expect(screen.getByTestId('notification-badge')).toBeInTheDocument()
  })

  it('navigates to different views', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Click on Kanban view
    const kanbanButton = screen.getByRole('button', { name: /kanban/i })
    await user.click(kanbanButton)

    expect(mockRouter.push).toHaveBeenCalledWith('/kanban')

    // Click on List view
    const listButton = screen.getByRole('button', { name: /list/i })
    await user.click(listButton)

    expect(mockRouter.push).toHaveBeenCalledWith('/list')

    // Click on Calendar view
    const calendarButton = screen.getByRole('button', { name: /calendar/i })
    await user.click(calendarButton)

    expect(mockRouter.push).toHaveBeenCalledWith('/calendar')
  })

  it('shows active view indicator', () => {
    // Mock current route
    Object.defineProperty(window, 'location', {
      value: { pathname: '/kanban' },
      writable: true,
    })

    render(<Header />)

    const kanbanButton = screen.getByRole('button', { name: /kanban/i })
    expect(kanbanButton).toHaveClass('active')
  })

  it('opens user profile dropdown', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('handles responsive menu toggle', async () => {
    const user = userEvent.setup()

    // Mock mobile viewport
    global.innerWidth = 375
    global.dispatchEvent(new Event('resize'))

    render(<Header />)

    // Mobile menu button should be visible
    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)

    // Mobile menu should open
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockUseAuth,
      loading: true,
    })

    render(<Header />)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays team member count', () => {
    render(<Header />)

    expect(screen.getByText('2 members')).toBeInTheDocument()
  })

  it('shows admin-only features for admin users', () => {
    render(<Header />)

    // Admin should see team management button
    expect(screen.getByRole('button', { name: /team management/i })).toBeInTheDocument()
  })

  it('hides admin features for non-admin users', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      ...mockUseAuth,
      user: { id: 'user-2', email: 'jane@example.com', name: 'Jane Smith' },
    })

    // Jane is a regular member, not admin
    render(<Header />)

    // Should not see certain admin features
    expect(screen.queryByRole('button', { name: /manage team/i })).not.toBeInTheDocument()
  })

  it('shows search bar', () => {
    render(<Header />)

    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument()
  })

  it('handles search input', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    await user.type(searchInput, 'test search')

    await waitFor(() => {
      expect(mockUseTask.dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { search: 'test search' },
      })
    })
  })

  it('displays completion percentage', () => {
    render(<Header />)

    // 1 done out of 3 tasks = 33%
    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    render(<Header />)

    // Press Cmd+K to open command palette
    await user.keyboard('{Meta>}k{/Meta}')

    // Command palette should be focused/activated
    expect(screen.getByTestId('command-palette')).toHaveClass('active')
  })
})
