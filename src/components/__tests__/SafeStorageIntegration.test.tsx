import React from 'react'
import { render, screen } from '@testing-library/react'
import { TaskProvider, useTask } from '@/contexts/TaskContext'
import { TaskState } from '@/types'

// Test component to access context
function TaskContextConsumer() {
  const { state } = useTask()
  
  return (
    <div>
      <div data-testid="task-count">{state.tasks.length}</div>
      <div data-testid="team-count">{state.teamMembers.length}</div>
      <div data-testid="label-count">{state.labels.length}</div>
      <div data-testid="daily-reports-count">{state.dailyReports.length}</div>
      
      {/* Render team members */}
      {state.teamMembers.map(member => (
        <div key={member.id} data-testid={`team-member-${member.name}`}>
          {member.name} - {member.role}
        </div>
      ))}
      
      {/* Render tasks with SafeStorage prefix */}
      {state.tasks.map(task => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          {task.title}
        </div>
      ))}
      
      {/* Render enhanced labels */}
      {state.labels.map(label => (
        <div key={label.id} data-testid={`label-${label.name}`}>
          {label.name}
        </div>
      ))}
    </div>
  )
}

describe('TaskContext Integration Tests', () => {
  it('should have default team members properly configured', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Verify team member count (3 default team members)
    expect(screen.getByTestId('team-count')).toHaveTextContent('3')
    
    // Verify specific default team members
    expect(screen.getByTestId('team-member-Unassigned')).toHaveTextContent('Unassigned - None')
    expect(screen.getByTestId('team-member-John Doe')).toHaveTextContent('John Doe - Developer')
    expect(screen.getByTestId('team-member-Jane Smith')).toHaveTextContent('Jane Smith - Designer')
  })

  it('should start with empty tasks', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Verify task count (0 initially)
    expect(screen.getByTestId('task-count')).toHaveTextContent('0')
  })

  it('should have default label system', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Verify default label count (5 labels total)
    expect(screen.getByTestId('label-count')).toHaveTextContent('5')
    
    // Verify default labels
    expect(screen.getByTestId('label-Bug')).toBeInTheDocument()
    expect(screen.getByTestId('label-Feature')).toBeInTheDocument()
    expect(screen.getByTestId('label-Enhancement')).toBeInTheDocument()
    expect(screen.getByTestId('label-Documentation')).toBeInTheDocument()
    expect(screen.getByTestId('label-Testing')).toBeInTheDocument()
  })

  it('should have daily reports system initialized', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Daily reports should be initialized as empty array
    expect(screen.getByTestId('daily-reports-count')).toHaveTextContent('0')
  })

  it('should render without errors', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Should render all components without errors
    expect(screen.getByTestId('task-count')).toBeInTheDocument()
    expect(screen.getByTestId('team-count')).toBeInTheDocument()
    expect(screen.getByTestId('label-count')).toBeInTheDocument()
    expect(screen.getByTestId('daily-reports-count')).toBeInTheDocument()
  })
})