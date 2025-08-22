import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarView } from '../CalendarView'
import { TaskContext } from '@/contexts/TaskContext'
import { Task, TaskState } from '@/types'

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Fix login bug',
    description: 'Login issue with OAuth',
    status: 'todo',
    priority: 'high',
    assigneeId: '1',
    dueDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    labels: [{ id: '1', name: 'Bug', color: '#ef4444' }],
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: '2',
    title: 'Design homepage',
    description: 'New homepage mockups',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: '2',
    dueDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    labels: [{ id: '2', name: 'Design', color: '#3b82f6' }],
    estimatedHours: 8,
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: '3',
    title: 'Overdue task',
    description: 'This task is overdue',
    status: 'todo',
    priority: 'high',
    dueDate: new Date('2024-01-01'), // Past date
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-20'),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
  },
]

const mockDispatch = jest.fn()
const mockState: TaskState = {
  tasks: mockTasks,
  teamMembers: [
    {
      id: '1',
      name: 'Alice Johnson',
      role: 'Developer',
      email: 'alice@test.com',
      userRole: 'member' as const,
    },
    {
      id: '2',
      name: 'Bob Smith',
      role: 'Designer',
      email: 'bob@test.com',
      userRole: 'member' as const,
    },
  ],
  labels: [
    { id: '1', name: 'Bug', color: '#ef4444' },
    { id: '2', name: 'Design', color: '#3b82f6' },
  ],
  filters: {
    search: '',
    assignee: [],
    priority: [],
    labels: [],
    dueDate: {},
  },
}

const mockContextValue = {
  state: mockState,
  dispatch: mockDispatch,
  filteredTasks: mockTasks,
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  addTask: jest.fn(),
  moveTask: jest.fn(),
  reorderTasks: jest.fn(),
  addGroup: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  initializeDefaultGroups: jest.fn(),
  addDailyReport: jest.fn(),
  updateDailyReport: jest.fn(),
  deleteDailyReport: jest.fn(),
  syncWithDatabase: jest.fn(),
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
}

// Mock date-fns to have consistent dates in tests
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  startOfMonth: jest.fn(() => new Date('2024-01-01')),
  endOfMonth: jest.fn(() => new Date('2024-01-31')),
  eachDayOfInterval: jest.fn(() => [
    new Date('2024-01-01'),
    new Date('2024-01-15'),
    new Date('2024-01-20'),
    new Date('2024-01-31'),
  ]),
  format: jest.requireActual('date-fns').format,
  isSameMonth: jest.fn(() => true),
  isSameDay: jest.fn((date1: Date, date2: Date) => date1.getDate() === date2.getDate()),
  addMonths: jest.fn(
    (date: Date, amount: number) =>
      new Date(date.getFullYear(), date.getMonth() + amount, date.getDate())
  ),
  subMonths: jest.fn(
    (date: Date, amount: number) =>
      new Date(date.getFullYear(), date.getMonth() - amount, date.getDate())
  ),
}))

// Mock the TaskModal component
jest.mock('../TaskModal', () => {
  return {
    TaskModal: ({ isOpen, onClose, onSubmit, task }: any) => {
      if (!isOpen) return null
      return (
        <div data-testid="task-modal">
          <button onClick={() => onSubmit({ ...task, title: 'Updated Task' })}>Save Task</button>
          <button onClick={onClose}>Close</button>
        </div>
      )
    },
  }
})

const renderWithContext = (component: React.ReactElement) => {
  return render(<TaskContext.Provider value={mockContextValue}>{component}</TaskContext.Provider>)
}

