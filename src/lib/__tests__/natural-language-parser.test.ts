import { parseNaturalLanguageTask } from '../natural-language-parser'

const mockTeamMembers = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Carol Davis' },
  { id: '4', name: 'David Wilson' },
]

describe('parseNaturalLanguageTask', () => {
  beforeEach(() => {
    // Mock current date for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z')) // Monday
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic parsing', () => {
    it('should parse a simple task title', () => {
      const result = parseNaturalLanguageTask('Fix login bug', mockTeamMembers)
      expect(result.title).toBe('Fix login bug')
      expect(result.priority).toBeUndefined()
      expect(result.assignee).toBeUndefined()
    })

    it('should handle empty input', () => {
      const result = parseNaturalLanguageTask('', mockTeamMembers)
      expect(result.title).toBe('')
    })

    it('should trim whitespace', () => {
      const result = parseNaturalLanguageTask('  Fix login bug  ', mockTeamMembers)
      expect(result.title).toBe('Fix login bug')
    })
  })

  describe('Priority parsing', () => {
    it('should parse high priority', () => {
      const result = parseNaturalLanguageTask('Fix login bug high priority', mockTeamMembers)
      expect(result.priority).toBe('high')
      expect(result.title).toBe('Fix login bug')
    })

    it('should parse medium priority', () => {
      const result = parseNaturalLanguageTask('Fix login bug medium priority', mockTeamMembers)
      expect(result.priority).toBe('medium')
      expect(result.title).toBe('Fix login bug')
    })

    it('should parse low priority', () => {
      const result = parseNaturalLanguageTask('Fix login bug low priority', mockTeamMembers)
      expect(result.priority).toBe('low')
      expect(result.title).toBe('Fix login bug')
    })

    it('should parse p1, p2, p3 format', () => {
      expect(parseNaturalLanguageTask('Task p1', mockTeamMembers).priority).toBe('high')
      expect(parseNaturalLanguageTask('Task p2', mockTeamMembers).priority).toBe('medium')
      expect(parseNaturalLanguageTask('Task p3', mockTeamMembers).priority).toBe('low')
    })

    it('should parse urgent as high priority', () => {
      const result = parseNaturalLanguageTask('Fix urgent bug', mockTeamMembers)
      expect(result.priority).toBe('high')
      expect(result.title).toBe('Fix bug')
    })

    it('should parse important as medium priority', () => {
      const result = parseNaturalLanguageTask('Important task to complete', mockTeamMembers)
      expect(result.priority).toBe('medium')
      expect(result.title).toBe('task to complete')
    })
  })

  describe('Assignee parsing', () => {
    it('should parse assignee by full name', () => {
      const result = parseNaturalLanguageTask('Fix bug @Alice Johnson', mockTeamMembers)
      expect(result.assignee).toBe('1')
      expect(result.title).toBe('Fix bug')
    })

    it('should parse assignee by first name', () => {
      const result = parseNaturalLanguageTask('Fix bug @Alice', mockTeamMembers)
      expect(result.assignee).toBe('1')
      expect(result.title).toBe('Fix bug')
    })

    it('should parse assignee case insensitively', () => {
      const result = parseNaturalLanguageTask('Fix bug @alice', mockTeamMembers)
      expect(result.assignee).toBe('1')
      expect(result.title).toBe('Fix bug')
    })

    it('should handle partial matches', () => {
      const result = parseNaturalLanguageTask('Fix bug @Bob', mockTeamMembers)
      expect(result.assignee).toBe('2')
    })

    it('should handle non-existent assignee', () => {
      const result = parseNaturalLanguageTask('Fix bug @NonExistent', mockTeamMembers)
      expect(result.assignee).toBeUndefined()
      expect(result.title).toBe('Fix bug')
    })
  })

  describe('Due date parsing', () => {
    it('should parse "today"', () => {
      const result = parseNaturalLanguageTask('Fix bug today', mockTeamMembers)
      expect(result.dueDate).toEqual(new Date('2024-01-15T10:00:00Z'))
      expect(result.title).toBe('Fix bug')
    })

    it('should parse "tomorrow"', () => {
      const result = parseNaturalLanguageTask('Fix bug tomorrow', mockTeamMembers)
      expect(result.dueDate).toEqual(new Date('2024-01-16T10:00:00Z'))
      expect(result.title).toBe('Fix bug')
    })

    it('should parse "this week"', () => {
      const result = parseNaturalLanguageTask('Fix bug this week', mockTeamMembers)
      // Should be Friday of current week
      expect(result.dueDate).toEqual(new Date('2024-01-19T10:00:00Z'))
      expect(result.title).toBe('Fix bug')
    })

    it('should parse "next week"', () => {
      const result = parseNaturalLanguageTask('Fix bug next week', mockTeamMembers)
      // Should be Friday of next week
      expect(result.dueDate).toEqual(new Date('2024-01-26T10:00:00Z'))
      expect(result.title).toBe('Fix bug')
    })

    it('should parse specific weekdays', () => {
      const result = parseNaturalLanguageTask('Fix bug friday', mockTeamMembers)
      expect(result.dueDate).toEqual(new Date('2024-01-19T10:00:00Z'))
      expect(result.title).toBe('Fix bug')
    })

    it('should parse date formats', () => {
      const result = parseNaturalLanguageTask('Fix bug 1/20/2024', mockTeamMembers)
      expect(result.dueDate?.getMonth()).toBe(0) // January
      expect(result.dueDate?.getDate()).toBe(20)
      expect(result.title).toBe('Fix bug')
    })
  })

  describe('Time estimation parsing', () => {
    it('should parse hours with "h"', () => {
      const result = parseNaturalLanguageTask('Fix bug 2h', mockTeamMembers)
      expect(result.estimatedHours).toBe(2)
      expect(result.title).toBe('Fix bug')
    })

    it('should parse decimal hours', () => {
      const result = parseNaturalLanguageTask('Fix bug 1.5h', mockTeamMembers)
      expect(result.estimatedHours).toBe(1.5)
    })

    it('should parse "hours" format', () => {
      const result = parseNaturalLanguageTask('Fix bug 3 hours', mockTeamMembers)
      expect(result.estimatedHours).toBe(3)
    })

    it('should parse minutes', () => {
      const result = parseNaturalLanguageTask('Fix bug 30m', mockTeamMembers)
      expect(result.estimatedHours).toBe(0.5)
    })

    it('should parse "minutes" format', () => {
      const result = parseNaturalLanguageTask('Fix bug 90 minutes', mockTeamMembers)
      expect(result.estimatedHours).toBe(1.5)
    })
  })

  describe('Label parsing', () => {
    it('should parse single label', () => {
      const result = parseNaturalLanguageTask('Fix bug #urgent', mockTeamMembers)
      expect(result.labels).toEqual(['urgent'])
      expect(result.title).toBe('Fix bug')
    })

    it('should parse multiple labels', () => {
      const result = parseNaturalLanguageTask('Fix bug #urgent #frontend #security', mockTeamMembers)
      expect(result.labels).toEqual(['urgent', 'frontend', 'security'])
      expect(result.title).toBe('Fix bug')
    })

    it('should handle labels with numbers and dashes', () => {
      const result = parseNaturalLanguageTask('Fix bug #bug-fix #v2', mockTeamMembers)
      expect(result.labels).toEqual(['bug-fix', 'v2'])
    })
  })

  describe('Status parsing', () => {
    it('should parse todo status', () => {
      const result = parseNaturalLanguageTask('Fix bug todo', mockTeamMembers)
      expect(result.status).toBe('todo')
    })

    it('should parse in-progress status', () => {
      const result = parseNaturalLanguageTask('Fix bug in-progress', mockTeamMembers)
      expect(result.status).toBe('in-progress')
    })

    it('should parse "in progress" with space', () => {
      const result = parseNaturalLanguageTask('Fix bug in progress', mockTeamMembers)
      expect(result.status).toBe('in-progress')
    })

    it('should parse review status', () => {
      const result = parseNaturalLanguageTask('Fix bug review', mockTeamMembers)
      expect(result.status).toBe('review')
    })

    it('should parse done status', () => {
      const result = parseNaturalLanguageTask('Fix bug done', mockTeamMembers)
      expect(result.status).toBe('done')
    })

    it('should parse completed as done', () => {
      const result = parseNaturalLanguageTask('Fix bug completed', mockTeamMembers)
      expect(result.status).toBe('done')
    })
  })

  describe('Complex parsing scenarios', () => {
    it('should parse complex task with all attributes', () => {
      const result = parseNaturalLanguageTask(
        'Fix login bug high priority tomorrow @alice 2h #urgent #frontend',
        mockTeamMembers
      )
      
      expect(result.title).toBe('Fix login bug')
      expect(result.priority).toBe('high')
      expect(result.assignee).toBe('1')
      expect(result.dueDate).toEqual(new Date('2024-01-16T10:00:00Z'))
      expect(result.estimatedHours).toBe(2)
      expect(result.labels).toEqual(['urgent', 'frontend'])
    })

    it('should handle attributes in different orders', () => {
      const result = parseNaturalLanguageTask(
        '@bob #bug 1.5h high priority Fix authentication issue friday',
        mockTeamMembers
      )
      
      expect(result.title).toBe('Fix authentication issue')
      expect(result.priority).toBe('high')
      expect(result.assignee).toBe('2')
      expect(result.estimatedHours).toBe(1.5)
      expect(result.labels).toEqual(['bug'])
    })

    it('should preserve original title when no parsing matches', () => {
      const result = parseNaturalLanguageTask(
        'This is just a regular task without special formatting',
        mockTeamMembers
      )
      
      expect(result.title).toBe('This is just a regular task without special formatting')
      expect(result.priority).toBeUndefined()
      expect(result.assignee).toBeUndefined()
    })

    it('should handle multiple time formats', () => {
      const result1 = parseNaturalLanguageTask('Task 2h 30m', mockTeamMembers)
      // Should take the first match
      expect(result1.estimatedHours).toBe(2)
    })
  })

  describe('Edge cases', () => {
    it('should handle special characters in title', () => {
      const result = parseNaturalLanguageTask('Fix API bug & update docs', mockTeamMembers)
      expect(result.title).toBe('Fix API bug & update docs')
    })

    it('should handle unicode characters', () => {
      const result = parseNaturalLanguageTask('添加新功能 @alice', mockTeamMembers)
      expect(result.title).toBe('添加新功能')
      expect(result.assignee).toBe('1')
    })

    it('should handle very long input', () => {
      const longTitle = 'A'.repeat(1000)
      const result = parseNaturalLanguageTask(longTitle, mockTeamMembers)
      expect(result.title).toBe(longTitle)
    })

    it('should handle empty team members array', () => {
      const result = parseNaturalLanguageTask('Fix bug @alice', [])
      expect(result.assignee).toBeUndefined()
      expect(result.title).toBe('Fix bug')
    })
  })
})