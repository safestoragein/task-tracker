import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { Toaster } from '../toaster'
import { useToast } from '@/hooks/use-toast'

// Mock the useToast hook
jest.mock('@/hooks/use-toast')

describe('Toaster Component', () => {
  const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty when no toasts', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    const { container } = render(<Toaster />)

    // Should render the viewport but no toasts
    expect(container.querySelector('[class*="fixed"]')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders single toast with title only', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Test Toast',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Test Toast')).toBeInTheDocument()
  })

  it('renders single toast with title and description', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Test Title',
          description: 'Test Description',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders toast with description only', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          description: 'Description without title',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Description without title')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'First Toast',
          description: 'First Description',
        },
        {
          id: 'toast-2',
          title: 'Second Toast',
          description: 'Second Description',
        },
        {
          id: 'toast-3',
          title: 'Third Toast',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('First Toast')).toBeInTheDocument()
    expect(screen.getByText('First Description')).toBeInTheDocument()
    expect(screen.getByText('Second Toast')).toBeInTheDocument()
    expect(screen.getByText('Second Description')).toBeInTheDocument()
    expect(screen.getByText('Third Toast')).toBeInTheDocument()
  })

  it('renders toast with action', () => {
    const actionElement = <button>Undo</button>

    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Action Toast',
          action: actionElement,
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Action Toast')).toBeInTheDocument()
    expect(screen.getByText('Undo')).toBeInTheDocument()
  })

  it('renders toast with variant', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Error Toast',
          variant: 'destructive',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Error Toast')).toBeInTheDocument()
  })

  it('updates when toasts change', () => {
    const { rerender } = render(<Toaster />)

    // Initially no toasts
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    rerender(<Toaster />)
    expect(screen.queryByText('Dynamic Toast')).not.toBeInTheDocument()

    // Add a toast
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-dynamic',
          title: 'Dynamic Toast',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    rerender(<Toaster />)
    expect(screen.getByText('Dynamic Toast')).toBeInTheDocument()
  })

  it('renders toasts with all props passed through', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Custom Toast',
          description: 'With custom props',
          variant: 'success',
          duration: 5000,
          className: 'custom-class',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Custom Toast')).toBeInTheDocument()
    expect(screen.getByText('With custom props')).toBeInTheDocument()
  })

  it('renders close button for each toast', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: 'toast-1',
          title: 'Closeable Toast',
        },
        {
          id: 'toast-2',
          title: 'Another Toast',
        },
      ],
      toast: jest.fn(),
      dismiss: jest.fn(),
    })

    render(<Toaster />)

    // Each toast should have a close button
    const closeButtons = screen.getAllByRole('button')
    expect(closeButtons).toHaveLength(2)
  })
})
