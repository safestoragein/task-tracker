import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth, safeStorageUsers } from '../AuthContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Test component to access auth context
function AuthTestComponent() {
  const { state, login, logout, canEditTask, canEditDailyReport } = useAuth()
  const [email, setEmail] = React.useState('')
  
  return (
    <div>
      <div data-testid="auth-status">
        {state.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="loading-status">
        {state.isLoading ? 'loading' : 'loaded'}
      </div>
      <div data-testid="user-name">
        {state.user?.name || 'no-user'}
      </div>
      <div data-testid="user-role">
        {state.user?.userRole || 'no-role'}
      </div>
      <div data-testid="user-id">
        {state.user?.id || 'no-id'}
      </div>
      
      <input
        data-testid="email-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button
        data-testid="login-button"
        onClick={() => {
          const success = login(email)
          if (!success) {
            console.log('Login failed')
          }
        }}
      >
        Login
      </button>
      <button
        data-testid="logout-button"
        onClick={logout}
      >
        Logout
      </button>
      
      {/* Test permission buttons */}
      <button
        data-testid="can-edit-niranjan-task"
        onClick={() => console.log('Can edit Niranjan task:', canEditTask('2'))}
      >
        Can Edit Niranjan Task
      </button>
      <button
        data-testid="can-edit-own-task"
        onClick={() => console.log('Can edit own task:', canEditTask(state.user?.id))}
      >
        Can Edit Own Task
      </button>
      <button
        data-testid="can-edit-niranjan-report"
        onClick={() => console.log('Can edit Niranjan report:', canEditDailyReport('2'))}
      >
        Can Edit Niranjan Report
      </button>
    </div>
  )
}

describe('AuthContext - Member Authentication Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('User Authentication', () => {
    it('should authenticate Niranjan with correct email', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
      })

      // Login as Niranjan
      await user.type(screen.getByTestId('email-input'), 'niranjan@safestorage.in')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user-name')).toHaveTextContent('Niranjan')
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin')
        expect(screen.getByTestId('user-id')).toHaveTextContent('2')
      })

      // Verify user data was saved to localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'safestorage_user',
        expect.stringContaining('Niranjan')
      )
    })

    it('should authenticate all SafeStorage team members', async () => {
      const user = userEvent.setup()
      
      // Test each team member
      const teamMembers = safeStorageUsers
      
      for (const member of teamMembers) {
        const { rerender } = render(
          <AuthProvider>
            <AuthTestComponent />
          </AuthProvider>
        )

        await waitFor(() => {
          expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
        })

        // Clear email input and login
        const emailInput = screen.getByTestId('email-input')
        await user.clear(emailInput)
        await user.type(emailInput, member.email)
        await user.click(screen.getByTestId('login-button'))

        await waitFor(() => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
          expect(screen.getByTestId('user-name')).toHaveTextContent(member.name)
          expect(screen.getByTestId('user-role')).toHaveTextContent(member.userRole)
          expect(screen.getByTestId('user-id')).toHaveTextContent(member.id)
        })

        // Logout for next iteration
        await user.click(screen.getByTestId('logout-button'))
        await waitFor(() => {
          expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        })
      }
    })

    it('should not authenticate invalid email addresses', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
      })

      // Try invalid email
      await user.type(screen.getByTestId('email-input'), 'invalid@example.com')
      await user.click(screen.getByTestId('login-button'))

      // Should remain unauthenticated
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user')
    })

    it('should handle case-insensitive email login', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
      })

      // Login with uppercase email
      await user.type(screen.getByTestId('email-input'), 'NIRANJAN@SAFESTORAGE.IN')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user-name')).toHaveTextContent('Niranjan')
      })
    })

    it('should logout user correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      // First login
      await user.type(screen.getByTestId('email-input'), 'niranjan@safestorage.in')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Then logout
      await user.click(screen.getByTestId('logout-button'))

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-name')).toHaveTextContent('no-user')
        expect(screen.getByTestId('user-role')).toHaveTextContent('no-role')
      })

      // Verify user data was removed from localStorage
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('safestorage_user')
    })
  })

  describe('Permission System', () => {
    it('should allow admin users to edit any task', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      // Login as admin (Niranjan)
      await user.type(screen.getByTestId('email-input'), 'niranjan@safestorage.in')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin')
      })

      // Test editing any task
      await user.click(screen.getByTestId('can-edit-niranjan-task'))
      expect(consoleSpy).toHaveBeenCalledWith('Can edit Niranjan task:', true)

      consoleSpy.mockRestore()
    })

    it('should allow members to edit only their own tasks', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      // Login as member (Anush - ID 3)
      await user.type(screen.getByTestId('email-input'), 'anush@safestorage.in')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('member')
        expect(screen.getByTestId('user-id')).toHaveTextContent('3')
      })

      // Test editing own task
      await user.click(screen.getByTestId('can-edit-own-task'))
      expect(consoleSpy).toHaveBeenCalledWith('Can edit own task:', true)

      // Test editing Niranjan's task (should be false)
      await user.click(screen.getByTestId('can-edit-niranjan-task'))
      expect(consoleSpy).toHaveBeenCalledWith('Can edit Niranjan task:', false)

      consoleSpy.mockRestore()
    })

    it('should handle daily report permissions correctly', async () => {
      const user = userEvent.setup()
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      // Login as member (Anush - ID 3)
      await user.type(screen.getByTestId('email-input'), 'anush@safestorage.in')
      await user.click(screen.getByTestId('login-button'))

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('member')
      })

      // Test editing Niranjan's report (should be false for member)
      await user.click(screen.getByTestId('can-edit-niranjan-report'))
      expect(consoleSpy).toHaveBeenCalledWith('Can edit Niranjan report:', false)

      consoleSpy.mockRestore()
    })

    it('should deny permissions when user is not authenticated', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })

      const user = userEvent.setup()
      
      // Test permissions when not logged in
      await user.click(screen.getByTestId('can-edit-niranjan-task'))
      expect(consoleSpy).toHaveBeenCalledWith('Can edit Niranjan task:', false)

      await user.click(screen.getByTestId('can-edit-own-task'))
      expect(consoleSpy).toHaveBeenCalledWith('Can edit own task:', false)

      consoleSpy.mockRestore()
    })
  })

  describe('Persistence and Recovery', () => {
    it('should restore user session from localStorage on app start', async () => {
      const niranjanUser = {
        id: '2',
        name: 'Niranjan',
        role: 'QA Manager',
        email: 'niranjan@safestorage.in',
        userRole: 'admin'
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(niranjanUser))

      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user-name')).toHaveTextContent('Niranjan')
        expect(screen.getByTestId('user-role')).toHaveTextContent('admin')
      })
    })

    it('should handle invalid stored user data', async () => {
      const invalidUser = {
        id: '999',
        name: 'Invalid User',
        email: 'invalid@example.com'
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidUser))

      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-name')).toHaveTextContent('no-user')
      })

      // Should remove invalid data
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('safestorage_user')
    })

    it('should handle corrupted localStorage data gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json-data')

      // Should not crash the app
      expect(() => {
        render(
          <AuthProvider>
            <AuthTestComponent />
          </AuthProvider>
        )
      }).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('loaded')
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })
    })
  })

  describe('Team Member Data Integrity', () => {
    it('should have correct SafeStorage team member data', () => {
      const expectedMembers = [
        { id: '1', name: 'Kushal', role: 'Tech Manager', email: 'kushal@safestorage.in', userRole: 'admin' },
        { id: '2', name: 'Niranjan', role: 'QA Manager', email: 'niranjan@safestorage.in', userRole: 'admin' },
        { id: '3', name: 'Anush', role: 'Logistics Manager', email: 'anush@safestorage.in', userRole: 'member' },
        { id: '4', name: 'Harsha', role: 'Operations Manager', email: 'harsha@safestorage.in', userRole: 'member' },
        { id: '5', name: 'Kiran', role: 'Technical Architect', email: 'kiran@safestorage.in', userRole: 'member' },
        { id: '6', name: 'Manish', role: 'HR', email: 'manish@safestorage.in', userRole: 'admin' },
        { id: '7', name: 'Ramesh', role: 'CEO', email: 'ramesh@safestorage.in', userRole: 'admin' },
        { id: '8', name: 'Arun', role: 'Team Member', email: 'arun@safestorage.in', userRole: 'member' },
        { id: '9', name: 'Shantraj', role: 'Team Member', email: 'shantraj@safestorage.in', userRole: 'member' },
      ]

      expect(safeStorageUsers).toHaveLength(expectedMembers.length)
      
      expectedMembers.forEach((expectedMember) => {
        const actualMember = safeStorageUsers.find(u => u.id === expectedMember.id)
        expect(actualMember).toBeDefined()
        expect(actualMember).toMatchObject(expectedMember)
      })
    })

    it('should have Niranjan with correct admin permissions', () => {
      const niranjan = safeStorageUsers.find(u => u.name === 'Niranjan')
      expect(niranjan).toBeDefined()
      expect(niranjan?.id).toBe('2')
      expect(niranjan?.email).toBe('niranjan@safestorage.in')
      expect(niranjan?.userRole).toBe('admin')
      expect(niranjan?.role).toBe('QA Manager')
    })

    it('should maintain unique user IDs across all team members', () => {
      const ids = safeStorageUsers.map(u => u.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should maintain unique email addresses across all team members', () => {
      const emails = safeStorageUsers.map(u => u.email)
      const uniqueEmails = new Set(emails)
      expect(uniqueEmails.size).toBe(emails.length)
    })
  })

  describe('Role-Based Access Control', () => {
    it('should correctly identify admin users', () => {
      const adminUsers = safeStorageUsers.filter(u => u.userRole === 'admin')
      const expectedAdmins = ['Kushal', 'Niranjan', 'Manish', 'Ramesh']
      
      expect(adminUsers).toHaveLength(expectedAdmins.length)
      adminUsers.forEach(admin => {
        expect(expectedAdmins).toContain(admin.name)
      })
    })

    it('should correctly identify member users', () => {
      const memberUsers = safeStorageUsers.filter(u => u.userRole === 'member')
      const expectedMembers = ['Anush', 'Harsha', 'Kiran', 'Arun', 'Shantraj']
      
      expect(memberUsers).toHaveLength(expectedMembers.length)
      memberUsers.forEach(member => {
        expect(expectedMembers).toContain(member.name)
      })
    })
  })
})