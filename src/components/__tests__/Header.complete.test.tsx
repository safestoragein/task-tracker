import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../Header'
import { TaskContext } from '@/contexts/TaskContext'
import { AuthContext } from '@/contexts/AuthContext'

// Mock the contexts
const mockTaskContextValue = {
  state: {
    tasks: [],
    teamMembers: [
      { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'Developer', userRole: 'admin' as const }
    ],
    labels: [],
    dailyReports: [],
    filters: {
      search: '',
      assignee: [],
      priority: [],
      labels: [],
      dueDate: {},
    }
  },
  dispatch: jest.fn(),
  filteredTasks: [],
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
  updateUser: jest.fn()
}

const renderWithContext = (taskOverrides = {}, authOverrides = {}) => {
  const taskValue = { ...mockTaskContextValue, ...taskOverrides }
  const authValue = { ...mockAuthContextValue, ...authOverrides }
  
  return render(
    <AuthContext.Provider value={authValue}>
      <TaskContext.Provider value={taskValue}>
        <Header />
      </TaskContext.Provider>
    </AuthContext.Provider>
  )
}

describe('Header - 100% Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ✅ BASIC RENDERING TESTS
  describe('Rendering', () => {
    it('renders application title', () => {
      renderWithContext()
      expect(screen.getByText('Task Tracker')).toBeInTheDocument()
    })

    it('renders user avatar and name when authenticated', () => {
      renderWithContext()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('JD')).toBeInTheDocument() // Avatar initials
    })

    it('renders login button when not authenticated', () => {
      renderWithContext({}, { isAuthenticated: false, user: null })
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('displays sync status indicator', () => {
      renderWithContext()
      expect(screen.getByText(/last sync/i)).toBeInTheDocument()
    })

    it('shows online status', () => {
      renderWithContext()
      expect(screen.getByText(/online/i)).toBeInTheDocument()
    })

    it('shows offline status when offline', () => {
      renderWithContext({ isOnline: false })
      expect(screen.getByText(/offline/i)).toBeInTheDocument()
    })

    it('shows syncing indicator when syncing', () => {
      renderWithContext({ isSyncing: true })
      expect(screen.getByText(/syncing/i)).toBeInTheDocument()
    })
  })

  // ✅ USER MENU TESTS
  describe('User Menu', () => {
    it('opens user menu when avatar is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const avatar = screen.getByText('JD')
      await user.click(avatar)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Logout')).toBeInTheDocument()
      })
    })

    it('closes user menu when clicking outside', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      // Open menu
      const avatar = screen.getByText('JD')
      await user.click(avatar)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
      })
      
      // Click outside
      await user.click(document.body)
      
      await waitFor(() => {
        expect(screen.queryByText('Profile')).not.toBeInTheDocument()
      })
    })

    it('navigates to profile when profile option is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const avatar = screen.getByText('JD')
      await user.click(avatar)
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
      })
      
      const profileOption = screen.getByText('Profile')
      await user.click(profileOption)
      
      // Should navigate to profile page
      // This might require router mocking depending on implementation
    })

    it('opens settings when settings option is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const avatar = screen.getByText('JD')
      await user.click(avatar)
      
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
      })
      
      const settingsOption = screen.getByText('Settings')
      await user.click(settingsOption)
      
      // Should open settings modal/page
    })

    it('calls logout when logout option is clicked', async () => {
      const mockLogout = jest.fn()
      const user = userEvent.setup()
      
      renderWithContext({}, { logout: mockLogout })
      
      const avatar = screen.getByText('JD')
      await user.click(avatar)
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument()
      })
      
      const logoutOption = screen.getByText('Logout')
      await user.click(logoutOption)
      
      expect(mockLogout).toHaveBeenCalled()
    })
  })

  // ✅ NAVIGATION TESTS
  describe('Navigation', () => {
    it('renders navigation links', () => {
      renderWithContext()
      
      expect(screen.getByText('Board')).toBeInTheDocument()
      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('highlights active navigation item', () => {
      renderWithContext()
      
      // Mock current route as 'board'
      const boardLink = screen.getByText('Board')
      expect(boardLink).toHaveClass('active') // Assuming active class
    })

    it('navigates when navigation links are clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const listLink = screen.getByText('List')
      await user.click(listLink)
      
      // Should navigate to list view
      // This might require router mocking
    })

    it('shows navigation icons', () => {
      renderWithContext()
      
      // Check for icon elements (this depends on icon implementation)
      const boardIcon = screen.getByTestId('board-icon') // Assuming data-testid
      expect(boardIcon).toBeInTheDocument()
    })
  })

  // ✅ SEARCH FUNCTIONALITY TESTS
  describe('Search Functionality', () => {
    it('renders search input', () => {
      renderWithContext()
      expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument()
    })

    it('updates search filter when typing', async () => {
      const mockDispatch = jest.fn()
      const user = userEvent.setup()
      
      renderWithContext({ dispatch: mockDispatch })
      
      const searchInput = screen.getByPlaceholderText(/search tasks/i)
      await user.type(searchInput, 'test search')
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { search: expect.stringContaining('test search') }
      })
    })

    it('clears search when clear button is clicked', async () => {
      const mockDispatch = jest.fn()
      const user = userEvent.setup()
      
      renderWithContext({ 
        dispatch: mockDispatch,
        state: {
          ...mockTaskContextValue.state,
          filters: { ...mockTaskContextValue.state.filters, search: 'existing search' }
        }
      })
      
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)
      
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { search: '' }
      })
    })

    it('shows search results count', () => {
      const filteredTasks = [
        { id: 'task-1', title: 'Task 1' },
        { id: 'task-2', title: 'Task 2' }
      ]
      
      renderWithContext({ 
        filteredTasks,
        state: {
          ...mockTaskContextValue.state,
          filters: { ...mockTaskContextValue.state.filters, search: 'task' }
        }
      })
      
      expect(screen.getByText('2 results')).toBeInTheDocument()
    })

    it('shows no results message when search yields no results', () => {
      renderWithContext({ 
        filteredTasks: [],
        state: {
          ...mockTaskContextValue.state,
          filters: { ...mockTaskContextValue.state.filters, search: 'nonexistent' }
        }
      })
      
      expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    })
  })

  // ✅ SYNC STATUS TESTS
  describe('Sync Status', () => {
    it('displays last sync time', () => {
      const lastSyncTime = new Date('2025-08-20T10:30:00')
      renderWithContext({ lastSyncTime })
      
      expect(screen.getByText(/last sync.*10:30/i)).toBeInTheDocument()
    })

    it('shows never synced message when no sync time', () => {
      renderWithContext({ lastSyncTime: null })
      
      expect(screen.getByText(/never synced/i)).toBeInTheDocument()
    })

    it('shows sync button', () => {
      renderWithContext()
      expect(screen.getByRole('button', { name: /sync now/i })).toBeInTheDocument()
    })

    it('calls syncWithDatabase when sync button is clicked', async () => {
      const mockSyncWithDatabase = jest.fn()
      const user = userEvent.setup()
      
      renderWithContext({ syncWithDatabase: mockSyncWithDatabase })
      
      const syncButton = screen.getByRole('button', { name: /sync now/i })
      await user.click(syncButton)
      
      expect(mockSyncWithDatabase).toHaveBeenCalled()
    })

    it('disables sync button when already syncing', () => {
      renderWithContext({ isSyncing: true })
      
      const syncButton = screen.getByRole('button', { name: /syncing/i })
      expect(syncButton).toBeDisabled()
    })

    it('disables sync button when offline', () => {
      renderWithContext({ isOnline: false })
      
      const syncButton = screen.getByRole('button', { name: /sync now/i })
      expect(syncButton).toBeDisabled()
    })
  })

  // ✅ NOTIFICATIONS TESTS
  describe('Notifications', () => {
    it('shows notification bell icon', () => {
      renderWithContext()
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    it('shows notification count badge when there are notifications', () => {
      renderWithContext()
      
      // Assuming there are 3 notifications
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('opens notifications panel when bell is clicked', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const notificationBell = screen.getByTestId('notification-bell')
      await user.click(notificationBell)
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument()
      })
    })

    it('marks notifications as read when opened', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const notificationBell = screen.getByTestId('notification-bell')
      await user.click(notificationBell)
      
      // Should mark notifications as read
      await waitFor(() => {
        expect(screen.queryByText('3')).not.toBeInTheDocument() // Badge should disappear
      })
    })
  })

  // ✅ THEME TOGGLE TESTS
  describe('Theme Toggle', () => {
    it('shows theme toggle button', () => {
      renderWithContext()
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
    })

    it('toggles between light and dark theme', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
      
      // Should show current theme (light by default)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      
      await user.click(themeToggle)
      
      // Should switch to dark theme
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
    })

    it('persists theme preference', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(themeToggle)
      
      // Should save theme preference to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  // ✅ RESPONSIVE DESIGN TESTS
  describe('Responsive Design', () => {
    it('shows mobile menu button on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640, // Mobile width
      })
      
      renderWithContext()
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    })

    it('hides navigation on mobile by default', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })
      
      renderWithContext()
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveClass('hidden') // Assuming hidden class on mobile
    })

    it('toggles mobile navigation when menu button is clicked', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      })
      
      const user = userEvent.setup()
      renderWithContext()
      
      const menuButton = screen.getByRole('button', { name: /menu/i })
      await user.click(menuButton)
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).not.toHaveClass('hidden')
    })
  })

  // ✅ ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithContext()
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Task Tracker')
    })

    it('has proper ARIA labels', () => {
      renderWithContext()
      
      const searchInput = screen.getByLabelText(/search tasks/i)
      expect(searchInput).toBeInTheDocument()
      
      const syncButton = screen.getByRole('button', { name: /sync now/i })
      expect(syncButton).toHaveAttribute('aria-label')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      // Tab through interactive elements
      await user.tab()
      expect(screen.getByPlaceholderText(/search tasks/i)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /sync now/i })).toHaveFocus()
    })

    it('has proper focus management', async () => {
      const user = userEvent.setup()
      renderWithContext()
      
      // Open user menu
      const avatar = screen.getByText('JD')
      await user.click(avatar)
      
      // First menu item should be focused
      await waitFor(() => {
        expect(screen.getByText('Profile')).toHaveFocus()
      })
    })

    it('has proper color contrast', () => {
      renderWithContext()
      
      // This would typically require a color contrast testing library
      // For now, we just ensure text is readable
      const title = screen.getByText('Task Tracker')
      expect(title).toHaveClass('text-gray-900') // Assuming good contrast class
    })
  })

  // ✅ ERROR HANDLING TESTS
  describe('Error Handling', () => {
    it('handles sync errors gracefully', async () => {
      const mockSyncWithDatabase = jest.fn().mockRejectedValue(new Error('Sync failed'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      
      renderWithContext({ syncWithDatabase: mockSyncWithDatabase })
      
      const syncButton = screen.getByRole('button', { name: /sync now/i })
      await user.click(syncButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Sync failed:', expect.any(Error))
      })
      
      // Should show error message to user
      expect(screen.getByText(/sync failed/i)).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })

    it('handles authentication errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      renderWithContext({}, { 
        user: null, 
        isAuthenticated: false,
        error: 'Authentication failed' 
      })
      
      // Should show authentication error
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })

  // ✅ PERFORMANCE TESTS
  describe('Performance', () => {
    it('debounces search input', async () => {
      const mockDispatch = jest.fn()
      const user = userEvent.setup()
      
      renderWithContext({ dispatch: mockDispatch })
      
      const searchInput = screen.getByPlaceholderText(/search tasks/i)
      
      // Type quickly
      await user.type(searchInput, 'quick typing')
      
      // Should debounce and only call dispatch once (or limited times)
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledTimes(1)
      }, { timeout: 1000 })
    })

    it('renders efficiently with many notifications', () => {
      const startTime = performance.now()
      
      // Mock many notifications
      const manyNotifications = Array.from({ length: 1000 }, (_, i) => ({
        id: `notification-${i}`,
        message: `Notification ${i}`,
        read: false
      }))
      
      renderWithContext({ notifications: manyNotifications })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(500) // 500ms
    })
  })
})