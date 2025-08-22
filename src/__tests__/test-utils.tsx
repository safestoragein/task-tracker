import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { TaskProvider } from '@/contexts/TaskContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { DndContext } from '@dnd-kit/core'
import { Task, TeamMember, Label, User } from '@/types'

// Mock team members
export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Kushal',
    role: 'Tech Manager',
    email: 'kushal@safestorage.in',
    userRole: 'admin',
  },
  {
    id: '2',
    name: 'Niranjan',
    role: 'QA Manager',
    email: 'niranjan@safestorage.in',
    userRole: 'admin',
  },
  {
    id: '3',
    name: 'Anush',
    role: 'Logistics Manager',
    email: 'anush@safestorage.in',
    userRole: 'member',
  },
  { id: '4', name: 'John Doe', role: 'Developer', email: 'john@example.com', userRole: 'member' },
]

// Mock labels
export const mockLabels: Label[] = [
  { id: '1', name: 'bug', color: '#ef4444' },
  { id: '2', name: 'feature', color: '#3b82f6' },
  { id: '3', name: 'enhancement', color: '#10b981' },
]

// Mock user
export const mockUser: User = {
  id: '1',
  name: 'Kushal',
  role: 'Tech Manager',
  email: 'kushal@safestorage.in',
  userRole: 'admin',
}

// Helper to create mock tasks
export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  priority: 'medium',
  labels: mockLabels.slice(0, 2),
  assigneeId: '1',
  dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  createdAt: new Date(),
  updatedAt: new Date(),
  estimatedHours: undefined,
  actualHours: undefined,
  subtasks: [],
  comments: [],
  attachments: [],
  order: 0,
  ...overrides,
})

// Mock implementations for contexts
export const mockTaskContext = {
  state: {
    teamMembers: mockTeamMembers,
    tasks: [createMockTask()],
    labels: mockLabels,
    groups: [],
    dailyReports: [],
    filters: {
      search: '',
      assignee: [],
      priority: [],
      labels: [],
      dueDate: {},
    },
  },
  dispatch: jest.fn(),
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
  filteredTasks: [createMockTask()],
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
}

export const mockAuthContext = {
  state: {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  },
  dispatch: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  canEditTask: jest.fn(() => true),
  canEditDailyReport: jest.fn(() => true),
}

// Custom render function that wraps with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DndContext>
      <AuthProvider>
        <TaskProvider>{children}</TaskProvider>
      </AuthProvider>
    </DndContext>
  )
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
