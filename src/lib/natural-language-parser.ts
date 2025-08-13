import { Priority, TaskStatus } from '@/types'

interface ParsedTaskData {
  title: string
  priority?: Priority
  assignee?: string
  dueDate?: Date
  status?: TaskStatus
  labels?: string[]
  estimatedHours?: number
}

export function parseNaturalLanguageTask(input: string, teamMembers: { id: string, name: string }[]): ParsedTaskData {
  let processedText = input.trim()
  const result: ParsedTaskData = {
    title: processedText
  }

  // Extract labels (#hashtags) - do this FIRST to avoid conflicts
  const labelMatches = processedText.match(/#([a-zA-Z0-9_-]+)/g)
  if (labelMatches && labelMatches.length > 0) {
    result.labels = labelMatches.map(match => match.substring(1).toLowerCase())
    labelMatches.forEach(match => {
      processedText = processedText.replace(match, '').trim()
    })
  }

  // Extract priority (high, medium, low, p1, p2, p3)
  const priorityMatch = processedText.match(/\b(high|medium|low|p1|p2|p3)\s+priority\b/i) || 
                       processedText.match(/\b(high|medium|low|urgent|important|p1|p2|p3)\b/i)
  if (priorityMatch) {
    const priorityText = priorityMatch[1].toLowerCase()
    if (priorityText === 'high' || priorityText === 'p1' || priorityText === 'urgent') {
      result.priority = 'high'
    } else if (priorityText === 'medium' || priorityText === 'p2' || priorityText === 'important') {
      result.priority = 'medium'
    } else if (priorityText === 'low' || priorityText === 'p3') {
      result.priority = 'low'
    }
    processedText = processedText.replace(priorityMatch[0], '').trim()
  }

  // Extract assignee (@mention)
  const assigneeMatch = processedText.match(/@([a-zA-Z\s]+?)(?:\s|$)/i)
  if (assigneeMatch) {
    const assigneeName = assigneeMatch[1].trim().toLowerCase()
    const foundMember = teamMembers.find(member => 
      member.name.toLowerCase().includes(assigneeName) ||
      assigneeName.includes(member.name.toLowerCase().split(' ')[0]) // First name match
    )
    if (foundMember) {
      result.assignee = foundMember.id
    }
    // Replace the entire @mention part
    processedText = processedText.replace(/@[a-zA-Z\s]+/i, '').trim()
  }

  // Extract due dates (today, tomorrow, monday, this week, next week, specific dates)
  const dateMatch = processedText.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this week|next week|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})\b/i)
  if (dateMatch) {
    const dateText = dateMatch[1].toLowerCase()
    const now = new Date()
    
    if (dateText === 'today') {
      result.dueDate = now
    } else if (dateText === 'tomorrow') {
      result.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    } else if (dateText === 'this week') {
      const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
      result.dueDate = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000)
    } else if (dateText === 'next week') {
      const daysUntilNextFriday = ((5 - now.getDay()) % 7) + 7
      result.dueDate = new Date(now.getTime() + daysUntilNextFriday * 24 * 60 * 60 * 1000)
    } else if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(dateText)) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const targetDay = dayNames.indexOf(dateText)
      const currentDay = now.getDay()
      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7
      result.dueDate = new Date(now.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000)
    } else {
      // Try parsing specific date formats
      const parsedDate = new Date(dateText.replace(/[-]/g, '/'))
      if (!isNaN(parsedDate.getTime())) {
        result.dueDate = parsedDate
      }
    }
    processedText = processedText.replace(dateMatch[0], '').trim()
  }

  // Extract time estimates (1h, 2 hours, 30m, 1.5h)
  const timeMatch = processedText.match(/\b(\d+(?:\.\d+)?)\s*(h|hours?|m|mins?|minutes?)\b/i)
  if (timeMatch) {
    const amount = parseFloat(timeMatch[1])
    const unit = timeMatch[2].toLowerCase()
    
    if (unit.startsWith('h')) {
      result.estimatedHours = amount
    } else if (unit.startsWith('m')) {
      result.estimatedHours = amount / 60
    }
    processedText = processedText.replace(timeMatch[0], '').trim()
  }


  // Extract status keywords
  const statusMatch = processedText.match(/\b(todo|in-progress|in progress|review|done|completed)\b/i)
  if (statusMatch) {
    const statusText = statusMatch[1].toLowerCase().replace(/\s/g, '-')
    if (statusText === 'todo') result.status = 'todo'
    else if (statusText === 'in-progress') result.status = 'in-progress'
    else if (statusText === 'review') result.status = 'review'
    else if (statusText === 'done' || statusText === 'completed') result.status = 'done'
    
    processedText = processedText.replace(statusMatch[0], '').trim()
  }

  // Clean up the remaining text as the title
  result.title = processedText.replace(/\s+/g, ' ').trim() || input.trim()

  return result
}

// Example usage and test cases
export const naturalLanguageExamples = [
  "Fix login bug high priority tomorrow @alice 2h #bug",
  "Design new landing page @bob next week #design #feature",
  "Update documentation low priority friday 1h",
  "Code review for user authentication today @charlie #review",
  "Implement payment gateway high priority this week 8h @david #feature #backend"
]