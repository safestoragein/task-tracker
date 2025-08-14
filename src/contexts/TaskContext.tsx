'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { Task, TaskStatus, TeamMember, Label, FilterState, DailyReport, TaskState } from '@/types'
import { supabase } from '@/lib/supabase'
import { LocalStorageManager } from '@/lib/localStorage'

export type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_TASKS_FROM_DB'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStatus: TaskStatus } }
  | { type: 'REORDER_TASKS'; payload: { tasks: Task[] } }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'SET_LABELS'; payload: Label[] }
  | { type: 'SET_FILTERS'; payload: FilterState }
  | { type: 'UPDATE_FILTERS'; payload: Partial<FilterState> }
  | { type: 'ADD_DAILY_REPORT'; payload: DailyReport }
  | { type: 'UPDATE_DAILY_REPORT'; payload: { id: string; updates: Partial<DailyReport> } }
  | { type: 'DELETE_DAILY_REPORT'; payload: string }
  | { type: 'SET_DAILY_REPORTS'; payload: DailyReport[] }

const initialState: TaskState = {
  tasks: [],
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

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  let newState: TaskState

  switch (action.type) {
    case 'SET_TASKS':
      newState = { ...state, tasks: action.payload }
      LocalStorageManager.setTasks(action.payload)
      return newState

    case 'SET_TASKS_FROM_DB':
      // Only update state and localStorage if we have tasks from database
      if (action.payload.length > 0) {
        newState = { ...state, tasks: action.payload }
        LocalStorageManager.setTasks(action.payload)
        return newState
      }
      // If database returns empty, keep current state
      return state

    case 'ADD_TASK':
      newState = { ...state, tasks: [...state.tasks, action.payload] }
      LocalStorageManager.setTasks(newState.tasks)
      return newState

    case 'UPDATE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        )
      }
      LocalStorageManager.setTasks(newState.tasks)
      return newState

    case 'DELETE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
      LocalStorageManager.setTasks(newState.tasks)
      return newState

    case 'MOVE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.newStatus, updatedAt: new Date() }
            : task
        )
      }
      LocalStorageManager.setTasks(newState.tasks)
      return newState

    case 'REORDER_TASKS':
      newState = { ...state, tasks: action.payload.tasks }
      LocalStorageManager.setTasks(newState.tasks)
      return newState

    case 'SET_TEAM_MEMBERS':
      LocalStorageManager.setTeamMembers(action.payload)
      return { ...state, teamMembers: action.payload }

    case 'SET_LABELS':
      LocalStorageManager.setLabels(action.payload)
      return { ...state, labels: action.payload }

    case 'SET_FILTERS':
      return { ...state, filters: action.payload }

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      }

    case 'ADD_DAILY_REPORT':
      newState = { ...state, dailyReports: [...state.dailyReports, action.payload] }
      LocalStorageManager.setDailyReports(newState.dailyReports)
      return newState

    case 'UPDATE_DAILY_REPORT':
      newState = {
        ...state,
        dailyReports: state.dailyReports.map(report =>
          report.id === action.payload.id
            ? { ...report, ...action.payload.updates, updatedAt: new Date() }
            : report
        )
      }
      LocalStorageManager.setDailyReports(newState.dailyReports)
      return newState

    case 'DELETE_DAILY_REPORT':
      newState = {
        ...state,
        dailyReports: state.dailyReports.filter(report => report.id !== action.payload)
      }
      LocalStorageManager.setDailyReports(newState.dailyReports)
      return newState

    case 'SET_DAILY_REPORTS':
      LocalStorageManager.setDailyReports(action.payload)
      return { ...state, dailyReports: action.payload }

    default:
      return state
  }
}

// Helper function to convert Supabase data to our Task type
function convertSupabaseTask(dbTask: any): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    status: dbTask.status,
    priority: dbTask.priority,
    assigneeId: dbTask.assignee_id,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    estimatedHours: dbTask.estimated_hours,
    labels: dbTask.labels || [],
    subtasks: dbTask.subtasks || [],
    comments: dbTask.comments || [],
    attachments: dbTask.attachments || [],
  }
}

