const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Harsha's tasks - Facility Management and Operations
const harshaTasks = [
  {
    title: "Fix SG3 water leakages - Bangalore",
    description: "Address and repair water leakage issues at SG3 Bangalore facility to prevent damage and maintain operations",
    priority: "high",
    status: "todo",
    labels: ["Bug", "Logistics"],
    estimated_hours: 12
  },
  {
    title: "Set up digital room - SG5 Bangalore",
    description: "Setup digital room infrastructure at SG5 Bangalore facility for improved technology operations",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 16
  },
  {
    title: "Open bank accounts for employees - All cities",
    description: "Setup bank accounts for employee salary processing across all SafeStorage city operations",
    priority: "medium",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 20
  },
  {
    title: "Build office cabin - SG5 Bangalore",
    description: "Construct dedicated office cabin space at SG5 Bangalore facility for administrative operations",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 24
  },
  {
    title: "Install signal boosters - SG5 Bangalore",
    description: "Install mobile signal boosters at SG5 Bangalore facility to improve communication connectivity",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 8,
    due_date: "2025-09-05"
  },
  {
    title: "Install big boards - SG5 Bangalore",
    description: "Install large SafeStorage signage boards at SG5 Bangalore facility for brand visibility",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 10
  },
  {
    title: "Add SG5 location to Google Maps - Bangalore",
    description: "Register SG5 Bangalore facility location on Google Maps for customer navigation and visibility",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 3
  },
  {
    title: "Sell vehicle TN12AP7683 - Chennai",
    description: "Complete sale process of vehicle TN12AP7683 in Chennai including documentation and transfer",
    priority: "low",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 6
  },
  {
    title: "Sell vehicles - Bangalore",
    description: "Complete sale of designated vehicles in Bangalore operations, handle documentation and transfers",
    priority: "low",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 12
  },
  {
    title: "Install CCTV - Mumbai",
    description: "Install comprehensive CCTV surveillance system at Mumbai warehouse facility for security",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 14
  },
  {
    title: "Add location to Google Maps - Mumbai",
    description: "Register Mumbai facility location on Google Maps for customer access and business visibility",
    priority: "medium",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 3
  },
  {
    title: "Change GST address - Mumbai",
    description: "Update GST registration address for Mumbai operations to comply with tax regulations",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 6
  },
  {
    title: "Install smoke detectors and fire extinguishers - Mumbai",
    description: "Install complete fire safety equipment including smoke detectors and extinguishers at Mumbai facility",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 10
  },
  {
    title: "Install fire extinguishers and smoke detectors - Delhi",
    description: "Install fire safety equipment including extinguishers and smoke detection systems at Delhi facility",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 10
  },
  {
    title: "Install fire cylinders and smoke detectors - Coimbatore",
    description: "Install fire safety equipment including cylinders and smoke detection systems at Coimbatore facility",
    priority: "high",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 10
  },
  {
    title: "Complete GST registration - Coimbatore",
    description: "Complete GST registration process and documentation for Coimbatore warehouse operations",
    priority: "high",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 8
  },
  {
    title: "Purchase pallets - Coimbatore",
    description: "Purchase required storage pallets for Coimbatore warehouse operational needs",
    priority: "medium",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 6
  },
  {
    title: "Implement QR code system - All cities",
    description: "Implement comprehensive QR code tracking and management system across all SafeStorage city operations",
    priority: "medium",
    status: "todo",
    labels: ["Feature", "Enhancement"],
    estimated_hours: 30
  },
  {
    title: "Build mezzanine - SG5 Bangalore",
    description: "Construct mezzanine level at SG5 Bangalore facility for additional storage capacity and space optimization",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 50
  },
  {
    title: "Purchase office furniture - Bangalore",
    description: "Purchase required office furniture and equipment for Bangalore facility administrative operations",
    priority: "low",
    status: "todo",
    labels: ["Enhancement"],
    estimated_hours: 8
  },
  {
    title: "Transfer racks to Bangalore from Mumbai",
    description: "Coordinate transfer and relocation of storage racks from Mumbai facility to Bangalore operations",
    priority: "medium",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 12
  },
  {
    title: "Transfer racks to Pune from Mumbai",
    description: "Coordinate transfer and relocation of storage racks from Mumbai facility to Pune operations",
    priority: "medium",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 12
  },
  {
    title: "Update warehouse layout on WMS - Bangalore All",
    description: "Update warehouse layout information in WMS system for all Bangalore facility locations",
    priority: "medium",
    status: "todo",
    labels: ["Enhancement", "Backend"],
    estimated_hours: 16
  },
  {
    title: "Sell vehicle - Bangalore",
    description: "Complete sale of designated vehicle in Bangalore including documentation and transfer procedures",
    priority: "low",
    status: "todo",
    labels: ["Logistics"],
    estimated_hours: 6
  },
  {
    title: "Fix warehouse leakages - HY-4 Hyderabad",
    description: "Address and repair warehouse leakage issues at HY-4 Hyderabad facility to prevent operational disruption",
    priority: "high",
    status: "todo",
    labels: ["Bug", "Logistics"],
    estimated_hours: 14
  },
  {
    title: "Create accounts for cash salary - Bangalore All",
    description: "Setup cash salary payment accounts for all employees at Bangalore facility locations",
    priority: "medium",
    status: "todo",
    labels: ["Legal"],
    estimated_hours: 12
  },
  {
    title: "Default customers action plan",
    description: "Develop and implement comprehensive action plan for handling default customers and payment recovery",
    priority: "medium",
    status: "todo",
    labels: ["CRM"],
    estimated_hours: 16
  },
  {
    title: "Video testimonials from warehouse visit customers",
    description: "Collect video testimonials from customers who visit warehouses, featuring SafeStorage branding for marketing",
    priority: "low",
    status: "todo",
    labels: ["Marketing"],
    estimated_hours: 20
  }
]

