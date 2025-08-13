const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample tasks data based on conversation history
const sampleTasks = [
  // Niranjan's tasks (cleaned from duplicates based on conversation)
  {
    title: "Verify and update Niranjan points, any duplicate point delete it.",
    description: "Clean up duplicate tasks and reorganize task list",
    status: "done",
    priority: "high",
    assignee_name: "Niranjan",
    labels: ["Enhancement"]
  },
  
  // Harsha's tasks (from conversation history)
  {
    title: "Fix SG3 water leakages – Bangalore",
    description: "Address water leakage issues in SG3 facility",
    status: "todo",
    priority: "high",
    assignee_name: "Harsha",
    labels: ["Bug", "Logistics"]
  },
  {
    title: "Coordinate with SG1 for additional storage space",
    description: "Work with SG1 team to secure more storage capacity",
    status: "todo", 
    priority: "medium",
    assignee_name: "Harsha",
    labels: ["Logistics"]
  },
  {
    title: "Update inventory management system",
    description: "Modernize the current inventory tracking processes",
    status: "in-progress",
    priority: "medium",
    assignee_name: "Harsha", 
    labels: ["Enhancement", "Backend"]
  },
  {
    title: "Review customer complaints from Q3",
    description: "Analyze and address customer feedback from third quarter",
    status: "todo",
    priority: "high",
    assignee_name: "Harsha",
    labels: ["Analytics"]
  },
  {
    title: "Implement quality control measures",
    description: "Set up new QC processes for operations",
    status: "todo",
    priority: "medium", 
    assignee_name: "Harsha",
    labels: ["Enhancement"]
  }
]

async function migrateData() {
  try {
    console.log('Starting data migration...')
    
    // Get team members to map names to IDs
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('*')
    
    if (!teamMembers || teamMembers.length === 0) {
      console.error('No team members found in database')
      return
    }
    
    console.log('Found team members:', teamMembers.map(m => m.name))
    
    // Get existing labels
    const { data: labels } = await supabase
      .from('labels')
      .select('*')
    
    console.log('Available labels:', labels?.map(l => l.name))
    
    // Migrate tasks
    for (const task of sampleTasks) {
      // Find assignee ID
      const assignee = teamMembers.find(m => m.name === task.assignee_name)
      if (!assignee) {
        console.warn(`Assignee ${task.assignee_name} not found, skipping task: ${task.title}`)
        continue
      }
      
      // Map label names to label objects
      const taskLabels = task.labels.map(labelName => {
        return labels?.find(l => l.name === labelName)?.name || labelName
      }).filter(Boolean)
      
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: assignee.id,
        labels: taskLabels,
        estimated_hours: Math.floor(Math.random() * 8) + 1, // Random 1-8 hours
        due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within 30 days
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
      
      if (error) {
        console.error(`Error inserting task "${task.title}":`, error)
      } else {
        console.log(`✅ Migrated task: ${task.title}`)
      }
    }
    
    // Check final task count
    const { data: allTasks, error: countError } = await supabase
      .from('tasks')
      .select('*')
    
    if (countError) {
      console.error('Error counting tasks:', countError)
    } else {
      console.log(`\n📊 Migration complete! Total tasks in database: ${allTasks?.length}`)
      
      // Show breakdown by assignee
      const tasksByAssignee = {}
      allTasks?.forEach(task => {
        const assignee = teamMembers.find(m => m.id === task.assignee_id)
        const name = assignee?.name || 'Unknown'
        tasksByAssignee[name] = (tasksByAssignee[name] || 0) + 1
      })
      
      console.log('\n📋 Tasks by assignee:')
      Object.entries(tasksByAssignee).forEach(([name, count]) => {
        console.log(`  ${name}: ${count} tasks`)
      })
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData()