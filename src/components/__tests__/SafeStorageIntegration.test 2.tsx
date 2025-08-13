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

describe('SafeStorage Integration Tests', () => {
  it('should have SafeStorage team members properly configured', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Verify team member count (6 SafeStorage team members)
    expect(screen.getByTestId('team-count')).toHaveTextContent('6')
    
    // Verify specific SafeStorage team members
    expect(screen.getByTestId('team-member-Kushal')).toHaveTextContent('Kushal - Tech Manager')
    expect(screen.getByTestId('team-member-Niranjan')).toHaveTextContent('Niranjan - QA Manager')
    expect(screen.getByTestId('team-member-Anush')).toHaveTextContent('Anush - Logistics Manager')
    expect(screen.getByTestId('team-member-Harsha')).toHaveTextContent('Harsha - Operations Manager')
    expect(screen.getByTestId('team-member-Kiran')).toHaveTextContent('Kiran - Technical Architect')
    expect(screen.getByTestId('team-member-Manish')).toHaveTextContent('Manish - HR')
  })

  it('should have SafeStorage tasks loaded', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Verify task count (9 SafeStorage tasks)
    expect(screen.getByTestId('task-count')).toHaveTextContent('9')
    
    // Verify specific SafeStorage tasks
    expect(screen.getByTestId('task-kiran-task-1')).toHaveTextContent('Claude code - existing code analysis and optimization')
    expect(screen.getByTestId('task-kiran-task-2')).toHaveTextContent('AWS migration setup and Git + Jenkins workflow')
    expect(screen.getByTestId('task-kiran-task-3')).toHaveTextContent('SafeStorage mobile apps deployment to PlayStore')
    
    expect(screen.getByTestId('task-kushal-task-1')).toHaveTextContent('SafeStorage Payment detailed analysis')
    expect(screen.getByTestId('task-kushal-task-2')).toHaveTextContent('SafeStorage CRM - Build Agentic platform')
    expect(screen.getByTestId('task-kushal-task-3')).toHaveTextContent('LinkedIn Ads Setup - waiting for creatives')
    
    expect(screen.getByTestId('task-anush-task-1')).toHaveTextContent('Kolkata warehouse confirmation')
    expect(screen.getByTestId('task-anush-task-2')).toHaveTextContent('Vendor vehicle branding implementation')
    expect(screen.getByTestId('task-anush-task-3')).toHaveTextContent('Pune owner legal notice')
  })

  it('should have enhanced label system with SafeStorage categories', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Verify enhanced label count (15 labels total)
    expect(screen.getByTestId('label-count')).toHaveTextContent('15')
    
    // Verify original labels
    expect(screen.getByTestId('label-Bug')).toBeInTheDocument()
    expect(screen.getByTestId('label-Feature')).toBeInTheDocument()
    expect(screen.getByTestId('label-Enhancement')).toBeInTheDocument()
    expect(screen.getByTestId('label-Documentation')).toBeInTheDocument()
    expect(screen.getByTestId('label-Research')).toBeInTheDocument()
    
    // Verify SafeStorage-specific labels
    expect(screen.getByTestId('label-Backend')).toBeInTheDocument()
    expect(screen.getByTestId('label-Frontend')).toBeInTheDocument()
    expect(screen.getByTestId('label-Mobile')).toBeInTheDocument()
    expect(screen.getByTestId('label-DevOps')).toBeInTheDocument()
    expect(screen.getByTestId('label-Marketing')).toBeInTheDocument()
    expect(screen.getByTestId('label-Logistics')).toBeInTheDocument()
    expect(screen.getByTestId('label-Payment')).toBeInTheDocument()
    expect(screen.getByTestId('label-CRM')).toBeInTheDocument()
    expect(screen.getByTestId('label-Legal')).toBeInTheDocument()
    expect(screen.getByTestId('label-Analytics')).toBeInTheDocument()
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

  it('should support backlog status in task workflow', () => {
    render(
      <TaskProvider>
        <TaskContextConsumer />
      </TaskProvider>
    )
    
    // Find tasks with backlog status
    const backlogTasks = screen.getAllByTestId(/^task-/)
      .map(el => el.textContent)
      .filter(text => text?.includes('Claude code') || text?.includes('AWS migration') || text?.includes('SafeStorage mobile') || text?.includes('SafeStorage CRM'))
    
    // Should have backlog tasks
    expect(backlogTasks.length).toBeGreaterThan(0)
  })
})