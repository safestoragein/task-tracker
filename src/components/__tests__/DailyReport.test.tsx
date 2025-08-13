import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DailyReport } from '../DailyReport'
import { TaskContext } from '@/contexts/TaskContext'
import { TaskState, DailyReport as DailyReportType } from '@/types'

const mockTeamMembers = [
  { id: '1', name: 'Kushal', role: 'Tech Manager', email: 'kushal@company.com' },
  { id: '2', name: 'Niranjan', role: 'QA Manager', email: 'niranjan@company.com' },
]

const mockDailyReports: DailyReportType[] = [
  {
    id: 'report-1',
    authorId: '1',
    date: new Date('2025-08-11'),
    yesterdayWork: 'Completed payment analysis',
    todayPlan: 'Work on CRM development',
    blockers: 'Need API documentation',
    createdAt: new Date('2025-08-11'),
    updatedAt: new Date('2025-08-11'),
  }
]

const mockDispatch = jest.fn()

const mockState: TaskState = {
  tasks: [],
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
  dispatch: mockDispatch,
  filteredTasks: []
}

describe('DailyReport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderDailyReport = () => {
    return render(
      <TaskContext.Provider value={mockContextValue}>
        <DailyReport />
      </TaskContext.Provider>
    )
  }

  it('renders daily standup heading and description', () => {
    renderDailyReport()
    
    expect(screen.getByText('Daily Standup')).toBeInTheDocument()
    expect(screen.getByText('Team progress and planning')).toBeInTheDocument()
  })

  it('displays team members with their roles', () => {
    renderDailyReport()
    
    expect(screen.getByText('Kushal')).toBeInTheDocument()
    expect(screen.getByText('Tech Manager')).toBeInTheDocument()
    expect(screen.getByText('Niranjan')).toBeInTheDocument()
    expect(screen.getByText('QA Manager')).toBeInTheDocument()
  })

  it('shows reported status for team members who have submitted reports', () => {
    renderDailyReport()
    
    // Kushal has reported (has a report in mockDailyReports)
    const reportedBadges = screen.getAllByText('Reported')
    expect(reportedBadges.length).toBeGreaterThan(0)
    
    // Niranjan hasn't reported
    const pendingBadges = screen.getAllByText('Pending')
    expect(pendingBadges.length).toBeGreaterThan(0)
  })

  it('displays existing daily report content', () => {
    renderDailyReport()
    
    expect(screen.getByText('Completed payment analysis')).toBeInTheDocument()
    expect(screen.getByText('Work on CRM development')).toBeInTheDocument()
    expect(screen.getByText('Need API documentation')).toBeInTheDocument()
  })

  it('shows add report button', () => {
    renderDailyReport()
    
    const addButtons = screen.getAllByText('Add Report')
    expect(addButtons.length).toBeGreaterThan(0)
  })

  it('opens report creation form when add report is clicked', async () => {
    renderDailyReport()
    
    const addButton = screen.getAllByText('Add Report')[0]
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText('What did you work on yesterday?')).toBeInTheDocument()
      expect(screen.getByText('What are you planning to work on today?')).toBeInTheDocument()
      expect(screen.getByText('Any blockers or impediments?')).toBeInTheDocument()
    })
  })

  it('allows date selection', () => {
    renderDailyReport()
    
    const dateInput = screen.getByDisplayValue('2025-08-11')
    expect(dateInput).toBeInTheDocument()
    
    fireEvent.change(dateInput, { target: { value: '2025-08-12' } })
    expect(dateInput).toHaveValue('2025-08-12')
  })

  it('submits a new daily report', async () => {
    renderDailyReport()
    
    // Click add report
    const addButton = screen.getAllByText('Add Report')[0]
    fireEvent.click(addButton)
    
    await waitFor(() => {
      // Fill in the form
      const yesterdayInput = screen.getByPlaceholderText('Describe your accomplishments from yesterday...')
      const todayInput = screen.getByPlaceholderText('Outline your plan for today...')
      
      fireEvent.change(yesterdayInput, { target: { value: 'Fixed bugs' } })
      fireEvent.change(todayInput, { target: { value: 'Add new features' } })
      
      // Submit the form
      const submitButton = screen.getByText('Submit Report')
      fireEvent.click(submitButton)
      
      // Verify dispatch was called with correct action
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_DAILY_REPORT',
        payload: expect.objectContaining({
          yesterdayWork: 'Fixed bugs',
          todayPlan: 'Add new features',
          authorId: expect.any(String),
          id: expect.any(String),
        })
      })
    })
  })

  it('cancels report creation', async () => {
    renderDailyReport()
    
    // Click add report
    const addButton = screen.getAllByText('Add Report')[0]
    fireEvent.click(addButton)
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      // Form should be closed
      expect(screen.queryByText('What did you work on yesterday?')).not.toBeInTheDocument()
    })
  })

  it('displays section headers correctly', () => {
    renderDailyReport()
    
    expect(screen.getByText("Yesterday's Work")).toBeInTheDocument()
    expect(screen.getByText("Today's Plan")).toBeInTheDocument()
    expect(screen.getByText('Blockers')).toBeInTheDocument()
  })

  it('shows empty state when no reports exist for selected date', () => {
    const emptyState = {
      ...mockState,
      dailyReports: []
    }
    
    const emptyContextValue = {
      state: emptyState,
      dispatch: mockDispatch,
      filteredTasks: []
    }
    
    render(
      <TaskContext.Provider value={emptyContextValue}>
        <DailyReport />
      </TaskContext.Provider>
    )
    
    // Should show pending status for all team members
    const pendingBadges = screen.getAllByText('Pending')
    expect(pendingBadges).toHaveLength(mockTeamMembers.length)
  })
})