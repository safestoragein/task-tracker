const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Niranjan's tasks - QA Manager and Operations
const niranjanTasks = [
  {
    title: "Warehouse branding boards design",
    description: "Design and implement comprehensive branding boards for all SafeStorage warehouse locations",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 12
  },
  {
    title: "Fire safety and smoke detectors installation",
    description: "Install fire safety equipment and smoke detection systems across all warehouse facilities",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 16
  },
  {
    title: "CCTV footage online access system",
    description: "Setup online access system for CCTV footage monitoring and remote surveillance capabilities",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 14
  },
  {
    title: "Labour and GST certificates for warehouses",
    description: "Obtain and maintain labour compliance and GST certificates for all warehouse locations",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 12
  },
  {
    title: "Self Storage units setup",
    description: "Setup and configure self storage units system for individual customer storage needs",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Logistics"],
    estimated_hours: 20
  },
  {
    title: "Update warehouse locations in dashboard",
    description: "Update all warehouse location information and details in the management dashboard system",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 8
  },
  {
    title: "Report damage 24-hour auto-disable feature",
    description: "Implement automatic 24-hour disable functionality for damage reporting system",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 10
  },
  {
    title: "Insurance value and declared goods system",
    description: "Implement insurance value tracking and declared goods management system for Glass, Marble, and fragile items",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Legal"],
    estimated_hours: 16
  },
  {
    title: "Packers and Movers intercity orders system",
    description: "Setup comprehensive packers and movers system for intercity order management and tracking",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Logistics"],
    estimated_hours: 20
  },
  {
    title: "Pending instant payments and inventory updates",
    description: "Resolve pending instant payment processing issues and synchronize inventory update systems",
    priority: "high",
    status: "todo",
    labels: ["Bug", "Payment"],
    estimated_hours: 12
  },
  {
    title: "Intercity and Shifting data reports",
    description: "Setup comprehensive reporting system for intercity and shifting data handling and analytics",
    priority: "medium",
    status: "todo",
    labels: ["Analytics", "Backend"],
    estimated_hours: 10
  },
  {
    title: "Airtel leased line bills and address change",
    description: "Handle Airtel leased line billing optimization and process address change requirements",
    priority: "low",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 6
  },
  {
    title: "SG5 WiFi boosters installation",
    description: "Install WiFi signal boosters at SG5 facility to improve connectivity and network coverage",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 6
  },
  {
    title: "SG5 UPS issue resolution",
    description: "Diagnose and resolve UPS power backup issues at SG5 facility for operational continuity",
    priority: "high",
    status: "todo",
    labels: ["Bug"],
    estimated_hours: 8
  },
  {
    title: "Damage request form with 24hr expiry",
    description: "Enable damage request form functionality after retrieval with automatic 24-hour expiry option",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Frontend"],
    estimated_hours: 10
  },
  {
    title: "Transport app link testing",
    description: "Test and validate transport app linking functionality and integration points",
    priority: "medium",
    status: "todo",
    labels: ["Mobile", "Bug"],
    estimated_hours: 6
  },
  {
    title: "Display terms while booking retrieval",
    description: "Implement terms and conditions display during retrieval booking process for customer clarity",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Frontend"],
    estimated_hours: 8
  },
  {
    title: "Chennai CCTV installation",
    description: "Install and setup comprehensive CCTV surveillance system at Chennai warehouse facility",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 10
  },
  {
    title: "UK warehouse analysis",
    description: "Conduct detailed analysis of UK warehouse operations, requirements, and expansion opportunities",
    priority: "low",
    status: "todo",
    labels: ["Research", "Analytics"],
    estimated_hours: 16
  },
  {
    title: "Fix partial retrieval charges display bug",
    description: "Fix critical issue where partial retrieval charges are not reflecting correctly in the system",
    priority: "high",
    status: "todo",
    labels: ["Bug", "Payment"],
    estimated_hours: 8
  },
  {
    title: "Biometric device installation",
    description: "Install biometric attendance and access control devices at all warehouse facilities",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 12
  },
  {
    title: "WMS outbound modify order functionality",
    description: "Implement modify order functionality for WMS outbound operations and shipment management",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 14
  },
  {
    title: "WMS warehouse names API integration",
    description: "Replace static warehouse names with dynamic API-based fetching system in WMS",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 10
  },
  {
    title: "Two-way pickup-retrieval-customer request flow",
    description: "Implement comprehensive two-way flow system for pickup → retrieval → customer request process",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 18
  }
]

async function addNiranjanTasks() {
  try {
    console.log('🚀 Adding Niranjan\'s tasks to SafeStorage Task Tracker...')
    
    // Get team members and labels
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    // Find Niranjan
    const niranjan = teamMembers?.find(m => m.name === 'Niranjan')
    if (!niranjan) {
      console.error('❌ Niranjan not found in team members')
      return
    }
    
    console.log(`🔍 Found Niranjan: ${niranjan.name} (${niranjan.role})`)
    
    let addedCount = 0
    
    for (const task of niranjanTasks) {
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
        assignee_id: niranjan.id,
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
    const niranjanTasksInDb = allTasks?.filter(t => t.assignee_id === niranjan.id) || []
    
    console.log(`\n📊 Successfully added ${addedCount} tasks for Niranjan!`)
    console.log(`📈 Total tasks in database: ${allTasks?.length}`)
    
    // Show task breakdown by priority
    const priorityBreakdown = {}
    niranjanTasksInDb.forEach(task => {
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1
    })
    
    console.log(`\n🎯 Niranjan's tasks by priority:`)
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} tasks`)
    })
    
    // Show task breakdown by category
    const categoryBreakdown = {}
    niranjanTasksInDb.forEach(task => {
      if (task.labels && task.labels.length > 0) {
        task.labels.forEach(label => {
          categoryBreakdown[label] = (categoryBreakdown[label] || 0) + 1
        })
      }
    })
    
    console.log(`\n🏷️  Niranjan's tasks by category:`)
    Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} tasks`)
      })
    
    // Show estimated hours
    const totalHours = niranjanTasksInDb.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
    console.log(`\n⏱️  Total estimated hours: ${totalHours} hours`)
    console.log(`📅 Estimated completion time: ${Math.ceil(totalHours / 40)} weeks (at 40 hours/week)`)
    
    // Show key focus areas
    console.log(`\n🎯 Key Focus Areas:`)
    console.log(`  🛡️  Safety & Security: Fire safety, CCTV, biometric systems`)
    console.log(`  💻 System Development: WMS improvements, API integrations`)
    console.log(`  🔧 Infrastructure: WiFi, UPS, facility upgrades`)
    console.log(`  ⚖️  Compliance: Legal certificates, insurance systems`)
    console.log(`  🐛 Bug Fixes: Payment issues, app testing, system bugs`)
    
    console.log('\n🎉 Niranjan\'s tasks successfully loaded!')
    
  } catch (error) {
    console.error('❌ Failed to add Niranjan\'s tasks:', error)
  }
}

addNiranjanTasks()