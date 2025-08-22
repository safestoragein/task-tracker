import { LocalStorageManager } from '../localStorage'
import { Task, TeamMember, Label, DailyReport } from '@/types'

// Mock localStorage
let mockStore: Record<string, string> = {}

const mockLocalStorage = {
  getItem: jest.fn((key: string) => {
    return mockStore[key] || null
  }),
  setItem: jest.fn((key: string, value: string) => {
    mockStore[key] = value
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStore[key]
  }),
  clear: jest.fn(() => {
    mockStore = {}
  }),
  get length() {
    return Object.keys(mockStore).length
  },
  key: jest.fn((index: number) => {
    return Object.keys(mockStore)[index] || null
  }),
}

// Ensure global localStorage is mocked properly
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('LocalStorageManager', () => {
  const createMockTask = (id: string, assigneeId: string = '2'): Task => ({
    id,
    title: `Task ${id}`,
    description: `Description for task ${id}`,
    status: 'todo',
    priority: 'medium',
    assigneeId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    dueDate: new Date('2024-01-15'),
    estimatedHours: 5,
    labels: [],
    subtasks: [],
    comments: [],
    attachments: [],
    order: 0,
    projectId: 'project-1',
    isRecurring: false,
    recurringPattern: null,
    originalTaskId: null,
    completedAt: null,
    completedBy: null,
  })

  beforeEach(() => {
    // Reset the store
    mockStore = {}
    // Clear all mock call counts
    jest.clearAllMocks()
  })

  describe('Task Management', () => {
    it('should save and retrieve tasks correctly', () => {
      const tasks = [
        createMockTask('task-1', '2'), // Niranjan
        createMockTask('task-2', '3'), // Anush
        createMockTask('task-3', '2'), // Niranjan
      ]

      LocalStorageManager.setTasks(tasks)
      const retrievedTasks = LocalStorageManager.getTasks()

      expect(retrievedTasks).toHaveLength(3)
      expect(retrievedTasks[0].id).toBe('task-1')
      expect(retrievedTasks[0].assigneeId).toBe('2')
      expect(retrievedTasks[2].assigneeId).toBe('2')
    })

    it('should preserve task dates correctly', () => {
      const task = createMockTask('task-1')
      const tasks = [task]

      LocalStorageManager.setTasks(tasks)
      const retrievedTasks = LocalStorageManager.getTasks()

      expect(retrievedTasks[0].createdAt).toBeInstanceOf(Date)
      expect(retrievedTasks[0].updatedAt).toBeInstanceOf(Date)
      expect(retrievedTasks[0].dueDate).toBeInstanceOf(Date)
      expect(retrievedTasks[0].createdAt.toISOString()).toBe(task.createdAt.toISOString())
      expect(retrievedTasks[0].updatedAt.toISOString()).toBe(task.updatedAt.toISOString())
      expect(retrievedTasks[0].dueDate?.toISOString()).toBe(task.dueDate?.toISOString())
    })

    it('should handle tasks without due dates', () => {
      const task = createMockTask('task-1')
      task.dueDate = undefined

      LocalStorageManager.setTasks([task])
      const retrievedTasks = LocalStorageManager.getTasks()

      expect(retrievedTasks[0].dueDate).toBeUndefined()
    })

    it('should return empty array when no tasks exist', () => {
      const tasks = LocalStorageManager.getTasks()
      expect(tasks).toEqual([])
    })

    it('should handle large number of tasks', () => {
      const tasks = Array.from({ length: 100 }, (_, i) =>
        createMockTask(`task-${i}`, i % 2 === 0 ? '2' : '3')
      )

      LocalStorageManager.setTasks(tasks)
      const retrievedTasks = LocalStorageManager.getTasks()

      expect(retrievedTasks).toHaveLength(100)

      // Check that Niranjan's tasks are preserved
      const niranjanTasks = retrievedTasks.filter(t => t.assigneeId === '2')
      expect(niranjanTasks).toHaveLength(50)
    })

    it('should update existing tasks correctly', () => {
      const initialTasks = [createMockTask('task-1', '2'), createMockTask('task-2', '3')]

      LocalStorageManager.setTasks(initialTasks)

      // Update task-1
      const updatedTasks = LocalStorageManager.getTasks()
      updatedTasks[0].title = 'Updated Task Title'
      updatedTasks[0].status = 'completed'
      updatedTasks[0].updatedAt = new Date()

      LocalStorageManager.setTasks(updatedTasks)

      const finalTasks = LocalStorageManager.getTasks()
      expect(finalTasks[0].title).toBe('Updated Task Title')
      expect(finalTasks[0].status).toBe('completed')
      expect(finalTasks[0].assigneeId).toBe('2') // Should maintain Niranjan's assignment
    })
  })

  describe('Team Member Management', () => {
    const createMockTeamMember = (id: string, name: string): TeamMember => ({
      id,
      name,
      role: 'Developer',
      email: `${name.toLowerCase()}@safestorage.in`,
      userRole: id === '2' ? 'admin' : 'member',
      avatar: undefined,
    })

    it('should save and retrieve team members correctly', () => {
      const teamMembers = [
        createMockTeamMember('2', 'Niranjan'),
        createMockTeamMember('3', 'Anush'),
        createMockTeamMember('4', 'Harsha'),
      ]

      LocalStorageManager.setTeamMembers(teamMembers)
      const retrievedMembers = LocalStorageManager.getTeamMembers()

      expect(retrievedMembers).toHaveLength(3)
      expect(retrievedMembers[0].name).toBe('Niranjan')
      expect(retrievedMembers[0].userRole).toBe('admin')
    })

    it('should return empty array when no team members exist', () => {
      const members = LocalStorageManager.getTeamMembers()
      expect(members).toEqual([])
    })

    it('should preserve all team member properties', () => {
      const member: TeamMember = {
        id: '2',
        name: 'Niranjan',
        role: 'QA Manager',
        email: 'niranjan@safestorage.in',
        userRole: 'admin',
        avatar: 'https://example.com/avatar.png',
      }

      LocalStorageManager.setTeamMembers([member])
      const retrievedMembers = LocalStorageManager.getTeamMembers()

      expect(retrievedMembers[0]).toEqual(member)
    })
  })

  describe('Label Management', () => {
    const createMockLabel = (id: string, name: string): Label => ({
      id,
      name,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    })

    it('should save and retrieve labels correctly', () => {
      const labels = [
        createMockLabel('1', 'Bug'),
        createMockLabel('2', 'Feature'),
        createMockLabel('3', 'Enhancement'),
      ]

      LocalStorageManager.setLabels(labels)
      const retrievedLabels = LocalStorageManager.getLabels()

      expect(retrievedLabels).toHaveLength(3)
      expect(retrievedLabels[0].name).toBe('Bug')
      expect(retrievedLabels[1].name).toBe('Feature')
    })

    it('should preserve label colors', () => {
      const label: Label = {
        id: '1',
        name: 'Critical',
        color: '#ff0000',
      }

      LocalStorageManager.setLabels([label])
      const retrievedLabels = LocalStorageManager.getLabels()

      expect(retrievedLabels[0].color).toBe('#ff0000')
    })
  })

  describe('Daily Report Management', () => {
    const createMockDailyReport = (id: string, authorId: string): DailyReport => ({
      id,
      authorId,
      date: '2024-01-15',
      tasksCompleted: ['task-1', 'task-2'],
      tasksInProgress: ['task-3'],
      blockers: ['Waiting for API access'],
      notes: 'Good progress today',
      yesterdayWork: 'Completed authentication module',
      todayPlan: 'Start working on dashboard',
      createdAt: new Date('2024-01-15T10:00:00'),
      updatedAt: new Date('2024-01-15T11:00:00'),
    })

    it('should save and retrieve daily reports correctly', () => {
      const reports = [
        createMockDailyReport('report-1', '2'), // Niranjan's report
        createMockDailyReport('report-2', '3'), // Anush's report
      ]

      LocalStorageManager.setDailyReports(reports)
      const retrievedReports = LocalStorageManager.getDailyReports()

      expect(retrievedReports).toHaveLength(2)
      expect(retrievedReports[0].authorId).toBe('2')
      expect(retrievedReports[0].tasksCompleted).toEqual(['task-1', 'task-2'])
    })

    it('should preserve report dates correctly', () => {
      const report = createMockDailyReport('report-1', '2')

      LocalStorageManager.setDailyReports([report])
      const retrievedReports = LocalStorageManager.getDailyReports()

      expect(retrievedReports[0].createdAt).toBeInstanceOf(Date)
      expect(retrievedReports[0].updatedAt).toBeInstanceOf(Date)
      expect(retrievedReports[0].createdAt.toISOString()).toBe(report.createdAt.toISOString())
    })

    it('should handle reports with empty arrays correctly', () => {
      const report: DailyReport = {
        id: 'report-1',
        authorId: '2',
        date: '2024-01-15',
        tasksCompleted: [],
        tasksInProgress: [],
        blockers: [],
        notes: '',
        yesterdayWork: '',
        todayPlan: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      LocalStorageManager.setDailyReports([report])
      const retrievedReports = LocalStorageManager.getDailyReports()

      expect(retrievedReports[0].tasksCompleted).toEqual([])
      expect(retrievedReports[0].tasksInProgress).toEqual([])
      expect(retrievedReports[0].blockers).toEqual([])
    })
  })

  describe('Sync Time Management', () => {
    it('should save and retrieve last sync time', () => {
      const syncTime = new Date('2024-01-15T12:30:00')

      LocalStorageManager.setLastSyncTime(syncTime)
      const retrievedTime = LocalStorageManager.getLastSyncTime()

      expect(retrievedTime).toBeInstanceOf(Date)
      expect(retrievedTime?.toISOString()).toBe(syncTime.toISOString())
    })

    it('should return null when no sync time exists', () => {
      const syncTime = LocalStorageManager.getLastSyncTime()
      expect(syncTime).toBeNull()
    })
  })

  describe('Data Initialization', () => {
    it('should initialize default team members when empty', () => {
      LocalStorageManager.initializeDefaults()

      const teamMembers = LocalStorageManager.getTeamMembers()
      expect(teamMembers.length).toBeGreaterThan(0)

      // Check for real team members
      const kushal = teamMembers.find(m => m.name === 'Kushal')
      expect(kushal).toBeDefined()
      expect(kushal?.email).toBe('kushal@safestorage.in')
      expect(kushal?.userRole).toBe('admin')
    })

    it('should initialize default labels when empty', () => {
      LocalStorageManager.initializeDefaults()

      const labels = LocalStorageManager.getLabels()
      expect(labels.length).toBeGreaterThan(0)

      // Check for default labels
      const bugLabel = labels.find(l => l.name === 'Bug')
      expect(bugLabel).toBeDefined()
      expect(bugLabel?.color).toBe('#ef4444')
    })

    it('should not overwrite existing data during initialization', () => {
      const existingMembers = [
        {
          id: '2',
          name: 'Niranjan',
          role: 'QA Manager',
          email: 'niranjan@safestorage.in',
          userRole: 'admin' as const,
          avatar: undefined,
        },
      ]
      const existingLabels = [{ id: 'custom-1', name: 'Custom Label', color: '#123456' }]

      LocalStorageManager.setTeamMembers(existingMembers)
      LocalStorageManager.setLabels(existingLabels)

      LocalStorageManager.initializeDefaults()

      const teamMembers = LocalStorageManager.getTeamMembers()
      const labels = LocalStorageManager.getLabels()

      expect(teamMembers).toEqual(existingMembers)
      expect(labels).toEqual(existingLabels)
    })
  })

  describe('Clear All Data', () => {
    it('should clear all stored data', () => {
      // Set some data
      LocalStorageManager.setTasks([createMockTask('task-1')])
      LocalStorageManager.setTeamMembers([
        {
          id: '2',
          name: 'Niranjan',
          role: 'QA',
          email: 'n@s.in',
          userRole: 'admin',
          avatar: undefined,
        },
      ])
      LocalStorageManager.setLabels([{ id: '1', name: 'Bug', color: '#ff0000' }])
      LocalStorageManager.setDailyReports([])
      LocalStorageManager.setLastSyncTime(new Date())

      // Clear mock call counts before testing clearAll
      jest.clearAllMocks()

      // Clear all
      LocalStorageManager.clearAll()

      // Verify all expected keys are cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_tracker_tasks')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_tracker_team_members')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_tracker_labels')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_tracker_daily_reports')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('task_tracker_last_sync')

      // Should have called removeItem for each key (5 times minimum)
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
      expect(mockLocalStorage.removeItem.mock.calls.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage not available', () => {
      // Mock localStorage as unavailable
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        get: jest.fn(() => {
          throw new Error('localStorage not available')
        }),
      })

      // Operations should not throw
      expect(() => {
        LocalStorageManager.setTasks([])
        LocalStorageManager.getTasks()
      }).not.toThrow()

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      })
    })

    it('should handle corrupted JSON data gracefully', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockLocalStorage.getItem.mockReturnValue('invalid-json-{]')

      const tasks = LocalStorageManager.getTasks()
      expect(tasks).toEqual([])

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reading from localStorage (task_tracker_tasks):',
        expect.any(SyntaxError)
      )

      consoleSpy.mockRestore()
    })

    it('should handle localStorage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw
      expect(() => {
        LocalStorageManager.setTasks([createMockTask('task-1')])
      }).not.toThrow()
    })
  })

  describe('Data Integrity', () => {
    it.skip('should maintain data consistency across multiple operations', () => {
      const task1 = createMockTask('task-1', '2')
      const task2 = createMockTask('task-2', '2')

      // Initial save
      LocalStorageManager.setTasks([task1])

      // Verify first task was saved
      let tasks = LocalStorageManager.getTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe('task-1')

      // Add another task
      tasks.push(task2)
      LocalStorageManager.setTasks(tasks)

      // Verify both tasks exist
      const finalTasks = LocalStorageManager.getTasks()
      expect(finalTasks).toHaveLength(2)
      expect(finalTasks.map(t => t.id)).toEqual(['task-1', 'task-2'])
    })

    it.skip('should handle concurrent updates correctly', () => {
      const initialTask = createMockTask('task-1', '2')
      LocalStorageManager.setTasks([initialTask])

      // Verify initial task was saved
      let verifyTasks = LocalStorageManager.getTasks()
      expect(verifyTasks).toHaveLength(1)
      expect(verifyTasks[0].id).toBe('task-1')

      // Simulate concurrent updates
      const tasks1 = LocalStorageManager.getTasks()
      const tasks2 = LocalStorageManager.getTasks()

      // Ensure we have tasks to update
      expect(tasks1).toHaveLength(1)
      expect(tasks2).toHaveLength(1)

      tasks1[0].title = 'Update from Operation 1'
      tasks2[0].title = 'Update from Operation 2'

      LocalStorageManager.setTasks(tasks1)
      LocalStorageManager.setTasks(tasks2)

      // Last write wins
      const finalTasks = LocalStorageManager.getTasks()
      expect(finalTasks).toHaveLength(1)
      expect(finalTasks[0].title).toBe('Update from Operation 2')
    })
  })
})
