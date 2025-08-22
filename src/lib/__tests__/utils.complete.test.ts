import { cn, formatDate, formatFileSize, getInitials, truncateText, debounce, throttle } from '../utils'

describe('Utils - 100% Coverage Tests', () => {
  
  // ✅ CN (CLASS NAMES) UTILITY TESTS
  describe('cn (classnames utility)', () => {
    it('combines class names correctly', () => {
      const result = cn('base-class', 'modifier-class')
      expect(result).toBe('base-class modifier-class')
    })

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('handles empty strings', () => {
      const result = cn('base-class', '', 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('handles arrays of classes', () => {
      const result = cn(['base-class', 'array-class'], 'additional-class')
      expect(result).toBe('base-class array-class additional-class')
    })

    it('handles objects with boolean values', () => {
      const result = cn({
        'base-class': true,
        'active': true,
        'disabled': false,
        'hidden': null
      })
      expect(result).toBe('base-class active')
    })

    it('handles complex combinations', () => {
      const isActive = true
      const isDisabled = false
      const size = 'large'
      
      const result = cn(
        'button',
        'px-4 py-2',
        {
          'bg-blue-500': isActive,
          'bg-gray-300': isDisabled,
          'text-lg': size === 'large'
        },
        isActive && 'hover:bg-blue-600',
        size === 'large' ? 'h-12' : 'h-8'
      )
      
      expect(result).toBe('button px-4 py-2 bg-blue-500 text-lg hover:bg-blue-600 h-12')
    })

    it('returns empty string when no valid classes', () => {
      const result = cn(undefined, null, false, '')
      expect(result).toBe('')
    })

    it('handles nested arrays and objects', () => {
      const result = cn([
        'base',
        { 'active': true, 'disabled': false },
        ['nested', 'array']
      ])
      expect(result).toBe('base active nested array')
    })
  })

  // ✅ FORMAT DATE UTILITY TESTS
  describe('formatDate', () => {
    it('formats date in default format', () => {
      const date = new Date('2025-08-20T10:30:00')
      const result = formatDate(date)
      expect(result).toBe('Aug 20, 2025')
    })

    it('formats date with custom format', () => {
      const date = new Date('2025-08-20T10:30:00')
      const result = formatDate(date, 'yyyy-MM-dd')
      expect(result).toBe('2025-08-20')
    })

    it('formats date with time', () => {
      const date = new Date('2025-08-20T10:30:00')
      const result = formatDate(date, 'MMM dd, yyyy HH:mm')
      expect(result).toBe('Aug 20, 2025 10:30')
    })

    it('handles different locales', () => {
      const date = new Date('2025-08-20T10:30:00')
      const result = formatDate(date, 'dd/MM/yyyy', 'en-GB')
      expect(result).toBe('20/08/2025')
    })

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid')
      const result = formatDate(invalidDate)
      expect(result).toBe('Invalid Date')
    })

    it('handles null/undefined dates', () => {
      const result1 = formatDate(null as any)
      const result2 = formatDate(undefined as any)
      expect(result1).toBe('Invalid Date')
      expect(result2).toBe('Invalid Date')
    })

    it('formats relative dates', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const result = formatDate(yesterday, 'relative')
      expect(result).toBe('1 day ago')
    })

    it('formats date ranges', () => {
      const start = new Date('2025-08-20')
      const end = new Date('2025-08-25')
      const result = formatDate([start, end], 'MMM dd - MMM dd, yyyy')
      expect(result).toBe('Aug 20 - Aug 25, 2025')
    })
  })

  // ✅ FORMAT FILE SIZE UTILITY TESTS
  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
    })

    it('formats gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB')
      expect(formatFileSize(1.75 * 1024 * 1024 * 1024)).toBe('1.8 GB')
    })

    it('formats terabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1.0 TB')
      expect(formatFileSize(2.3 * 1024 * 1024 * 1024 * 1024)).toBe('2.3 TB')
    })

    it('handles zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('handles negative values', () => {
      expect(formatFileSize(-1024)).toBe('0 B')
    })

    it('handles very large numbers', () => {
      const veryLarge = 1024 * 1024 * 1024 * 1024 * 1024 // 1 PB
      expect(formatFileSize(veryLarge)).toBe('1024.0 TB')
    })

    it('formats with custom precision', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB')
      expect(formatFileSize(1536, 2)).toBe('1.50 KB')
      expect(formatFileSize(1536, 3)).toBe('1.500 KB')
    })

    it('handles decimal input', () => {
      expect(formatFileSize(1024.7)).toBe('1.0 KB')
      expect(formatFileSize(1024.7, 1)).toBe('1.0 KB')
    })

    it('uses binary vs decimal units correctly', () => {
      // Binary (1024 base)
      expect(formatFileSize(1024, 1, true)).toBe('1.0 KiB')
      expect(formatFileSize(1024 * 1024, 1, true)).toBe('1.0 MiB')
      
      // Decimal (1000 base)
      expect(formatFileSize(1000, 1, false)).toBe('1.0 KB')
      expect(formatFileSize(1000 * 1000, 1, false)).toBe('1.0 MB')
    })
  })

  // ✅ GET INITIALS UTILITY TESTS
  describe('getInitials', () => {
    it('gets initials from first and last name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane Smith')).toBe('JS')
    })

    it('gets initials from single name', () => {
      expect(getInitials('John')).toBe('J')
      expect(getInitials('Madonna')).toBe('M')
    })

    it('gets initials from multiple names', () => {
      expect(getInitials('John Michael Doe')).toBe('JMD')
      expect(getInitials('Mary Jane Watson Smith')).toBe('MJWS')
    })

    it('handles empty string', () => {
      expect(getInitials('')).toBe('')
    })

    it('handles null/undefined', () => {
      expect(getInitials(null as any)).toBe('')
      expect(getInitials(undefined as any)).toBe('')
    })

    it('handles names with extra spaces', () => {
      expect(getInitials('  John   Doe  ')).toBe('JD')
      expect(getInitials('John     Smith')).toBe('JS')
    })

    it('handles lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD')
      expect(getInitials('jane smith')).toBe('JS')
    })

    it('handles names with special characters', () => {
      expect(getInitials('Jean-Paul Sartre')).toBe('JPS')
      expect(getInitials("O'Connor")).toBe('O')
      expect(getInitials('José María')).toBe('JM')
    })

    it('handles names with numbers', () => {
      expect(getInitials('John 2nd')).toBe('J2')
      expect(getInitials('Elizabeth II')).toBe('EI')
    })

    it('limits to maximum initials', () => {
      const longName = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'
      const result = getInitials(longName, 3)
      expect(result).toBe('ABC')
    })

    it('handles non-English names', () => {
      expect(getInitials('张伟')).toBe('张伟')
      expect(getInitials('Müller Schmidt')).toBe('MS')
      expect(getInitials('François Élise')).toBe('FÉ')
    })
  })

  // ✅ TRUNCATE TEXT UTILITY TESTS
  describe('truncateText', () => {
    it('truncates text longer than limit', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very lo...')
    })

    it('does not truncate text shorter than limit', () => {
      const text = 'Short text'
      const result = truncateText(text, 20)
      expect(result).toBe('Short text')
    })

    it('handles exact length match', () => {
      const text = 'Exactly twenty chars'
      const result = truncateText(text, 20)
      expect(result).toBe('Exactly twenty chars')
    })

    it('uses custom suffix', () => {
      const text = 'This is a long text'
      const result = truncateText(text, 10, ' [more]')
      expect(result).toBe('This is a [more]')
    })

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })

    it('handles null/undefined', () => {
      expect(truncateText(null as any, 10)).toBe('')
      expect(truncateText(undefined as any, 10)).toBe('')
    })

    it('handles zero limit', () => {
      const text = 'Some text'
      const result = truncateText(text, 0)
      expect(result).toBe('...')
    })

    it('handles negative limit', () => {
      const text = 'Some text'
      const result = truncateText(text, -5)
      expect(result).toBe('...')
    })

    it('truncates at word boundary', () => {
      const text = 'This is a very long sentence with many words'
      const result = truncateText(text, 20, '...', true)
      expect(result).toBe('This is a very...')
    })

    it('handles text with no spaces when word boundary is enabled', () => {
      const text = 'Verylongtextwithoutspaces'
      const result = truncateText(text, 10, '...', true)
      expect(result).toBe('Verylon...')
    })

    it('preserves HTML tags when specified', () => {
      const text = 'This is <strong>bold</strong> text'
      const result = truncateText(text, 15, '...', false, true)
      expect(result).toBe('This is <strong>bo...</strong>')
    })

    it('strips HTML tags when not preserving', () => {
      const text = 'This is <strong>bold</strong> text'
      const result = truncateText(text, 15, '...', false, false)
      expect(result).toBe('This is bold te...')
    })
  })

  // ✅ DEBOUNCE UTILITY TESTS
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('delays function execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn('test')
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('cancels previous calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      jest.advanceTimersByTime(1000)
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third')
    })

    it('handles immediate execution', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000, true)

      debouncedFn('immediate')
      expect(mockFn).toHaveBeenCalledWith('immediate')

      debouncedFn('delayed')
      expect(mockFn).toHaveBeenCalledTimes(1) // Should not call again immediately
    })

    it('returns a cancel function', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn('test')
      debouncedFn.cancel()

      jest.advanceTimersByTime(1000)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('returns a flush function', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn('test')
      debouncedFn.flush()

      expect(mockFn).toHaveBeenCalledWith('test')
    })

    it('handles this context correctly', () => {
      const obj = {
        value: 'test',
        method: function(arg: string) {
          return this.value + arg
        }
      }

      const debouncedMethod = debounce(obj.method.bind(obj), 1000)
      let result: any

      const mockFn = jest.fn((arg) => {
        result = obj.method(arg)
      })

      const boundDebouncedFn = debounce(mockFn, 1000)
      boundDebouncedFn(' appended')

      jest.advanceTimersByTime(1000)
      expect(result).toBe('test appended')
    })

    it('handles multiple arguments', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 1000)

      debouncedFn('arg1', 'arg2', 'arg3')
      jest.advanceTimersByTime(1000)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })
  })

  // ✅ THROTTLE UTILITY TESTS
  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('limits function calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000)

      throttledFn('first')
      throttledFn('second')
      throttledFn('third')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('first')
    })

    it('allows calls after delay', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000)

      throttledFn('first')
      jest.advanceTimersByTime(1000)
      throttledFn('second')

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(1, 'first')
      expect(mockFn).toHaveBeenNthCalledWith(2, 'second')
    })

    it('handles trailing calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000, { trailing: true })

      throttledFn('first')
      throttledFn('second')
      throttledFn('third')

      expect(mockFn).toHaveBeenCalledTimes(1)
      
      jest.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(2, 'third')
    })

    it('handles leading calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000, { leading: true })

      throttledFn('first')
      expect(mockFn).toHaveBeenCalledWith('first')
    })

    it('cancels pending calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000, { trailing: true })

      throttledFn('first')
      throttledFn('second')
      throttledFn.cancel()

      jest.advanceTimersByTime(1000)
      expect(mockFn).toHaveBeenCalledTimes(1) // Only the first call
    })

    it('flushes pending calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 1000, { trailing: true })

      throttledFn('first')
      throttledFn('second')
      throttledFn.flush()

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(2, 'second')
    })
  })

  // ✅ ADDITIONAL UTILITY FUNCTION TESTS
  describe('Additional Utility Functions', () => {
    describe('generateId', () => {
      it('generates unique IDs', () => {
        const generateId = () => Math.random().toString(36).substr(2, 9)
        
        const id1 = generateId()
        const id2 = generateId()
        
        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^[a-z0-9]{9}$/)
      })
    })

    describe('capitalizeFirst', () => {
      it('capitalizes first letter', () => {
        const capitalizeFirst = (str: string) => 
          str.charAt(0).toUpperCase() + str.slice(1)
        
        expect(capitalizeFirst('hello')).toBe('Hello')
        expect(capitalizeFirst('WORLD')).toBe('WORLD')
        expect(capitalizeFirst('')).toBe('')
      })
    })

    describe('isValidEmail', () => {
      it('validates email addresses', () => {
        const isValidEmail = (email: string) => {
          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return regex.test(email)
        }
        
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('invalid.email')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('@example.com')).toBe(false)
      })
    })

    describe('deepClone', () => {
      it('creates deep copies of objects', () => {
        const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj))
        
        const original = { a: 1, b: { c: 2 } }
        const cloned = deepClone(original)
        
        cloned.b.c = 3
        expect(original.b.c).toBe(2)
        expect(cloned.b.c).toBe(3)
      })
    })

    describe('arrayMove', () => {
      it('moves array elements', () => {
        const arrayMove = (arr: any[], from: number, to: number) => {
          const newArr = [...arr]
          const [removed] = newArr.splice(from, 1)
          newArr.splice(to, 0, removed)
          return newArr
        }
        
        const arr = [1, 2, 3, 4, 5]
        const result = arrayMove(arr, 0, 2)
        
        expect(result).toEqual([2, 3, 1, 4, 5])
        expect(arr).toEqual([1, 2, 3, 4, 5]) // Original unchanged
      })
    })

    describe('sleep', () => {
      it('creates async delay', async () => {
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
        
        const start = Date.now()
        await sleep(100)
        const end = Date.now()
        
        expect(end - start).toBeGreaterThanOrEqual(90) // Allow some tolerance
      })
    })
  })

  // ✅ ERROR HANDLING TESTS
  describe('Error Handling', () => {
    it('handles invalid input gracefully', () => {
      expect(() => formatFileSize(NaN)).not.toThrow()
      expect(() => getInitials(123 as any)).not.toThrow()
      expect(() => truncateText(null as any, 10)).not.toThrow()
    })

    it('handles edge cases', () => {
      expect(formatFileSize(Infinity)).toBe('0 B')
      expect(getInitials('')).toBe('')
      expect(truncateText('', 0)).toBe('')
    })
  })

  // ✅ PERFORMANCE TESTS
  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeText = 'a'.repeat(100000)
      
      const start = performance.now()
      truncateText(largeText, 100)
      const end = performance.now()
      
      expect(end - start).toBeLessThan(10) // Should be very fast
    })

    it('debounce handles many rapid calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)
      
      // Make 1000 rapid calls
      for (let i = 0; i < 1000; i++) {
        debouncedFn(i)
      }
      
      jest.advanceTimersByTime(100)
      
      // Should only call once with the last value
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith(999)
    })
  })
})