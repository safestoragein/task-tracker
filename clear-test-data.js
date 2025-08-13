const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function clearTestData() {
  try {
    console.log('🧹 Starting database cleanup...')
    
    // First, get current counts
    const { data: currentTasks } = await supabase.from('tasks').select('*')
    const { data: currentReports } = await supabase.from('daily_reports').select('*')
    
    console.log(`📊 Current data:`)
    console.log(`  - Tasks: ${currentTasks?.length || 0}`)
    console.log(`  - Daily Reports: ${currentReports?.length || 0}`)
    
    if (currentTasks?.length === 0 && currentReports?.length === 0) {
      console.log('✨ Database is already clean!')
      return
    }
    
    console.log('\n🗑️  Clearing test data...')
    
    // Clear all tasks
    if (currentTasks && currentTasks.length > 0) {
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (using a condition that matches all)
      
      if (tasksError) {
        console.error('❌ Error clearing tasks:', tasksError)
      } else {
        console.log(`✅ Cleared ${currentTasks.length} tasks`)
      }
    }
    
    // Clear all daily reports
    if (currentReports && currentReports.length > 0) {
      const { error: reportsError } = await supabase
        .from('daily_reports')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
      if (reportsError) {
        console.error('❌ Error clearing daily reports:', reportsError)
      } else {
        console.log(`✅ Cleared ${currentReports.length} daily reports`)
      }
    }
    
    // Verify cleanup
    const { data: remainingTasks } = await supabase.from('tasks').select('*')
    const { data: remainingReports } = await supabase.from('daily_reports').select('*')
    
    console.log('\n📊 After cleanup:')
    console.log(`  - Tasks: ${remainingTasks?.length || 0}`)
    console.log(`  - Daily Reports: ${remainingReports?.length || 0}`)
    
    // Show what remains (should be just team members and labels)
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    console.log('\n📋 Preserved data:')
    console.log(`  - Team Members: ${teamMembers?.length || 0}`)
    console.log(`  - Labels: ${labels?.length || 0}`)
    
    if (teamMembers && teamMembers.length > 0) {
      console.log('  Team Members:')
      teamMembers.forEach(member => {
        console.log(`    - ${member.name} (${member.role}, ${member.user_role})`)
      })
    }
    
    console.log('\n✨ Database cleanup complete! Ready for production use.')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

clearTestData()