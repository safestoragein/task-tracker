// Local storage utilities for offline support and data persistence

import { Task, TeamMember, Label, DailyReport } from '@/types'

const STORAGE_KEYS = {
  TASKS: 'task_tracker_tasks',
  TEAM_MEMBERS: 'task_tracker_team_members',
  LABELS: 'task_tracker_labels',
  DAILY_REPORTS: 'task_tracker_daily_reports',
  LAST_SYNC: 'task_tracker_last_sync',
} as const

export class LocalStorageManager {
  // Check if localStorage is available
  private static isAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Generic storage methods
  private static getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  private static setItem<T>(key: string, value: T): void {
    if (!this.isAvailable()) return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
    }
  }

  // Task methods
  static getTasks(): Task[] {
    const tasks = this.getItem<any[]>(STORAGE_KEYS.TASKS, [])
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }))
  }

  static setTasks(tasks: Task[]): void {
    const serializedTasks = tasks.map(task => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString(),
    }))
    this.setItem(STORAGE_KEYS.TASKS, serializedTasks)
  }

  // Team member methods
  static getTeamMembers(): TeamMember[] {
    return this.getItem<TeamMember[]>(STORAGE_KEYS.TEAM_MEMBERS, [])
  }

  static setTeamMembers(members: TeamMember[]): void {
    this.setItem(STORAGE_KEYS.TEAM_MEMBERS, members)
  }

  // Label methods
  static getLabels(): Label[] {
    return this.getItem<Label[]>(STORAGE_KEYS.LABELS, [])
  }

  static setLabels(labels: Label[]): void {
    this.setItem(STORAGE_KEYS.LABELS, labels)
  }

  // Daily report methods
  static getDailyReports(): DailyReport[] {
    const reports = this.getItem<any[]>(STORAGE_KEYS.DAILY_REPORTS, [])
    return reports.map(report => ({
      ...report,
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt),
    }))
  }

  static setDailyReports(reports: DailyReport[]): void {
    const serializedReports = reports.map(report => ({
      ...report,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    }))
    this.setItem(STORAGE_KEYS.DAILY_REPORTS, serializedReports)
  }

  // Sync tracking
  static getLastSyncTime(): Date | null {
    const timestamp = this.getItem<string | null>(STORAGE_KEYS.LAST_SYNC, null)
    return timestamp ? new Date(timestamp) : null
  }

  static setLastSyncTime(date: Date): void {
    this.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString())
  }

  // Clear all data
  static clearAll(): void {
    if (!this.isAvailable()) return

    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing localStorage (${key}):`, error)
      }
    })
  }

  // Initialize with default data if empty
  static initializeDefaults(): void {
    // Initialize team members if empty OR if they contain old fake data
    const existingMembers = this.getTeamMembers()
    const hasFakeData = existingMembers.some(m => m.name === 'John Doe' || m.name === 'Jane Smith' || m.name === 'Unassigned')
    
    if (existingMembers.length === 0 || hasFakeData) {
      const defaultTeamMembers: TeamMember[] = [
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
        {
          id: '4',
          name: 'Harsha',
          role: 'Operations Manager',
          email: 'harsha@safestorage.in',
          userRole: 'member',
        },
        {
          id: '5',
          name: 'Kiran',
          role: 'Technical Architect',
          email: 'kiran@safestorage.in',
          userRole: 'member',
        },
        { id: '6', name: 'Manish', role: 'HR', email: 'manish@safestorage.in', userRole: 'admin' },
        { id: '7', name: 'Ramesh', role: 'CEO', email: 'ramesh@safestorage.in', userRole: 'admin' },
        {
          id: '8',
          name: 'Arun',
          role: 'Team Member',
          email: 'arun@safestorage.in',
          userRole: 'member',
        },
        {
          id: '9',
          name: 'Shantraj',
          role: 'Team Member',
          email: 'shantraj@safestorage.in',
          userRole: 'member',
        },
      ]
      this.setTeamMembers(defaultTeamMembers)
    }

    // Initialize labels if empty
    if (this.getLabels().length === 0) {
      const defaultLabels: Label[] = [
        { id: '1', name: 'Bug', color: '#ef4444' },
        { id: '2', name: 'Feature', color: '#3b82f6' },
        { id: '3', name: 'Enhancement', color: '#10b981' },
        { id: '4', name: 'Documentation', color: '#8b5cf6' },
        { id: '5', name: 'Testing', color: '#f59e0b' },
      ]
      this.setLabels(defaultLabels)
    }
  }
}
