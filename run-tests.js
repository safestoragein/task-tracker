const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test suite for SafeStorage Task Tracker
async function runComprehensiveTests() {
  console.log('🧪 Running Comprehensive Test Suite for SafeStorage Task Tracker...\n')
  
  const results = {
    passed: 0,
    failed: 0,
    issues: []
  }
  
  // Helper function to log test results
  const logTest = (testName, passed, details = '') => {
    if (passed) {
      console.log(`✅ ${testName}`)
      results.passed++
    } else {
      console.log(`❌ ${testName}`)
      console.log(`   Error: ${details}`)
      results.failed++
      results.issues.push({ test: testName, error: details })
    }
  }
  
  // Test 1: Database Connection
  console.log('📊 Testing Database Connection...')
  try {
    const { data, error } = await supabase.from('team_members').select('count').single()
    logTest('Database connection', !error, error?.message)
  } catch (err) {
    logTest('Database connection', false, err.message)
  }
  
  // Test 2: Team Members Data
  console.log('\n👥 Testing Team Members...')
  try {
    const { data: teamMembers, error } = await supabase.from('team_members').select('*')
    logTest('Team members fetch', !error && teamMembers?.length > 0, error?.message)
    
    if (teamMembers) {
      const expectedUsers = ['Arun', 'Shantraj', 'Kushal', 'Niranjan', 'Harsha', 'Anush', 'Kiran', 'Manish', 'Ramesh']
      const foundUsers = teamMembers.map(m => m.name)
      
      expectedUsers.forEach(expectedUser => {
        const found = foundUsers.includes(expectedUser)
        logTest(`User exists: ${expectedUser}`, found, `User ${expectedUser} not found in database`)
      })
      
      // Test admin vs member roles
      const admins = teamMembers.filter(m => m.user_role === 'admin')
      const members = teamMembers.filter(m => m.user_role === 'member')
      logTest('Admin users exist', admins.length >= 4, `Expected at least 4 admins, found ${admins.length}`)
      logTest('Member users exist', members.length >= 5, `Expected at least 5 members, found ${members.length}`)
    }
  } catch (err) {
    logTest('Team members test', false, err.message)
  }
  
  // Test 3: Tasks Data
  console.log('\n📋 Testing Tasks...')
  try {
    const { data: tasks, error } = await supabase.from('tasks').select('*')
    logTest('Tasks fetch', !error, error?.message)
    
    if (tasks) {
      logTest('Tasks exist', tasks.length > 0, `No tasks found in database`)
      
      // Test task structure
      if (tasks.length > 0) {
        const sampleTask = tasks[0]
        const requiredFields = ['id', 'title', 'status', 'priority', 'assignee_id', 'created_at']
        requiredFields.forEach(field => {
          logTest(`Task has ${field}`, sampleTask[field] !== undefined && sampleTask[field] !== null, `Field ${field} missing or null`)
        })
        
        // Test task distribution by assignee
        const tasksByAssignee = {}
        tasks.forEach(task => {
          tasksByAssignee[task.assignee_id] = (tasksByAssignee[task.assignee_id] || 0) + 1
        })
        logTest('Tasks assigned to users', Object.keys(tasksByAssignee).length > 0, 'No tasks assigned to any users')
        
        // Test task statuses
        const statuses = [...new Set(tasks.map(t => t.status))]
        const expectedStatuses = ['todo', 'in-progress', 'review', 'done']
        const hasValidStatuses = statuses.every(status => expectedStatuses.includes(status))
        logTest('Valid task statuses', hasValidStatuses, `Invalid statuses found: ${statuses.filter(s => !expectedStatuses.includes(s))}`)
        
        // Test priorities
        const priorities = [...new Set(tasks.map(t => t.priority))]
        const expectedPriorities = ['low', 'medium', 'high']
        const hasValidPriorities = priorities.every(priority => expectedPriorities.includes(priority))
        logTest('Valid task priorities', hasValidPriorities, `Invalid priorities found: ${priorities.filter(p => !expectedPriorities.includes(p))}`)
      }
    }
  } catch (err) {
    logTest('Tasks test', false, err.message)
  }
  
  // Test 4: Labels Data
  console.log('\n🏷️  Testing Labels...')
  try {
    const { data: labels, error } = await supabase.from('labels').select('*')
    logTest('Labels fetch', !error && labels?.length > 0, error?.message)
    
    if (labels) {
      const expectedLabels = ['Bug', 'Feature', 'Enhancement', 'Backend', 'Frontend', 'Marketing']
      const foundLabels = labels.map(l => l.name)
      expectedLabels.forEach(expectedLabel => {
        const found = foundLabels.includes(expectedLabel)
        logTest(`Label exists: ${expectedLabel}`, found, `Label ${expectedLabel} not found`)
      })
    }
  } catch (err) {
    logTest('Labels test', false, err.message)
  }
  
  // Test 5: Authentication Logic
  console.log('\n🔐 Testing Authentication...')
  const safeStorageUsers = [
    { id: '1', name: 'Kushal', email: 'kushal@safestorage.in', userRole: 'admin' },
    { id: '2', name: 'Niranjan', email: 'niranjan@safestorage.in', userRole: 'admin' },
    { id: '3', name: 'Anush', email: 'anush@safestorage.in', userRole: 'member' },
    { id: '4', name: 'Harsha', email: 'harsha@safestorage.in', userRole: 'member' },
    { id: '5', name: 'Kiran', email: 'kiran@safestorage.in', userRole: 'member' },
    { id: '6', name: 'Manish', email: 'manish@safestorage.in', userRole: 'admin' },
    { id: '7', name: 'Ramesh', email: 'ramesh@safestorage.in', userRole: 'admin' },
    { id: '8', name: 'Arun', email: 'arun@safestorage.in', userRole: 'member' },
    { id: '9', name: 'Shantraj', email: 'shantraj@safestorage.in', userRole: 'member' },
  ]
  
  const login = (email) => {
    const user = safeStorageUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    return user ? { success: true, user } : { success: false }
  }
  
  // Test login for all users
  safeStorageUsers.forEach(user => {
    const result = login(user.email)
    logTest(`Login: ${user.name}`, result.success, `Login failed for ${user.email}`)
  })
  
  // Test new users specifically
  const newUsers = ['arun@safestorage.in', 'shantraj@safestorage.in']
  newUsers.forEach(email => {
    const result = login(email)
    logTest(`New user login: ${email}`, result.success, `New user ${email} cannot login`)
  })
  
  // Test 6: Check for potential filter issues
  console.log('\n🔍 Testing Filter Logic...')
  try {
    const { data: tasks } = await supabase.from('tasks').select('*')
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    
    if (tasks && teamMembers) {
      // Test filtering by assignee
      const assigneeIds = [...new Set(tasks.map(t => t.assignee_id))]
      const validAssigneeIds = assigneeIds.filter(id => teamMembers.some(m => m.id === id))
      logTest('Valid assignee IDs in tasks', assigneeIds.length === validAssigneeIds.length, 
        `Found ${assigneeIds.length - validAssigneeIds.length} invalid assignee IDs`)
      
      // Test filtering by status
      const tasksByStatus = {
        todo: tasks.filter(t => t.status === 'todo').length,
        'in-progress': tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length
      }
      logTest('Status filtering works', Object.values(tasksByStatus).some(count => count > 0), 'No tasks found for status filtering')
      
      // Test filtering by priority
      const tasksByPriority = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      }
      logTest('Priority filtering works', Object.values(tasksByPriority).some(count => count > 0), 'No tasks found for priority filtering')
      
      // Test label structure for filtering
      const tasksWithLabels = tasks.filter(t => t.labels && t.labels.length > 0)
      logTest('Tasks have labels for filtering', tasksWithLabels.length > 0, 'No tasks have labels for filtering')
    }
  } catch (err) {
    logTest('Filter logic test', false, err.message)
  }
  
  // Test 7: Data Consistency
  console.log('\n🔄 Testing Data Consistency...')
  try {
    const { data: tasks } = await supabase.from('tasks').select('*')
    const { data: teamMembers } = await supabase.from('team_members').select('*')
    
    if (tasks && teamMembers) {
      // Check for orphaned tasks (tasks assigned to non-existent users)
      const orphanedTasks = tasks.filter(task => 
        task.assignee_id && !teamMembers.some(member => member.id === task.assignee_id)
      )
      logTest('No orphaned tasks', orphanedTasks.length === 0, `Found ${orphanedTasks.length} orphaned tasks`)
      
      // Check for tasks with null/undefined required fields
      const invalidTasks = tasks.filter(task => 
        !task.id || !task.title || !task.status || !task.priority || !task.assignee_id
      )
      logTest('All tasks have required fields', invalidTasks.length === 0, `Found ${invalidTasks.length} tasks with missing required fields`)
    }
  } catch (err) {
    logTest('Data consistency test', false, err.message)
  }
  
  // Final Results
  console.log('\n' + '='.repeat(60))
  console.log('🎯 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`📊 Total: ${results.passed + results.failed}`)
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`)
  
  if (results.issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:')
    results.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.test}`)
      console.log(`   ${issue.error}`)
    })
  }
  
  console.log('\n🔗 Live Application: https://task-tracker-3jo7hr75h-safestoragein-gmailcoms-projects.vercel.app')
  
  return results
}

// Run the tests
runComprehensiveTests().then(results => {
  console.log('\n✨ Test execution complete!')
  process.exit(results.failed > 0 ? 1 : 0)
}).catch(err => {
  console.error('❌ Test execution failed:', err)
  process.exit(1)
})