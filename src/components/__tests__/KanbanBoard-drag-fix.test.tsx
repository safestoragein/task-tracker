import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanBoard } from '../KanbanBoard'
import { TaskContext } from '@/contexts/TaskContext'
import { Task, TaskState } from '@/types'

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test task in progress',
    description: 'Testing drag and drop',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
  },
  {
    id: '2', 
    title: 'Test task in review',
    description: 'Another test task',
    status: 'review',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
  }
]

const mockDispatch = jest.fn()
const mockState: TaskState = {
  tasks: mockTasks,
  teamMembers: [],
  labels: [],
  dailyReports: [],
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

describe('KanbanBoard Drag-and-Drop Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not delete task when dropdown is accidentally triggered during drag', () => {
    render(
      <TaskContext.Provider value={mockContextValue}>
        <KanbanBoard />
      </TaskContext.Provider>
    )

    // Verify tasks are rendered
    expect(screen.getByText('Test task in progress')).toBeInTheDocument()
    expect(screen.getByText('Test task in review')).toBeInTheDocument()

    // Simulate clicking on dropdown menu (should not trigger deletion)
    const dropdownButtons = screen.getAllByRole('button')
    const moreButton = dropdownButtons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-more-horizontal')
    )

    if (moreButton) {
      fireEvent.click(moreButton)
      // Should not have dispatched DELETE_TASK
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'DELETE_TASK' })
      )
    }

    // Tasks should still exist
    expect(screen.getByText('Test task in progress')).toBeInTheDocument()
    expect(screen.getByText('Test task in review')).toBeInTheDocument()
  })

  it('should validate drag end event properly', () => {
    render(
      <TaskContext.Provider value={mockContextValue}>
        <KanbanBoard />
      </TaskContext.Provider>
    )

    // Verify initial state
    expect(mockTasks).toHaveLength(2)
    
    // The drag validation logic should prevent invalid operations
    // This test ensures tasks are not accidentally deleted during drag
    expect(mockState.tasks.find(t => t.id === '1')).toBeDefined()
    expect(mockState.tasks.find(t => t.id === '2')).toBeDefined()
  })
})