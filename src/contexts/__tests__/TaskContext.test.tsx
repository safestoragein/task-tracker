import React from 'react'
import { render, act, waitFor } from '@testing-library/react'
import { TaskProvider, useTask, TaskContext } from '../TaskContext'
import { LocalStorageManager } from '@/lib/localStorage'
import { Task, TaskStatus, TeamMember } from '@/types'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

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

// Mock LocalStorageManager
jest.mock('@/lib/localStorage')

const mockLocalStorageManager = LocalStorageManager as jest.Mocked<typeof LocalStorageManager>

// Test component to access context
function TestComponent() {
  const context = useTask()
  return (
    <div>
      <div data-testid="task-count">{context.state.tasks.length}</div>
      <div data-testid="team-count">{context.state.teamMembers.length}</div>
      <button 
        data-testid="add-task"
        onClick={() => context.addTask({
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo' as TaskStatus,
          priority: 'medium',
          assigneeId: '2', // Niranjan's ID
          labels: [],
          subtasks: [],
          comments: [],
          attachments: [],
        })}
      >
        Add Task
      </button>
      <button 
        data-testid="update-task"
        onClick={() => {
          if (context.state.tasks.length > 0) {
            context.updateTask(context.state.tasks[0].id, { title: 'Updated Task' })
          }
        }}
      >
        Update Task
      </button>
      {context.state.tasks.map(task => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          {task.title} - {task.assigneeId}
        </div>
      ))}
    </div>
  )
}

