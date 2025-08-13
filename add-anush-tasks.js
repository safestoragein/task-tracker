const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Anush's tasks - Logistics and Operations
const anushTasks = [
  {
    title: "Kolkata warehouse confirmation",
    description: "Finalize and confirm Kolkata warehouse location, lease agreements, and operational setup requirements",
    priority: "high",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 12
  },
  {
    title: "Jaipur warehouse confirmation",
    description: "Finalize and confirm Jaipur warehouse location, lease agreements, and operational setup requirements",
    priority: "high",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 12
  },
  {
    title: "Noida warehouse confirmation",
    description: "Finalize and confirm Noida warehouse location, lease agreements, and operational setup requirements",
    priority: "high",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 12
  },
  {
    title: "Porter agreement finalization",
    description: "Complete negotiations and finalize service agreement with Porter for logistics and delivery services",
    priority: "high",
    status: "todo",
    labels: ["Logistics", "Legal"],
    estimated_hours: 8
  },
  {
    title: "SSTP P&L analysis",
    description: "Analyze SafeStorage Transport Partners profit and loss statements, identify cost optimization opportunities",
    priority: "medium",
    status: "todo",
    labels: ["Analytics", "Logistics"],
    estimated_hours: 10
  },
  {
    title: "Cityfurnish business status review",
    description: "Review current status of Cityfurnish partnership, assess business performance and future opportunities",
    priority: "medium",
    status: "todo",
    labels: ["Research"],
    estimated_hours: 6
  },
  {
    title: "Vendor agreement confirmation",
    description: "Review, finalize and confirm agreements with all logistics and service vendors across all locations",
    priority: "high",
    status: "todo",
    labels: ["Logistics", "Legal"],
    estimated_hours: 16
  },
  {
    title: "Vendor vehicle branding implementation",
    description: "Coordinate SafeStorage branding installation on all vendor vehicles for brand visibility and marketing",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Logistics"],
    estimated_hours: 12
  },
  {
    title: "Crush paper implementation for fragile items",
    description: "Implement crush paper packaging system for fragile items protection during storage and transport",
    priority: "medium",
    status: "todo",
    labels: ["Logistics", "Enhancement"],
    estimated_hours: 8
  },
  {
    title: "Packing material branding",
    description: "Implement SafeStorage branding on all packing materials including boxes, bubble wrap, and protective materials",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Logistics"],
    estimated_hours: 10
  },
  {
    title: "Send back 6-meter Stacker",
    description: "Coordinate return of 6-meter stacker equipment to supplier, handle logistics and documentation",
    priority: "low",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 4
  },
  {
    title: "Pune owner legal notice handling",
    description: "Handle legal notice proceedings with Pune warehouse owner, coordinate with legal team for resolution",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 20
  }
]

async function addAnushTasks() {
  try {
    console.log('🚀 Adding Anush\'s tasks to SafeStorage Task Tracker...')
    
    // Get team members and labels
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    // Find Anush
    const anush = teamMembers?.find(m => m.name === 'Anush')
    if (!anush) {
      console.error('❌ Anush not found in team members')
      return
    }
    
    console.log(`🚛 Found Anush: ${anush.name} (${anush.role})`)
    
    let addedCount = 0
    
    for (const task of anushTasks) {
      // Map labels
      const taskLabels = task.labels?.map(labelName => {
        return labels?.find(l => l.name === labelName)?.name || labelName
      }).filter(Boolean) || []
      
      // Set due date (30-90 days from now)
      const dueDate = new Date(Date.now() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000).toISOString()
      
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: anush.id,
        labels: taskLabels,
        estimated_hours: task.estimated_hours,
        due_date: dueDate
      }
      
      const { error } = await supabase.from('tasks').insert([taskData])
      
      if (error) {
        console.error(`❌ Error adding task "${task.title}":`, error.message)
      } else {
        console.log(`✅ Added: ${task.title}`)
        addedCount++
      }
    }
    
    // Get current database stats
    const { data: allTasks } = await supabase.from('tasks').select('*')
    const anushTasksInDb = allTasks?.filter(t => t.assignee_id === anush.id) || []
    
    console.log(`\n📊 Successfully added ${addedCount} tasks for Anush!`)
    console.log(`📈 Total tasks in database: ${allTasks?.length}`)
    
    // Show task breakdown by priority
    const priorityBreakdown = {}
    anushTasksInDb.forEach(task => {
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1
    })
    
    console.log(`\n🎯 Anush's tasks by priority:`)
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} tasks`)
    })
    
    // Show task breakdown by category
    const categoryBreakdown = {}
    anushTasksInDb.forEach(task => {
      if (task.labels && task.labels.length > 0) {
        task.labels.forEach(label => {
          categoryBreakdown[label] = (categoryBreakdown[label] || 0) + 1
        })
      }
    })
    
    console.log(`\n🏷️  Anush's tasks by category:`)
    Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} tasks`)
      })
    
    // Show estimated hours
    const totalHours = anushTasksInDb.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
    console.log(`\n⏱️  Total estimated hours: ${totalHours} hours`)
    console.log(`📅 Estimated completion time: ${Math.ceil(totalHours / 40)} weeks (at 40 hours/week)`)
    
    // Show key focus areas
    console.log(`\n🎯 Key Focus Areas:`)
    console.log(`  📍 Warehouse Expansion: Kolkata, Jaipur, Noida`)
    console.log(`  🤝 Partnerships: Porter, vendor agreements`)
    console.log(`  📦 Operations: Packaging, branding, equipment`)
    console.log(`  ⚖️  Legal: Pune notice, vendor contracts`)
    
    console.log('\n🎉 Anush\'s tasks successfully loaded!')
    
  } catch (error) {
    console.error('❌ Failed to add Anush\'s tasks:', error)
  }
}

addAnushTasks()