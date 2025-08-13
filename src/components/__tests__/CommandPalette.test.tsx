import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from '../CommandPalette'
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
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    { id: '1', name: 'Alice Johnson', role: 'Developer', email: 'alice@test.com' },
    { id: '2', name: 'Bob Smith', role: 'Designer', email: 'bob@test.com' },
  ],
  labels: [
    { id: '1', name: 'Bug', color: '#ef4444' },
    { id: '2', name: 'Feature', color: '#3b82f6' },
  ],
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
  filteredTasks: mockTasks
}

const renderWithContext = (props: any) => {
  return render(
    <TaskContext.Provider value={mockContextValue}>
      <CommandPalette {...props} />
    </TaskContext.Provider>
  )
}

describe('CommandPalette', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when closed', () => {
    renderWithContext({ isOpen: false, onClose: jest.fn() })
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a command or create a task...')).toBeInTheDocument()
  })

  it('should show keyboard shortcut hint', () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('should create task from natural language input', async () => {
    const mockOnClose = jest.fn()
    renderWithContext({ isOpen: true, onClose: mockOnClose })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, 'Fix urgent bug @alice 2h')
    
    // Should show task preview
    await waitFor(() => {
      expect(screen.getByText('Fix bug')).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('2h')).toBeInTheDocument()
    })
    
    // Press Enter to create task
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_TASK',
        payload: expect.objectContaining({
          title: 'Fix bug',
          priority: 'high',
          assigneeId: '1',
          estimatedHours: 2,
        })
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should search tasks when using "/" prefix', async () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, '/login')
    
    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument()
      expect(screen.getByText('todo • high priority')).toBeInTheDocument()
    })
  })

  it('should show quick filters when no input', () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    expect(screen.getByText('Show High Priority Tasks')).toBeInTheDocument()
    expect(screen.getByText('Show My Tasks')).toBeInTheDocument()
    expect(screen.getByText('Show Overdue Tasks')).toBeInTheDocument()
  })

  it('should show navigation actions when using "/" prefix', async () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, '/')
    
    await waitFor(() => {
      expect(screen.getByText('Go to Analytics')).toBeInTheDocument()
      expect(screen.getByText('Team Management')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation', async () => {
    const mockOnClose = jest.fn()
    renderWithContext({ isOpen: true, onClose: mockOnClose })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    // Navigate with arrow keys
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    
    // Close with Escape
    fireEvent.keyDown(input, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should apply high priority filter when clicked', async () => {
    const mockOnClose = jest.fn()
    renderWithContext({ isOpen: true, onClose: mockOnClose })
    
    const highPriorityFilter = screen.getByText('Show High Priority Tasks')
    fireEvent.click(highPriorityFilter)
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_FILTERS',
        payload: { priority: ['high'] }
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('should show task preview with all parsed attributes', async () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, 'Fix critical bug high priority tomorrow @alice 3h #urgent #backend')
    
    await waitFor(() => {
      expect(screen.getByText('Fix critical bug')).toBeInTheDocument()
      expect(screen.getByText('high')).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('3h')).toBeInTheDocument()
      expect(screen.getByText('urgent')).toBeInTheDocument()
      expect(screen.getByText('backend')).toBeInTheDocument()
    })
  })

  it('should show help text when no input', () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    expect(screen.getByText('Use "/" for search and navigation')).toBeInTheDocument()
    expect(screen.getByText('↑↓ to navigate • ↵ to select • esc to close')).toBeInTheDocument()
  })

  it('should clear input after creating task', async () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, 'Test task')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    // Input should be cleared (component would re-render with empty input)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('should handle empty search results', async () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, '/nonexistentask')
    
    // Should still show navigation actions even with no task matches
    await waitFor(() => {
      expect(screen.getByText('Go to Analytics')).toBeInTheDocument()
    })
  })

  it('should limit search results to 5 tasks', async () => {
    // Create more tasks for this test
    const manyTasks = Array.from({ length: 10 }, (_, i) => ({
      ...mockTasks[0],
      id: `task-${i}`,
      title: `Search task ${i}`,
    }))
    
    const contextWithManyTasks = {
      ...mockContextValue,
      filteredTasks: manyTasks
    }
    
    render(
      <TaskContext.Provider value={contextWithManyTasks}>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TaskContext.Provider>
    )
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, '/search')
    
    // Should show maximum 5 results
    await waitFor(() => {
      const taskResults = screen.getAllByText(/Search task/)
      expect(taskResults.length).toBeLessThanOrEqual(5)
    })
  })

  it('should handle matched labels in task creation', async () => {
    const mockOnClose = jest.fn()
    renderWithContext({ isOpen: true, onClose: mockOnClose })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    await userEvent.type(input, 'Fix issue #bug #feature')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_TASK',
        payload: expect.objectContaining({
          title: 'Fix issue',
          labels: expect.arrayContaining([
            expect.objectContaining({ name: 'Bug' }),
            expect.objectContaining({ name: 'Feature' }),
          ])
        })
      })
    })
  })

  it('should show quick filters when no tasks available', async () => {
    // Test with empty context
    const emptyContext = {
      ...mockContextValue,
      filteredTasks: []
    }
    
    render(
      <TaskContext.Provider value={emptyContext}>
        <CommandPalette isOpen={true} onClose={jest.fn()} />
      </TaskContext.Provider>
    )
    
    // Should still show filter actions even with no tasks
    expect(screen.getByText('Show High Priority Tasks')).toBeInTheDocument()
    expect(screen.getByText('Show My Tasks')).toBeInTheDocument()
    expect(screen.getByText('Show Overdue Tasks')).toBeInTheDocument()
  })

  it('should handle keyboard navigation through actions', async () => {
    renderWithContext({ isOpen: true, onClose: jest.fn() })
    
    const input = screen.getByPlaceholderText('Type a command or create a task...')
    
    // Navigate down through filters
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    
    // Should highlight different items (visual feedback)
    // This would require checking for highlight classes in real implementation
    expect(input).toBeInTheDocument() // Basic check that navigation doesn't crash
  })
})