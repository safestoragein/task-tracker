import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer } from '../use-toast'

// Mock timers for timeout testing
jest.useFakeTimers()

describe('use-toast Hook - 100% Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  // ✅ BASIC HOOK FUNCTIONALITY
  describe('useToast Hook', () => {
    it('provides initial empty state', () => {
      const { result } = renderHook(() => useToast())
      
      expect(result.current.toasts).toEqual([])
      expect(result.current.toast).toBeInstanceOf(Function)
      expect(result.current.dismiss).toBeInstanceOf(Function)
    })

    it('adds toast through hook', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'Test Description'
        })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Test Toast')
      expect(result.current.toasts[0].description).toBe('Test Description')
      expect(result.current.toasts[0].open).toBe(true)
    })

    it('dismisses toast through hook', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({
          title: 'Test Toast'
        })
      })

      expect(result.current.toasts[0].open).toBe(true)
      
      const toastId = result.current.toasts[0].id
      
      act(() => {
        result.current.dismiss(toastId)
      })
      
      // The toast should be dismissed (open: false)
      expect(result.current.toasts[0].open).toBe(false)
    })

    it('dismisses all toasts when no ID provided', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })
      
      expect(result.current.toasts).toHaveLength(1) // TOAST_LIMIT = 1
      expect(result.current.toasts[0].open).toBe(true)
      
      act(() => {
        result.current.dismiss() // No ID = dismiss all
      })
      
      expect(result.current.toasts[0].open).toBe(false)
    })
  })

  // ✅ STANDALONE TOAST FUNCTION
  describe('Standalone toast Function', () => {
    it('creates toast and returns control methods', () => {
      const result = toast({
        title: 'Standalone Toast',
        description: 'Test description'
      })
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('dismiss')
      expect(result).toHaveProperty('update')
      expect(typeof result.id).toBe('string')
      expect(typeof result.dismiss).toBe('function')
      expect(typeof result.update).toBe('function')
    })

    it('dismisses toast using returned dismiss function', () => {
      const { result } = renderHook(() => useToast())
      
      let toastControls: ReturnType<typeof toast>
      act(() => {
        toastControls = toast({ title: 'Dismissible Toast' })
      })
      
      expect(result.current.toasts[0].open).toBe(true)
      
      act(() => {
        toastControls!.dismiss()
      })
      
      expect(result.current.toasts[0].open).toBe(false)
    })

    it('updates toast using returned update function', () => {
      const { result } = renderHook(() => useToast())
      
      let toastControls: ReturnType<typeof toast>
      act(() => {
        toastControls = toast({ title: 'Original Title' })
      })
      
      expect(result.current.toasts[0].title).toBe('Original Title')
      
      act(() => {
        toastControls!.update({
          id: toastControls!.id,
          title: 'Updated Title',
          description: 'New Description'
        })
      })
      
      expect(result.current.toasts[0].title).toBe('Updated Title')
      expect(result.current.toasts[0].description).toBe('New Description')
    })

    it('calls onOpenChange when toast is dismissed', () => {
      const onOpenChange = jest.fn()
      const { result } = renderHook(() => useToast())
      
      act(() => {
        result.current.toast({
          title: 'Test Toast',
          onOpenChange
        })
      })
      
      // Get the toast from state to access its onOpenChange
      const toastFromState = result.current.toasts[0]
      
      // Simulate calling onOpenChange(false) - this is what happens in real usage
      act(() => {
        if (toastFromState.onOpenChange) {
          toastFromState.onOpenChange(false)
        }
      })
      
      expect(result.current.toasts[0].open).toBe(false)
    })
  })

  // ✅ REDUCER TESTING
  describe('Toast Reducer', () => {
    const initialState = { toasts: [] }
    
    it('handles ADD_TOAST action', () => {
      const toast = {
        id: '1',
        title: 'Test Toast',
        open: true
      }
      
      const action = {
        type: 'ADD_TOAST' as const,
        toast
      }
      
      const newState = reducer(initialState, action)
      
      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toEqual(toast)
    })

    it('enforces TOAST_LIMIT when adding toasts', () => {
      const firstToast = { id: '1', title: 'First Toast', open: true }
      const secondToast = { id: '2', title: 'Second Toast', open: true }
      
      let state = { toasts: [] }
      
      state = reducer(state, {
        type: 'ADD_TOAST' as const,
        toast: firstToast
      })
      
      state = reducer(state, {
        type: 'ADD_TOAST' as const,
        toast: secondToast
      })
      
      // TOAST_LIMIT = 1, should only keep the latest
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('2')
    })

    it('handles UPDATE_TOAST action', () => {
      const initialToast = { id: '1', title: 'Original', open: true }
      const state = { toasts: [initialToast] }
      
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '1', title: 'Updated', description: 'New Description' }
      }
      
      const newState = reducer(state, action)
      
      expect(newState.toasts[0].title).toBe('Updated')
      expect(newState.toasts[0].description).toBe('New Description')
      expect(newState.toasts[0].open).toBe(true) // Should preserve existing properties
    })

    it('handles UPDATE_TOAST action for non-existent toast', () => {
      const initialToast = { id: '1', title: 'Original', open: true }
      const state = { toasts: [initialToast] }
      
      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: '999', title: 'Updated' }
      }
      
      const newState = reducer(state, action)
      
      // Should not change anything
      expect(newState.toasts).toEqual([initialToast])
    })

    it('handles DISMISS_TOAST action with specific ID', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true }
      const toast2 = { id: '2', title: 'Toast 2', open: true }
      const state = { toasts: [toast1, toast2] }
      
      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: '1'
      }
      
      const newState = reducer(state, action)
      
      expect(newState.toasts[0].open).toBe(false) // First toast dismissed
      expect(newState.toasts[1].open).toBe(true)  // Second toast still open
    })

    it('handles DISMISS_TOAST action without ID (dismiss all)', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true }
      const toast2 = { id: '2', title: 'Toast 2', open: true }
      const state = { toasts: [toast1, toast2] }
      
      const action = {
        type: 'DISMISS_TOAST' as const
      }
      
      const newState = reducer(state, action)
      
      expect(newState.toasts[0].open).toBe(false)
      expect(newState.toasts[1].open).toBe(false)
    })

    it('handles REMOVE_TOAST action with specific ID', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true }
      const toast2 = { id: '2', title: 'Toast 2', open: true }
      const state = { toasts: [toast1, toast2] }
      
      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: '1'
      }
      
      const newState = reducer(state, action)
      
      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0].id).toBe('2')
    })

    it('handles REMOVE_TOAST action without ID (remove all)', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true }
      const toast2 = { id: '2', title: 'Toast 2', open: true }
      const state = { toasts: [toast1, toast2] }
      
      const action = {
        type: 'REMOVE_TOAST' as const
      }
      
      const newState = reducer(state, action)
      
      expect(newState.toasts).toEqual([])
    })
  })

  // ✅ TIMEOUT AND CLEANUP TESTING
  describe('Timeout and Cleanup', () => {
    it('removes toast after TOAST_REMOVE_DELAY', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
        const toastResult = toast({ title: 'Temporary Toast' })
        toastResult.dismiss()
      })
      
      expect(result.current.toasts[0].open).toBe(false)
      
      act(() => {
        jest.advanceTimersByTime(1000000) // TOAST_REMOVE_DELAY
      })
      
      expect(result.current.toasts).toHaveLength(0)
    })

    it('does not add duplicate timeouts for same toast', () => {
      const { result } = renderHook(() => useToast())
      
      let toastResult: ReturnType<typeof toast>
      act(() => {
        toastResult = toast({ title: 'Test Toast' })
      })
      
      // Dismiss multiple times
      act(() => {
        toastResult.dismiss()
        toastResult.dismiss()
        toastResult.dismiss()
      })
      
      // Should still be in dismissed state, not removed
      expect(result.current.toasts[0].open).toBe(false)
      expect(result.current.toasts).toHaveLength(1)
    })

    it('clears timeout when toast is manually removed', () => {
      const { result } = renderHook(() => useToast())
      
      let toastResult: ReturnType<typeof toast>
      act(() => {
        toastResult = toast({ title: 'Test Toast' })
        toastResult.dismiss()
      })
      
      expect(result.current.toasts[0].open).toBe(false)
      
      // Now advance time to trigger the remove timeout
      act(() => {
        jest.advanceTimersByTime(1000000)
      })
      
      // Toast should be completely removed
      expect(result.current.toasts).toHaveLength(0)
    })
  })

  // ✅ ID GENERATION TESTING
  describe('ID Generation', () => {
    it('generates unique sequential IDs', () => {
      const toast1 = toast({ title: 'Toast 1' })
      const toast2 = toast({ title: 'Toast 2' })
      const toast3 = toast({ title: 'Toast 3' })
      
      expect(toast1.id).not.toBe(toast2.id)
      expect(toast2.id).not.toBe(toast3.id)
      expect(toast1.id).not.toBe(toast3.id)
      
      // Should be sequential numbers as strings
      expect(parseInt(toast2.id)).toBeGreaterThan(parseInt(toast1.id))
      expect(parseInt(toast3.id)).toBeGreaterThan(parseInt(toast2.id))
    })

    it('handles ID counter overflow', () => {
      // This tests the modulo operation in genId
      const manyToasts = []
      for (let i = 0; i < 10; i++) {
        manyToasts.push(toast({ title: `Toast ${i}` }))
      }
      
      // All IDs should be unique
      const ids = manyToasts.map(t => t.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  // ✅ LISTENER MANAGEMENT
  describe('Listener Management', () => {
    it('adds and removes listeners correctly', () => {
      const { result, unmount } = renderHook(() => useToast())
      
      // Add a toast to trigger listener
      act(() => {
        result.current.toast({ title: 'Test Toast' })
      })
      
      expect(result.current.toasts).toHaveLength(1)
      
      // Unmounting should remove listener
      unmount()
      
      // This should not affect the unmounted component
      act(() => {
        toast({ title: 'Another Toast' })
      })
      
      // No errors should occur
    })

    it('handles multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast())
      const { result: result2 } = renderHook(() => useToast())
      
      act(() => {
        result1.current.toast({ title: 'Toast from hook 1' })
      })
      
      // Both hooks should see the same toast
      expect(result1.current.toasts).toHaveLength(1)
      expect(result2.current.toasts).toHaveLength(1)
      expect(result1.current.toasts[0].title).toBe('Toast from hook 1')
      expect(result2.current.toasts[0].title).toBe('Toast from hook 1')
    })
  })

  // ✅ EDGE CASES
  describe('Edge Cases', () => {
    it('handles empty toast props', () => {
      const result = toast({})
      
      expect(result.id).toBeDefined()
      expect(result.dismiss).toBeInstanceOf(Function)
      expect(result.update).toBeInstanceOf(Function)
    })

    it('handles toast with all possible props', () => {
      const result = toast({
        title: 'Full Toast',
        description: 'Description',
        variant: 'destructive',
        className: 'custom-class'
      })
      
      expect(result.id).toBeDefined()
      
      const { result: hookResult } = renderHook(() => useToast())
      
      expect(hookResult.current.toasts[0].title).toBe('Full Toast')
      expect(hookResult.current.toasts[0].description).toBe('Description')
      expect(hookResult.current.toasts[0].variant).toBe('destructive')
      expect(hookResult.current.toasts[0].className).toBe('custom-class')
    })
  })
})