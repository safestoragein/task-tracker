const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Kushal's tasks - Business Development and Marketing
const kushalTasks = [
  {
    title: "SafeStorage Payment detailed analysis",
    description: "Conduct comprehensive analysis of payment systems, transaction patterns, success rates, and identify optimization opportunities",
    priority: "high",
    status: "todo",
    labels: ["Analytics", "Payment"],
    estimated_hours: 16
  },
  {
    title: "SafeStorage anniversary video production",
    description: "Create and produce anniversary celebration video showcasing SafeStorage milestones, team, and customer testimonials",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 20
  },
  {
    title: "LinkedIn Ads Setup - Waiting for creatives",
    description: "Setup LinkedIn advertising campaigns for SafeStorage brand awareness and lead generation (pending creative assets)",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 8
  },
  {
    title: "TMDHosting - reduce storage space",
    description: "Optimize and reduce hosting storage requirements with TMDHosting to cut costs and improve efficiency",
    priority: "medium",
    status: "todo",
    labels: ["DevOps"],
    estimated_hours: 6
  },
  {
    title: "SafeStorage.in - website changes",
    description: "Implement requested changes and improvements to main SafeStorage.in website for better user experience",
    priority: "high",
    status: "todo",
    labels: ["Frontend", "Enhancement"],
    estimated_hours: 24
  },
  {
    title: "Business Customer management system",
    description: "Implement total customer list, partial retrieval options, and missing invoices handling for business customers",
    priority: "high",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 28
  },
  {
    title: "Second page quotation system",
    description: "Develop and implement second page quotation functionality for complex customer requirements",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 12
  },
  {
    title: "SafeStorage CRM - Agentic platform development",
    description: "Develop AI-powered CRM platform with performance-based lead distribution, lead source analysis, and automated workflows",
    priority: "high",
    status: "todo",
    labels: ["CRM", "Feature", "Backend"],
    estimated_hours: 60
  },
  {
    title: "Performance-based lead distribution system",
    description: "Replace round-robin with performance-based system where top performers get more leads and quotations",
    priority: "high",
    status: "todo",
    labels: ["CRM", "Analytics"],
    estimated_hours: 20
  },
  {
    title: "Lead source analysis and optimization",
    description: "Analyze each lead source to determine which sources provide better conversion results and ROI",
    priority: "high",
    status: "todo",
    labels: ["Analytics", "Marketing"],
    estimated_hours: 16
  },
  {
    title: "WhatsApp bots support integration",
    description: "Implement WhatsApp bot support for automated customer service, lead qualification, and support queries",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Backend"],
    estimated_hours: 24
  },
  {
    title: "KYC and Insurance value mandatory fields",
    description: "Implement mandatory KYC and insurance value update system on customer dashboard with validation",
    priority: "high",
    status: "todo",
    labels: ["Feature", "Legal"],
    estimated_hours: 16
  },
  {
    title: "Knowlarity recording integration for pickup calls",
    description: "Add Knowlarity recording system for pickup confirmation calls including KYC, insurance value, and feedback collection from CRM",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 14
  },
  {
    title: "Remove huge discounts - implement surge pricing",
    description: "Remove excessive discount practices and implement standard pricing with weekend surge pricing strategy",
    priority: "high",
    status: "todo",
    labels: ["Enhancement", "Payment"],
    estimated_hours: 12
  },
  {
    title: "Customer WhatsApp messaging and incentives",
    description: "Setup automated WhatsApp message circulation system for customers with incentive programs and engagement campaigns",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Feature"],
    estimated_hours: 18
  },
  {
    title: "Warehouse video call and visit scheduling",
    description: "Add warehouse video call functionality and schedule warehouse visit options directly in CRM system",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "CRM"],
    estimated_hours: 16
  },
  {
    title: "Stownest traffic analysis - 570 missing keywords",
    description: "Analyze why customers choose Stownest over SafeStorage, identify 570 missing keywords using spyfu.com for competitive advantage",
    priority: "high",
    status: "todo",
    labels: ["Research", "Marketing"],
    estimated_hours: 24
  },
  {
    title: "SafeStorage ads improvement vs competitors",
    description: "Improve SafeStorage ad attractiveness and effectiveness compared to Stownest using Google Ads Transparency insights",
    priority: "high",
    status: "todo",
    labels: ["Marketing", "Enhancement"],
    estimated_hours: 20
  },
  {
    title: "Free transport strategy for high-demand areas",
    description: "Develop and implement strategy offering free transport services in high-demand customer areas to increase market share",
    priority: "medium",
    status: "todo",
    labels: ["Marketing", "Logistics"],
    estimated_hours: 10
  },
  {
    title: "Next day and month-end retrieval premium pricing",
    description: "Implement premium pricing for next day retrieval (+₹2000) and month end retrieval (+₹2000) services",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Payment"],
    estimated_hours: 12
  },
  {
    title: "SafeStorage global website development",
    description: "Develop comprehensive global SafeStorage website for international market expansion and brand presence",
    priority: "medium",
    status: "todo",
    labels: ["Frontend", "Marketing"],
    estimated_hours: 40
  },
  {
    title: "Home Triangle partnership onboarding",
    description: "Complete onboarding process and establish partnership with Home Triangle for expanded service offerings",
    priority: "low",
    status: "todo",
    labels: ["Research"],
    estimated_hours: 12
  }
]

async function addKushalTasks() {
  try {
    console.log('🚀 Adding Kushal\'s tasks to SafeStorage Task Tracker...')
    
    // Get team members and labels
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    // Find Kushal
    const kushal = teamMembers?.find(m => m.name === 'Kushal')
    if (!kushal) {
      console.error('❌ Kushal not found in team members')
      return
    }
    
    console.log(`👨‍💼 Found Kushal: ${kushal.name} (${kushal.role})`)
    
    let addedCount = 0
    
    for (const task of kushalTasks) {
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
        assignee_id: kushal.id,
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
    const kushalTasksInDb = allTasks?.filter(t => t.assignee_id === kushal.id) || []
    
    console.log(`\n📊 Successfully added ${addedCount} tasks for Kushal!`)
    console.log(`📈 Total tasks in database: ${allTasks?.length}`)
    
    // Show task breakdown by priority
    const priorityBreakdown = {}
    kushalTasksInDb.forEach(task => {
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1
    })
    
    console.log(`\n🎯 Kushal's tasks by priority:`)
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} tasks`)
    })
    
    // Show task breakdown by category
    const categoryBreakdown = {}
    kushalTasksInDb.forEach(task => {
      if (task.labels && task.labels.length > 0) {
        task.labels.forEach(label => {
          categoryBreakdown[label] = (categoryBreakdown[label] || 0) + 1
        })
      }
    })
    
    console.log(`\n🏷️  Kushal's tasks by category:`)
    Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} tasks`)
      })
    
    // Show estimated hours
    const totalHours = kushalTasksInDb.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
    console.log(`\n⏱️  Total estimated hours: ${totalHours} hours`)
    console.log(`📅 Estimated completion time: ${Math.ceil(totalHours / 40)} weeks (at 40 hours/week)`)
    
    console.log('\n🎉 Kushal\'s tasks successfully loaded!')
    console.log('🔗 View live: https://task-tracker-5xh0p21rn-safestoragein-gmailcoms-projects.vercel.app')
    
  } catch (error) {
    console.error('❌ Failed to add Kushal\'s tasks:', error)
  }
}

addKushalTasks()