import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DailyReport } from '../DailyReport'
import { AuthProvider, AuthContext } from '@/contexts/AuthContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { User } from '@/types'

// Create a mock AuthProvider for testing
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

describe('DailyReport - Member Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow Anush (member) to add his own report', async () => {
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

    // Look for Anush's card
    const anushSection = screen.getByText('Anush').closest('[class*="Card"]')
    expect(anushSection).toBeInTheDocument()

    // Anush should see the "Add Report" button for his own card
    const addReportButtons = screen.getAllByText('Add Report')

    // Find the button in Anush's section specifically
    const anushAddButton = Array.from(addReportButtons).find(button =>
      anushSection?.contains(button)
    )

    expect(anushAddButton).toBeInTheDocument()
    expect(anushAddButton).not.toBeDisabled()
  })

  it('should NOT allow Anush to add reports for other members', async () => {
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

    // Look for Kushal's card (different member)
    const kushalSection = screen.getByText('Kushal').closest('[class*="Card"]')

    if (kushalSection) {
      // Kushal's section should NOT have an "Add Report" button for Anush
      const addReportButtons = kushalSection.querySelectorAll('button')
      const kushalAddButton = Array.from(addReportButtons).find(button =>
        button.textContent?.includes('Add Report')
      )

      expect(kushalAddButton).not.toBeInTheDocument()
    }
  })

  it('should show correct permission message for members', async () => {
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

    // Should see the permission message for members
    await waitFor(() => {
      expect(
        screen.getByText(/You can view all reports but only edit your own/i)
      ).toBeInTheDocument()
    })
  })

  it('should allow admin to add reports for any member', async () => {
    const kushalUser: User = {
      id: '1',
      name: 'Kushal',
      email: 'kushal@safestorage.in',
      role: 'Tech Manager',
      userRole: 'admin',
    }

    render(
      <MockAuthProvider mockUser={kushalUser}>
        <TaskProvider>
          <DailyReport />
        </TaskProvider>
      </MockAuthProvider>
    )

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Daily Standup')).toBeInTheDocument()
    })

    // Admin should see "Add Report" buttons for ALL members
    const addReportButtons = screen.getAllByText('Add Report')

    // Should have multiple buttons (one for each member without a report)
    expect(addReportButtons.length).toBeGreaterThan(0)

    // All buttons should be enabled for admin
    addReportButtons.forEach(button => {
      expect(button).not.toBeDisabled()
    })
  })
})
