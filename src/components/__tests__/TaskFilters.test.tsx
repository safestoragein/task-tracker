import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskFilters } from '../TaskFilters'
import { useTask } from '@/contexts/TaskContext'
import { format } from 'date-fns'

// Mock the dependencies
jest.mock('@/contexts/TaskContext')
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn((date) => date.toISOString().split('T')[0])
}))

const mockState = {
  filters: {
    search: '',
    assignee: [],
    priority: [],
    labels: [],
    dueDate: {},
  },
  teamMembers: [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: '', role: 'member' as const },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: '', role: 'admin' as const },
  ],
  labels: ['bug', 'feature', 'enhancement', 'documentation'],
  tasks: [],
  selectedMemberId: null,
  quickFilterMemberId: null,
}

const mockDispatch = jest.fn()

const mockUseTask = {
  state: mockState,
  dispatch: mockDispatch,
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  addLabel: jest.fn(),
  deleteLabel: jest.fn(),
  addTeamMember: jest.fn(),
  updateTeamMember: jest.fn(),
  deleteTeamMember: jest.fn(),
  setSelectedMemberId: jest.fn(),
  setQuickFilterMemberId: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
}

describe('TaskFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTask as jest.Mock).mockReturnValue(mockUseTask)
  })

  it('renders search input', () => {
    render(<TaskFilters />)
    
    const searchInput = screen.getByPlaceholderText(/Search tasks/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('handles search input changes', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    const searchInput = screen.getByPlaceholderText(/Search tasks/i)
    await user.type(searchInput, 'test search')
    
    // Debounced, so we need to wait
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { search: 'test search' }
      })
    })
  })

  it('opens filter popover when clicked', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Labels')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
  })

  it('toggles priority filters', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Click on High priority
    const highPriorityButton = screen.getByRole('button', { name: /high/i })
    await user.click(highPriorityButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FILTERS',
      payload: { priority: ['high'] }
    })
  })

  it('removes priority filter when clicked again', async () => {
    const user = userEvent.setup()
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          priority: ['high'],
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Click on High priority again to remove
    const highPriorityButton = screen.getByRole('button', { name: /high/i })
    await user.click(highPriorityButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FILTERS',
      payload: { priority: [] }
    })
  })

  it('toggles label filters', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Click on bug label
    const bugLabel = screen.getByText('bug')
    await user.click(bugLabel)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FILTERS',
      payload: { labels: ['bug'] }
    })
  })

  it('toggles assignee filters', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Click on assignee
    const assigneeCheckbox = screen.getByRole('checkbox', { name: /John Doe/i })
    await user.click(assigneeCheckbox)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FILTERS',
      payload: { assignee: ['user-1'] }
    })
  })

  it('handles date range selection', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Open date picker
    const dateButton = screen.getByRole('button', { name: /pick a date/i })
    await user.click(dateButton)
    
    // Select a date (simplified for testing)
    const dateInCalendar = screen.getAllByText('15')[0]
    await user.click(dateInCalendar)
    
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_FILTERS',
        payload: expect.objectContaining({
          dueDate: expect.any(Object)
        })
      })
    )
  })

  it('clears all filters', async () => {
    const user = userEvent.setup()
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          search: 'test',
          assignee: ['user-1'],
          priority: ['high'],
          labels: ['bug'],
          dueDate: { from: new Date() },
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Click clear all
    const clearButton = screen.getByRole('button', { name: /clear all/i })
    await user.click(clearButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILTERS',
      payload: {
        search: '',
        assignee: [],
        priority: [],
        labels: [],
        dueDate: {},
      }
    })
  })

  it('displays active filter count', () => {
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          search: 'test',
          assignee: [],
          priority: ['high', 'medium'],
          labels: ['bug'],
          dueDate: { from: new Date() },
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Should show count of 5 (1 search + 2 priority + 1 label + 1 date)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows no filter count when no filters active', () => {
    render(<TaskFilters />)
    
    // Should not show any count badge
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('highlights active priority filters', async () => {
    const user = userEvent.setup()
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          priority: ['high'],
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // High priority should be highlighted
    const highPriorityButton = screen.getByRole('button', { name: /high/i })
    expect(highPriorityButton).toHaveClass('bg-red-100')
  })

  it('highlights active label filters', async () => {
    const user = userEvent.setup()
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          labels: ['bug'],
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Bug label should be highlighted
    const bugLabel = screen.getByText('bug')
    expect(bugLabel.closest('button')).toHaveClass('bg-primary')
  })

  it('displays selected date range', async () => {
    const fromDate = new Date('2025-01-15')
    const toDate = new Date('2025-01-20')
    
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          dueDate: { from: fromDate, to: toDate },
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Should display date range
    expect(screen.getByText(/2025-01-15/)).toBeInTheDocument()
    expect(screen.getByText(/2025-01-20/)).toBeInTheDocument()
  })

  it('handles multiple filter selections', async () => {
    const user = userEvent.setup()
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // Select multiple priorities
    const highButton = screen.getByRole('button', { name: /high/i })
    const mediumButton = screen.getByRole('button', { name: /medium/i })
    
    await user.click(highButton)
    await user.click(mediumButton)
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FILTERS',
      payload: { priority: ['high'] }
    })
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_FILTERS',
      payload: { priority: ['medium'] }
    })
  })

  it('closes filter popover when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <TaskFilters />
        <button>Outside button</button>
      </div>
    )
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    expect(screen.getByText('Priority')).toBeInTheDocument()
    
    // Click outside
    const outsideButton = screen.getByText('Outside button')
    await user.click(outsideButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Priority')).not.toBeInTheDocument()
    })
  })

  it('maintains filter state after closing popover', async () => {
    const user = userEvent.setup()
    ;(useTask as jest.Mock).mockReturnValue({
      ...mockUseTask,
      state: {
        ...mockState,
        filters: {
          ...mockState.filters,
          priority: ['high'],
        }
      }
    })
    
    render(<TaskFilters />)
    
    // Open filter popover
    const filterButton = screen.getByRole('button', { name: /filter/i })
    await user.click(filterButton)
    
    // High should be selected
    const highButton = screen.getByRole('button', { name: /high/i })
    expect(highButton).toHaveClass('bg-red-100')
    
    // Close and reopen
    await user.click(filterButton) // Close
    await user.click(filterButton) // Open again
    
    // High should still be selected
    expect(screen.getByRole('button', { name: /high/i })).toHaveClass('bg-red-100')
  })
})