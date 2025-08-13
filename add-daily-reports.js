const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample daily reports for different team members
const sampleDailyReports = [
  // Recent reports
  {
    author_name: "Niranjan",
    date: "2025-08-13",
    yesterday_work: "Completed API testing for mobile integration. Fixed 3 critical bugs in authentication flow.",
    today_plan: "Set up automated testing framework. Review mobile app regression test results.",
    notes: "API performance looks good. Need to discuss deployment timeline with Kushal.",
    tasks_completed: ["API bug fixes", "Mobile authentication testing"],
    tasks_in_progress: ["Automated testing framework", "Performance optimization"],
    blockers: ["Waiting for staging environment setup"]
  },
  {
    author_name: "Harsha",
    date: "2025-08-13", 
    yesterday_work: "Coordinated with SG1 team for storage space. Reviewed customer complaints from Q3.",
    today_plan: "Start implementing quality control measures. Update inventory management system.",
    notes: "SG3 water leakage issue needs immediate attention. Customer satisfaction scores improved.",
    tasks_completed: ["SG1 coordination meeting", "Q3 complaints review"],
    tasks_in_progress: ["Quality control implementation", "Inventory system updates"],
    blockers: ["Vendor response pending for SG3 repairs"]
  },
  {
    author_name: "Kushal",
    date: "2025-08-12",
    yesterday_work: "Reviewed OAuth 2.0 implementation progress. Optimized database queries for analytics.",
    today_plan: "Complete CI/CD pipeline setup. Code review for mobile API integration.",
    notes: "Database performance improved by 40% after query optimization.",
    tasks_completed: ["Database query optimization"],
    tasks_in_progress: ["OAuth 2.0 implementation", "CI/CD pipeline"],
    blockers: []
  },
  {
    author_name: "Ramesh",
    date: "2025-08-12",
    yesterday_work: "Strategic planning session with leadership team. Reviewed Q4 financial projections.",
    today_plan: "Investor pitch deck preparation. Market research analysis.",
    notes: "Strong growth trajectory for Q4. Series A discussions progressing well.",
    tasks_completed: ["Leadership strategy session"],
    tasks_in_progress: ["Strategic planning 2025", "Investor pitch deck"],
    blockers: []
  },
  {
    author_name: "Kiran",
    date: "2025-08-11",
    yesterday_work: "Microservices architecture design review. Security audit planning.",
    today_plan: "Complete API documentation. Performance optimization analysis.",
    notes: "Architecture looks scalable. Security audit scheduled for next week.",
    tasks_completed: ["Architecture design review"],
    tasks_in_progress: ["Microservices design", "Security audit prep"],
    blockers: ["Need security consultant availability"]
  },
  {
    author_name: "Anush",
    date: "2025-08-11",
    yesterday_work: "Mumbai delivery route optimization. Vendor contract negotiations.",
    today_plan: "GPS tracking system implementation planning. Cost analysis review.",
    notes: "Delivery efficiency up 15%. New packaging vendor offers 20% cost savings.",
    tasks_completed: ["Route optimization", "Vendor negotiations"],
    tasks_in_progress: ["GPS tracking implementation"],
    blockers: []
  },
  {
    author_name: "Manish",
    date: "2025-08-10",
    yesterday_work: "Q4 performance review templates prepared. Employee handbook updates.",
    today_plan: "Schedule performance reviews. Plan team building event.",
    notes: "All managers aligned on review criteria. Team building budget approved.",
    tasks_completed: ["Performance review prep"],
    tasks_in_progress: ["Employee handbook updates"],
    blockers: []
  }
]

async function addDailyReports() {
  try {
    console.log('Adding daily reports...')
    
    // Get team members
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('*')
    
    let addedCount = 0
    
    for (const report of sampleDailyReports) {
      // Find author ID
      const author = teamMembers.find(m => m.name === report.author_name)
      if (!author) {
        console.warn(`Author ${report.author_name} not found, skipping report`)
        continue
      }
      
      const reportData = {
        author_id: author.id,
        date: report.date,
        yesterday_work: report.yesterday_work,
        today_plan: report.today_plan,
        notes: report.notes,
        tasks_completed: report.tasks_completed,
        tasks_in_progress: report.tasks_in_progress,
        blockers: report.blockers
      }
      
      const { error } = await supabase
        .from('daily_reports')
        .insert([reportData])
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Report already exists for ${report.author_name} on ${report.date}`)
        } else {
          console.error(`Error inserting report for ${report.author_name}:`, error)
        }
      } else {
        console.log(`✅ Added daily report: ${report.author_name} (${report.date})`)
        addedCount++
      }
    }
    
    // Get final count
    const { data: allReports } = await supabase
      .from('daily_reports')
      .select('*')
    
    console.log(`\n📊 Added ${addedCount} new reports. Total reports: ${allReports?.length}`)
    
    // Show breakdown by author
    const reportsByAuthor = {}
    allReports?.forEach(report => {
      const author = teamMembers.find(m => m.id === report.author_id)
      const name = author?.name || 'Unknown'
      reportsByAuthor[name] = (reportsByAuthor[name] || 0) + 1
    })
    
    console.log('\n📋 Reports by team member:')
    Object.entries(reportsByAuthor)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count} reports`)
      })
      
  } catch (error) {
    console.error('Failed to add daily reports:', error)
  }
}

addDailyReports()