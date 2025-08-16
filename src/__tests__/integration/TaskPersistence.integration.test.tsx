import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskProvider, useTask } from '@/contexts/TaskContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LocalStorageManager } from '@/lib/localStorage'
import { Task, TaskStatus } from '@/types'

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      })),
    })),
  },
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

// Integrated test component simulating real app behavior
function IntegratedTaskManager() {
  const { state: authState, login, logout } = useAuth()
  const { 
    state: taskState, 
    addTask, 
    updateTask, 
    deleteTask,
    filteredTasks,
    dispatch 
  } = useTask()
  
  const [taskTitle, setTaskTitle] = React.useState('')
  const [assigneeId, setAssigneeId] = React.useState('2') // Default to Niranjan
  
  const handleAddTask = async () => {
    if (taskTitle) {
      await addTask({
        title: taskTitle,
        description: 'Test description',
        status: 'todo' as TaskStatus,
        priority: 'medium',
        assigneeId,
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      })
      setTaskTitle('')
    }
  }
  
  const handleUpdateTask = async (taskId: string, newTitle: string) => {
    await updateTask(taskId, { title: newTitle })
  }
  
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
  }
  
  const simulatePageRefresh = () => {
    // Simulate SET_TASKS_FROM_DB action that happens on page refresh
    const dbTasks = taskState.tasks.map(task => ({
      ...task,
      updatedAt: new Date(task.updatedAt.getTime() - 60000) // Make DB version older
    }))
    dispatch({ type: 'SET_TASKS_FROM_DB', payload: dbTasks })
  }
  
  return (
    <div>
      {/* Auth Section */}
      <div data-testid="auth-section">
        {authState.isAuthenticated ? (
          <>
            <div data-testid="logged-in-user">{authState.user?.name}</div>
            <button onClick={logout} data-testid="logout-btn">Logout</button>
          </>
        ) : (
          <button 
            onClick={() => login('niranjan@safestorage.in')} 
            data-testid="login-btn"
          >
            Login as Niranjan
          </button>
        )}
      </div>
      
      {/* Task Management Section */}
      <div data-testid="task-section">
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Task title"
          data-testid="task-title-input"
        />
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          data-testid="assignee-select"
        >
          <option value="2">Niranjan</option>
          <option value="3">Anush</option>
          <option value="4">Harsha</option>
        </select>
        <button onClick={handleAddTask} data-testid="add-task-btn">
          Add Task
        </button>
        <button onClick={simulatePageRefresh} data-testid="refresh-btn">
          Simulate Refresh
        </button>
      </div>
      
      {/* Task List */}
      <div data-testid="task-list">
        <div data-testid="task-count">Tasks: {filteredTasks.length}</div>
        {filteredTasks.map(task => (
          <div key={task.id} data-testid={`task-item-${task.id}`}>
            <span data-testid={`task-title-${task.id}`}>{task.title}</span>
            <span data-testid={`task-assignee-${task.id}`}>
              Assigned to: {taskState.teamMembers.find(m => m.id === task.assigneeId)?.name || 'Unknown'}
            </span>
            <button
              onClick={() => handleUpdateTask(task.id, `Updated: ${task.title}`)}
              data-testid={`update-btn-${task.id}`}
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              data-testid={`delete-btn-${task.id}`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

describe('Task Persistence Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
    
    // Initialize with default data
    LocalStorageManager.initializeDefaults()
  })

  describe('Complete User Flow for Niranjan', () => {
    it('should handle complete task lifecycle for Niranjan with persistence', async () => {
      const user = userEvent.setup()
      
      const { rerender } = render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Step 1: Login as Niranjan
      await user.click(screen.getByTestId('login-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('logged-in-user')).toHaveTextContent('Niranjan')
      })

      // Step 2: Add a task
      await user.type(screen.getByTestId('task-title-input'), 'Niranjan Task 1')
      await user.click(screen.getByTestId('add-task-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 1')
      })

      // Verify task is displayed correctly
      const taskId = screen.getByText('Niranjan Task 1').closest('[data-testid^="task-item-"]')?.getAttribute('data-testid')?.replace('task-item-', '')
      expect(taskId).toBeDefined()
      expect(screen.getByTestId(`task-assignee-${taskId}`)).toHaveTextContent('Assigned to: Niranjan')

      // Step 3: Update the task
      await user.click(screen.getByTestId(`update-btn-${taskId}`))
      
      await waitFor(() => {
        expect(screen.getByTestId(`task-title-${taskId}`)).toHaveTextContent('Updated: Niranjan Task 1')
      })

      // Step 4: Simulate page refresh
      await user.click(screen.getByTestId('refresh-btn'))

      // Task should still be there with updated title
      await waitFor(() => {
        expect(screen.getByTestId(`task-title-${taskId}`)).toHaveTextContent('Updated: Niranjan Task 1')
        expect(screen.getByTestId(`task-assignee-${taskId}`)).toHaveTextContent('Assigned to: Niranjan')
      })

      // Step 5: Add another task
      await user.clear(screen.getByTestId('task-title-input'))
      await user.type(screen.getByTestId('task-title-input'), 'Niranjan Task 2')
      await user.click(screen.getByTestId('add-task-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2')
      })

      // Step 6: Simulate another refresh
      await user.click(screen.getByTestId('refresh-btn'))

      // Both tasks should persist
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2')
        expect(screen.getByText('Updated: Niranjan Task 1')).toBeInTheDocument()
        expect(screen.getByText('Niranjan Task 2')).toBeInTheDocument()
      })
    })

    it('should maintain task assignments across refresh', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Login as Niranjan
      await user.click(screen.getByTestId('login-btn'))

      // Add tasks for different team members
      await user.type(screen.getByTestId('task-title-input'), 'Task for Niranjan')
      await user.selectOptions(screen.getByTestId('assignee-select'), '2')
      await user.click(screen.getByTestId('add-task-btn'))

      await user.clear(screen.getByTestId('task-title-input'))
      await user.type(screen.getByTestId('task-title-input'), 'Task for Anush')
      await user.selectOptions(screen.getByTestId('assignee-select'), '3')
      await user.click(screen.getByTestId('add-task-btn'))

      await user.clear(screen.getByTestId('task-title-input'))
      await user.type(screen.getByTestId('task-title-input'), 'Task for Harsha')
      await user.selectOptions(screen.getByTestId('assignee-select'), '4')
      await user.click(screen.getByTestId('add-task-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3')
      })

      // Verify initial assignments
      const niranjanTaskElement = screen.getByText('Task for Niranjan').closest('[data-testid^="task-item-"]')
      const anushTaskElement = screen.getByText('Task for Anush').closest('[data-testid^="task-item-"]')
      const harshaTaskElement = screen.getByText('Task for Harsha').closest('[data-testid^="task-item-"]')

      const niranjanTaskId = niranjanTaskElement?.getAttribute('data-testid')?.replace('task-item-', '')
      const anushTaskId = anushTaskElement?.getAttribute('data-testid')?.replace('task-item-', '')
      const harshaTaskId = harshaTaskElement?.getAttribute('data-testid')?.replace('task-item-', '')

      expect(screen.getByTestId(`task-assignee-${niranjanTaskId}`)).toHaveTextContent('Assigned to: Niranjan')
      expect(screen.getByTestId(`task-assignee-${anushTaskId}`)).toHaveTextContent('Assigned to: Anush')
      expect(screen.getByTestId(`task-assignee-${harshaTaskId}`)).toHaveTextContent('Assigned to: Harsha')

      // Simulate refresh
      await user.click(screen.getByTestId('refresh-btn'))

      // Verify assignments are maintained
      await waitFor(() => {
        expect(screen.getByTestId(`task-assignee-${niranjanTaskId}`)).toHaveTextContent('Assigned to: Niranjan')
        expect(screen.getByTestId(`task-assignee-${anushTaskId}`)).toHaveTextContent('Assigned to: Anush')
        expect(screen.getByTestId(`task-assignee-${harshaTaskId}`)).toHaveTextContent('Assigned to: Harsha')
      })
    })

    it('should handle rapid task updates without data loss', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Login
      await user.click(screen.getByTestId('login-btn'))

      // Add initial task
      await user.type(screen.getByTestId('task-title-input'), 'Rapid Update Task')
      await user.click(screen.getByTestId('add-task-btn'))

      await waitFor(() => {
        expect(screen.getByText('Rapid Update Task')).toBeInTheDocument()
      })

      const taskElement = screen.getByText('Rapid Update Task').closest('[data-testid^="task-item-"]')
      const taskId = taskElement?.getAttribute('data-testid')?.replace('task-item-', '')

      // Perform rapid updates
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByTestId(`update-btn-${taskId}`))
        // Don't wait between updates
      }

      // Wait for final state
      await waitFor(() => {
        const title = screen.getByTestId(`task-title-${taskId}`).textContent
        expect(title).toContain('Updated:')
      })

      // Simulate refresh
      await user.click(screen.getByTestId('refresh-btn'))

      // Task should still exist with updates
      await waitFor(() => {
        expect(screen.getByTestId(`task-title-${taskId}`)).toBeInTheDocument()
        const title = screen.getByTestId(`task-title-${taskId}`).textContent
        expect(title).toContain('Updated:')
      })
    })

    it('should handle task deletion and persistence', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Login
      await user.click(screen.getByTestId('login-btn'))

      // Add multiple tasks
      const taskTitles = ['Task 1', 'Task 2', 'Task 3']
      for (const title of taskTitles) {
        await user.clear(screen.getByTestId('task-title-input'))
        await user.type(screen.getByTestId('task-title-input'), title)
        await user.click(screen.getByTestId('add-task-btn'))
      }

      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 3')
      })

      // Delete Task 2
      const task2Element = screen.getByText('Task 2').closest('[data-testid^="task-item-"]')
      const task2Id = task2Element?.getAttribute('data-testid')?.replace('task-item-', '')
      
      await user.click(screen.getByTestId(`delete-btn-${task2Id}`))

      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2')
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
      })

      // Refresh
      await user.click(screen.getByTestId('refresh-btn'))

      // Verify Task 2 is still deleted
      await waitFor(() => {
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 2')
        expect(screen.getByText('Task 1')).toBeInTheDocument()
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
        expect(screen.getByText('Task 3')).toBeInTheDocument()
      })
    })
  })

  describe('Offline/Online Simulation', () => {
    it('should maintain local changes when database is unavailable', async () => {
      const user = userEvent.setup()
      
      // Mock database as unavailable
      const { supabase } = require('@/lib/supabase')
      supabase.from.mockImplementation(() => ({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.reject(new Error('Network error'))),
        })),
        insert: jest.fn(() => Promise.reject(new Error('Network error'))),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.reject(new Error('Network error'))),
        })),
      }))

      render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Login
      await user.click(screen.getByTestId('login-btn'))

      // Add task while "offline"
      await user.type(screen.getByTestId('task-title-input'), 'Offline Task')
      await user.click(screen.getByTestId('add-task-btn'))

      // Task should be added locally despite database error
      await waitFor(() => {
        expect(screen.getByText('Offline Task')).toBeInTheDocument()
        expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 1')
      })

      // Update task while "offline"
      const taskElement = screen.getByText('Offline Task').closest('[data-testid^="task-item-"]')
      const taskId = taskElement?.getAttribute('data-testid')?.replace('task-item-', '')
      
      await user.click(screen.getByTestId(`update-btn-${taskId}`))

      await waitFor(() => {
        expect(screen.getByTestId(`task-title-${taskId}`)).toHaveTextContent('Updated: Offline Task')
      })

      // Simulate refresh while still "offline"
      await user.click(screen.getByTestId('refresh-btn'))

      // Local changes should persist
      await waitFor(() => {
        expect(screen.getByTestId(`task-title-${taskId}`)).toHaveTextContent('Updated: Offline Task')
      })
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty task title gracefully', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Login
      await user.click(screen.getByTestId('login-btn'))

      // Try to add task with empty title
      await user.click(screen.getByTestId('add-task-btn'))

      // No task should be added
      expect(screen.getByTestId('task-count')).toHaveTextContent('Tasks: 0')
    })

    it('should handle logout and login with task persistence', async () => {
      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TaskProvider>
            <IntegratedTaskManager />
          </TaskProvider>
        </AuthProvider>
      )

      // Login
      await user.click(screen.getByTestId('login-btn'))

      // Add task
      await user.type(screen.getByTestId('task-title-input'), 'Persistent Task')
      await user.click(screen.getByTestId('add-task-btn'))

      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument()
      })

      // Logout
      await user.click(screen.getByTestId('logout-btn'))

      await waitFor(() => {
        expect(screen.queryByTestId('logged-in-user')).not.toBeInTheDocument()
      })

      // Login again
      await user.click(screen.getByTestId('login-btn'))

      // Task should still be there
      await waitFor(() => {
        expect(screen.getByText('Persistent Task')).toBeInTheDocument()
      })
    })
  })
})