const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function moveAllTasksToBacklog() {
  console.log('🔄 Moving all tasks to Backlog status...\n')
  
  try {
    // Get all tasks that are not in backlog
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title, status')
      .neq('status', 'backlog')
    
    if (fetchError) throw fetchError
    
    if (!tasks || tasks.length === 0) {
      console.log('✅ All tasks are already in Backlog status!')
      return
    }
    
    console.log(`Found ${tasks.length} tasks to move to Backlog:`)
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.title} (currently: ${task.status})`)
    })
    
    console.log('\n🔄 Moving tasks...')
    
    // Update all tasks to backlog status
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        status: 'backlog',
        updated_at: new Date().toISOString()
      })
      .neq('status', 'backlog')
    
    if (updateError) throw updateError
    
    console.log(`\n✅ Successfully moved ${tasks.length} tasks to Backlog status!`)
    console.log('\n📊 Status Summary:')
    console.log(`  - Moved to Backlog: ${tasks.length} tasks`)
    console.log(`  - Already in Backlog: ${tasks.filter(t => t.status === 'backlog').length} tasks`)
    
  } catch (error) {
    console.error('❌ Error moving tasks to backlog:', error)
    process.exit(1)
  }
}

// Run the migration
moveAllTasksToBacklog().then(() => {
  console.log('\n🎉 Task migration complete!')
  process.exit(0)
})