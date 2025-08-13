'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Task, TaskStatus, TeamMember, Label, FilterState, DailyReport, TaskState } from '@/types'
import { supabase } from '@/lib/supabase'

export type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStatus: TaskStatus } }
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
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        )
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.newStatus, updatedAt: new Date() }
            : task
        )
      }
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload }
    case 'SET_LABELS':
      return { ...state, labels: action.payload }
    case 'SET_FILTERS':
      return { ...state, filters: action.payload }
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      }
    case 'ADD_DAILY_REPORT':
      return { ...state, dailyReports: [...state.dailyReports, action.payload] }
    case 'UPDATE_DAILY_REPORT':
      return {
        ...state,
        dailyReports: state.dailyReports.map(report =>
          report.id === action.payload.id
            ? { ...report, ...action.payload.updates, updatedAt: new Date() }
            : report
        )
      }
    case 'DELETE_DAILY_REPORT':
      return {
        ...state,
        dailyReports: state.dailyReports.filter(report => report.id !== action.payload)
      }
    case 'SET_DAILY_REPORTS':
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
    labels: task.labels?.map(l => l.name) || [],
    subtasks: task.subtasks || [],
    comments: task.comments || [],
    attachments: task.attachments || [],
  }
}

export const TaskContext = createContext<{
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  filteredTasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>
  addDailyReport: (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateDailyReport: (id: string, updates: Partial<DailyReport>) => Promise<void>
  deleteDailyReport: (id: string) => Promise<void>
} | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Load initial data from Supabase
  useEffect(() => {
    loadInitialData()
    setupRealtimeSubscriptions()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('*')
        .order('name')

      if (teamMembers) {
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
      const { data: labels } = await supabase
        .from('labels')
        .select('*')
        .order('name')

      if (labels) {
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
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (tasks) {
        dispatch({
          type: 'SET_TASKS',
          payload: tasks.map(convertSupabaseTask)
        })
      }

      // Load daily reports
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
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Subscribe to task changes
    supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        // Reload tasks when they change
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (tasks) {
          dispatch({
            type: 'SET_TASKS',
            payload: tasks.map(convertSupabaseTask)
          })
        }
      })
      .subscribe()

    // Subscribe to daily report changes
    supabase
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
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { error } = await supabase
        .from('tasks')
        .insert([convertTaskToSupabase(newTask)])

      if (error) throw error

      dispatch({ type: 'ADD_TASK', payload: newTask })
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          assignee_id: updates.assigneeId,
          due_date: updates.dueDate?.toISOString(),
          estimated_hours: updates.estimatedHours,
        })
        .eq('id', id)

      if (error) throw error

      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      dispatch({ type: 'DELETE_TASK', payload: id })
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) throw error

      dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus } })
    } catch (error) {
      console.error('Error moving task:', error)
      throw error
    }
  }

  const addDailyReport = async (reportData: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReport: DailyReport = {
        ...reportData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

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

      if (error) throw error

      dispatch({ type: 'ADD_DAILY_REPORT', payload: newReport })
    } catch (error) {
      console.error('Error adding daily report:', error)
      throw error
    }
  }

  const updateDailyReport = async (id: string, updates: Partial<DailyReport>) => {
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

      if (error) throw error

      dispatch({ type: 'UPDATE_DAILY_REPORT', payload: { id, updates } })
    } catch (error) {
      console.error('Error updating daily report:', error)
      throw error
    }
  }

  const deleteDailyReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', id)

      if (error) throw error

      dispatch({ type: 'DELETE_DAILY_REPORT', payload: id })
    } catch (error) {
      console.error('Error deleting daily report:', error)
      throw error
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

    if (labels.length > 0 && !task.labels.some(label => labels.includes(label.id))) {
      return false
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
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      addDailyReport,
      updateDailyReport,
      deleteDailyReport,
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