export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'

export type UserRole = 'admin' | 'member' | 'scrum_master'

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  role: string
  email: string
  userRole: UserRole
  groupIds?: string[] // Groups this member belongs to
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  assigneeId?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  labels: Label[]
  estimatedHours?: number
  actualHours?: number
  subtasks: Subtask[]
  comments: Comment[]
  attachments: Attachment[]
  order?: number // Position within the column for drag & drop reordering
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

export interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: Date
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

export interface Column {
  id: TaskStatus
  title: string
  color: string
  limit?: number
}

export interface FilterState {
  search: string
  assignee: string[]
  priority: Priority[]
  labels: string[]
  dueDate: {
    from?: Date
    to?: Date
  }
}

export interface DailyReport {
  id: string
  authorId: string
  date: Date | string
  yesterdayWork?: string
  todayPlan?: string
  blockers?: string
  notes?: string
  tasksCompleted?: string[]
  tasksInProgress?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Group {
  id: string
  name: string
  description: string
  memberIds: string[]
  scrumMasterIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  userRole: UserRole
  avatar?: string
  groupIds?: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface TaskState {
  tasks: Task[]
  teamMembers: TeamMember[]
  groups: Group[]
  labels: Label[]
  dailyReports: DailyReport[]
  filters: FilterState
}