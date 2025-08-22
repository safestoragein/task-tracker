// Test script to simulate the exact real-world scenario
// This will help identify why tasks can't move from todo to backlog

const mockInitialState = {
  tasks: [
    {
      id: 'task-1',
      title: 'Sample Todo Task',
      description: 'A task in todo status',
      status: 'todo',
      priority: 'medium',
      assigneeId: 'user-1',
      dueDate: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      labels: [],
      subtasks: [],
      comments: [],
      attachments: [],
      order: 0
    }
  ],
  teamMembers: [
    { id: 'user-1', name: 'Test User', email: 'test@example.com', avatar: '', role: 'member', userRole: 'admin' }
  ],
  labels: [],
  dailyReports: [],
  filters: {
    search: '',
    assignee: [],
    priority: [],
    labels: [],
    dueDate: {},
  }
}

// Mock the moveTask function exactly as it is in the context
async function mockMoveTask(state, taskId, newStatus) {
  console.log('=== Executing moveTask ===')
  console.log('Task ID:', taskId)
  console.log('New Status:', newStatus)
  
  // Calculate the next order value for the target status
  const tasksInTargetStatus = state.tasks.filter(t => t.status === newStatus)
  console.log('Existing tasks in target status:', tasksInTargetStatus.length)
  
  const maxOrder = tasksInTargetStatus.reduce((max, task) => 
    Math.max(max, task.order ?? 0), -1)
  console.log('Max order in target status:', maxOrder)

  // Move in local state immediately with new order
  const updatedTasks = state.tasks.map(task =>
    task.id === taskId
      ? { ...task, status: newStatus, order: maxOrder + 1, updatedAt: new Date() }
      : task
  )
  
  const newState = { ...state, tasks: updatedTasks }
  
  console.log('Task before update:', state.tasks.find(t => t.id === taskId))
  console.log('Task after update:', newState.tasks.find(t => t.id === taskId))
  
  console.log('✅ moveTask completed successfully')
  
  return newState
}

// Mock the handleDragEnd function exactly as it is in KanbanBoard.tsx
async function mockHandleDragEnd(state, event) {
  console.log('\n=== handleDragEnd Called ===')
  
  const { active, over } = event
  
  console.log('Active:', active)
  console.log('Over:', over)

  // Ensure we have valid drag targets
  if (!over || !active) {
    console.log('❌ Drag ended without valid targets')
    return state
  }

  const taskId = active.id
  const overId = over.id

  console.log('Task ID:', taskId)
  console.log('Over ID:', overId)

  // Find the task being moved
  const task = state.tasks.find(t => t.id === taskId)
  if (!task) {
    console.log('❌ Task not found:', taskId)
    return state
  }

  console.log('Found task:', { id: task.id, title: task.title, status: task.status })

  // Check if we're dropping on a column (status change)
  const validStatuses = ['backlog', 'todo', 'in-progress', 'review', 'done']
  const isDroppedOnColumn = validStatuses.includes(overId)
  
  console.log('Valid statuses:', validStatuses)
  console.log('Is dropped on column:', isDroppedOnColumn)
  
  if (isDroppedOnColumn) {
    const newStatus = overId
    console.log('New status would be:', newStatus)
    
    if (task.status !== newStatus) {
      console.log(`✅ Moving task "${task.title}" from ${task.status} to ${newStatus}`)
      return await mockMoveTask(state, taskId, newStatus)
    } else {
      console.log('ℹ️  Task dropped on same column, no status change needed')
      return state
    }
  } else {
    console.log('❌ Not dropped on a valid column')
    return state
  }
}

// Simulate the exact scenario: dragging from todo to backlog
async function runTest() {
  console.log('=== TESTING: Drag TODO task to BACKLOG ===')

  const dragEvent = {
    active: { id: 'task-1' },
    over: { id: 'backlog' }
  }

  const resultState = await mockHandleDragEnd(mockInitialState, dragEvent)

  console.log('\n=== FINAL RESULT ===')
  console.log('Original task status:', mockInitialState.tasks[0].status)
  console.log('Final task status:', resultState.tasks[0].status)
  console.log('Status changed:', mockInitialState.tasks[0].status !== resultState.tasks[0].status)
}

// Test potential edge case: what if the over.id is not exactly 'backlog'?
console.log('\n=== TESTING EDGE CASES ===')

const edgeCases = [
  { active: { id: 'task-1' }, over: { id: 'backlog' } },
  { active: { id: 'task-1' }, over: { id: 'BACKLOG' } }, // case sensitivity
  { active: { id: 'task-1' }, over: { id: ' backlog' } }, // whitespace
  { active: { id: 'task-1' }, over: { id: 'backlog ' } }, // trailing space
  { active: { id: 'task-1' }, over: { id: 'column-backlog' } }, // prefix
]

edgeCases.forEach((testCase, index) => {
  console.log(`\nEdge case ${index + 1}: over.id = "${testCase.over.id}"`)
  const result = mockHandleDragEnd(mockInitialState, testCase)
  console.log('Would move?', result.tasks[0].status !== mockInitialState.tasks[0].status)
})

runTest().then(() => {
  console.log('\n=== DEBUGGING TIPS ===')
  console.log('If the issue persists in the real app:')
  console.log('1. Check browser console for errors during drag')
  console.log('2. Add console.log to the actual handleDragEnd function')
  console.log('3. Verify that the droppable zone for backlog is properly set up')
  console.log('4. Check if there are any CSS issues preventing drop detection')
  console.log('5. Ensure @dnd-kit/core is working correctly')
})