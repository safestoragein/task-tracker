import { render, screen, fireEvent } from '@testing-library/react'
import { TeamManagement } from '../TeamManagement'
import { AuthProvider } from '@/contexts/AuthContext'
import { TaskProvider } from '@/contexts/TaskContext'

// Mock admin user
const mockAdminUser = {
  id: '1',
  name: 'Ramesh',
  email: 'ramesh@safestorage.in',
  role: 'CEO',
  userRole: 'admin' as const
}

// Mock member user
const mockMemberUser = {
  id: '2',
  name: 'Niranjan',
  email: 'niranjan@safestorage.in',
  role: 'QA Manager',
  userRole: 'member' as const
}

const TestWrapper = ({ children, user }: { children: React.ReactNode, user: any }) => (
  <AuthProvider>
    <TaskProvider>
      {children}
    </TaskProvider>
  </AuthProvider>
)

describe('TeamManagement Component', () => {
  test('renders team management for admin users', () => {
    // Mock the useAuth hook
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        state: {
          user: mockAdminUser,
          isAuthenticated: true,
          isLoading: false
        }
      })
    }))

    render(
      <TestWrapper user={mockAdminUser}>
        <TeamManagement />
      </TestWrapper>
    )

    expect(screen.getByText('Team Management')).toBeInTheDocument()
    expect(screen.getByText('Add Member')).toBeInTheDocument()
  })

  test('shows access restricted for non-admin users', () => {
    // Mock the useAuth hook for member user
    jest.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        state: {
          user: mockMemberUser,
          isAuthenticated: true,
          isLoading: false
        }
      })
    }))

    render(
      <TestWrapper user={mockMemberUser}>
        <TeamManagement />
      </TestWrapper>
    )

    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
    expect(screen.getByText('Only administrators can access team management.')).toBeInTheDocument()
  })

  test('displays team members with task statistics', () => {
    render(
      <TestWrapper user={mockAdminUser}>
        <TeamManagement />
      </TestWrapper>
    )

    // Should show team member cards with task stats
    expect(screen.getByText('Task Summary')).toBeInTheDocument()
    expect(screen.getByText(/total/)).toBeInTheDocument()
  })
})