const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Comprehensive task data for SafeStorage team
const additionalTasks = [
  // Kushal (Tech Manager) - Technical tasks
  {
    title: "Implement OAuth 2.0 authentication system",
    description: "Set up secure OAuth integration for customer portal",
    status: "in-progress",
    priority: "high",
    assignee_name: "Kushal",
    labels: ["Feature", "Backend"],
    estimated_hours: 16
  },
  {
    title: "Optimize database queries for reporting",
    description: "Improve performance of analytics queries",
    status: "todo",
    priority: "medium",
    assignee_name: "Kushal",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 8
  },
  {
    title: "Set up CI/CD pipeline with automated testing",
    description: "Configure GitHub Actions for continuous deployment",
    status: "todo",
    priority: "high",
    assignee_name: "Kushal",
    labels: ["DevOps", "Enhancement"],
    estimated_hours: 12
  },
  {
    title: "Code review: Mobile app API integration",
    description: "Review and approve mobile team's API integration work",
    status: "review",
    priority: "medium",
    assignee_name: "Kushal",
    labels: ["Mobile", "Backend"],
    estimated_hours: 4
  },

  // Anush (Logistics Manager) - Operations tasks
  {
    title: "Coordinate delivery schedule for Mumbai region",
    description: "Plan and optimize delivery routes for Q4",
    status: "in-progress",
    priority: "high",
    assignee_name: "Anush",
    labels: ["Logistics"],
    estimated_hours: 6
  },
  {
    title: "Vendor negotiation for packaging materials",
    description: "Renegotiate contracts with packaging suppliers",
    status: "todo",
    priority: "medium",
    assignee_name: "Anush",
    labels: ["Logistics"],
    estimated_hours: 8
  },
  {
    title: "Implement real-time tracking system",
    description: "Deploy GPS tracking for delivery vehicles",
    status: "todo",
    priority: "high",
    assignee_name: "Anush",
    labels: ["Feature", "Logistics"],
    estimated_hours: 20
  },
  {
    title: "Monthly logistics cost analysis",
    description: "Analyze logistics expenses and identify cost savings",
    status: "done",
    priority: "medium",
    assignee_name: "Anush",
    labels: ["Analytics", "Logistics"],
    estimated_hours: 4
  },

  // Kiran (Technical Architect) - Architecture tasks
  {
    title: "Design microservices architecture",
    description: "Plan migration from monolith to microservices",
    status: "in-progress",
    priority: "high",
    assignee_name: "Kiran",
    labels: ["Backend", "Enhancement"],
    estimated_hours: 24
  },
  {
    title: "Security audit of payment gateway integration",
    description: "Comprehensive security review of payment systems",
    status: "todo",
    priority: "high",
    assignee_name: "Kiran",
    labels: ["Payment", "Backend"],
    estimated_hours: 12
  },
  {
    title: "API documentation and standards",
    description: "Create comprehensive API documentation",
    status: "todo",
    priority: "medium",
    assignee_name: "Kiran",
    labels: ["Documentation", "Backend"],
    estimated_hours: 8
  },
  {
    title: "Performance optimization review",
    description: "System-wide performance analysis and optimization",
    status: "review",
    priority: "medium",
    assignee_name: "Kiran",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 16
  },

  // Manish (HR) - HR and admin tasks
  {
    title: "Q4 performance review preparation",
    description: "Prepare materials and schedule performance reviews",
    status: "in-progress",
    priority: "high",
    assignee_name: "Manish",
    labels: ["Analytics"],
    estimated_hours: 6
  },
  {
    title: "Update employee handbook",
    description: "Revise company policies and procedures",
    status: "todo",
    priority: "medium",
    assignee_name: "Manish",
    labels: ["Documentation"],
    estimated_hours: 8
  },
  {
    title: "Organize team building event",
    description: "Plan and execute quarterly team building activity",
    status: "todo",
    priority: "low",
    assignee_name: "Manish",
    labels: ["Marketing"],
    estimated_hours: 12
  },
  {
    title: "Compliance training modules",
    description: "Develop mandatory compliance training for all employees",
    status: "todo",
    priority: "medium",
    assignee_name: "Manish",
    labels: ["Legal", "Documentation"],
    estimated_hours: 16
  },

  // Ramesh (CEO) - Strategic tasks
  {
    title: "Strategic planning for 2025",
    description: "Define company objectives and roadmap for next year",
    status: "in-progress",
    priority: "high",
    assignee_name: "Ramesh",
    labels: ["Analytics"],
    estimated_hours: 20
  },
  {
    title: "Investor pitch deck preparation",
    description: "Prepare presentation for Series A funding round",
    status: "todo",
    priority: "high",
    assignee_name: "Ramesh",
    labels: ["Marketing"],
    estimated_hours: 16
  },
  {
    title: "Market expansion research",
    description: "Research opportunities in Tier 2 cities",
    status: "todo",
    priority: "medium",
    assignee_name: "Ramesh",
    labels: ["Research", "Marketing"],
    estimated_hours: 12
  },
  {
    title: "Partnership evaluation with logistics companies",
    description: "Assess potential partnerships for expansion",
    status: "review",
    priority: "medium",
    assignee_name: "Ramesh",
    labels: ["Research", "Logistics"],
    estimated_hours: 8
  },

  // Additional Harsha tasks (expanding on existing)
  {
    title: "Customer satisfaction survey analysis",
    description: "Analyze customer feedback and identify improvement areas",
    status: "todo",
    priority: "high",
    assignee_name: "Harsha",
    labels: ["Analytics"],
    estimated_hours: 6
  },
  {
    title: "SOP documentation for warehouse operations",
    description: "Document standard operating procedures for all facilities",
    status: "in-progress",
    priority: "medium",
    assignee_name: "Harsha",
    labels: ["Documentation", "Logistics"],
    estimated_hours: 12
  },
  {
    title: "Staff training program for new hires",
    description: "Develop comprehensive training program for operations staff",
    status: "todo",
    priority: "medium",
    assignee_name: "Harsha",
    labels: ["Documentation"],
    estimated_hours: 10
  },

  // Additional Niranjan tasks (QA focused)
  {
    title: "Automated testing framework setup",
    description: "Implement comprehensive automated testing suite",
    status: "in-progress",
    priority: "high",
    assignee_name: "Niranjan",
    labels: ["Backend", "Enhancement"],
    estimated_hours: 20
  },
  {
    title: "Mobile app regression testing",
    description: "Complete testing of mobile application new features",
    status: "todo",
    priority: "high",
    assignee_name: "Niranjan",
    labels: ["Mobile", "Bug"],
    estimated_hours: 8
  },
  {
    title: "API load testing and optimization",
    description: "Stress test APIs and identify performance bottlenecks",
    status: "review",
    priority: "medium",
    assignee_name: "Niranjan",
    labels: ["Backend", "Enhancement"],
    estimated_hours: 12
  },
  {
    title: "QA process documentation",
    description: "Document testing procedures and best practices",
    status: "todo",
    priority: "medium",
    assignee_name: "Niranjan",
    labels: ["Documentation"],
    estimated_hours: 6
  }
]

