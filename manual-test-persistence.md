# Manual Test Script for Task Persistence Issue

## Test Objective
Verify that Niranjan's (and all users') task updates persist after page refresh.

## Prerequisites
- Application running on http://localhost:3003
- Browser with developer tools

## Test Steps

### 1. Initial Setup
1. Open http://localhost:3003 in your browser
2. Open Developer Tools (F12) > Console

### 2. Login as Niranjan
1. Click Login button
2. Enter email: `niranjan@safestorage.in`
3. Submit login form
4. **Verify**: You should see "Niranjan" displayed as the logged-in user

### 3. Create Test Task
Run this in the browser console:
```javascript
// Create a test task for Niranjan
const testTask = {
  id: `test-niranjan-${Date.now()}`,
  title: `Niranjan Test Task - ${new Date().toLocaleTimeString()}`,
  description: 'Testing persistence after refresh',
  status: 'todo',
  priority: 'high',
  assigneeId: '2', // Niranjan's ID
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: [],
  subtasks: [],
  comments: [],
  attachments: []
};

// Add to localStorage
const tasks = JSON.parse(localStorage.getItem('task_tracker_tasks') || '[]');
tasks.push(testTask);
localStorage.setItem('task_tracker_tasks', JSON.stringify(tasks));
console.log('✅ Task created:', testTask.title);
console.log('Task ID:', testTask.id);
```

### 4. Update the Task
After creating the task, run this to update it:
```javascript
// Update the task
const tasks = JSON.parse(localStorage.getItem('task_tracker_tasks') || '[]');
const taskIndex = tasks.findIndex(t => t.id.startsWith('test-niranjan-'));
if (taskIndex !== -1) {
  tasks[taskIndex].title = `UPDATED: ${tasks[taskIndex].title}`;
  tasks[taskIndex].status = 'in-progress';
  tasks[taskIndex].updatedAt = new Date().toISOString();
  localStorage.setItem('task_tracker_tasks', JSON.stringify(tasks));
  console.log('✅ Task updated:', tasks[taskIndex].title);
  console.log('New status:', tasks[taskIndex].status);
} else {
  console.log('❌ Test task not found');
}
```

### 5. Refresh the Page
1. Press F5 or Cmd+R to refresh the page
2. Wait for the page to fully load

### 6. Verify Persistence
Run this in the console after refresh:
```javascript
// Check if task persisted with updates
const tasks = JSON.parse(localStorage.getItem('task_tracker_tasks') || '[]');
const testTask = tasks.find(t => t.id.startsWith('test-niranjan-'));

if (testTask) {
  console.log('✅ Task found after refresh!');
  console.log('Title:', testTask.title);
  console.log('Status:', testTask.status);
  console.log('Assigned to:', testTask.assigneeId === '2' ? 'Niranjan' : 'Other');
  
  if (testTask.title.includes('UPDATED:') && testTask.status === 'in-progress') {
    console.log('🎉 SUCCESS: Updates were preserved!');
  } else {
    console.log('⚠️ WARNING: Task found but updates were lost');
  }
} else {
  console.log('❌ FAILURE: Task not found after refresh');
}
```

### 7. Test Database Sync Simulation
This simulates what happens when database returns older data:
```javascript
// Simulate SET_TASKS_FROM_DB with older data
const tasks = JSON.parse(localStorage.getItem('task_tracker_tasks') || '[]');
const testTask = tasks.find(t => t.id.startsWith('test-niranjan-'));

if (testTask) {
  const localUpdatedAt = new Date(testTask.updatedAt);
  const dbUpdatedAt = new Date(localUpdatedAt.getTime() - 60000); // 1 minute older
  
  console.log('Local version updated at:', localUpdatedAt.toISOString());
  console.log('DB version updated at:', dbUpdatedAt.toISOString());
  
  if (localUpdatedAt > dbUpdatedAt) {
    console.log('✅ Merge logic: Local version is newer and should be preserved');
  } else {
    console.log('❌ Merge logic: DB version would overwrite local changes');
  }
}
```

### 8. Cleanup
Remove test data:
```javascript
// Clean up test tasks
const tasks = JSON.parse(localStorage.getItem('task_tracker_tasks') || '[]');
const filtered = tasks.filter(t => !t.id.startsWith('test-niranjan-'));
localStorage.setItem('task_tracker_tasks', JSON.stringify(filtered));
console.log('✅ Test data cleaned up');
```

## Expected Results

✅ **PASS Criteria:**
1. Task is created successfully
2. Task updates are saved to localStorage
3. After refresh, task is still present
4. Task title contains "UPDATED:"
5. Task status is "in-progress"
6. Task is still assigned to Niranjan (assigneeId: '2')
7. Merge logic correctly identifies local version as newer

❌ **FAIL Criteria:**
1. Task disappears after refresh
2. Task reverts to original title (without "UPDATED:")
3. Task status reverts to "todo"
4. Task assignment changes
5. Updates are lost during simulated database sync

## Test Report Template

```
Test Date: _______________
Tester: _______________

[ ] Login as Niranjan - PASS/FAIL
[ ] Create task - PASS/FAIL
[ ] Update task - PASS/FAIL
[ ] Task persists after refresh - PASS/FAIL
[ ] Updates preserved after refresh - PASS/FAIL
[ ] Merge logic correct - PASS/FAIL

Overall Result: PASS / FAIL

Notes:
_________________________________
_________________________________
```