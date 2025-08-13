import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickTaskInput } from '../QuickTaskInput'
import { TaskContext } from '@/contexts/TaskContext'
import { Task, TaskState } from '@/types'

// Mock the useTask hook
const mockDispatch = jest.fn()
const mockState: TaskState = {
  tasks: [],
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
  filteredTasks: []
}

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <TaskContext.Provider value={mockContextValue}>
      {component}
    </TaskContext.Provider>
  )
}

describe('QuickTaskInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render input field', () => {
    renderWithContext(<QuickTaskInput />)
    
    expect(screen.getByPlaceholderText(/Quick add:/)).toBeInTheDocument()
  })

  it('should show help button', () => {
    renderWithContext(<QuickTaskInput />)
    
    expect(screen.getByTestId('help-button')).toBeInTheDocument()
  })

  it('should create task on form submit', async () => {
    const mockOnTaskCreated = jest.fn()
    renderWithContext(<QuickTaskInput onTaskCreated={mockOnTaskCreated} />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    const submitButton = screen.getByTestId('submit-button')
    
    await userEvent.type(input, 'Fix login bug')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_TASK',
        payload: expect.objectContaining({
          title: 'Fix login bug',
          status: 'todo',
          priority: 'medium',
        })
      })
    })
  })

  it('should parse natural language input', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    
    await userEvent.type(input, 'Fix bug high priority @alice 2h')
    
    // Should show preview
    await waitFor(() => {
      expect(screen.getByText('Fix bug')).toBeInTheDocument()
      expect(screen.getByText('high', { exact: false })).toBeInTheDocument()
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('2h')).toBeInTheDocument()
    })
  })

  it('should show preview when input is focused and has content', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    
    await userEvent.click(input)
    await userEvent.type(input, 'Test task')
    
    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeInTheDocument()
    })
  })

  it('should clear input after successful submission', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    const submitButton = screen.getByTestId('submit-button')
    
    await userEvent.type(input, 'Test task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should not submit empty input', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.click(submitButton)
    
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should handle Enter key submission', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    
    await userEvent.type(input, 'Test task{enter}')
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'ADD_TASK',
        payload: expect.objectContaining({
          title: 'Test task',
        })
      })
    })
  })

  it('should show help popover with examples', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const helpButton = screen.getByTestId('help-button')
    
    await userEvent.click(helpButton)
    
    await waitFor(() => {
      expect(screen.getByText('Quick Task Examples:')).toBeInTheDocument()
      expect(screen.getByText(/Fix login bug high priority tomorrow @alice 2h #bug/)).toBeInTheDocument()
    })
  })

  it('should match labels correctly', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    const submitButton = screen.getByTestId('submit-button')
    
    await userEvent.type(input, 'Fix issue #bug #feature')
    fireEvent.click(submitButton)
    
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

  it('should handle assignee that does not exist', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    
    await userEvent.type(input, 'Test task @nonexistent')
    
    // Preview should show without assignee
    await waitFor(() => {
      expect(screen.getByText('Test task')).toBeInTheDocument()
      expect(screen.queryByText('nonexistent')).not.toBeInTheDocument()
    })
  })

  it('should call onTaskCreated callback when provided', async () => {
    const mockOnTaskCreated = jest.fn()
    renderWithContext(<QuickTaskInput onTaskCreated={mockOnTaskCreated} />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    const submitButton = screen.getByTestId('submit-button')
    
    await userEvent.type(input, 'Test task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnTaskCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test task',
        })
      )
    })
  })

  it('should apply custom className', () => {
    renderWithContext(<QuickTaskInput className="custom-class" />)
    
    const container = screen.getByPlaceholderText(/Quick add:/).closest('.custom-class')
    expect(container).toBeInTheDocument()
  })

  it('should disable submit button when input is empty', () => {
    renderWithContext(<QuickTaskInput />)
    
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when input has content', async () => {
    renderWithContext(<QuickTaskInput />)
    
    const input = screen.getByPlaceholderText(/Quick add:/)
    const submitButton = screen.getByTestId('submit-button')
    
    await userEvent.type(input, 'Test')
    
    expect(submitButton).not.toBeDisabled()
  })
})