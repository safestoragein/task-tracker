const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// New team members to add
const newTeamMembers = [
  {
    name: 'Arun',
    role: 'Team Member',
    email: 'arun@safestorage.in',
    user_role: 'member'
  },
  {
    name: 'Shantraj',
    role: 'Team Member',
    email: 'shantraj@safestorage.in',
    user_role: 'member'
  }
]

async function addNewUsers() {
  try {
    console.log('👥 Adding new team members to SafeStorage Task Tracker...')
    
    // Check current team members
    const { data: currentMembers } = await supabase.from('team_members').select('*')
    console.log(`📊 Current team size: ${currentMembers?.length} members`)
    
    let addedCount = 0
    
    for (const member of newTeamMembers) {
      // Check if member already exists
      const existingMember = currentMembers?.find(m => 
        m.name.toLowerCase() === member.name.toLowerCase() || 
        m.email.toLowerCase() === member.email.toLowerCase()
      )
      
      if (existingMember) {
        console.log(`⚠️  ${member.name} already exists in the system`)
        continue
      }
      
      const { error } = await supabase
        .from('team_members')
        .insert([member])
      
      if (error) {
        console.error(`❌ Error adding ${member.name}:`, error.message)
      } else {
        console.log(`✅ Added: ${member.name} (${member.role}) - ${member.email}`)
        addedCount++
      }
    }
    
    // Get updated team list
    const { data: updatedMembers } = await supabase.from('team_members').select('*').order('name')
    
    console.log(`\n📈 Successfully added ${addedCount} new team members!`)
    console.log(`👥 Total team size: ${updatedMembers?.length} members`)
    
    // Show complete team roster
    console.log('\n👨‍💼 Complete SafeStorage Team:')
    
    const admins = updatedMembers?.filter(m => m.user_role === 'admin') || []
    const members = updatedMembers?.filter(m => m.user_role === 'member') || []
    
    console.log('\n🔑 Administrators:')
    admins.forEach(admin => {
      console.log(`  • ${admin.name} - ${admin.role} (${admin.email})`)
    })
    
    console.log('\n👥 Team Members:')
    members.forEach(member => {
      console.log(`  • ${member.name} - ${member.role} (${member.email})`)
    })
    
    console.log(`\n📊 Team Statistics:`)
    console.log(`  Administrators: ${admins.length}`)
    console.log(`  Members: ${members.length}`)
    console.log(`  Total: ${updatedMembers?.length}`)
    
    // Show task distribution
    const { data: allTasks } = await supabase.from('tasks').select('assignee_id')
    const taskCounts = {}
    
    updatedMembers?.forEach(member => {
      const taskCount = allTasks?.filter(task => task.assignee_id === member.id).length || 0
      taskCounts[member.name] = taskCount
    })
    
    console.log('\n📋 Current Task Distribution:')
    Object.entries(taskCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} tasks`)
      })
    
    console.log('\n🎉 Team members successfully added to SafeStorage Task Tracker!')
    
  } catch (error) {
    console.error('❌ Failed to add new team members:', error)
  }
}

addNewUsers()