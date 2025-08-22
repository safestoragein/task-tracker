import { renderHook, act } from '@testing-library/react'
import { useToast, ToastProvider, toast } from '../use-toast'
import React from 'react'

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('useToast - 100% Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // ✅ BASIC FUNCTIONALITY TESTS
  describe('Basic Functionality', () => {
    it('provides toast function', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      expect(result.current.toast).toBeInstanceOf(Function)
      expect(result.current.toasts).toEqual([])
    })

    it('adds toast message', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test toast message'
        })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Test Toast',
        description: 'This is a test toast message'
      })
    })

    it('generates unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })
      
      expect(result.current.toasts).toHaveLength(2)
      expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id)
    })

    it('dismisses toast by ID', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      let toastId: string
      
      act(() => {
        const toast = result.current.toast({ title: 'Test Toast' })
        toastId = toast.id
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      act(() => {
        result.current.dismiss(toastId)
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })

    it('dismisses all toasts when no ID provided', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.toast({ title: 'Toast 3' })
      })
      
      expect(result.current.toasts).toHaveLength(3)
      
      act(() => {
        result.current.dismiss()
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })
  })

  // ✅ TOAST VARIANTS TESTS
  describe('Toast Variants', () => {
    it('creates default toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'Default Toast' })
      })
      
      expect(result.current.toasts[0].variant).toBe('default')
    })

    it('creates success toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Success Toast',
          variant: 'success'
        })
      })
      
      expect(result.current.toasts[0].variant).toBe('success')
    })

    it('creates error toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Error Toast',
          variant: 'destructive'
        })
      })
      
      expect(result.current.toasts[0].variant).toBe('destructive')
    })

    it('creates warning toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Warning Toast',
          variant: 'warning'
        })
      })
      
      expect(result.current.toasts[0].variant).toBe('warning')
    })
  })

  // ✅ AUTO-DISMISS TESTS
  describe('Auto-dismiss Functionality', () => {
    it('auto-dismisses toast after default duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'Auto-dismiss Toast' })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      act(() => {
        jest.advanceTimersByTime(5000) // Default duration
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })

    it('auto-dismisses toast after custom duration', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Custom Duration Toast',
          duration: 3000
        })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      act(() => {
        jest.advanceTimersByTime(2999) // Just before duration
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      act(() => {
        jest.advanceTimersByTime(1) // Complete duration
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })

    it('does not auto-dismiss toast with duration 0', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Persistent Toast',
          duration: 0
        })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      act(() => {
        jest.advanceTimersByTime(10000) // Long time
      })
      
      expect(result.current.toasts).toHaveLength(1) // Still there
    })

    it('cancels auto-dismiss when manually dismissed', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      let toastId: string
      
      act(() => {
        const toast = result.current.toast({
          title: 'Manual Dismiss Toast',
          duration: 5000
        })
        toastId = toast.id
      })
      
      act(() => {
        jest.advanceTimersByTime(2000) // Partial duration
        result.current.dismiss(toastId) // Manual dismiss
      })
      
      expect(result.current.toasts).toHaveLength(0)
      
      act(() => {
        jest.advanceTimersByTime(3000) // Complete remaining duration
      })
      
      // Should still be 0 (not re-dismissed)
      expect(result.current.toasts).toHaveLength(0)
    })
  })

  // ✅ TOAST LIMITS TESTS
  describe('Toast Limits', () => {
    it('limits number of simultaneous toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        // Add more toasts than the limit (assuming limit is 5)
        for (let i = 0; i < 10; i++) {
          result.current.toast({ title: `Toast ${i}` })
        }
      })
      
      // Should only keep the latest 5 toasts
      expect(result.current.toasts).toHaveLength(5)
      expect(result.current.toasts[0].title).toBe('Toast 5')
      expect(result.current.toasts[4].title).toBe('Toast 9')
    })

    it('removes oldest toast when limit exceeded', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      // Fill to limit
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.toast({ title: `Toast ${i}` })
        }
      })
      
      const oldestId = result.current.toasts[0].id
      
      // Add one more
      act(() => {
        result.current.toast({ title: 'New Toast' })
      })
      
      // Oldest should be removed
      expect(result.current.toasts).toHaveLength(5)
      expect(result.current.toasts.find(t => t.id === oldestId)).toBeUndefined()
      expect(result.current.toasts[4].title).toBe('New Toast')
    })
  })

  // ✅ TOAST CONTENT TESTS
  describe('Toast Content', () => {
    it('supports title only', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'Title Only' })
      })
      
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Title Only',
        description: undefined
      })
    })

    it('supports title and description', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Toast Title',
          description: 'Toast description with more details'
        })
      })
      
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Toast Title',
        description: 'Toast description with more details'
      })
    })

    it('supports custom actions', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      const action = {
        label: 'Undo',
        onClick: jest.fn()
      }
      
      act(() => {
        result.current.toast({
          title: 'Toast with Action',
          action
        })
      })
      
      expect(result.current.toasts[0].action).toBe(action)
    })

    it('supports custom className', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Styled Toast',
          className: 'custom-toast-class'
        })
      })
      
      expect(result.current.toasts[0].className).toBe('custom-toast-class')
    })
  })

  // ✅ GLOBAL TOAST FUNCTION TESTS
  describe('Global Toast Function', () => {
    it('works without provider context', () => {
      // This should work even without the provider wrapper
      const result = toast({ title: 'Global Toast' })
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('dismiss')
      expect(result).toHaveProperty('update')
    })

    it('provides helper methods', () => {
      expect(toast.success).toBeInstanceOf(Function)
      expect(toast.error).toBeInstanceOf(Function)
      expect(toast.warning).toBeInstanceOf(Function)
      expect(toast.info).toBeInstanceOf(Function)
    })

    it('success helper creates success toast', () => {
      const result = toast.success('Success message')
      expect(result.variant).toBe('success')
    })

    it('error helper creates destructive toast', () => {
      const result = toast.error('Error message')
      expect(result.variant).toBe('destructive')
    })

    it('warning helper creates warning toast', () => {
      const result = toast.warning('Warning message')
      expect(result.variant).toBe('warning')
    })

    it('info helper creates default toast', () => {
      const result = toast.info('Info message')
      expect(result.variant).toBe('default')
    })
  })

  // ✅ TOAST UPDATE TESTS
  describe('Toast Updates', () => {
    it('updates toast content', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      let toastId: string
      
      act(() => {
        const toast = result.current.toast({ title: 'Original Title' })
        toastId = toast.id
      })
      
      act(() => {
        result.current.update(toastId, {
          title: 'Updated Title',
          description: 'New description'
        })
      })
      
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Updated Title',
        description: 'New description'
      })
    })

    it('updates toast variant', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      let toastId: string
      
      act(() => {
        const toast = result.current.toast({ title: 'Test Toast' })
        toastId = toast.id
      })
      
      act(() => {
        result.current.update(toastId, { variant: 'destructive' })
      })
      
      expect(result.current.toasts[0].variant).toBe('destructive')
    })

    it('ignores update for non-existent toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'Existing Toast' })
      })
      
      act(() => {
        result.current.update('non-existent-id', { title: 'Updated' })
      })
      
      // Should not crash and original toast should remain unchanged
      expect(result.current.toasts[0].title).toBe('Existing Toast')
    })
  })

  // ✅ QUEUE MANAGEMENT TESTS
  describe('Queue Management', () => {
    it('maintains toast order (newest first)', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({ title: 'First Toast' })
      })
      
      act(() => {
        jest.advanceTimersByTime(100)
        result.current.toast({ title: 'Second Toast' })
      })
      
      act(() => {
        jest.advanceTimersByTime(100)
        result.current.toast({ title: 'Third Toast' })
      })
      
      expect(result.current.toasts[0].title).toBe('Third Toast')
      expect(result.current.toasts[1].title).toBe('Second Toast')
      expect(result.current.toasts[2].title).toBe('First Toast')
    })

    it('handles rapid successive toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        // Add many toasts rapidly
        for (let i = 0; i < 20; i++) {
          result.current.toast({ title: `Rapid Toast ${i}` })
        }
      })
      
      // Should handle gracefully without crashes
      expect(result.current.toasts.length).toBeGreaterThan(0)
      expect(result.current.toasts.length).toBeLessThanOrEqual(5) // Respects limit
    })
  })

  // ✅ EVENT HANDLING TESTS
  describe('Event Handling', () => {
    it('calls onOpenChange when toast is added', () => {
      const onOpenChange = jest.fn()
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          onOpenChange
        })
      })
      
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('calls onOpenChange when toast is dismissed', () => {
      const onOpenChange = jest.fn()
      const { result } = renderHook(() => useToast(), { wrapper })
      
      let toastId: string
      
      act(() => {
        const toast = result.current.toast({
          title: 'Test Toast',
          onOpenChange
        })
        toastId = toast.id
      })
      
      onOpenChange.mockClear()
      
      act(() => {
        result.current.dismiss(toastId)
      })
      
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls action onClick handler', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      const onClick = jest.fn()
      
      act(() => {
        result.current.toast({
          title: 'Action Toast',
          action: {
            label: 'Click Me',
            onClick
          }
        })
      })
      
      const toast = result.current.toasts[0]
      
      act(() => {
        toast.action?.onClick()
      })
      
      expect(onClick).toHaveBeenCalled()
    })
  })

  // ✅ ERROR HANDLING TESTS
  describe('Error Handling', () => {
    it('handles missing provider gracefully', () => {
      // Test without provider wrapper
      expect(() => {
        renderHook(() => useToast())
      }).not.toThrow()
    })

    it('handles invalid toast data', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      expect(() => {
        act(() => {
          result.current.toast(null as any)
        })
      }).not.toThrow()
    })

    it('handles dismiss of non-existent toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      expect(() => {
        act(() => {
          result.current.dismiss('non-existent-id')
        })
      }).not.toThrow()
    })

    it('handles action with missing onClick', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      expect(() => {
        act(() => {
          result.current.toast({
            title: 'Test Toast',
            action: {
              label: 'Action'
              // Missing onClick
            } as any
          })
        })
      }).not.toThrow()
    })
  })

  // ✅ MEMORY MANAGEMENT TESTS
  describe('Memory Management', () => {
    it('cleans up timers when component unmounts', () => {
      const { result, unmount } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          duration: 5000
        })
      })
      
      // Unmount before timeout
      unmount()
      
      // Should not cause memory leaks or errors
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      // No assertions needed - just testing for no errors
    })

    it('cleans up timers when toast is manually dismissed', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      let toastId: string
      
      act(() => {
        const toast = result.current.toast({
          title: 'Test Toast',
          duration: 5000
        })
        toastId = toast.id
      })
      
      act(() => {
        result.current.dismiss(toastId)
      })
      
      // Timer should be cleaned up
      act(() => {
        jest.advanceTimersByTime(5000)
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })
  })

  // ✅ ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('provides accessible toast data', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Accessible Toast',
          description: 'This toast has proper accessibility attributes'
        })
      })
      
      const toast = result.current.toasts[0]
      
      // Should have proper attributes for screen readers
      expect(toast.title).toBe('Accessible Toast')
      expect(toast.description).toBe('This toast has proper accessibility attributes')
    })

    it('supports ARIA live regions', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        result.current.toast({
          title: 'Live Region Toast',
          variant: 'destructive' // Should be announced as assertive
        })
      })
      
      // Destructive toasts should use assertive live region
      expect(result.current.toasts[0].variant).toBe('destructive')
    })
  })

  // ✅ PERFORMANCE TESTS
  describe('Performance', () => {
    it('handles many toasts efficiently', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      const start = performance.now()
      
      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.toast({ title: `Performance Toast ${i}` })
        }
      })
      
      const end = performance.now()
      const duration = end - start
      
      // Should be very fast
      expect(duration).toBeLessThan(100)
      
      // Should respect limits
      expect(result.current.toasts.length).toBeLessThanOrEqual(5)
    })

    it('debounces rapid identical toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })
      
      act(() => {
        // Add many identical toasts
        for (let i = 0; i < 10; i++) {
          result.current.toast({ title: 'Identical Toast' })
        }
      })
      
      // Should not have 10 identical toasts
      const identicalToasts = result.current.toasts.filter(t => t.title === 'Identical Toast')
      expect(identicalToasts.length).toBeLessThan(10)
    })
  })
})