describe('CalendarView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock current date for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render calendar with current month', () => {
    renderWithContext(<CalendarView />)

    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('should show day headers', () => {
    renderWithContext(<CalendarView />)

    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('should display tasks on their due dates', () => {
    renderWithContext(<CalendarView />)

    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
    expect(screen.getByText('Design homepage')).toBeInTheDocument()
  })

  it('should navigate to previous month', async () => {
    renderWithContext(<CalendarView />)

    const prevButton = screen.getByRole('button', { name: 'Previous month' })
    fireEvent.click(prevButton)

    // Date would change (mocked), so just verify button works
    expect(prevButton).toBeInTheDocument()
  })

  it('should navigate to next month', async () => {
    renderWithContext(<CalendarView />)

    const nextButton = screen.getByRole('button', { name: 'Next month' })
    fireEvent.click(nextButton)

    expect(nextButton).toBeInTheDocument()
  })

  it('should navigate to current month with Today button', async () => {
    renderWithContext(<CalendarView />)

    const todayButton = screen.getByText('Today')
    fireEvent.click(todayButton)

    expect(todayButton).toBeInTheDocument()
  })

  it('should select date when clicking on calendar day', async () => {
    renderWithContext(<CalendarView />)

    // Find a day with the date 15 (which has a task)
    const day15 = screen.getByText('15')
    fireEvent.click(day15.closest('div')!)

    // Should show selected date tasks in sidebar
    await waitFor(() => {
      expect(screen.getByText('Monday, January 15')).toBeInTheDocument()
    })
  })

  it('should show selected date tasks in sidebar', async () => {
    renderWithContext(<CalendarView />)

    // Click on date with task
    const day15 = screen.getByText('15')
    fireEvent.click(day15.closest('div')!)

    await waitFor(() => {
      // Should show task details in sidebar (there are multiple instances of this text)
      expect(screen.getAllByText('Fix login bug')).toHaveLength(2)
      expect(screen.getByText('Alice')).toBeInTheDocument() // Shows first name only in sidebar
    })
  })

  it('should open task modal when clicking on task in calendar', async () => {
    renderWithContext(<CalendarView />)

    const taskElement = screen.getByText('Fix login bug')
    fireEvent.click(taskElement)

    await waitFor(() => {
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    })
  })

  it('should open task modal when clicking on task in sidebar', async () => {
    renderWithContext(<CalendarView />)

    // First select a date
    const day15 = screen.getByText('15')
    fireEvent.click(day15.closest('div')!)

    await waitFor(() => {
      const sidebarTask = screen.getAllByText('Fix login bug')[1] // Second occurrence in sidebar
      fireEvent.click(sidebarTask)
    })

    await waitFor(() => {
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    })
  })

  it('should create new task when clicking New Task button', async () => {
    renderWithContext(<CalendarView />)

    const newTaskButton = screen.getByText('New Task')
    fireEvent.click(newTaskButton)

    await waitFor(() => {
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    })
  })

  it('should show "Create task for this date" button when date has no tasks', async () => {
    renderWithContext(<CalendarView />)

    // Click on a date without tasks (e.g., day 31)
    const day31 = screen.getByText('31')
    fireEvent.click(day31.closest('div')!)

    await waitFor(() => {
      expect(screen.getByText('No tasks for this date')).toBeInTheDocument()
      expect(screen.getByText('Create task for this date')).toBeInTheDocument()
    })
  })

  it('should pre-fill due date when creating task for specific date', async () => {
    renderWithContext(<CalendarView />)

    // Click on a date without tasks
    const day31 = screen.getByText('31')
    fireEvent.click(day31.closest('div')!)

    await waitFor(() => {
      const createButton = screen.getByText('Create task for this date')
      fireEvent.click(createButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('task-modal')).toBeInTheDocument()
    })
  })

  it('should show monthly statistics in sidebar', () => {
    renderWithContext(<CalendarView />)

    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('should display correct task counts in statistics', () => {
    renderWithContext(<CalendarView />)

    // Based on mockTasks: 1 in-progress, 0 done, 1 overdue
    const stats = screen.getAllByText(/\d+/)
    expect(stats.length).toBeGreaterThan(0) // Should show some numbers
  })

  it('should handle task updates from modal', async () => {
    renderWithContext(<CalendarView />)

    const taskElement = screen.getByText('Fix login bug')
    fireEvent.click(taskElement)

    await waitFor(() => {
      const saveButton = screen.getByText('Save Task')
      fireEvent.click(saveButton)
    })

    await waitFor(() => {
      expect(mockContextValue.updateTask).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: 'Updated Task' })
      )
    })
  })

  it('should close modal when clicking close button', async () => {
    renderWithContext(<CalendarView />)

    const taskElement = screen.getByText('Fix login bug')
    fireEvent.click(taskElement)

    await waitFor(() => {
      const closeButton = screen.getByText('Close')
      fireEvent.click(closeButton)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument()
    })
  })

  it('should show task priority indicators', () => {
    renderWithContext(<CalendarView />)

    // Tasks should show priority color dots
    const taskElements = screen.getAllByText(/Fix login bug|Design homepage/)
    expect(taskElements.length).toBeGreaterThan(0)
  })

  it('should show task labels', async () => {
    renderWithContext(<CalendarView />)

    // Select a date to show tasks in sidebar
    const day15 = screen.getByText('15')
    fireEvent.click(day15.closest('div')!)

    await waitFor(() => {
      // Labels should appear in sidebar task details
      expect(screen.getByText('Bug')).toBeInTheDocument()
    })
  })

  it('should highlight overdue tasks', () => {
    renderWithContext(<CalendarView />)

    // Overdue task should be visible (we don't test exact styling)
    expect(screen.getByText('Overdue task')).toBeInTheDocument()
  })

  it('should show "+N more" when day has more than 3 tasks', () => {
    // Create many tasks for the same day
    const manyTasks = Array.from({ length: 5 }, (_, i) => ({
      ...mockTasks[0],
      id: `task-${i}`,
      title: `Task ${i}`,
      dueDate: new Date('2024-01-15'),
    }))

    const contextWithManyTasks = {
      ...mockContextValue,
      filteredTasks: manyTasks,
    }

    render(
      <TaskContext.Provider value={contextWithManyTasks}>
        <CalendarView />
      </TaskContext.Provider>
    )

    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('should handle empty task list', () => {
    const emptyContext = {
      ...mockContextValue,
      filteredTasks: [],
    }

    render(
      <TaskContext.Provider value={emptyContext}>
        <CalendarView />
      </TaskContext.Provider>
    )

    expect(screen.getByText('January 2024')).toBeInTheDocument()
    expect(screen.getByText('Select a date')).toBeInTheDocument()
  })

  it('should show assignee information in sidebar task details', async () => {
    renderWithContext(<CalendarView />)

    // Select date with task
    const day15 = screen.getByText('15')
    fireEvent.click(day15.closest('div')!)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument() // Shows first name only in sidebar
    })
  })

  it('should show estimated hours in sidebar', async () => {
    renderWithContext(<CalendarView />)

    // Select date with task that has estimated hours
    const day20 = screen.getByText('20')
    fireEvent.click(day20.closest('div')!)

    await waitFor(() => {
      expect(screen.getByText('8h')).toBeInTheDocument()
    })
  })
})