describe('TaskContext - Task Persistence Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockLocalStorageManager.getTasks.mockReturnValue([])
    mockLocalStorageManager.getTeamMembers.mockReturnValue([
      { id: '2', name: 'Niranjan', role: 'QA Manager', email: 'niranjan@safestorage.in', userRole: 'admin' } as TeamMember
    ])
    mockLocalStorageManager.getLabels.mockReturnValue([])
    mockLocalStorageManager.getDailyReports.mockReturnValue([])
    mockLocalStorageManager.getLastSyncTime.mockReturnValue(null)
    mockLocalStorageManager.initializeDefaults.mockImplementation(() => {})
    mockLocalStorageManager.setTasks.mockImplementation(() => {})
    mockLocalStorageManager.setTeamMembers.mockImplementation(() => {})
    mockLocalStorageManager.setLabels.mockImplementation(() => {})
    mockLocalStorageManager.setDailyReports.mockImplementation(() => {})
    mockLocalStorageManager.setLastSyncTime.mockImplementation(() => {})
  })

  describe('Task Creation and Updates', () => {
    it('should persist task updates to localStorage immediately', async () => {
      const { getByTestId } = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      )

      // Add a task
      await act(async () => {
        getByTestId('add-task').click()
      })

      // Verify task was saved to localStorage
      expect(mockLocalStorageManager.setTasks).toHaveBeenCalled()
      const savedTasks = mockLocalStorageManager.setTasks.mock.calls[0][0]
      expect(savedTasks).toHaveLength(1)
      expect(savedTasks[0].title).toBe('Test Task')
      expect(savedTasks[0].assigneeId).toBe('2') // Niranjan's ID
    })

    it('should persist task updates immediately when task is modified', async () => {
      // Setup: Start with one task
      const existingTask: Task = {
        id: 'test-task-1',
        title: 'Original Task',
        description: 'Original Description',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2', // Niranjan's ID
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([existingTask])

      const { getByTestId } = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      )

      // Update the task
      await act(async () => {
        getByTestId('update-task').click()
      })

      // Verify task update was saved to localStorage
      expect(mockLocalStorageManager.setTasks).toHaveBeenCalled()
      const savedTasks = mockLocalStorageManager.setTasks.mock.calls[0][0]
      expect(savedTasks[0].title).toBe('Updated Task')
      expect(savedTasks[0].assigneeId).toBe('2') // Should maintain Niranjan's assignment
    })
  })

  describe('Data Merging Logic (SET_TASKS_FROM_DB)', () => {
    it('should preserve local task updates when they are newer than database versions', async () => {
      const now = new Date()
      const oldDate = new Date(now.getTime() - 60000) // 1 minute ago
      
      // Local task (newer)
      const localTask: Task = {
        id: 'task-1',
        title: 'Local Updated Task',
        description: 'Updated locally',
        status: 'in-progress',
        priority: 'high',
        assigneeId: '2', // Niranjan
        createdAt: oldDate,
        updatedAt: now, // Newer timestamp
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      // Database task (older)
      const dbTask: Task = {
        id: 'task-1',
        title: 'Old Database Task',
        description: 'Old description',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2', // Niranjan
        createdAt: oldDate,
        updatedAt: oldDate, // Older timestamp
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      // Mock localStorage to return local task
      mockLocalStorageManager.getTasks.mockReturnValue([localTask])

      const TestDBMergeComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          // Simulate database load with SET_TASKS_FROM_DB
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: [dbTask]
          })
        }, [dispatch])

        return (
          <div>
            {state.tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                <span data-testid="title">{task.title}</span>
                <span data-testid="status">{task.status}</span>
                <span data-testid="priority">{task.priority}</span>
              </div>
            ))}
          </div>
        )
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestDBMergeComponent />
        </TaskProvider>
      )

      await waitFor(() => {
        // Should keep the local version (newer timestamp)
        expect(getByTestId('title')).toHaveTextContent('Local Updated Task')
        expect(getByTestId('status')).toHaveTextContent('in-progress')
        expect(getByTestId('priority')).toHaveTextContent('high')
      })

      // Verify merged data was saved to localStorage
      expect(mockLocalStorageManager.setTasks).toHaveBeenCalled()
    })

    it('should use database task when it is newer than local version', async () => {
      const now = new Date()
      const oldDate = new Date(now.getTime() - 60000) // 1 minute ago
      
      // Local task (older)
      const localTask: Task = {
        id: 'task-1',
        title: 'Old Local Task',
        description: 'Old local description',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2', // Niranjan
        createdAt: oldDate,
        updatedAt: oldDate, // Older timestamp
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      // Database task (newer)
      const dbTask: Task = {
        id: 'task-1',
        title: 'Updated Database Task',
        description: 'Updated in database',
        status: 'completed',
        priority: 'high',
        assigneeId: '2', // Niranjan
        createdAt: oldDate,
        updatedAt: now, // Newer timestamp
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([localTask])

      const TestDBMergeComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: [dbTask]
          })
        }, [dispatch])

        return (
          <div>
            {state.tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                <span data-testid="title">{task.title}</span>
                <span data-testid="status">{task.status}</span>
                <span data-testid="priority">{task.priority}</span>
              </div>
            ))}
          </div>
        )
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestDBMergeComponent />
        </TaskProvider>
      )

      await waitFor(() => {
        // Should use the database version (newer timestamp)
        expect(getByTestId('title')).toHaveTextContent('Updated Database Task')
        expect(getByTestId('status')).toHaveTextContent('completed')
        expect(getByTestId('priority')).toHaveTextContent('high')
      })
    })

    it('should preserve local-only tasks that do not exist in database', async () => {
      const localOnlyTask: Task = {
        id: 'local-only-task',
        title: 'Local Only Task',
        description: 'This task exists only locally',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2', // Niranjan
        createdAt: new Date(),
        updatedAt: new Date(),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      const dbTask: Task = {
        id: 'db-task',
        title: 'Database Task',
        description: 'This task exists in database',
        status: 'todo',
        priority: 'medium',
        assigneeId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([localOnlyTask])

      const TestDBMergeComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: [dbTask]
          })
        }, [dispatch])

        return (
          <div data-testid="task-count">{state.tasks.length}</div>
        )
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestDBMergeComponent />
        </TaskProvider>
      )

      await waitFor(() => {
        // Should have both tasks: one from DB and one local-only
        expect(getByTestId('task-count')).toHaveTextContent('2')
      })
    })

    it('should keep current state when database returns empty array', async () => {
      const existingLocalTask: Task = {
        id: 'existing-task',
        title: 'Existing Local Task',
        description: 'Should be preserved',
        status: 'in-progress',
        priority: 'high',
        assigneeId: '2', // Niranjan
        createdAt: new Date(),
        updatedAt: new Date(),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([existingLocalTask])

      const TestDBMergeComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          // Simulate database returning empty array
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: []
          })
        }, [dispatch])

        return (
          <div>
            <div data-testid="task-count">{state.tasks.length}</div>
            {state.tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                {task.title}
              </div>
            ))}
          </div>
        )
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestDBMergeComponent />
        </TaskProvider>
      )

      await waitFor(() => {
        // Should keep the existing local task
        expect(getByTestId('task-count')).toHaveTextContent('1')
        expect(getByTestId('task-existing-task')).toHaveTextContent('Existing Local Task')
      })
    })
  })

  describe('Member-Specific Functionality', () => {
    it('should properly handle tasks assigned to Niranjan after page refresh', async () => {
      const niranjanTask: Task = {
        id: 'niranjan-task',
        title: 'Niranjan\'s Task',
        description: 'Task assigned to Niranjan',
        status: 'in-progress',
        priority: 'high',
        assigneeId: '2', // Niranjan's ID
        createdAt: new Date(),
        updatedAt: new Date(),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([niranjanTask])

      const { getByTestId } = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      )

      // Should load Niranjan's task correctly
      await waitFor(() => {
        expect(getByTestId('task-count')).toHaveTextContent('1')
        expect(getByTestId('task-niranjan-task')).toHaveTextContent('Niranjan\'s Task - 2')
      })
    })

    it('should maintain task assignment during updates', async () => {
      const niranjanTask: Task = {
        id: 'niranjan-task',
        title: 'Original Task',
        description: 'Task assigned to Niranjan',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2', // Niranjan's ID
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([niranjanTask])

      const { getByTestId } = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      )

      // Update the task
      await act(async () => {
        getByTestId('update-task').click()
      })

      // Verify assignment is maintained
      const savedTasks = mockLocalStorageManager.setTasks.mock.calls[0][0]
      expect(savedTasks[0].assigneeId).toBe('2') // Should still be assigned to Niranjan
      expect(savedTasks[0].title).toBe('Updated Task') // But title should be updated
    })
  })

  describe('Offline/Online Scenarios', () => {
    it('should handle task updates when offline', async () => {
      const { getByTestId } = render(
        <TaskProvider>
          <TestComponent />
        </TaskProvider>
      )

      // Add task (will be stored locally)
      await act(async () => {
        getByTestId('add-task').click()
      })

      // Verify task was stored locally even when offline
      expect(mockLocalStorageManager.setTasks).toHaveBeenCalled()
      expect(getByTestId('task-count')).toHaveTextContent('1')
    })

    it('should preserve local changes when coming back online', async () => {
      const localTask: Task = {
        id: 'offline-task',
        title: 'Task Updated Offline',
        description: 'Updated while offline',
        status: 'in-progress',
        priority: 'high',
        assigneeId: '2', // Niranjan
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(), // Recent update
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      const dbTask: Task = {
        id: 'offline-task',
        title: 'Old Task State',
        description: 'Old state from database',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2', // Niranjan
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'), // Old update
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([localTask])

      const TestOnlineComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          // Simulate coming back online and receiving database data
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: [dbTask]
          })
        }, [dispatch])

        return (
          <div>
            {state.tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                <span data-testid="title">{task.title}</span>
                <span data-testid="status">{task.status}</span>
              </div>
            ))}
          </div>
        )
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestOnlineComponent />
        </TaskProvider>
      )

      await waitFor(() => {
        // Should preserve the offline updates (newer timestamp)
        expect(getByTestId('title')).toHaveTextContent('Task Updated Offline')
        expect(getByTestId('status')).toHaveTextContent('in-progress')
      })
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorageManager.getTasks.mockImplementation(() => {
        throw new Error('Corrupted data')
      })

      // Should not crash the app
      expect(() => {
        render(
          <TaskProvider>
            <TestComponent />
          </TaskProvider>
        )
      }).not.toThrow()
    })

    it('should handle missing task properties during merge', async () => {
      const incompleteDbTask: any = {
        id: 'incomplete-task',
        title: 'Incomplete Task',
        // Missing several required properties
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockLocalStorageManager.getTasks.mockReturnValue([])

      const TestIncompleteComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: [incompleteDbTask]
          })
        }, [dispatch])

        return <div data-testid="task-count">{state.tasks.length}</div>
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestIncompleteComponent />
        </TaskProvider>
      )

      // Should handle incomplete data without crashing
      await waitFor(() => {
        expect(getByTestId('task-count')).toHaveTextContent('1')
      })
    })

    it('should handle duplicate task IDs during merge', async () => {
      const task1: Task = {
        id: 'duplicate-id',
        title: 'Local Task',
        description: 'Local version',
        status: 'todo',
        priority: 'medium',
        assigneeId: '2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      const task2: Task = {
        id: 'duplicate-id',
        title: 'Database Task',
        description: 'Database version',
        status: 'completed',
        priority: 'high',
        assigneeId: '2',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        labels: [],
        subtasks: [],
        comments: [],
        attachments: [],
      }

      mockLocalStorageManager.getTasks.mockReturnValue([task1])

      const TestDuplicateComponent = () => {
        const { state, dispatch } = useTask()
        
        React.useEffect(() => {
          dispatch({
            type: 'SET_TASKS_FROM_DB',
            payload: [task2]
          })
        }, [dispatch])

        return (
          <div>
            <div data-testid="task-count">{state.tasks.length}</div>
            {state.tasks.map(task => (
              <div key={`${task.id}-${task.title}`} data-testid={`task-title`}>
                {task.title}
              </div>
            ))}
          </div>
        )
      }

      const { getByTestId } = render(
        <TaskProvider>
          <TestDuplicateComponent />
        </TaskProvider>
      )

      await waitFor(() => {
        // Should have only one task (the newer local version)
        expect(getByTestId('task-count')).toHaveTextContent('1')
        expect(getByTestId('task-title')).toHaveTextContent('Local Task')
      })
    })
  })
})