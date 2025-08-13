import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'review' | 'done' | 'backlog'
          priority: 'low' | 'medium' | 'high'
          assignee_id: string
          due_date: string | null
          created_at: string
          updated_at: string
          estimated_hours: number | null
          labels: string[] | null
          subtasks: any[] | null
          comments: any[] | null
          attachments: any[] | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'review' | 'done' | 'backlog'
          priority?: 'low' | 'medium' | 'high'
          assignee_id: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
          estimated_hours?: number | null
          labels?: string[] | null
          subtasks?: any[] | null
          comments?: any[] | null
          attachments?: any[] | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'review' | 'done' | 'backlog'
          priority?: 'low' | 'medium' | 'high'
          assignee_id?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
          estimated_hours?: number | null
          labels?: string[] | null
          subtasks?: any[] | null
          comments?: any[] | null
          attachments?: any[] | null
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          email: string
          user_role: 'admin' | 'member'
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          email: string
          user_role?: 'admin' | 'member'
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          email?: string
          user_role?: 'admin' | 'member'
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      labels: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          author_id: string
          date: string
          tasks_completed: any[]
          tasks_in_progress: any[]
          blockers: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          date: string
          tasks_completed?: any[]
          tasks_in_progress?: any[]
          blockers?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          date?: string
          tasks_completed?: any[]
          tasks_in_progress?: any[]
          blockers?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}