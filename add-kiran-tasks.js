const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Kiran's tasks - Technical Architecture and Development
const kiranTasks = [
  {
    title: "Claude code - existing code analysis and optimise",
    description: "Analyze existing codebase using Claude AI and implement optimizations for performance, maintainability, and code quality",
    priority: "high",
    status: "todo",
    labels: ["Backend", "Enhancement"],
    estimated_hours: 24
  },
  {
    title: "Customer life cycle - end to end walkthrough",
    description: "Create test account and document complete customer journey from registration to service completion, capturing all required changes",
    priority: "high",
    status: "todo",
    labels: ["Documentation", "Research"],
    estimated_hours: 16
  },
  {
    title: "New Customer dashboard - live deployment",
    description: "Deploy new customer dashboard to production environment with all features and integrations",
    priority: "high",
    status: "todo",
    labels: ["Frontend", "DevOps"],
    estimated_hours: 12
  },
  {
    title: "Tax invoices - credit note and proforma options",
    description: "Implement credit note options and proforma invoice functionality for total payment processing",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Payment"],
    estimated_hours: 20
  },
  {
    title: "SafeStorage.ae - Dubai website complete implementation",
    description: "Develop Dubai website with backend integration, CRM tracking, invoicing system, and add Dubai as a city in backend management",
    priority: "high",
    status: "todo",
    labels: ["Frontend", "Backend", "CRM"],
    estimated_hours: 48
  },
  {
    title: "Mobile apps deployment to PlayStore",
    description: "Deploy SafeStorage customer app, WMS app, supervisor app and vendor app to Google Play Store",
    priority: "medium",
    status: "todo",
    labels: ["Mobile", "DevOps"],
    estimated_hours: 16
  },
  {
    title: "WMS Customers vs Dashboard customers sync",
    description: "Resolve data synchronization issues between WMS customer records and Dashboard customer data",
    priority: "high",
    status: "todo",
    labels: ["Backend", "Bug"],
    estimated_hours: 12
  },
  {
    title: "AWS migration and Git+Jenkins workflow setup",
    description: "Complete migration to AWS infrastructure and establish Git+Jenkins CI/CD workflow for automated deployments",
    priority: "high",
    status: "todo",
    labels: ["DevOps", "Backend"],
    estimated_hours: 40
  },
  {
    title: "WMS - Handle packing material management",
    description: "Implement comprehensive packing material tracking, inventory management, and usage reporting in WMS",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 16
  },
  {
    title: "WMS - Maintenance tasks module",
    description: "Develop maintenance task scheduling, tracking, and reporting system within WMS",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 18
  },
  {
    title: "WMS - Attendance tracking system",
    description: "Implement employee attendance tracking system integrated with WMS operations",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 14
  },
  {
    title: "Optimize booking report - reduce loading time",
    description: "Improve booking report performance through database optimization, caching, and query improvements to significantly reduce loading time",
    priority: "high",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 12
  },
  {
    title: "Repeated customers handling system",
    description: "Implement intelligent system to identify, track, and provide enhanced services for repeat customers",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 16
  },
  {
    title: "Damages display dashboard - pre-booking retrieval",
    description: "Display damage points and history on customer dashboard before booking retrieval to ensure transparency",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Frontend"],
    estimated_hours: 10
  }
]

async function addKiranTasks() {
  try {
    console.log('🚀 Adding Kiran\'s tasks to SafeStorage Task Tracker...')
    
    // Get team members and labels
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    // Find Kiran
    const kiran = teamMembers?.find(m => m.name === 'Kiran')
    if (!kiran) {
      console.error('❌ Kiran not found in team members')
      return
    }
    
    console.log(`👨‍💻 Found Kiran: ${kiran.name} (${kiran.role})`)
    
    let addedCount = 0
    
    for (const task of kiranTasks) {
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
        assignee_id: kiran.id,
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
    
    // Final statistics
    const { data: allTasks } = await supabase.from('tasks').select('*')
    
    console.log(`\n📊 Successfully added ${addedCount} tasks for Kiran!`)
    console.log(`📈 Total tasks in database: ${allTasks?.length}`)
    
    // Show task breakdown by priority
    const priorityBreakdown = {}
    const kiranTasksInDb = allTasks?.filter(t => t.assignee_id === kiran.id) || []
    
    kiranTasksInDb.forEach(task => {
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1
    })
    
    console.log(`\n🎯 Kiran's tasks by priority:`)
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} tasks`)
    })
    
    // Show estimated hours
    const totalHours = kiranTasksInDb.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
    console.log(`\n⏱️  Total estimated hours: ${totalHours} hours`)
    console.log(`📅 Estimated completion time: ${Math.ceil(totalHours / 40)} weeks (at 40 hours/week)`)
    
    console.log('\n🎉 Kiran\'s tasks successfully loaded!')
    console.log('🔗 View live: https://task-tracker-5xh0p21rn-safestoragein-gmailcoms-projects.vercel.app')
    
  } catch (error) {
    console.error('❌ Failed to add Kiran\'s tasks:', error)
  }
}

addKiranTasks()