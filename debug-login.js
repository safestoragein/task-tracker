// Debug script to test login functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Simulate the AuthContext user list
const safeStorageUsers = [
  { id: '1', name: 'Kushal', role: 'Tech Manager', email: 'kushal@safestorage.in', userRole: 'admin' },
  { id: '2', name: 'Niranjan', role: 'QA Manager', email: 'niranjan@safestorage.in', userRole: 'admin' },
  { id: '3', name: 'Anush', role: 'Logistics Manager', email: 'anush@safestorage.in', userRole: 'member' },
  { id: '4', name: 'Harsha', role: 'Operations Manager', email: 'harsha@safestorage.in', userRole: 'member' },
  { id: '5', name: 'Kiran', role: 'Technical Architect', email: 'kiran@safestorage.in', userRole: 'member' },
  { id: '6', name: 'Manish', role: 'HR', email: 'manish@safestorage.in', userRole: 'admin' },
  { id: '7', name: 'Ramesh', role: 'CEO', email: 'ramesh@safestorage.in', userRole: 'admin' },
  { id: '8', name: 'Arun', role: 'Team Member', email: 'arun@safestorage.in', userRole: 'member' },
  { id: '9', name: 'Shantraj', role: 'Team Member', email: 'shantraj@safestorage.in', userRole: 'member' },
]

// Simulate login function from AuthContext
const login = (email) => {
  const user = safeStorageUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (user) {
    return { success: true, user }
  }
  return { success: false, user: null }
}

console.log('🔍 Testing login functionality...\n')

// Test existing users
console.log('✅ Testing existing users:')
const existingEmails = ['kushal@safestorage.in', 'niranjan@safestorage.in', 'harsha@safestorage.in']
existingEmails.forEach(email => {
  const result = login(email)
  console.log(`  ${email}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
})

// Test new users
console.log('\n🆕 Testing new users:')
const newEmails = ['arun@safestorage.in', 'shantraj@safestorage.in']
newEmails.forEach(email => {
  const result = login(email)
  console.log(`  ${email}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
  if (result.success) {
    console.log(`    User: ${result.user.name} (${result.user.role}) - ${result.user.userRole}`)
  }
})

// Check all users in list
console.log('\n📋 All users in AuthContext:')
safeStorageUsers.forEach(user => {
  console.log(`  ${user.id}: ${user.name} <${user.email}> (${user.userRole})`)
})

// Check case sensitivity
console.log('\n🔤 Testing case sensitivity:')
const testEmails = ['ARUN@safestorage.in', 'arun@SAFESTORAGE.IN', 'Arun@SafeStorage.in']
testEmails.forEach(email => {
  const result = login(email)
  console.log(`  ${email}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`)
})

console.log('\n🎯 Debug complete!')