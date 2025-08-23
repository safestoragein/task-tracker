import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '../toast'

describe('Toast Components', () => {
  describe('Toast', () => {
    it('renders toast with default variant', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test Title</ToastTitle>
            <ToastDescription>Test Description</ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('renders toast with destructive variant', () => {
      render(
        <ToastProvider>
          <Toast variant="destructive">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>Something went wrong</ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders toast with success variant', () => {
      render(
        <ToastProvider>
          <Toast variant="success">
            <ToastTitle>Success</ToastTitle>
            <ToastDescription>Operation completed</ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Operation completed')).toBeInTheDocument()
    })

    it('renders toast with warning variant', () => {
      render(
        <ToastProvider>
          <Toast variant="warning">
            <ToastTitle>Warning</ToastTitle>
            <ToastDescription>Please be careful</ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Warning')).toBeInTheDocument()
      expect(screen.getByText('Please be careful')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <Toast className="custom-toast">
            <ToastTitle>Test</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const toast = screen.getByText('Test').closest('[class*="group"]')
      expect(toast).toHaveClass('custom-toast')
    })
  })

  describe('ToastClose', () => {
    it('renders close button', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test</ToastTitle>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const closeButton = screen.getByRole('button')
      expect(closeButton).toBeInTheDocument()
    })

    it('applies custom className to close button', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test</ToastTitle>
            <ToastClose className="custom-close" />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveClass('custom-close')
    })
  })

  describe('ToastAction', () => {
    it('renders action button', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test</ToastTitle>
            <ToastAction altText="Undo">Undo</ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Undo')).toBeInTheDocument()
    })

    it('handles action button click', () => {
      const handleClick = jest.fn()

      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test</ToastTitle>
            <ToastAction altText="Retry" onClick={handleClick}>
              Retry
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Retry'))
      expect(handleClick).toHaveBeenCalled()
    })

    it('applies custom className to action button', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Test</ToastTitle>
            <ToastAction altText="Action" className="custom-action">
              Action
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Action')).toHaveClass('custom-action')
    })
  })

  describe('ToastTitle', () => {
    it('renders title with custom className', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle className="custom-title">Custom Title</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const title = screen.getByText('Custom Title')
      expect(title).toHaveClass('custom-title')
      expect(title).toHaveClass('text-sm')
      expect(title).toHaveClass('font-semibold')
    })
  })

  describe('ToastDescription', () => {
    it('renders description with custom className', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastDescription className="custom-description">Custom Description</ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const description = screen.getByText('Custom Description')
      expect(description).toHaveClass('custom-description')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('opacity-90')
    })
  })

  describe('ToastViewport', () => {
    it('renders viewport with custom className', () => {
      const { container } = render(
        <ToastProvider>
          <ToastViewport className="custom-viewport" />
        </ToastProvider>
      )

      const viewport = container.querySelector('.custom-viewport')
      expect(viewport).toBeInTheDocument()
      expect(viewport).toHaveClass('fixed')
    })
  })

  describe('Toast Integration', () => {
    it('renders complete toast with all components', () => {
      render(
        <ToastProvider>
          <Toast>
            <div className="grid gap-1">
              <ToastTitle>Notification Title</ToastTitle>
              <ToastDescription>This is a notification message</ToastDescription>
            </div>
            <ToastAction altText="Dismiss">Dismiss</ToastAction>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Notification Title')).toBeInTheDocument()
      expect(screen.getByText('This is a notification message')).toBeInTheDocument()
      expect(screen.getByText('Dismiss')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument() // Close button
    })

    it('handles multiple toasts', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>Toast 1</ToastTitle>
          </Toast>
          <Toast>
            <ToastTitle>Toast 2</ToastTitle>
          </Toast>
          <Toast>
            <ToastTitle>Toast 3</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Toast 2')).toBeInTheDocument()
      expect(screen.getByText('Toast 3')).toBeInTheDocument()
    })
  })
})