async function addMoreTasks() {
  try {
    console.log('Adding more comprehensive task data...')
    
    // Get team members
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('*')
    
    const { data: labels } = await supabase
      .from('labels')
      .select('*')
    
    let addedCount = 0
    
    for (const task of additionalTasks) {
      // Find assignee ID
      const assignee = teamMembers.find(m => m.name === task.assignee_name)
      if (!assignee) {
        console.warn(`Assignee ${task.assignee_name} not found, skipping task: ${task.title}`)
        continue
      }
      
      // Map label names
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
        estimated_hours: task.estimated_hours,
        due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      const { error } = await supabase
        .from('tasks')
        .insert([taskData])
      
      if (error) {
        console.error(`Error inserting task "${task.title}":`, error)
      } else {
        console.log(`✅ Added: ${task.title} (${task.assignee_name})`)
        addedCount++
      }
    }
    
    // Final statistics
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*')
    
    console.log(`\n📊 Added ${addedCount} new tasks. Total tasks: ${allTasks?.length}`)
    
    // Show breakdown by assignee and status
    const tasksByAssignee = {}
    const tasksByStatus = {}
    
    allTasks?.forEach(task => {
      const assignee = teamMembers.find(m => m.id === task.assignee_id)
      const name = assignee?.name || 'Unknown'
      tasksByAssignee[name] = (tasksByAssignee[name] || 0) + 1
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1
    })
    
    console.log('\n📋 Tasks by team member:')
    Object.entries(tasksByAssignee)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} tasks`)
      })
    
    console.log('\n📊 Tasks by status:')
    Object.entries(tasksByStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} tasks`)
    })
    
  } catch (error) {
    console.error('Failed to add tasks:', error)
  }
}

addMoreTasks()