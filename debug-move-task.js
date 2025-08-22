// Debug script to test the moveTask function logic
// This simulates the actual moveTask function from TaskContext

const mockTasks = [
  {
    id: 'task-1',
    title: 'Test Task in Todo',
    status: 'todo',
    priority: 'medium',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    order: 0
  },
  {
    id: 'task-2',
    title: 'Test Task in Backlog',
    status: 'backlog',
    priority: 'low',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
    order: 0
  }
]

function simulateMoveTask(tasks, taskId, newStatus) {
  console.log('=== Simulating moveTask ===')
  console.log('Task ID:', taskId)
  console.log('New Status:', newStatus)
  console.log('Current Tasks:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })))
  
  // Calculate the next order value for the target status
  const tasksInTargetStatus = tasks.filter(t => t.status === newStatus)
  console.log('Tasks in target status:', tasksInTargetStatus.map(t => ({ id: t.id, order: t.order })))
  
  const maxOrder = tasksInTargetStatus.reduce((max, task) => 
    Math.max(max, task.order ?? 0), -1)
  console.log('Max order in target status:', maxOrder)
  
  // Move in local state immediately with new order
  const updatedTasks = tasks.map(task =>
    task.id === taskId
      ? { ...task, status: newStatus, order: maxOrder + 1, updatedAt: new Date() }
      : task
  )
  
  console.log('Updated Tasks:', updatedTasks.map(t => ({ id: t.id, title: t.title, status: t.status, order: t.order })))
  
  return updatedTasks
}

// Test moving from todo to backlog
console.log('=== TEST 1: Move from TODO to BACKLOG ===')
const result1 = simulateMoveTask(mockTasks, 'task-1', 'backlog')

// Test moving from backlog to todo
console.log('\n=== TEST 2: Move from BACKLOG to TODO ===')
const result2 = simulateMoveTask(mockTasks, 'task-2', 'todo')

// Test with more complex scenarios
const complexTasks = [
  { id: 'task-1', status: 'todo', order: 0 },
  { id: 'task-2', status: 'todo', order: 1 },
  { id: 'task-3', status: 'backlog', order: 0 },
  { id: 'task-4', status: 'backlog', order: 1 },
  { id: 'task-5', status: 'backlog', order: 2 }
]

console.log('\n=== TEST 3: Complex scenario - Move TODO task to BACKLOG with existing tasks ===')
const result3 = simulateMoveTask(complexTasks, 'task-1', 'backlog')

// Check if the issue might be with the drag end handler logic
function testDragEndHandler(tasks, dragEvent) {
  console.log('\n=== Testing Full Drag End Handler Logic ===')
  
  const { active, over } = dragEvent
  
  if (!over || !active) {
    console.log('❌ No valid drag targets')
    return null
  }
  
  const taskId = active.id
  const overId = over.id
  
  // Find the task being moved
  const task = tasks.find(t => t.id === taskId)
  if (!task) {
    console.log('❌ Task not found:', taskId)
    return null
  }
  
  console.log('Found task:', { id: task.id, status: task.status })
  
  // Check if we're dropping on a column (status change)
  const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done']
  const isDroppedOnColumn = validStatuses.includes(overId)
  
  console.log('Over ID:', overId)
  console.log('Is dropped on column:', isDroppedOnColumn)
  
  if (isDroppedOnColumn) {
    const newStatus = overId
    
    if (task.status !== newStatus) {
      console.log(`✅ Moving task "${task.id}" from ${task.status} to ${newStatus}`)
      return simulateMoveTask(tasks, taskId, newStatus)
    } else {
      console.log('Task dropped on same column, no status change needed')
      return tasks
    }
  } else {
    console.log('❌ Not dropped on a valid column')
    return tasks
  }
}

// Test the full drag end logic
const testDragEvent = {
  active: { id: 'task-1' },
  over: { id: 'backlog' }
}

testDragEndHandler(mockTasks, testDragEvent)