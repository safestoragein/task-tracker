import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { TaskProvider, useTask } from '../TaskContext'
import { Task, TaskStatus, DailyReport, Group } from '@/types'
import { LocalStorageManager } from '@/lib/localStorage'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn(),
      }),
    })),
  },
}))

jest.mock('@/lib/localStorage')

// Mock data
const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Task 1',
    description: 'First task',
    status: 'todo',
    priority: 'high',
    assigneeId: 'user-1',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
    order: 0,
    estimatedHours: 5,
  },
]

const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Engineering',
    description: 'Engineering team',
    members: ['user-1', 'user-2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    role: 'Developer',
    userRole: 'admin' as const,
  },
]

const mockLabels = [{ id: 'label-1', name: 'bug', color: '#ff0000' }]

const mockDailyReports: DailyReport[] = []

// Wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
)

describe('TaskContext Enhanced Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const mockLocalStorageManager = LocalStorageManager as jest.Mocked<typeof LocalStorageManager>
    mockLocalStorageManager.getTasks.mockReturnValue(mockTasks)
    mockLocalStorageManager.getTeamMembers.mockReturnValue(mockTeamMembers)
    mockLocalStorageManager.getLabels.mockReturnValue(mockLabels)
    mockLocalStorageManager.getDailyReports.mockReturnValue(mockDailyReports)
    mockLocalStorageManager.getLastSyncTime.mockReturnValue(new Date())
    mockLocalStorageManager.setTasks.mockImplementation(() => {})
    mockLocalStorageManager.setTeamMembers.mockImplementation(() => {})
    mockLocalStorageManager.setLabels.mockImplementation(() => {})
    mockLocalStorageManager.setDailyReports.mockImplementation(() => {})
    mockLocalStorageManager.setLastSyncTime.mockImplementation(() => {})
    mockLocalStorageManager.initializeDefaults.mockImplementation(() => {})
  })

  describe('Group Management', () => {
    it('adds a new group', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      const newGroup = {
        name: 'Design',
        description: 'Design team',
        members: ['user-3'],
      }

      await act(async () => {
        await result.current.addGroup(newGroup)
      })

      expect(result.current.state.groups).toHaveLength(1)
    })

    it('updates an existing group', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      // First add a group
      await act(async () => {
        await result.current.addGroup({
          name: 'Test Group',
          description: 'Test description',
          members: [],
        })
      })

      const groupId = result.current.state.groups[0].id

      await act(async () => {
        await result.current.updateGroup(groupId, {
          name: 'Updated Group',
          description: 'Updated description',
        })
      })

      const updatedGroup = result.current.state.groups.find(g => g.id === groupId)
      expect(updatedGroup?.name).toBe('Updated Group')
      expect(updatedGroup?.description).toBe('Updated description')
    })

    it('deletes a group', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      // First add a group
      await act(async () => {
        await result.current.addGroup({
          name: 'Test Group',
          description: 'Test description',
          members: [],
        })
      })

      const groupId = result.current.state.groups[0].id

      await act(async () => {
        await result.current.deleteGroup(groupId)
      })

      expect(result.current.state.groups).toHaveLength(0)
    })

    it('dispatches SET_GROUPS action', () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      act(() => {
        result.current.dispatch({
          type: 'SET_GROUPS',
          payload: mockGroups,
        })
      })

      expect(result.current.state.groups).toEqual(mockGroups)
    })
  })

  describe('Subtask Management', () => {
    it('adds a subtask to a task', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      await act(async () => {
        await result.current.addSubtask('task-1', 'New subtask')
      })

      const task = result.current.state.tasks.find(t => t.id === 'task-1')
      expect(task?.subtasks).toHaveLength(1)
      expect(task?.subtasks[0].title).toBe('New subtask')
      expect(task?.subtasks[0].completed).toBe(false)
    })

    it('toggles subtask completion', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      // First add a subtask
      await act(async () => {
        await result.current.addSubtask('task-1', 'Test subtask')
      })

      const task = result.current.state.tasks.find(t => t.id === 'task-1')
      const subtaskId = task?.subtasks[0].id

      await act(async () => {
        await result.current.toggleSubtask('task-1', subtaskId!)
      })

      const updatedTask = result.current.state.tasks.find(t => t.id === 'task-1')
      expect(updatedTask?.subtasks[0].completed).toBe(true)

      // Toggle again
      await act(async () => {
        await result.current.toggleSubtask('task-1', subtaskId!)
      })

      const toggledTask = result.current.state.tasks.find(t => t.id === 'task-1')
      expect(toggledTask?.subtasks[0].completed).toBe(false)
    })

    it('deletes a subtask', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      // First add a subtask
      await act(async () => {
        await result.current.addSubtask('task-1', 'Test subtask')
      })

      const task = result.current.state.tasks.find(t => t.id === 'task-1')
      const subtaskId = task?.subtasks[0].id

      await act(async () => {
        await result.current.deleteSubtask('task-1', subtaskId!)
      })

      const updatedTask = result.current.state.tasks.find(t => t.id === 'task-1')
      expect(updatedTask?.subtasks).toHaveLength(0)
    })
  })

  describe('Comment Management', () => {
    it('adds a comment to a task', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      await act(async () => {
        await result.current.addComment('task-1', 'user-1', 'Test comment')
      })

      const task = result.current.state.tasks.find(t => t.id === 'task-1')
      expect(task?.comments).toHaveLength(1)
      expect(task?.comments[0].content).toBe('Test comment')
      expect(task?.comments[0].authorId).toBe('user-1')
    })
  })

  describe('Database Operations', () => {
    it('syncs with database successfully', async () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      await act(async () => {
        await result.current.syncWithDatabase()
      })

      expect(result.current.isSyncing).toBe(false)
    })

    it('handles database loading with data', async () => {
      const supabase = require('@/lib/supabase').supabase

      const mockDbTasks = [
        {
          id: 'db-task-1',
          title: 'Database Task',
          description: 'From database',
          status: 'todo',
          priority: 'high',
          assignee_id: 'user-1',
          due_date: '2025-12-31',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          labels: [],
          subtasks: [],
          comments: [],
          attachments: [],
          order_index: 0,
          estimated_hours: 3,
        },
      ]

      supabase.from.mockImplementation((table: string) => {
        if (table === 'tasks') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: mockDbTasks, error: null })),
            })),
          }
        }
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        }
      })

      const { result } = renderHook(() => useTask(), { wrapper })

      await act(async () => {
        await result.current.syncWithDatabase()
      })

      await waitFor(() => {
        expect(LocalStorageManager.setLastSyncTime).toHaveBeenCalled()
      })
    })

    it('handles realtime task updates', async () => {
      const supabase = require('@/lib/supabase').supabase
      let channelCallback: any

      supabase.channel.mockImplementation(() => ({
        on: jest.fn((event, schema, callback) => {
          if (typeof schema === 'function') {
            channelCallback = schema
          } else {
            channelCallback = callback
          }
          return {
            subscribe: jest.fn().mockReturnValue({
              unsubscribe: jest.fn(),
            }),
          }
        }),
      }))

      const { result } = renderHook(() => useTask(), { wrapper })

      // Simulate INSERT event
      if (channelCallback) {
        act(() => {
          channelCallback({
            eventType: 'INSERT',
            new: {
              id: 'realtime-task',
              title: 'Realtime Task',
              status: 'todo',
              priority: 'medium',
            },
          })
        })
      }

      // Simulate UPDATE event
      if (channelCallback) {
        act(() => {
          channelCallback({
            eventType: 'UPDATE',
            new: {
              id: 'task-1',
              title: 'Updated via Realtime',
              status: 'in-progress',
            },
          })
        })
      }

      // Simulate DELETE event
      if (channelCallback) {
        act(() => {
          channelCallback({
            eventType: 'DELETE',
            old: {
              id: 'task-1',
            },
          })
        })
      }
    })
  })

  describe('Filter Operations', () => {
    it('handles SET_FILTERS action', () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      const filters = {
        search: 'test',
        assignee: ['user-1'],
        priority: ['high'],
        labels: [],
        dueDate: undefined,
      }

      act(() => {
        result.current.dispatch({
          type: 'SET_FILTERS',
          payload: filters,
        })
      })

      expect(result.current.state.filters).toEqual(filters)
    })
  })

  describe('Error Recovery', () => {
    it('handles localStorage save errors gracefully', async () => {
      const mockLocalStorageManager = LocalStorageManager as jest.Mocked<typeof LocalStorageManager>
      mockLocalStorageManager.setTasks.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const { result } = renderHook(() => useTask(), { wrapper })

      await act(async () => {
        await result.current.addTask({
          title: 'Test Task',
          description: '',
          status: 'todo',
          priority: 'medium',
          labels: [],
          subtasks: [],
          comments: [],
          attachments: [],
        })
      })

      // Task should still be added to state even if localStorage fails
      expect(result.current.state.tasks).toHaveLength(2)
      consoleSpy.mockRestore()
    })

    it('handles missing supabase gracefully', () => {
      // Mock supabase as null
      jest.resetModules()
      jest.doMock('@/lib/supabase', () => ({
        supabase: null,
      }))

      const { result } = renderHook(() => useTask(), { wrapper })

      // Should not crash
      expect(result.current.state).toBeDefined()
    })
  })

  describe('Computed Values', () => {
    it('calculates stats correctly', () => {
      const { result } = renderHook(() => useTask(), { wrapper })

      // Add tasks with different statuses
      act(() => {
        result.current.dispatch({
          type: 'SET_TASKS',
          payload: [
            { ...mockTasks[0], id: '1', status: 'todo' },
            { ...mockTasks[0], id: '2', status: 'in-progress' },
            { ...mockTasks[0], id: '3', status: 'done' },
            { ...mockTasks[0], id: '4', status: 'done' },
          ],
        })
      })

      const stats = result.current.stats
      expect(stats.total).toBe(4)
      expect(stats.todo).toBe(1)
      expect(stats.inProgress).toBe(1)
      expect(stats.done).toBe(2)
    })
  })
})
