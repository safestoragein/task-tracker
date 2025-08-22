import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DailyReport } from '../DailyReport'
import { AuthContext } from '@/contexts/AuthContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { User } from '@/types'
import userEvent from '@testing-library/user-event'

// Mock AuthProvider for testing different users
const MockAuthProvider = ({
  children,
  mockUser,
}: {
  children: React.ReactNode
  mockUser: User | null
}) => {
  const mockValue = {
    state: {
      user: mockUser,
      isAuthenticated: !!mockUser,
      isLoading: false,
    },
    dispatch: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    canEditTask: jest.fn(),
    canEditDailyReport: (reportAuthorId: string) => {
      if (!mockUser) return false
      if (mockUser.userRole === 'admin') return true
      return reportAuthorId === mockUser.id
    },
  }

  return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
}

describe('DailyReport - Integration Test for Member Access Fix', () => {
  it.skip('should show all team members and allow Anush to add his own report', async () => {
    const user = userEvent.setup()
    const anushUser: User = {
      id: '3',
      name: 'Anush',
      email: 'anush@safestorage.in',
      role: 'Logistics Manager',
      userRole: 'member',
    }

    render(
      <MockAuthProvider mockUser={anushUser}>
        <TaskProvider>
          <DailyReport />
        </TaskProvider>
      </MockAuthProvider>
    )

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Daily Standup')).toBeInTheDocument()
    })

    // Check that team members are now visible
    expect(screen.getByText('Anush')).toBeInTheDocument()
    expect(screen.getByText('Kushal')).toBeInTheDocument()
    expect(screen.getByText('Harsha')).toBeInTheDocument()

    // Find Anush's section
    const anushCard = screen.getByText('Anush').closest('.border-l-4')
    expect(anushCard).toBeInTheDocument()

    // Anush should have an "Add Report" button in his own card
    const anushAddButton = screen
      .getAllByText('Add Report')
      .find(button => anushCard?.contains(button as HTMLElement))
    expect(anushAddButton).toBeInTheDocument()

    // Click the Add Report button to open the form
    await user.click(anushAddButton!)

    // Should see the report form
    expect(screen.getByText(/Creating daily standup report for Anush/)).toBeInTheDocument()
    expect(screen.getByLabelText(/What did you work on yesterday/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/What are you planning to work on today/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Any blockers or impediments/i)).toBeInTheDocument()

    // Fill in the form
    await user.type(
      screen.getByLabelText(/What did you work on yesterday/i),
      'Worked on logistics planning'
    )
    await user.type(
      screen.getByLabelText(/What are you planning to work on today/i),
      'Continue with warehouse setup'
    )
    await user.type(
      screen.getByLabelText(/Any blockers or impediments/i),
      'Need approval from management'
    )

    // Submit the form
    const submitButton = screen.getByText('Submit Report')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })

  it('should NOT show Add Report button for other members when Anush is logged in', async () => {
    const anushUser: User = {
      id: '3',
      name: 'Anush',
      email: 'anush@safestorage.in',
      role: 'Logistics Manager',
      userRole: 'member',
    }

    render(
      <MockAuthProvider mockUser={anushUser}>
        <TaskProvider>
          <DailyReport />
        </TaskProvider>
      </MockAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Daily Standup')).toBeInTheDocument()
    })

    // Find Kushal's card (different member)
    const kushalCard = screen.getByText('Kushal').closest('.border-l-4')
    expect(kushalCard).toBeInTheDocument()

    // Kushal's card should NOT have an "Add Report" button when Anush is logged in
    const addReportButtons = screen.getAllByText('Add Report')
    const kushalAddButton = addReportButtons.find(button =>
      kushalCard?.contains(button as HTMLElement)
    )
    expect(kushalAddButton).toBeUndefined()

    // But Kushal's card should show "Read Only" badge
    const readOnlyBadges = screen.getAllByText('Read Only')
    const kushalReadOnlyBadge = readOnlyBadges.find(badge =>
      kushalCard?.contains(badge as HTMLElement)
    )
    expect(kushalReadOnlyBadge).toBeInTheDocument()
  })

  it('should show admin can add reports for anyone', async () => {
    const adminUser: User = {
      id: '1',
      name: 'Kushal',
      email: 'kushal@safestorage.in',
      role: 'Tech Manager',
      userRole: 'admin',
    }

    render(
      <MockAuthProvider mockUser={adminUser}>
        <TaskProvider>
          <DailyReport />
        </TaskProvider>
      </MockAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Daily Standup')).toBeInTheDocument()
    })

    // Admin should see "Add Report" buttons for multiple members
    const addReportButtons = screen.getAllByText('Add Report')
    expect(addReportButtons.length).toBeGreaterThanOrEqual(2) // Should be multiple

    // No "Read Only" badges should be visible for admin
    expect(screen.queryByText('Read Only')).not.toBeInTheDocument()
  })

  it('should display correct role indicators', async () => {
    const anushUser: User = {
      id: '3',
      name: 'Anush',
      email: 'anush@safestorage.in',
      role: 'Logistics Manager',
      userRole: 'member',
    }

    render(
      <MockAuthProvider mockUser={anushUser}>
        <TaskProvider>
          <DailyReport />
        </TaskProvider>
      </MockAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Daily Standup')).toBeInTheDocument()
    })

    // Should see admin badges for admin users
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0)

    // Should see permission message for members
    expect(screen.getByText(/You can view all reports but only edit your own/i)).toBeInTheDocument()
  })
})
