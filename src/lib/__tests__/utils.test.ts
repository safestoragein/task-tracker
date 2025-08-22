import { cn, formatDate, getPriorityColor, getStatusColor } from '../utils'

describe('Utils Functions', () => {
  describe('cn (classnames utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('base-class', 'modifier-class')).toBe('base-class modifier-class')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class', false && 'hidden-class'))
        .toBe('base-class conditional-class')
    })

    it('handles undefined and null values', () => {
      expect(cn('base-class', undefined, null, 'valid-class'))
        .toBe('base-class valid-class')
    })

    it('handles empty strings', () => {
      expect(cn('base-class', '', 'valid-class')).toBe('base-class valid-class')
    })
  })

  describe('formatDate', () => {
    it('returns empty string for undefined date', () => {
      expect(formatDate(undefined)).toBe('')
    })

    it('returns "Today" for current date', () => {
      const today = new Date()
      expect(formatDate(today)).toBe('Today')
    })

    it('returns "Tomorrow" for next day', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(formatDate(tomorrow)).toBe('Tomorrow')
    })

    it('returns "Yesterday" for previous day', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatDate(yesterday)).toBe('Yesterday')
    })

    it('returns "In X days" for future dates within a week', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 3)
      expect(formatDate(futureDate)).toBe('In 3 days')
    })

    it('returns "X days ago" for past dates within a week', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)
      expect(formatDate(pastDate)).toBe('3 days ago')
    })

    it('returns formatted date string for dates beyond a week', () => {
      const distantDate = new Date('2025-12-25')
      const result = formatDate(distantDate)
      expect(result).toContain('25') // Should contain day
      expect(result).toContain('2025') // Should contain year
    })
  })

  describe('getPriorityColor', () => {
    it('returns red for high priority', () => {
      expect(getPriorityColor('high')).toBe('text-red-600')
    })

    it('returns yellow for medium priority', () => {
      expect(getPriorityColor('medium')).toBe('text-yellow-600')
    })

    it('returns green for low priority', () => {
      expect(getPriorityColor('low')).toBe('text-green-600')
    })
  })

  describe('getStatusColor', () => {
    it('returns gray for todo status', () => {
      expect(getStatusColor('todo')).toBe('bg-gray-100 text-gray-800')
    })

    it('returns blue for in-progress status', () => {
      expect(getStatusColor('in-progress')).toBe('bg-blue-100 text-blue-800')
    })

    it('returns yellow for review status', () => {
      expect(getStatusColor('review')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('returns green for done status', () => {
      expect(getStatusColor('done')).toBe('bg-green-100 text-green-800')
    })

    it('returns gray for unknown status', () => {
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800')
    })

    it('returns gray for backlog status (default case)', () => {
      expect(getStatusColor('backlog')).toBe('bg-gray-100 text-gray-800')
    })
  })
})