async function addHarshaTasks() {
  try {
    console.log('🚀 Adding Harsha\'s tasks to SafeStorage Task Tracker...')
    
    // Get team members and labels
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    const { data: labels } = await supabase.from('labels').select('*')
    
    // Find Harsha
    const harsha = teamMembers?.find(m => m.name === 'Harsha')
    if (!harsha) {
      console.error('❌ Harsha not found in team members')
      return
    }
    
    console.log(`🏗️ Found Harsha: ${harsha.name} (${harsha.role})`)
    
    let addedCount = 0
    
    for (const task of harshaTasks) {
      // Map labels
      const taskLabels = task.labels?.map(labelName => {
        return labels?.find(l => l.name === labelName)?.name || labelName
      }).filter(Boolean) || []
      
      // Set due date (use specific due date if provided, otherwise 30-90 days from now)
      const dueDate = task.due_date || 
        new Date(Date.now() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000).toISOString()
      
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: harsha.id,
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
    const harshaTasksInDb = allTasks?.filter(t => t.assignee_id === harsha.id) || []
    
    console.log(`\n📊 Successfully added ${addedCount} tasks for Harsha!`)
    console.log(`📈 Total tasks in database: ${allTasks?.length}`)
    
    // Show task breakdown by priority
    const priorityBreakdown = {}
    harshaTasksInDb.forEach(task => {
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1
    })
    
    console.log(`\n🎯 Harsha's tasks by priority:`)
    Object.entries(priorityBreakdown).forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} tasks`)
    })
    
    // Show task breakdown by category
    const categoryBreakdown = {}
    harshaTasksInDb.forEach(task => {
      if (task.labels && task.labels.length > 0) {
        task.labels.forEach(label => {
          categoryBreakdown[label] = (categoryBreakdown[label] || 0) + 1
        })
      }
    })
    
    console.log(`\n🏷️  Harsha's tasks by category:`)
    Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} tasks`)
      })
    
    // Show tasks by city
    const cityBreakdown = {}
    harshaTasksInDb.forEach(task => {
      if (task.title.includes('Bangalore')) cityBreakdown['Bangalore'] = (cityBreakdown['Bangalore'] || 0) + 1
      else if (task.title.includes('Mumbai')) cityBreakdown['Mumbai'] = (cityBreakdown['Mumbai'] || 0) + 1
      else if (task.title.includes('Chennai')) cityBreakdown['Chennai'] = (cityBreakdown['Chennai'] || 0) + 1
      else if (task.title.includes('Delhi')) cityBreakdown['Delhi'] = (cityBreakdown['Delhi'] || 0) + 1
      else if (task.title.includes('Coimbatore')) cityBreakdown['Coimbatore'] = (cityBreakdown['Coimbatore'] || 0) + 1
      else if (task.title.includes('Hyderabad')) cityBreakdown['Hyderabad'] = (cityBreakdown['Hyderabad'] || 0) + 1
      else if (task.title.includes('Pune')) cityBreakdown['Pune'] = (cityBreakdown['Pune'] || 0) + 1
      else if (task.title.includes('All cities')) cityBreakdown['All Cities'] = (cityBreakdown['All Cities'] || 0) + 1
      else cityBreakdown['General'] = (cityBreakdown['General'] || 0) + 1
    })
    
    console.log(`\n🏙️  Harsha's tasks by location:`)
    Object.entries(cityBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`  ${city}: ${count} tasks`)
      })
    
    // Show estimated hours
    const totalHours = harshaTasksInDb.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
    console.log(`\n⏱️  Total estimated hours: ${totalHours} hours`)
    console.log(`📅 Estimated completion time: ${Math.ceil(totalHours / 40)} weeks (at 40 hours/week)`)
    
    // Show key focus areas
    console.log(`\n🎯 Key Focus Areas:`)
    console.log(`  🔥 Safety & Security: Fire safety systems across multiple cities`)
    console.log(`  🏗️  Infrastructure: Facility upgrades, construction, equipment`)
    console.log(`  📍 Operations: Multi-city coordination, equipment transfers`)
    console.log(`  ⚖️  Compliance: GST registration, legal documentation`)
    console.log(`  📱 Technology: QR systems, WMS updates, digital infrastructure`)
    
    console.log('\n🎉 Harsha\'s tasks successfully loaded!')
    
  } catch (error) {
    console.error('❌ Failed to add Harsha\'s tasks:', error)
  }
}

addHarshaTasks()