// Helper function to convert our Task type to Supabase format
function convertTaskToSupabase(task: Task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee_id: task.assigneeId,
    due_date: task.dueDate?.toISOString(),
    estimated_hours: task.estimatedHours,
    labels: task.labels?.map(l => typeof l === 'string' ? l : l.name) || [],
    subtasks: task.subtasks || [],
    comments: task.comments || [],
    attachments: task.attachments || [],
  }
}

export const TaskContext = createContext<{
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  filteredTasks: Task[]
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>
  reorderTasks: (tasks: Task[]) => Promise<void>
  addDailyReport: (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateDailyReport: (id: string, updates: Partial<DailyReport>) => Promise<void>
  deleteDailyReport: (id: string) => Promise<void>
  syncWithDatabase: () => Promise<void>
} | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])

  // Initialize data from local storage first
  useEffect(() => {
    LocalStorageManager.initializeDefaults()
    loadFromLocalStorage()
    setLastSyncTime(LocalStorageManager.getLastSyncTime())
  }, [])

  // Load data from database after local storage
  useEffect(() => {
    loadFromDatabase()
    const subs = setupRealtimeSubscriptions()
    setSubscriptions(subs)

    // Cleanup subscriptions
    return () => {
      subs.forEach(sub => sub.unsubscribe())
    }
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      loadFromDatabase()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline])

  const loadFromLocalStorage = () => {
    try {
      const tasks = LocalStorageManager.getTasks()
      const teamMembers = LocalStorageManager.getTeamMembers()
      const labels = LocalStorageManager.getLabels()
      const dailyReports = LocalStorageManager.getDailyReports()

      if (tasks.length > 0) {
        dispatch({ type: 'SET_TASKS', payload: tasks })
      }
      if (teamMembers.length > 0) {
        dispatch({ type: 'SET_TEAM_MEMBERS', payload: teamMembers })
      }
      if (labels.length > 0) {
        dispatch({ type: 'SET_LABELS', payload: labels })
      }
      if (dailyReports.length > 0) {
        dispatch({ type: 'SET_DAILY_REPORTS', payload: dailyReports })
      }
    } catch (error) {
      console.error('Error loading from local storage:', error)
    }
  }

  const loadFromDatabase = async () => {
    try {
      setIsSyncing(true)

      // Check if Supabase is configured
      if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using local storage only')
        setIsOnline(false)
        return
      }

      // Load team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .order('name')

      if (teamError) {
        console.error('Error loading team members:', teamError)
        setIsOnline(false)
      } else if (teamMembers && teamMembers.length > 0) {
        dispatch({
          type: 'SET_TEAM_MEMBERS',
          payload: teamMembers.map((member: any) => ({
            id: member.id,
            name: member.name,
            role: member.role,
            email: member.email,
            userRole: member.user_role,
            avatar: member.avatar,
          }))
        })
      }

      // Load labels
      const { data: labels, error: labelError } = await supabase
        .from('labels')
        .select('*')
        .order('name')

      if (labelError) {
        console.error('Error loading labels:', labelError)
      } else if (labels && labels.length > 0) {
        dispatch({
          type: 'SET_LABELS',
          payload: labels.map((label: any) => ({
            id: label.id,
            name: label.name,
            color: label.color,
          }))
        })
      }

      // Load tasks
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (taskError) {
        console.error('Error loading tasks:', taskError)
        // Keep existing local data on database error
      } else if (tasks) {
        // Use SET_TASKS_FROM_DB which only overwrites if we have data
        dispatch({
          type: 'SET_TASKS_FROM_DB',
          payload: tasks.map(convertSupabaseTask)
        })
      }

      // Load daily reports
      const { data: reports, error: reportError } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false })

      if (reportError) {
        console.error('Error loading daily reports:', reportError)
      } else if (reports && reports.length > 0) {
        dispatch({
          type: 'SET_DAILY_REPORTS',
          payload: reports.map((report: any) => ({
            id: report.id,
            authorId: report.author_id,
            date: report.date,
            tasksCompleted: report.tasks_completed || [],
            tasksInProgress: report.tasks_in_progress || [],
            blockers: report.blockers || [],
            notes: report.notes || '',
            yesterdayWork: report.yesterday_work || '',
            todayPlan: report.today_plan || '',
            createdAt: new Date(report.created_at),
            updatedAt: new Date(report.updated_at),
          }))
        })
      }

      // Update sync time on successful load
      if (!teamError && !taskError) {
        const now = new Date()
        LocalStorageManager.setLastSyncTime(now)
        setLastSyncTime(now)
      }
    } catch (error) {
      console.error('Error loading from database:', error)
      setIsOnline(false)
    } finally {
      setIsSyncing(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    const subscriptions: any[] = []

    if (!supabase) {
      return subscriptions
    }

    try {
      // Subscribe to task changes
      const taskSub = supabase
        .channel('tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (tasks) {
            dispatch({
              type: 'SET_TASKS_FROM_DB',
              payload: tasks.map(convertSupabaseTask)
            })
          }
        })
        .subscribe()

      subscriptions.push(taskSub)

      // Subscribe to daily report changes
      const reportSub = supabase
        .channel('daily_reports')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_reports' }, async () => {
          const { data: reports } = await supabase
            .from('daily_reports')
            .select('*')
            .order('date', { ascending: false })
          
          if (reports) {
            dispatch({
              type: 'SET_DAILY_REPORTS',
              payload: reports.map((report: any) => ({
                id: report.id,
                authorId: report.author_id,
                date: report.date,
                tasksCompleted: report.tasks_completed || [],
                tasksInProgress: report.tasks_in_progress || [],
                blockers: report.blockers || [],
                notes: report.notes || '',
                yesterdayWork: report.yesterday_work || '',
                todayPlan: report.today_plan || '',
                createdAt: new Date(report.created_at),
                updatedAt: new Date(report.updated_at),
              }))
            })
          }
        })
        .subscribe()

      subscriptions.push(reportSub)
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error)
    }

    return subscriptions
  }

  const syncWithDatabase = async () => {
    if (!isOnline) return

    try {
      setIsSyncing(true)
      await loadFromDatabase()
    } catch (error) {
      console.error('Error syncing with database:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Calculate the next order value for this status
    const tasksInSameStatus = state.tasks.filter(t => t.status === taskData.status)
    const maxOrder = tasksInSameStatus.reduce((max, task) => 
      Math.max(max, task.order ?? 0), -1)
    
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      order: maxOrder + 1,
    }

    // Add to local state immediately
    dispatch({ type: 'ADD_TASK', payload: newTask })

    // Try to add to database if online
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .insert([convertTaskToSupabase(newTask)])

        if (error) {
          console.error('Error adding task to database:', error)
          // Task is already in local state, so user can continue working
        }
      } catch (error) {
        console.error('Error adding task:', error)
      }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Update local state immediately
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })

    // Try to update in database if online
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            ...updates,
            assignee_id: updates.assigneeId,
            due_date: updates.dueDate?.toISOString(),
            estimated_hours: updates.estimatedHours,
            labels: updates.labels?.map(l => typeof l === 'string' ? l : l.name),
          })
          .eq('id', id)

        if (error) {
          console.error('Error updating task in database:', error)
        }
      } catch (error) {
        console.error('Error updating task:', error)
      }
    }
  }

  const deleteTask = async (id: string) => {
    // Delete from local state immediately
    dispatch({ type: 'DELETE_TASK', payload: id })

    // Try to delete from database if online
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting task from database:', error)
        }
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    // Calculate the next order value for the target status
    const tasksInTargetStatus = state.tasks.filter(t => t.status === newStatus)
    const maxOrder = tasksInTargetStatus.reduce((max, task) => 
      Math.max(max, task.order ?? 0), -1)

    // Move in local state immediately with new order
    const updatedTasks = state.tasks.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, order: maxOrder + 1, updatedAt: new Date() }
        : task
    )
    dispatch({ type: 'REORDER_TASKS', payload: { tasks: updatedTasks } })

    // Try to update in database if online
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ status: newStatus, order: maxOrder + 1 })
          .eq('id', taskId)

        if (error) {
          console.error('Error moving task in database:', error)
        }
      } catch (error) {
        console.error('Error moving task:', error)
      }
    }
  }

  const reorderTasks = async (tasks: Task[]) => {
    // Update task order in local state immediately
    dispatch({ type: 'REORDER_TASKS', payload: { tasks } })

    // Try to update task orders in database if online
    if (isOnline && supabase) {
      try {
        // Update each task's order in the database
        const updates = tasks.map(task => ({
          id: task.id,
          order: task.order,
        }))

        for (const update of updates) {
          const { error } = await supabase
            .from('tasks')
            .update({ order: update.order })
            .eq('id', update.id)

          if (error) {
            console.error(`Error updating task order for ${update.id}:`, error)
          }
        }
      } catch (error) {
        console.error('Error reordering tasks:', error)
      }
    }
  }

  const addDailyReport = async (reportData: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: DailyReport = {
      ...reportData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add to local state immediately
    dispatch({ type: 'ADD_DAILY_REPORT', payload: newReport })

    // Try to add to database if online
    if (isOnline) {
      try {
        const { error } = await supabase
          .from('daily_reports')
          .insert([{
            id: newReport.id,
            author_id: newReport.authorId,
            date: newReport.date,
            tasks_completed: newReport.tasksCompleted || [],
            tasks_in_progress: newReport.tasksInProgress || [],
            blockers: newReport.blockers || [],
            notes: newReport.notes || '',
            yesterday_work: newReport.yesterdayWork || '',
            today_plan: newReport.todayPlan || '',
          }])

        if (error) {
          console.error('Error adding daily report to database:', error)
        }
      } catch (error) {
        console.error('Error adding daily report:', error)
      }
    }
  }

  const updateDailyReport = async (id: string, updates: Partial<DailyReport>) => {
    // Update local state immediately
    dispatch({ type: 'UPDATE_DAILY_REPORT', payload: { id, updates } })

    // Try to update in database if online
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('daily_reports')
          .update({
            author_id: updates.authorId,
            date: updates.date,
            tasks_completed: updates.tasksCompleted,
            tasks_in_progress: updates.tasksInProgress,
            blockers: updates.blockers,
            notes: updates.notes,
            yesterday_work: updates.yesterdayWork,
            today_plan: updates.todayPlan,
          })
          .eq('id', id)

        if (error) {
          console.error('Error updating daily report in database:', error)
        }
      } catch (error) {
        console.error('Error updating daily report:', error)
      }
    }
  }

  const deleteDailyReport = async (id: string) => {
    // Delete from local state immediately
    dispatch({ type: 'DELETE_DAILY_REPORT', payload: id })

    // Try to delete from database if online
    if (isOnline && supabase) {
      try {
        const { error } = await supabase
          .from('daily_reports')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting daily report from database:', error)
        }
      } catch (error) {
        console.error('Error deleting daily report:', error)
      }
    }
  }

  // Filter tasks based on current filters
  const filteredTasks = state.tasks.filter(task => {
    const { search, assignee, priority, labels, dueDate } = state.filters

    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
      return false
    }

    if (assignee.length > 0 && !assignee.includes(task.assigneeId || '')) {
      return false
    }

    if (priority.length > 0 && !priority.includes(task.priority)) {
      return false
    }

    if (labels.length > 0) {
      const taskLabelIds = task.labels.map(label => 
        typeof label === 'string' ? label : label.id
      )
      if (!labels.some(labelId => taskLabelIds.includes(labelId))) {
        return false
      }
    }

    if (dueDate.from && task.dueDate && task.dueDate < dueDate.from) {
      return false
    }

    if (dueDate.to && task.dueDate && task.dueDate > dueDate.to) {
      return false
    }

    return true
  })

  return (
    <TaskContext.Provider value={{
      state,
      dispatch,
      filteredTasks,
      isOnline,
      isSyncing,
      lastSyncTime,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      reorderTasks,
      addDailyReport,
      updateDailyReport,
      deleteDailyReport,
      syncWithDatabase,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}