import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  const mockOnClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders modal when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByText('Test Modal')).toBeInTheDocument()
    })

    it('does not render title when not provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('renders close button', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('does not have aria-labelledby when title is not provided', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).not.toHaveAttribute('aria-labelledby')
    })

    it('sets focus on modal when opened', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      // Modal should be focused (the modal box div has tabIndex={-1})
      const modalBox = screen.getByRole('dialog').firstChild as HTMLElement
      expect(document.activeElement).toBe(modalBox)
    })
  })

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      const closeButton = screen.getByLabelText('Close modal')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when ESC key is pressed', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay is clicked (when closeOnOverlayClick is true)', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnOverlayClick={true}>
          <div>Modal Content</div>
        </Modal>
      )

      const overlay = screen.getByRole('dialog')
      fireEvent.click(overlay)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when overlay is clicked if closeOnOverlayClick is false', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnOverlayClick={false}>
          <div>Modal Content</div>
        </Modal>
      )

      const overlay = screen.getByRole('dialog')
      fireEvent.click(overlay)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not close when clicking inside modal content', () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} closeOnOverlayClick={true}>
          <div>Modal Content</div>
        </Modal>
      )

      const content = screen.getByText('Modal Content')
      fireEvent.click(content)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not call onClose when ESC is pressed and modal is closed', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Body Scroll Prevention', () => {
    it('prevents body scroll when modal is open', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      // Initially body should not have overflow hidden
      expect(document.body.style.overflow).not.toBe('hidden')

      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      // Body should have overflow hidden when modal opens
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when modal is closed', () => {
      const { rerender, unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('hidden')

      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      expect(document.body.style.overflow).toBe('unset')

      // Also test cleanup on unmount
      unmount()
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Event Handler Cleanup', () => {
    it('removes event listeners when unmounted', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      )

      unmount()

      // After unmount, ESC key should not call onClose
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})
